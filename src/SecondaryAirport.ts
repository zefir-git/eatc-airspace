import {Beacon} from "./navigation/index.js";
import {PrimaryAirport} from "./PrimaryAirport.js";

export class SecondaryAirport extends PrimaryAirport {
    /**
     * @param code The final two letters of the ICAO code of the airport, e.g. ‘KK’ (from ‘EGKK’) for London Gatwick.
     * @param name The official name of the airport.
     * @param [pronunciation] The pronunciation of the airport name, used by arriving traffic.
     * @param initialClimb The initial climb altitude in feet for departures.
     * @param flow Approximate traffic flow, in flights per hour per active runway. Increases slightly with score.
     * @param inboundBeacon The default initial beacon for arrivals. If not already in {@link Airspace#beacons}, it
     *     will be added when this airport is registered.
     */
    public constructor(
        code: string,
        name: string,
        pronunciation: string | undefined,
        initialClimb: number,
        public readonly flow: number,
        public readonly inboundBeacon: Beacon,
    ) {
        super(code, name, pronunciation, initialClimb);
    }
}
