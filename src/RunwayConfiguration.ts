import {Runway} from "./Runway.js";

export class RunwayConfiguration {
    public readonly scores: [score: number, Runway, RunwayConfiguration.Options][] = [];

    /**
     * Add a runway to this configuration.
     *
     * @param score The game score at which this runway becomes active.
     * @param runway The runway.
     * @param options Runway options.
     */
    public add(score: number, runway: Runway, options: RunwayConfiguration.Options) {
        this.scores.push([score, runway, options]);
    }
}

export namespace RunwayConfiguration {
    /**
     * Runway options.
     */
    export interface Options {
        /**
         * Whether the runway is open for landings.
         * @default false
         */
        land?: boolean;

        /**
         * Whether the runway is open for departures.
         * @default false
         */
        depart?: boolean;

        /**
         * Whether to enable intersection departures (takeoffs begin 30% down the runway).
         * @default false
         */
        intersection?: boolean;

        /**
         * Whether landings need to backtrack on the runway after landing.
         * @default false
         */
        backtrack?: boolean;

        /**
         * If set, planes flying via {@link SidFix} (but not {@link Departure}) will initially turn to this heading before proceeding to the {@link SidFix}. This can be useful for parallel takeoffs that need to diverge.
         */
        initialHeading?: number;

        /**
         * Whether planes should depart on the {@link initialHeading} without clearance for the SID. This means that you will need to clear departures for the SID manually.
         * @default false
         */
        noSID?: boolean;
    }
}
