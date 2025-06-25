import {Runway} from "../Runway.js";
import {ApproachFix} from "./ApproachFix.js";
import {Beacon} from "./Beacon.js";
import {Fix} from "./Fix.js";
import {Route} from "./Route.js";

/**
 * An arrival waypoint route. This can be used for STARs, transitions, RNP approaches, etc.
 */
export class Arrival extends Route<any> {
    /**
     * The name or identifier of this arrival, e.g. ‘OTMET1H’.
     * Note that the game will display a maximum of seven characters.
     */
    public readonly name: string;

    /**
     * The phonetic pronunciation of the arrival name, e.g. ‘Otmet one hotel’.
     */
    public readonly pronunciation?: string;

    /**
     * The runways that need to be active for landings for this arrival to be available.
     */
    public readonly runways: Runway[];

    /**
     * The beacon at the start of the arrival. Aircraft directed to this beacon will have an ‘APP’ option available to
     * enable following the arrival. If you have {@link Airspace#automaticApproach} enabled and this beacon is used as
     * an entry point, then aircraft will automatically follow the arrival. If this beacon is not added to
     * {@link Airspace#beacons}, then it will only be visible when this arrival is available.
     *
     * The beacon will appear as a triangle when the arrival is available.
     */
    public readonly beacon: Beacon;

    /**
     * The inbound bearing for this arrival. If there are multiple arrivals on the specified {@link Beacon}, then an
     * arrival route is selected based on the closest inbound bearing to the beacon.
     */
    public readonly inboundBearing?: number;

    /**
     * The sequence of fixes (waypoints) that define the arrival route.
     */
    public override readonly fixes: (Fix | ApproachFix)[];

    /**
     * How to end the arrival.
     * @default {@link Arrival.End}
     */
    public readonly termination: Arrival.Termination;

    /**
     * @param name The name or identifier of this arrival, e.g. ‘OTMET1H’.
     * @param [pronunciation] The phonetic pronunciation of the arrival name, e.g. ‘Otmet one hotel’.
     * @param runways The runways that need to be active for landings for this arrival to be available.
     * @param beacon The beacon at the start of the arrival.
     * @param inboundBearing The inbound bearing for this arrival.
     * @param route The sequence of fixes (waypoints) that define the arrival route.
     * @param [termination] How to end the arrival.
     */
    public constructor(name: string, pronunciation: string | undefined, runways: Runway[], beacon: Beacon, inboundBearing: number, route: (Fix | ApproachFix)[], termination?: Arrival.Termination);
    /**
     * @param name The name or identifier of this arrival, e.g. ‘OTMET1H’.
     * @param [pronunciation] The phonetic pronunciation of the arrival name, e.g. ‘Otmet one hotel’.
     * @param runways The runways that need to be active for landings for this arrival to be available.
     * @param beacon The beacon at the start of the arrival.
     * @param route The sequence of fixes (waypoints) that define the arrival route.
     * @param [termination] How to end the arrival.
     */
    public constructor(name: string, pronunciation: string | undefined, runways: Runway[], beacon: Beacon, route: (Fix | ApproachFix)[], termination?: Arrival.Termination);
    public constructor(name: string, pronunciation: string | undefined, runways: Runway[], beacon: Beacon, ...args: [inboundBearing: number, route: (Fix | ApproachFix)[], termination?: Arrival.Termination] | [route: (Fix | ApproachFix)[], termination?: Arrival.Termination]) {
        super();
        this.name = name;
        this.pronunciation = pronunciation;
        this.runways = runways;
        this.beacon = beacon;
        if (Array.isArray(args[0])) {
            this.inboundBearing = undefined;
            this.fixes = args[0];
            this.termination = args[1] ?? new Arrival.End();
        }
        else {
            this.inboundBearing = args[0];
            this.fixes = args[1] as (Fix | ApproachFix)[];
            this.termination = args[2] ?? new Arrival.End();
        }
    }
}

export namespace Arrival {
    /**
     * Specifies how the arrival ends.
     */
    export abstract class Termination {}

    /**
     * Intercept ILS at the end of the arrival.
     */
    export class IlsIntercept extends Termination {
        /**
         * @param distance Distance from the (displaced) threshold where to intercept the ILS, in nautical miles.
         * @param [altitude] Maximum altitude at which to intercept the ILS, in feet.
         * @param [speed] Maximum speed at which to intercept the ILS, in KIAS.
         */
        public constructor(
            public readonly distance: number,
            public readonly altitude?: number,
            public readonly speed?: number,
        ) {
            super();
        }
    }

    /**
     * End the arrival and require vectoring.
     */
    export class End extends Termination {
        /**
         * @param [heading] The heading to fly at the end of the arrival, in degrees from true north.
         */
        public constructor(public readonly heading?: number) {
            super();
        }
    }

    /**
     * Enter hold at the last waypoint of the arrival. To be able to define holding pattern inbound leg and direction
     * of turns, you should add a {@link Beacon} to the {@link Airspace#beacons}.
     */
    export class Hold extends Termination {}
}
