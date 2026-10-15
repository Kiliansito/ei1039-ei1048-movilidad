"""Actualiza las copias de lectura a partir de la memoria LaTeX."""

from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "entrega1/01_Memoria/Informe_Entrega1_Via.tex"
DOCS = ROOT / "docs/entrega1"
TEXT = SOURCE.read_text()


def plain(value):
    value = re.sub(r"\\fontsize\{[^}]+\}\{[^}]+\}\\selectfont", "", value)
    value = re.sub(r"\\href\{([^}]+)\}\{([^}]+)\}", r"[\2](\1)", value)
    value = re.sub(r"\\url\{([^}]+)\}", r"<\1>", value)
    value = value.replace(r"\ensuremath{\times}", "×")
    value = value.replace(r"\texteuro{}", "€").replace(r"\textperiodcentered{}", "·")
    value = value.replace(r"\guillemotleft{}", "«").replace(r"\guillemotright{}", "»")
    value = re.sub(r"\\textbf\{([^}]+)\}", r"**\1**", value)
    value = value.replace(r"\_", "_").replace(r"\par", "")
    return value.strip().strip("{}").strip()


def prose(value):
    lines = []
    in_table = False
    table_header = False
    for line in value.splitlines():
        if "\\begin{tabularx}" in line:
            in_table = True
            table_header = True
            continue
        if "\\end{tabularx}" in line:
            in_table = False
            lines.append("")
            continue
        if in_table:
            row = re.split(r"\\\\", line)[0]
            if "&" in row:
                cells = [plain(cell) for cell in row.split("&")]
                lines.append("| " + " | ".join(cells) + " |")
                if table_header:
                    lines.append("| " + " | ".join("---" for _ in cells) + " |")
                    table_header = False
            continue
        heading = re.match(r"\\subsection\*?\{([^}]+)\}", line)
        if heading:
            lines.append("\n## " + heading[1] + "\n")
        elif line.startswith(r"\textbf{"):
            lines.append(plain(line) + "\n")
        elif "includegraphics" in line:
            pass
        elif line and not line.startswith("\\") and not line.startswith("{"):
            lines.append(plain(line) + "\n")
    return "\n".join(lines).strip() + "\n"


def section(number):
    match = re.search(r"\\section\{[^}]+\}\\label\{sec" + str(number) + r"\}(.*?)(?=\\section\{|\\end\{document\})", TEXT, re.S)
    if not match:
        raise ValueError(f"No se encuentra la sección {number}")
    return match[1]


def write(name, content):
    (DOCS / name).write_text(content.rstrip() + "\n")


DOCS.mkdir(parents=True, exist_ok=True)
write("00-portada.md", """# Vía, aplicación de movilidad

Especificación de requisitos y diseño inicial

Entrega 1 · EI1039 y EI1048 · Universitat Jaume I

Curso 2026-2027 · 15 de octubre de 2026

- Ruben Andres Szasz Szasz
- Kilian Escudero Vizcaino
- Ismael Ferrando Paulo

La memoria para entregar está en [PDF](../../entrega1/01_Memoria/Informe_Entrega1_Via.pdf). Su [fuente LaTeX](../../entrega1/01_Memoria/Informe_Entrega1_Via.tex) es el documento de referencia. Estos archivos Markdown son copias de lectura generadas con `python3 scripts/exportar_documentacion.py`.
""")
intro = section(1)
requirements = re.search(r"\\begin{tabularx}.*?\\end{tabularx}", intro, re.S)[0]
write("01-introduccion.md", "# Objetivo y alcance\n\n" + prose(intro.replace(requirements, "")))
write("02-requisitos.md", "# Requisitos\n\nLos seis requisitos corresponden al enunciado docente. El catálogo mantiene sus 24 historias y separa además la selección en el mapa y el coste eléctrico.\n\n" + prose(requirements) + "\nLa justificación está en [Objetivo y alcance](01-introduccion.md). Las decisiones se presentan al profesorado para su revisión.\n")
write("03-reglas-metodo-prueba.md", "# Reglas de dominio y pruebas\n\n" + prose(section(2)))

histories = re.findall(r"\\subsection\*\{HU-(\d\d) ([^}]+)\}\s*(.*?)(?=\\subsection\*\{HU-|\\section\{Diseño)", section(3) + r"\section{Diseño", re.S)
if len(histories) != 26:
    raise ValueError(f"Se esperaban 26 historias y se han encontrado {len(histories)}")
