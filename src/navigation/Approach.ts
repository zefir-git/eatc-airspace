import {Runway} from "../Runway.js";
import {ApproachFix} from "./ApproachFix.js";
import {Beacon} from "./Beacon.js";
import {Fix} from "./Fix.js";
import {Route} from "./Route.js";

/**
 * An approach waypoint route. This can be used for STARs, transitions, RNP approaches, etc.
 */
export class Approach extends Route<any> {
    /**
     * The name or identifier of this approach, e.g. ‘OTMET1H’.
     * Note that the game will display a maximum of seven characters.
     */
    public readonly name: string;

    /**
     * The phonetic pronunciation of the approach name, e.g. ‘Otmet one hotel’.
     */
    public readonly pronunciation: string;

    /**
     * The runways that need to be active for landings for this approach to be available.
     */
    public readonly runways: Runway[];

    /**
     * The beacon at the start of the approach. Aircraft directed to this beacon will have an ‘APP’ option available to
     * enable following the approach. If you have {@link Airspace#automaticApproach} enabled and this beacon is used as
     * an entry point, then aircraft will automatically follow the approach. If this beacon is not added to
     * {@link Airspace#beacons}, then it will only be visible when this approach is available.
     *
     * The beacon will appear as a triangle when the approach is available.
     */
    public readonly beacon: Beacon;

    /**
     * The inbound bearing for this approach. If there are multiple approaches on the specified {@link Beacon}, then an
     * approach route is selected based on the closest inbound bearing to the beacon.
     */
    public readonly inboundBearing?: number;

    /**
     * The sequence of fixes (waypoints) that define the approach route.
     */
    public readonly route: (Fix | ApproachFix)[];

    /**
     * How to end the approach.
     * @default {@link Approach.End}
     */
    public readonly termination: Approach.Termination;

    /**
     * @param name The name or identifier of this approach, e.g. ‘OTMET1H’.
     * @param pronunciation The phonetic pronunciation of the approach name, e.g. ‘Otmet one hotel’.
     * @param runways The runways that need to be active for landings for this approach to be available.
     * @param beacon The beacon at the start of the approach.
     * @param inboundBearing The inbound bearing for this approach.
     * @param route The sequence of fixes (waypoints) that define the approach route.
     * @param [termination] How to end the approach.
     */
    public constructor(name: string, pronunciation: string, runways: Runway[], beacon: Beacon, inboundBearing: number, route: (Fix | ApproachFix)[], termination?: Approach.Termination);
    /**
     * @param name The name or identifier of this approach, e.g. ‘OTMET1H’.
     * @param pronunciation The phonetic pronunciation of the approach name, e.g. ‘Otmet one hotel’.
     * @param runways The runways that need to be active for landings for this approach to be available.
     * @param beacon The beacon at the start of the approach.
     * @param route The sequence of fixes (waypoints) that define the approach route.
     * @param [termination] How to end the approach.
     */
    public constructor(name: string, pronunciation: string, runways: Runway[], beacon: Beacon, route: (Fix | ApproachFix)[], termination?: Approach.Termination);
    public constructor(name: string, pronunciation: string, runways: Runway[], beacon: Beacon, ...args: [inboundBearing: number, route: (Fix | ApproachFix)[], termination?: Approach.Termination] | [route: (Fix | ApproachFix)[], termination?: Approach.Termination]) {
        super();
        this.name = name;
        this.pronunciation = pronunciation;
        this.runways = runways;
        this.beacon = beacon;
        if (Array.isArray(args[0])) {
            this.inboundBearing = undefined;
            this.route = args[0];
            this.termination = args[1] ?? new Approach.End();
        }
        else {
            this.inboundBearing = args[0];
            this.route = args[1] as (Fix | ApproachFix)[];
            this.termination = args[2] ?? new Approach.End();
        }
    }
}

export namespace Approach {
    /**
     * Specifies how the approach ends.
     */
    export abstract class Termination {}

    /**
     * Intercept ILS at the end of the approach.
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
     * End the approach and require vectoring.
     */
    export class End extends Termination {
        /**
         * @param [heading] The heading to fly at the end of the approach, in degrees from true north.
         */
        public constructor(public readonly heading?: number) {
            super();
        }
    }

    /**
     * Enter hold at the last waypoint of the approach. To be able to define holding pattern inbound leg and direction
     * of turns, you should add a {@link Beacon} to the {@link Airspace#beacons}.
     */
    export class Hold extends Termination {}
}
