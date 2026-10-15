"""Actualiza las copias de lectura a partir de la memoria LaTeX."""

from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "entrega1/01_Memoria/Informe_Entrega1_Via.tex"
DOCS = ROOT / "docs/entrega1"
TEXT = SOURCE.read_text()
for relative in re.findall(r"\\input\{([^}]+)\}", TEXT):
    TEXT = TEXT.replace(r"\input{" + relative + "}", (SOURCE.parent / (relative + ".tex")).read_text())


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
        line = line.replace(r"\clearpage", "")
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
        heading = re.match(r"\\(subsection|subsubsection)\*?\{([^}]+)\}", line)
        if heading:
            lines.append("\n" + ("### " if heading[1] == "subsubsection" else "## ") + heading[2] + "\n")
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
write("01-introduccion.md", "# Introducción\n\n" + prose(section(1)))
write("02-requisitos.md", "# Requisitos\n\n" + prose(section(2)))
write("03-reglas-metodo-prueba.md", "# Reglas y método de prueba\n\n" + prose(section(3)))
write("04-historias-escenarios-aceptacion.md", "# Historias, escenarios y aceptación\n\n" + prose(section(4)))

histories = re.findall(r"\\subsection\*\{HU-(\d\d)\. ([^}]+)\}\s*(.*?)(?=\\(?:clearpage)?\\?subsection\*\{HU-|\Z)", section(4), re.S)
if len(histories) != 26:
    raise ValueError(f"Se esperaban 26 historias y se han encontrado {len(histories)}")

mockups = section(5)
screen_blocks = re.findall(r"\\subsection\*\{(M\d\d)\. ([^}]+)\}(.*?)(?=\\clearpage\\subsection|\Z)", mockups, re.S)
if len(screen_blocks) != 10:
    raise ValueError("Deben existir diez pantallas de Figma")
screens = []
links = {}
for code, title, block in screen_blocks:
    related = re.search(r"\\textbf\{Historias relacionadas\} (.*?)\\par", block)[1]
    hus = re.findall(r"HU-\d\d", related)
    screens.append([code, title, ", ".join(hus)])
    urls = re.findall(r"\\href\{([^}]+)\}", block)
    links[code] = urls[-1]
(ROOT / "entrega1/03_Mockups/pantallas.json").write_text(json.dumps(screens, ensure_ascii=False, indent=2) + "\n")

feature = ["Feature: Movilidad de Vía", "  # Catálogo sin definiciones ejecutables de pasos.", "  # Datos comunes en docs/entrega1/03-reglas-metodo-prueba.md."]
trace = ["# Trazabilidad de requisitos, historias y pantallas\n", "Los códigos PA identifican especificaciones previstas. No indican que todas estén automatizadas o superadas en el spike. Los escenarios elegidos son E-xx-V y E-xx-I1. El resto de las filas de las tablas amplía el análisis sin añadir pruebas seleccionadas.\n", "| Requisito | Historia | Escenarios y pruebas | Pantallas de Figma |", "| --- | --- | --- | --- |"]
for num, title, block in histories:
    requirement = re.search(r"\\textbf\{Requisito\} (R\d)", block)[1]
    tables = re.findall(r"\\begin\{minipage\}.*?\\end\{minipage\}", block, re.S)
    if len(tables) != 2:
        raise ValueError(f"HU-{num} debe contener dos pruebas seleccionadas")
    for kind, table in zip(["V", "I"], tables):
        rows = dict(re.findall(r"\\textbf\{(Justificación|Análisis|Given|When|Then)\} & (.*?)\\\\\[\dpt\]", table))
        if len(rows) != 5:
            raise ValueError(f"Análisis incompleto en HU-{num}-{kind}")
        label = "válido" if kind == "V" else "inválido"
        feature.extend(["", f"  Scenario: PA-{num}-{kind} {title}, escenario {label}"] + [f"    {key} {plain(rows[key])}" for key in ["Given", "When", "Then"]])
    related = ", ".join(code for code, _, hus in screens if "HU-" + num in hus)
    if not related:
        raise ValueError(f"HU-{num} no está relacionada con ninguna pantalla")
    trace.append(f"| {requirement} | HU-{num} {title} | E-{num}-V / PA-{num}-V y E-{num}-I1 / PA-{num}-I | {related} |")
(ROOT / "entrega1/04_Pruebas/aceptacion.feature").write_text("\n".join(feature) + "\n")
(ROOT / "entrega1/04_Pruebas/trazabilidad.md").write_text("\n".join(trace) + "\n")

write("05-mockups.md", "# Del escenario a la pantalla\n\n" + prose(mockups) + "\n" + "\n\n".join(f"## {code} {title}\n\n{hus}\n\n![{code} {title}](../../entrega1/03_Mockups/figma/{code}.png)\n\n[Editar en Figma]({links[code]})" for code, title, hus in screens))
write("06-spike.md", "# Iteración 0\n\n" + prose(section(6)) + "\nLas instrucciones están en [el README del spike](../../entrega1/02_Spike/README.md). Los resultados están en [Comprobaciones](../../entrega1/06_Comprobaciones/).\n")
write("07-ia.md", "# Experiencia con IA generativa\n\n" + prose(section(7)))
html = '<!doctype html><html lang="es"><meta charset="utf-8"><title>Mockups de Vía</title><style>body{max-width:960px;margin:40px auto;font:16px Arial;padding:0 20px}img{max-width:100%;height:auto;border:1px solid #ddd}section{margin:48px 0}a{color:#245c44}</style><h1>Vía · Mockups de Figma</h1><p>Diez propuestas de interfaz para las 26 historias. Las cifras ilustran cálculos y los estados alternativos no aparecen a la vez.</p>'
for code, title, hus in screens:
    html += f'<section><h2>{code} {title}</h2><p>{hus}</p><img src="figma/{code}.png" alt="{title}"><p><a href="{links[code]}">Abrir diseño editable en Figma</a></p></section>'
(ROOT / "entrega1/03_Mockups/index.html").write_text(html + "</html>\n")
print("Actualizados ocho documentos, 26 historias, 52 pruebas seleccionadas y diez pantallas de Figma")
