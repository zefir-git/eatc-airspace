import {Fix} from "./navigation/Fix.js";

export class Runway {
    /**
     * Internal runway identifier.
     */
    public readonly id: string;

    /**
     * Name of this end of the runway.
     *
     * @example "27L"
     * @example "04"
     * @example "22C"
     * @example "36R"
     */
    public readonly name: `${number}${"L" | "R" | "C" | ""}`;

    /**
     * The coordinates this end of the runway where the usable surface starts (i.e. including the displaced threshold).
     */
    public readonly position: Fix;

    /**
     * The true bearing of this end of the runway, in degrees from true north.
     */
    public readonly bearing: number;

    /**
     * The length of this end of the runway, in feet.
     */
    public readonly length: number;

    /**
     * Length of the displaced threshold on this end of the runway, in feet.
     */
    public readonly displaced: number;

    /**
     * Length of the displaced threshold on the opposite end of the runway, in feet.
     */
    public readonly oppositeDisplaced: number;

    /**
     * The elevation of the runway, in feet. Must be within 1000 feet of {@link Airspace#elevation}.
     */
    public readonly elevation?: number;

    /**
     * Vertical descent angle of the glideslope for landing on this runway end, measured in degrees from the horizontal.
     */
    public readonly glideslope: number;

    /**
     * Vertical descent angle of the glideslope for landing on the opposite end of the runway, measured in degrees from the horizontal.
     */
    public readonly oppositeGlideslope: number;

    /**
     * True bearing of the ILS localiser for landing on this runway end, in degrees from true north.
     */
    public readonly localizer: number;

    /**
     * True bearing of the ILS localiser for landing on the opposite end of the runway, in degrees from true north.
     */
    public readonly oppositeLocalizer: number;

    /**
     * A point on the localiser at a certain distance (NM) from the (displaced) threshold for approaches on this runway end.
     */
    public readonly localizerFix?: Runway.LocalizerFix;

    /**
     * A point on the localiser at a certain distance (NM) from the (displaced) threshold for approaches on the opposite end of the runway.
     */
    public readonly oppositeLocalizerFix?: Runway.LocalizerFix;

    /**
     * Tower frequency.
     */
    public readonly towerFrequency?: number;

    /**
     * Tower name pronunciation.
     *
     * @example "Gatwick Tower"
     */
    public readonly towerPronunciation?: string;

    /**
     * @param options Runway options.
     * @param options.id Internal runway identifier.
     * @param options.name Name of this end of the runway.
     * @param options.position The coordinates this end of the runway where the usable surface starts (i.e. including the displaced threshold).
     * @param options.bearing The true bearing of this end of the runway, in degrees from true north.
     * @param options.length The length of this end of the runway, in feet.
     * @param [options.displaced=0] Length of the displaced threshold on this end of the runway, in feet.
     * @param [options.elevation] The elevation of the runway, in feet. Must be within 1000 feet of {@link Airspace#elevation}.
     * @param [options.glideslope=3] Vertical descent angle of the glideslope for landing on this runway end, measured in degrees from the horizontal.
     * @param [options.localizer] True bearing of the ILS localiser for landing on this runway end, in degrees from true north.
     * @param [options.localizerFix] A point on the localiser at a certain distance (NM) from the (displaced) threshold for approaches on this runway end.
     * @param [options.towerFrequency] Tower frequency.
     * @param [options.towerPronunciation] Tower name pronunciation.
     * @param [options.opposite] Opposite runway end options.
     * @param [options.opposite.displaced=0] Length of the displaced threshold on the opposite end of the runway, in feet.
     * @param [options.opposite.glideslope=3] Vertical descent angle of the glideslope for landing on the opposite end of the runway, measured in degrees from the horizontal.
     * @param [options.opposite.localizer] True bearing of the ILS localiser for landing on the opposite end of the runway, in degrees from true north.
     * @param [options.opposite.localizerFix] A point on the localiser at a certain distance (NM) from the (displaced) threshold for approaches on the opposite end of the runway.
     */
    public constructor(options: {
        id: string;
        name: `${number}${"L" | "R" | "C" | ""}`;
        position: Fix;
        bearing: number;
        length: number;
        displaced?: number;
        elevation?: number;
        glideslope?: number;
        localizer?: number;
        localizerFix?: Runway.LocalizerFix;
        towerFrequency?: number;
        towerPronunciation?: string;
        opposite?: {
            displaced?: number;
            glideslope?: number;
            localizer?: number;
            localizerFix?: Runway.LocalizerFix;
        };
    }) {
        this.id = options.id;
        this.name = options.name;
        this.position = options.position;
        this.bearing = options.bearing;
        this.length = options.length;
        this.displaced = options.displaced ?? 0;
        this.elevation = options.elevation;
        this.glideslope = options.glideslope ?? 3;
        this.localizer = options.localizer ?? options.bearing;
        this.localizerFix = options.localizerFix;
        this.towerFrequency = options.towerFrequency;
        this.towerPronunciation = options.towerPronunciation;
        this.oppositeDisplaced = options.opposite?.displaced ?? 0;
        this.oppositeGlideslope = options.opposite?.glideslope ?? 3;
        this.oppositeLocalizer = options.opposite?.localizer ?? options.bearing;
        this.oppositeLocalizerFix = options.opposite?.localizerFix;
    }