markdown = ["# Historias, escenarios y aceptación\n", "Las 52 pruebas se especifican para el proyecto. El archivo `.feature` contiene el catálogo y todavía no tiene definiciones ejecutables de pasos. Las comprobaciones del spike tienen otro alcance, explicado en su README.\n"]
feature = ["Feature: Movilidad de Vía", "  # Catálogo de especificaciones sin definiciones ejecutables de pasos.", "  # Datos y condiciones comunes en docs/entrega1/03-reglas-metodo-prueba.md."]
trace = ["# Trazabilidad de requisitos, historias y pantallas\n", "Los códigos PA identifican especificaciones de aceptación previstas. No indican que todas estén automatizadas o superadas en el spike.\n", "| Requisito | Historia | Escenarios y pruebas | Pantallas |", "| --- | --- | --- | --- |"]
screen_stories = {}
for num, title, block in histories:
    first = block.splitlines()[0]
    meta = re.match(r"(R\d) \\textperiodcentered\{\} (.+?)   (Como .+?)\\par", first)
    if not meta:
        raise ValueError(f"No se reconocen los datos de HU-{num}")
    requirement, screens, story = meta.groups()
    markdown.extend([f"\n## HU-{num} {title}\n", f"{requirement} · {screens}\n", plain(story) + "\n"])
    tables = re.findall(r"\\begin{tabularx}.*?\\end{tabularx}", block, re.S)
    if len(tables) != 2:
        raise ValueError(f"HU-{num} no tiene exactamente dos escenarios")
    for kind, table in zip(["V", "I"], tables):
        rows = dict(re.findall(r"\\textbf\{(Justificación|Análisis|Given|When|Then)\} & (.*?)\\\\\[\dpt\]", table))
        if len(rows) != 5:
            raise ValueError(f"Análisis incompleto en HU-{num}-{kind}")
        label = "válido" if kind == "V" else "inválido"
        markdown.append(f"### E-{num}-{kind} · Escenario {label} · PA-{num}-{kind}\n")
        for key in ["Justificación", "Análisis", "Given", "When", "Then"]:
            markdown.append(f"**{key}** {plain(rows[key])}\n")
        feature.extend(["", f"  Scenario: PA-{num}-{kind} {title}, escenario {label}"] + [f"    {key} {plain(rows[key])}" for key in ["Given", "When", "Then"]])
    limits = re.search(r"\\textbf\{Límites y variantes\.\} (.*?)\\par", block)[1]
    markdown.append("**Límites y variantes** " + plain(limits) + "\n")
    pairs = f"E-{num}-V / PA-{num}-V y E-{num}-I / PA-{num}-I"
    trace.append(f"| {requirement} | HU-{num} {title} | {pairs} | {screens} |")
    for screen in re.findall(r"M\d\d", screens):
        screen_stories.setdefault(screen, []).append("HU-" + num)

write("04-historias-escenarios-aceptacion.md", "\n".join(markdown))
(ROOT / "entrega1/04_Pruebas/aceptacion.feature").write_text("\n".join(feature) + "\n")
(ROOT / "entrega1/04_Pruebas/trazabilidad.md").write_text("\n".join(trace) + "\n\nHU-25 y HU-26 afectan a la recuperación de datos y preferencias de todas las pantallas M03 a M09. No necesitan una pantalla propia.\n")

mockups = section(4)
captions = re.findall(r"\\textbf\{(M\d\d) (.*?) \\textperiodcentered\{\} (.*?)\}", mockups)
screens = [[code, title, plain(hus)] for code, title, hus in captions]
if len(screens) != 9:
    raise ValueError("Deben existir nueve pantallas")
(ROOT / "entrega1/03_Mockups/pantallas.json").write_text(json.dumps(screens, ensure_ascii=False, indent=2) + "\n")
write("05-mockups.md", "# Diseño de interfaces\n\n" + prose(mockups) + "\nLos diseños se pueden consultar juntos en [la galería](../../entrega1/03_Mockups/index.html). Cada pantalla conserva una versión SVG editable y otra PNG.\n\n" + "\n\n".join(f"## {code} {title}\n\n{hus}\n\n![{code} {title}](../../entrega1/03_Mockups/{code}.png)" for code, title, hus in screens) + "\n")
write("06-spike.md", "# Iteración 0\n\n" + prose(section(5)) + "\nLas instrucciones completas están en [el README del spike](../../entrega1/02_Spike/README.md). Los resultados están en [Comprobaciones](../../entrega1/06_Comprobaciones/).\n")
write("07-ia.md", "# Experiencia con IA generativa\n\n" + prose(section(6)))
print("Actualizados ocho documentos, 26 historias, 52 escenarios y nueve pantallas")
