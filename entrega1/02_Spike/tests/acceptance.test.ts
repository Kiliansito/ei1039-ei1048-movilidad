import assert from "node:assert/strict";
import { registerScenarios, realDependencies } from "./support/scenarios.ts";
// No skips. A missing ORS key or an unavailable real dependency must be reported as a failure.
assert.ok(
  process.env.ORS_API_KEY,
  "Configura ORS_API_KEY en .env para ejecutar las 52 pruebas de aceptación reales.",
);
registerScenarios("aceptacion", realDependencies());
