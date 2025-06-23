import {Fix} from "./Fix.js";

/**
 * Represents a fix that is part of an {@link Approach} and may include optional operational constraints.
 *
 * An ApproachFix extends the basic geographic fix by optionally specifying altitude and speed constraints
 * that must be adhered to when passing this fix during an approach procedure.
 */
export class ApproachFix extends Fix {
    /**
     * @param latitude The latitude of the fix, expressed in decimal degrees.
     * @param longitude The longitude of the fix, expressed in decimal degrees.
     * @param [altitude] Optional altitude constraint, in feet. The constraint indicates the aircraft must be at or
     *     below this altitude when passing the fix.
     * @param [speed] Optional speed constraint, in KIAS (knots indicated airspeed). The constraint indicates the aircraft must be at or below
     *     this speed when passing the fix.
     */
    public constructor(
        latitude: number,
        longitude: number,
        public readonly altitude?: number,
        public readonly speed?: number,
    ) {
        super(latitude, longitude);
    }

    /**
     * Create approach fix from a fix.
     *
     * @param fix A fix.
     * @param [altitude] Optional altitude constraint, in feet.
     * @param [speed] Optional speed constraint, in KIAS (knots indicated airspeed).
     * @returns A new ApproachFix with the specified constraints.
     */
    public static from(fix: Fix, altitude?: number, speed?: number): ApproachFix {
        return new ApproachFix(fix.latitude, fix.longitude, altitude, speed);
    }
}
