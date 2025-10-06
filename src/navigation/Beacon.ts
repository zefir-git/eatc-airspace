import {Fix} from "./Fix.js";
import {NamedFix} from "./NamedFix.js";
import {SidFix} from "./SidFix.js";

/**
 * A beacon is a named fix, optionally associated with a holding pattern, to which aircraft can be given a direct. It
 * is always displayed on the screen.
 */
export class Beacon extends SidFix {

    /**
     * @param latitude The latitude, in degrees, of the beacon.
     * @param longitude The longitude, in degrees, of the beacon.
     * @param name The visible name of the beacon.
     * @param pronunciation The pronunciation of the beacon’s name.
     * @param [holdingPattern] The holding pattern of the beacon.
     */
    public constructor(
        latitude: number,
        longitude: number,
        name: string,
        pronunciation?: string,
        public readonly holdingPattern?: Beacon.HoldingPattern
    ) {
        super(latitude, longitude, name, pronunciation);
    }

    /**
     * Create beacon from a fix.
     *
     * @param fix The fix.
     * @param name The visible name of the beacon.
     * @param pronunciation The pronunciation of the beacon’s name.
     * @param [holdingPattern] The holding pattern of the beacon.
     */
    public static override fromFix(fix: Fix,
        name: string,
        pronunciation?: string,
        holdingPattern?: Beacon.HoldingPattern): Beacon {
        return new Beacon(fix.latitude, fix.longitude, name, pronunciation, holdingPattern);
    }

    /**
     * Create beacon from a named fix.
     *
     * @param namedFix The named fix.
     * @param pronunciation The pronunciation of the beacon’s name.
     * @param [holdingPattern] The holding pattern of the beacon.
     */
    public static override fromNamedFix(namedFix: NamedFix, pronunciation?: string, holdingPattern?: Beacon.HoldingPattern): Beacon {
        return new Beacon(namedFix.latitude, namedFix.longitude, namedFix.name, pronunciation, holdingPattern);
    }
}

export namespace Beacon {
    /**
     * Specifies the direction of turns made by an aircraft while flying a holding pattern.
     */
    export const enum TurnDirection {
        RIGHT = 1,
        LEFT = -1
    }

    /**
     * Describes the parameters of a holding pattern for aircraft navigation.
     */
    export class HoldingPattern {
        /**
         * Constructs a holding pattern.
         *
         * @param inboundCourse The inbound course (track towards the fix), in degrees.
         * @param [turnDirection=TurnDirection.RIGHT] The direction of turns in the holding pattern.
         */
        public constructor(
            public readonly inboundCourse: number,
            public readonly turnDirection: TurnDirection = TurnDirection.RIGHT
        ) {
            if (inboundCourse === 0)
                this.inboundCourse = 360;
        }
    }
}
