/**
 * Frequency to which departures can be handed over.
 *
 * Departures will use this frequency when the bearing from the {@link Airspace#center} to the frequency is closest to
 * the bearing from the {@link Airspace#center} to the aircraft’s last SID fix.
 */
export class FrequencyHandoff {
    /**
     * @param bearing Bearing, in degrees from true north.
     * @param callsign ATC callsign.
     * @param pronunciation Pronunciation of the ATC callsign.
     * @param [frequency] Radio frequency, in MHz.
     */
    public constructor(
        public readonly bearing: number,
        public readonly callsign: string,
        public readonly pronunciation: string,
        public readonly frequency?: number,
    ) {}
}
