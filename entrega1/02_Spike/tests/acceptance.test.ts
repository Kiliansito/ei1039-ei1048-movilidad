import { registerScenarios, realDependencies } from "./support/scenarios.ts";
// No skips. A missing ORS key or an unavailable real dependency must be reported as a failure.
registerScenarios("aceptacion", realDependencies());
