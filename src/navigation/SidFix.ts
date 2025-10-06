import {Fix} from "./Fix.js";
import {NamedFix} from "./NamedFix.js";

/**
 * A fix used as a SID endpoint.
 */
export class SidFix extends NamedFix {

    /**
     * @param latitude The latitude, in degrees, of the beacon.
     * @param longitude The longitude, in degrees, of the beacon.
     * @param name The visible name of the beacon.
     * @param pronunciation The pronunciation of the beacon’s name.
     */
    public constructor(
        latitude: number,
        longitude: number,
        public override readonly name: string,
        public readonly pronunciation?: string,
    ) {
        super(latitude, longitude, name);
    }

    /**
     * Create SID fix from a fix.
     *
     * @param fix A fix.
     * @param name The visible name of the sid fix.
     * @param pronunciation The pronunciation of the SID fix’s name.
     */
    public static override fromFix(
        fix: Fix,
        name: string,
        pronunciation?: string,
    ): SidFix {
        return new SidFix(fix.latitude, fix.longitude, name, pronunciation);
    }

    /**
     * Create SID fix from a named fix.
     *
     * @param namedFix The named fix.
     * @param pronunciation The pronunciation of the SID fix’s name.
     */
    public static fromNamedFix(namedFix: NamedFix, pronunciation?: string): SidFix {
        return new SidFix(namedFix.latitude, namedFix.longitude, namedFix.name, pronunciation);
    }
}
