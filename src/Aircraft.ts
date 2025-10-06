import {WakeCategory} from "./WakeCategory.js";

/**
 * Custom aircraft type performance parameters.
 *
 * You can use the free
 * {@link https://learningzone.eurocontrol.int/ilp/customs/ATCPFDB/default.aspx EUROCONTROL Aircraft Performance Database}
 * to find performance information about aircraft.
 */
export class Aircraft {
    /**
     * ICAO type designator.
     */
    public readonly type: string;

    /**
     * Name of the aircraft manufacturer.
     */
    public readonly manufacturer?: string;

    /**
     * Wake turbulence category.
     */
    public readonly category: WakeCategory;

    /**
     * Range of the assignable speed in KIAS.
     */
    public readonly speed: [min: number, max: number];

    /**
     * Range of final approach speeds in KIAS. May be lower than {@link speed}.
     */
    public readonly approachSpeed: [min: number, max: number];

    /**
     * Typical acceleration range in KIAS/s². A random value is selected from this range.
     */
    public readonly acceleration: [min: number, max: number];

    /**
     * Typical climb rate range in ft/min. A random value is selected from this range.
     */
    public readonly climbRate: [min: number, max: number];

    /**
     * Typical descent rate range in ft/min. A random value is selected from this range.
     */
    public readonly descentRate: [min: number, max: number];

    /**
     * Typical turn rate range in °/s. A random value is selected from this range.
     */
    public readonly turnRate: [min: number, max: number];

    /**
     * Typical bank (roll) angle range in °. The minimum does not indicate the minimum possible bank angle.
     * A random value is selected from this range.
     */
    public readonly bankAngle: [min: number, max: number];

    /**
     * Typical bank (roll) rate range in °/s. A random value is selected from this range.
     */
    public readonly bankRate: [min: number, max: number];

    /**
     * @param options Aircraft performance parameters.
     * @param options.type ICAO type designator.
     * @param [options.manufacturer] Name of the aircraft manufacturer.
     * @param options.category Wake turbulence category.
     * @param options.speed Range of the assignable speed in KIAS.
     * @param options.approachSpeed Range of final approach speeds in KIAS. May be lower than {@link speed}.
     * @param [options.acceleration=[1.1, 1.3]] Typical acceleration range in KIAS/s². A random value is selected from this range.
     * @param [options.climbRate] Typical climb rate range in ft/min. A random value is selected from this range. Defaults to double the {@link descentRate}.
     * @param [options.descentRate=[1400, 1600]] Typical descent rate range in ft/min. A random value is selected from this range.
     * @param [options.turnRate=[2.9, 3.1]] Typical turn rate range in °/s. A random value is selected from this range.
     * @param [options.bankAngle=[25, 30]] Typical bank (roll) angle range in °. The minimum does not indicate the minimum possible bank angle.
     * A random value is selected from this range.
     * @param [options.bankRate=[3, 5]] Typical bank (roll) rate range in °/s. A random value is selected from this range.
     */
    public constructor({
        type,
        manufacturer,
        category,
        speed,
        approachSpeed,
        acceleration = [1.1, 1.3],
        climbRate,
        descentRate = [1400, 1600],
        turnRate = [2.9, 3.1],
        bankAngle = [25, 30],
        bankRate = [3, 5],
    }: {
        type: string;
        manufacturer?: string;
        category: WakeCategory;
        speed: [min: number, max: number];
        approachSpeed: [min: number, max: number];
        acceleration: [min: number, max: number];
        climbRate?: [min: number, max: number];
        descentRate: [min: number, max: number];
        turnRate: [min: number, max: number];
        bankAngle: [min: number, max: number];
        bankRate: [min: number, max: number];
    }) {
        this.type = type;
        this.manufacturer = manufacturer;
        this.category = category;
        this.speed = speed;
        this.approachSpeed = approachSpeed;
        this.acceleration = acceleration;
        this.climbRate = climbRate ?? [descentRate[0] * 2, descentRate[1] * 2];
        this.descentRate = descentRate;
        this.turnRate = turnRate;
        this.bankAngle = bankAngle;
        this.bankRate = bankRate;
    }
}
