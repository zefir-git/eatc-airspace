import {Fix} from "../navigation/Fix.js";
import {SecondaryAirport} from "../SecondaryAirport.js";
import {Radius} from "./Radius.js";

/**
 * A circular area with an altitude restriction.
 */
export class CircleArea extends Radius {
    /**
     * The name of the area, displayed beneath the altitude restriction. If this name matches a
     * {@link SecondaryAirport#code}, aircraft departing from or arriving at that airport are exempt from the altitude
     * restriction. If no name is specified, traffic to or from the {@link PrimaryAirport} is exempt from the altitude
     * restriction.
     */
    public readonly name?: string;

    /**
     * The minimum allowed altitude in feet.
     */
    public readonly altitude: number;

    /**
     * The centre of the circle.
     */
    public readonly center: Fix;

    /**
     * Position of the label.
     */
    public readonly label: Fix;

    /**
     * Start and end angle of the visible arc, as bearings in degrees from true north. If omitted, the full circle is
     * visible.
     */
    public readonly visibleArc?: [start: number, end: number];

    /**
     * @param name The name of the area, displayed beneath the altitude restriction. If this name matches a
     *     {@link SecondaryAirport#code}, aircraft departing from or arriving at that airport are exempt from the
     *     altitude restriction. If no name is specified, traffic to or from the {@link PrimaryAirport} is exempt from
     *     the altitude restriction.
     * @param altitude The minimum allowed altitude in feet.
     * @param center The centre of the circle.
     * @param radius The radius of the circle, in nautical miles.
     * @param label Position of the label.
     * @param [visibleArc] Start and end angle of the visible arc, as bearings in degrees from true north. If omitted,
     *     the full circle is visible.
     */
    public constructor(name: string, altitude: number, center: Fix, radius: number, label: Fix, visibleArc?: [start: number, end: number]);
    /**
     * @param altitude The minimum allowed altitude in feet.
     * @param center The centre of the circle.
     * @param radius The radius of the circle, in nautical miles.
     * @param label Position of the label.
     * @param [visibleArc] Start and end angle of the visible arc, as bearings in degrees from true north. If omitted,
     *     the full circle is visible.
     */
    public constructor(altitude: number, center: Fix, radius: number, label: Fix, visibleArc?: [start: number, end: number]);

    /**
     * @param airport The airport whose traffic should be exempt from the altitude restriction.
     * @param altitude The minimum allowed altitude in feet.
     * @param center The centre of the circle.
     * @param radius The radius of the circle, in nautical miles.
     * @param label Position of the label.
     * @param [visibleArc] Start and end angle of the visible arc, as bearings in degrees from true north. If omitted,
     *     the full circle is visible.
     */
    public constructor(airport: SecondaryAirport, altitude: number, center: Fix, radius: number, label: Fix, visibleArc?: [start: number, end: number]);

    public constructor(...args:
        [name: string | SecondaryAirport, altitude: number, center: Fix, radius: number, label: Fix, visibleArc?: [start: number, end: number]]
        | [altitude: number, center: Fix, radius: number, label: Fix, visibleArc?: [start: number, end: number]]
    ) {
        if (typeof args[0] === "number") {
            const [altitude, center, radius, label, visibleArc] = args as [altitude: number, center: Fix, radius: number, label: Fix, visibleArc?: [start: number, end: number]];
            super(radius);
            this.name = undefined;
            this.altitude = altitude;
            this.center = center;
            this.label = label;
            this.visibleArc = visibleArc;
        }
        else {
            const [name, altitude, center, radius, label, visibleArc] = args as [name: string | SecondaryAirport, altitude: number, center: Fix, radius: number, label: Fix, visibleArc?: [start: number, end: number]];
            super(radius);
            this.name = typeof name === "string" ? name : name.code;
            this.altitude = altitude;
            this.center = center;
            this.label = label;
            this.visibleArc = visibleArc;
        }
    }
}
