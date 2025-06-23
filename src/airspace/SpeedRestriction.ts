export class SpeedRestriction {
    /**
     * Maximum speed within radius of the {@link Airspace#center}.
     */
    public readonly withinRadius: SpeedRestriction.WithinRadius;

    /**
     * Maximum speed below altitude.
     */
    public readonly belowAltitude: SpeedRestriction.BelowAltitude;

    /**
     * Maximum speed on localiser.
     */
    public readonly onLocaliser: SpeedRestriction.OnLocaliser;

    /**
     * @param [withinRadius] Maximum speed within radius of the {@link Airspace#center}.
     * @param [belowAltitude] Maximum speed below altitude.
     * @param [onLocaliser] Maximum speed on localiser.
     */
    public constructor(withinRadius?: SpeedRestriction.WithinRadius, belowAltitude?: SpeedRestriction.BelowAltitude, onLocaliser?: SpeedRestriction.OnLocaliser) {
        this.withinRadius = withinRadius ?? new SpeedRestriction.WithinRadius(0, 0);
        this.belowAltitude = belowAltitude ?? new SpeedRestriction.BelowAltitude(0, 0);
        this.onLocaliser = onLocaliser ?? new SpeedRestriction.OnLocaliser(0, 0);
    }
}

export namespace SpeedRestriction {
    /**
     * Maximum speed within radius of the {@link Airspace#center}.
     */
    export class WithinRadius {
        /**
         * @param radius Radius, in nautical miles.
         * @param speed Maximum speed, in KIAS.
         */
        public constructor(public readonly radius: number, public readonly speed: number) {}
    }

    /**
     * Maximum speed below altitude.
     */
    export class BelowAltitude {
        /**
         * @param altitude Altitude, in feet.
         * @param speed Maximum speed, in KIAS.
         */
        public constructor(public readonly altitude: number, public readonly speed: number) {}
    }

    /**
     * Maximum speed on localiser.
     */
    export class OnLocaliser {
        /**
         * @param distance Distance to touchdown, in nautical miles.
         * @param speed Maximum speed, in KIAS.
         */
        public constructor(public readonly distance: number, public readonly speed: number) {}
    }
}
