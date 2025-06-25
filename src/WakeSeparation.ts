import {WakeCategory} from "./WakeCategory.js";

/**
 * A wake turbulence separation matrix indexed by {@link WakeCategory}.
 *
 * Each row corresponds to a leading aircraft’s wake category and contains six {@link WakeSeparation.Separation} values
 * representing required separation from the leader to each possible following category.
 *
 * @param rows A mapping from each leading {@link WakeCategory} to a {@link WakeSeparation.Row} containing separations
 *     to all following categories.
 *
 * @example
 * // RECAT-EU (game default)
 * new WakeSeparation({
 *   [WakeCategory.SUPER_HEAVY]: [[3, 0], [4, 100], [5, 120], [5, 140], [6, 160], [8, 180]],
 *   [WakeCategory.UPPER_HEAVY]: [[0, 0], [3, 0], [4, 0], [4, 100], [5, 120], [7, 140]],
 *   [WakeCategory.LOWER_HEAVY]: [[0, 0], [0, 0], [3, 0], [3, 80], [4, 100], [6, 120]],
 *   [WakeCategory.UPPER_MEDIUM]: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 120]],
 *   [WakeCategory.LOWER_MEDIUM]: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [4, 100]],
 *   [WakeCategory.LIGHT]: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 80]],
 * });
 */
export class WakeSeparation {
    public constructor(public readonly rows: Record<WakeCategory, WakeSeparation.Row>) {}
}

export namespace WakeSeparation {
    /**
     * Localiser separation distance, in nautical miles, and time between departures, in seconds.
     */
    export type Separation = [
        distance: number,
        interval: number
    ];

    /**
     * A row of separations for all categories based on a leading aircraft’s wake {@link WakeCategory}.
     */
    export type Row = [
        superHeavy: Separation,
        upperHeavy: Separation,
        lowerHeavy: Separation,
        upperMedium: Separation,
        lowerMedium: Separation,
        light: Separation
    ];
}
