import {PrimaryAirport} from "./PrimaryAirport.js";

export class SecondaryAirport extends PrimaryAirport {
    /**
     * @param code The final two letters of the ICAO code of the airport, e.g. ‘KK’ (from ‘EGKK’) for London Gatwick.
     * @param name
     * @param pronunciation
     * @param initialClimb
     * @param flow Approximate traffic flow, in flights per hour per active runway. Increases slightly with score.
     * @param inboundBeacon The default initial beacon (from {@link Airspace#beacons}) for arrivals.
     */
    public constructor(
        code: string,
        name: string,
        pronunciation: string,
        initialClimb: number,
        public readonly flow: number,
        public readonly inboundBeacon: string,
    ) {
        super(code, name, pronunciation, initialClimb);
    }
}
