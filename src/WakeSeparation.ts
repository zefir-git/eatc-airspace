import {WakeCategory} from "./WakeCategory.js";

/**
 * A wake turbulence separation matrix indexed by {@link WakeCategory}.
 *
 * Each row corresponds to a leading aircraft’s wake category and contains six {@link WakeSeparation.Separation} values
 * representing required separation from the leader to each possible following category.
 *
 * @param rows A mapping from each leading {@link WakeCategory} to a {@link WakeSeparation.Row} containing separations
 *     to all following categories.
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