    /**
     * Whether this is the reverse end of a runway.
     */
    public isReverse(): boolean {
        return this.id.endsWith("rev");
    }

    /**
     * Get the true {@link id} of the runway, even if this is the reversed end.
     */
    public realId(): string {
        return this.isReverse() ? this.id.slice(0, -3) : this.id;
    }

    /**
     * Get the opposite end of this runway. If already an opposite end, returns the primary end.
     */
    public reverse(): Runway {
        const id = this.isReverse() ? this.realId() : this.id + "rev";
        const number = Number(this.name.match(/\d+/)?.[0]!);
        const letter = (this.name.match(/[LRC]$/)?.[0] ?? "") as "L" | "R" | "C" | "";
        const oppositeLetter = letter === "" ? "" : letter === "L" ? "R" : letter === "R" ? "L" : "C";
        const name: `${number}${"L" | "R" | "C" | ""}` = `${(number + 18) % 360}${oppositeLetter}`;
        const bearing = (this.bearing + 180) % 360;
        const position = this.position.destination(bearing, this.length);
        return new Runway({
            id,
            name,
            position,
            bearing,
            length: this.length,
            displaced: this.oppositeDisplaced,
            elevation: this.elevation,
            glideslope: this.oppositeGlideslope,
            localizer: this.oppositeLocalizer,
            localizerFix: this.oppositeLocalizerFix,
            towerFrequency: this.towerFrequency,
            towerPronunciation: this.towerPronunciation,
            opposite: {
                displaced: this.displaced,
                glideslope: this.glideslope,
                localizer: this.localizer,
                localizerFix: this.localizerFix,
            },
        });
    }

    /**
     * Get the position of the runway threshold.
     */
    public thr(): Fix {
        return this.position.destination(this.reverse().bearing, this.displaced);
    }
}

export namespace Runway {
    /**
     * A fix displayed on the approach localiser when the runway end is active for landings.
     */
    export class LocalizerFix {
        /**
         * Name of the fix.
         */
        public readonly name: string;

        /**
         * Distance from the (displaced) threshold, in nautical miles.
         */
        public readonly distance: number;

        /**
         * Pronunciation of the fix’s name.
         */
        public readonly pronunciation?: string;

        /**
         * @param name Name of the fix.
         * @param pronunciation Pronunciation of the fix’s name.
         * @param distance Distance from the (displaced) threshold, in nautical miles.
         */
        public constructor(name: string, pronunciation: string, distance: number);
        /**
         * @param name Name of the fix.
         * @param distance Distance from the (displaced) threshold, in nautical miles.
         */
        public constructor(name: string, distance: number);
        public constructor(...args: [string, string, number] | [string, number]) {
            if (args.length === 3) {
                this.name = args[0];
                this.pronunciation = args[1];
                this.distance = args[2];
            }
            else {
                this.name = args[0];
                this.distance = args[1];
            }
        }
    }
}
