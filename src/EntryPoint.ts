/**
 * A point where new arrivals are generated.
 */
export class EntryPoint {
    /**
     * @param bearing The bearing in degrees from the {@link Airspace#center} along which the entry point is located, 11 NMI beyond where this bearing intersects the {@link Airspace#boundary}.
     * @param [altitude] The altitude, in feet, at which arrivals pass the entry point.
     * @param [beacon] The beacon from {@link Airspace#beacons} towards which arrivals from this entry point will be directed.
     */
    public constructor(
        public readonly bearing: string,
        public readonly altitude?: number,
        public readonly beacon?: string,
    ) {}
}
