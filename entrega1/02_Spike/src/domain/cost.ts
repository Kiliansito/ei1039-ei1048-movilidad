import type { Mode, Vehicle, Prices } from "./types.ts";
// Strategy: each transport mode owns its estimation rules.
const strategies = {
  car: (
    distance: number,
    duration: number,
    weight: number,
    vehicle: Vehicle | undefined,
    prices: Prices,
  ) => ({
    cost:
      !vehicle || prices[vehicle.type] == null
        ? null
        : Math.round(
            (distance / 1000 / 100) *
              vehicle.consumption *
              prices[vehicle.type]! *
              100,
          ) / 100,
    calories: 0,
  }),
  bike: (distance: number, duration: number, weight: number) => ({
    cost: 0,
    calories: Math.round(((6.8 * 3.5 * weight) / 200) * (duration / 60)),
  }),
  foot: (distance: number, duration: number, weight: number) => ({
    cost: 0,
    calories: Math.round(((3.5 * 3.5 * weight) / 200) * (duration / 60)),
  }),
};
export function estimate(
  mode: Mode,
  distance: number,
  duration: number,
  weight: number,
  vehicle: Vehicle | undefined,
  prices: Prices,
) {
  return strategies[mode](distance, duration, weight, vehicle, prices);
}
