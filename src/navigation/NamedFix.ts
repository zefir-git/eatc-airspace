import {Fix} from "./Fix.js";

/**
 * A named fix is a fix with a user-friendly name. The fix name is never visible, unless it is used as a {@link Beacon}
 * or SID marker. It is recommended to use named fixes so that you can quickly reuse them with a {@link Registry}.
 */
export class NamedFix extends Fix {
    /**
     * @param latitude The latitude, in degrees, of the named fix.
     * @param longitude The longitude, in degrees, of the named fix.
     * @param name The name of the named fix.
     */
    public constructor(latitude: number, longitude: number, public readonly name: string) {
        super(latitude, longitude);
    }

    /**
     * Create a named fix from a fix.
     *
     * @param fix The fix.
     * @param name The name of the named fix.
     */
    public static fromFix(fix: Fix, name: string, ..._: any): NamedFix {
        return new NamedFix(fix.latitude, fix.longitude, name);
    }
}
