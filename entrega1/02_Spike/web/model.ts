import { useSyncExternalStore } from "react";
import type {
  State,
  Route,
  Preferences,
  Collection,
} from "../src/domain/types";
export async function api<T = any>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const response = await fetch("/api" + path, {
    method,
    headers: { "Content-Type": "application/json", "X-Via-Client": "web" },
    body: data === undefined ? undefined : JSON.stringify(data),
  }).catch(() => {
    throw new Error("No se puede conectar con el servidor.");
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error ?? "No se ha podido completar la operación.");
  return result;
}
type Snapshot = {
  state: State | null;
  ready: boolean;
  configured: boolean;
  busy: boolean;
  error: string;
  notice: string;
  plan: { routes: Route[]; planId: string } | null;
};
// Modelo observable. La vista no conoce SQLite ni los proveedores externos.
class ViewModel {
  private snapshot: Snapshot = {
    state: null,
    ready: false,
    configured: false,
    busy: false,
    error: "",
    notice: "",
    plan: null,
  };
  private listeners = new Set<() => void>();
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getSnapshot = () => this.snapshot;
  set(value: Partial<Snapshot>) {
    this.snapshot = { ...this.snapshot, ...value };
    this.listeners.forEach((fn) => fn());
  }
  async run(action: () => Promise<void>) {
    if (this.snapshot.busy) return;
    this.set({ busy: true, error: "", notice: "" });
    try {
      await action();
    } catch (e) {
      this.set({
        error:
          e instanceof Error
            ? e.message
            : "No se ha podido completar la operación.",
      });
    } finally {
      this.set({ busy: false });
    }
  }
  async init() {
    try {
      const health = await api("/health");
      this.set({ configured: health.routingConfigured });
      const response = await fetch("/api/state");
      if (response.status === 401) this.set({ state: null });
      else {
        if (!response.ok)
          throw new Error("No se pueden recuperar los datos guardados.");
        this.set({ state: await response.json() });
      }
    } catch (e) {
      this.set({
        error: e instanceof Error ? e.message : "Servidor no disponible.",
      });
    } finally {
      this.set({ ready: true });
    }
  }
  async refresh() {
    this.set({ state: await api<State>("/state") });
  }
  async auth(register: boolean, data: unknown) {
    await api(register ? "/auth/register" : "/auth/login", "POST", data);
    await this.refresh();
  }
  async logout() {
    await api("/auth/logout", "POST", {});
    this.set({ state: null, plan: null, notice: "Sesión cerrada." });
  }
  async account(password: string) {
    await api("/account", "DELETE", { password });
    this.set({ state: null, plan: null, notice: "Cuenta eliminada." });
  }
  async save(path: string, data: unknown, notice: string) {
    await api(path, "POST", data);
    await this.refresh();
    this.set({ notice, plan: null });
  }
  async remove(kind: Collection, id: string) {
    await api(`/${kind}/${id}`, "DELETE", {});
    await this.refresh();
    this.set({ notice: "Elemento eliminado.", plan: null });
  }
  async favorite(kind: Collection, id: string) {
    await api(`/${kind}/${id}/favorite`, "PATCH", {});
    await this.refresh();
    this.set({ notice: "Favorito actualizado." });
  }
  async preferences(data: Partial<Preferences>) {
    await api("/preferences", "PATCH", data);
    await this.refresh();
    this.set({ notice: "Preferencias guardadas.", plan: null });
  }
  async plan(data: any) {
    this.set({ plan: null });
    await api("/preferences", "PATCH", {
      lastJourney: {
        fromId: data.from,
        toId: data.to,
        mode: data.mode,
        preference: data.preference,
        vehicleId: data.vehicleId ?? "",
      },
    });
    await this.refresh();
    this.set({ plan: await api("/plan", "POST", data) });
  }
  async saveRoute(index: number, name: string) {
    await api("/routes", "POST", {
      index,
      name,
      planId: this.snapshot.plan?.planId,
    });
    await this.refresh();
    this.set({ notice: "Ruta guardada." });
  }
}
export const vm = new ViewModel();
export const useApp = () => useSyncExternalStore(vm.subscribe, vm.getSnapshot);
