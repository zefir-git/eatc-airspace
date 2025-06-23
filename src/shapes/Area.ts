import {Fix} from "../navigation/Fix.js";
import {SecondaryAirport} from "../SecondaryAirport.js";
import {Shape} from "./Shape.js";

/**
 * An area with an altitude restriction.
 */
export class Area extends Shape {
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
     * Position of the label.
     */
    public readonly label: Fix;

    /**
     * Number of lines from the end of the area to make invisible. Set to `Infinity` to make the entire area invisible.
     * Omit to make the entire area visible.
     */
    public readonly invisible?: number;

    /**
     * @param name The name of the area, displayed beneath the altitude restriction. If this name matches a
     *     {@link SecondaryAirport#code}, aircraft departing from or arriving at that airport are exempt from the
     *     altitude restriction. If no name is specified, traffic to or from the {@link PrimaryAirport} is exempt from
     *     the altitude restriction.
     * @param altitude The minimum allowed altitude in feet.
     * @param label Position of the label.
     * @param vertices Vertices that define the area.
     * @param [invisible] Number of lines from the end of the area to make invisible. Set to `Infinity` to make the
     *     entire area invisible. Omit to make the entire area visible.
     */
    public constructor(name: string, altitude: number, label: Fix, vertices: Iterable<Fix>, invisible?: number);

    /**
     * @param altitude The minimum allowed altitude in feet.
     * @param label Position of the label.
     * @param vertices Vertices that define the area.
     * @param [invisible] Number of lines from the end of the area to make invisible. Set to `Infinity` to make the
     *     entire area invisible. Omit to make the entire area visible.
     */
    public constructor(altitude: number, label: Fix, vertices: Iterable<Fix>, invisible?: number);

    /**
     * @param airport The airport whose traffic should be exempt from the altitude restriction.
     * @param altitude The minimum allowed altitude in feet.
     * @param label Position of the label.
     * @param vertices Vertices that define the area.
     * @param [invisible] Number of lines from the end of the area to make invisible. Set to `Infinity` to make the
     *     entire area invisible. Omit to make the entire area visible.
     */
    public constructor(airport: SecondaryAirport, altitude: number, label: Fix, vertices: Iterable<Fix>, invisible?: number);

    public constructor(...args:
        [name: string | SecondaryAirport, altitude: number, label: Fix, vertices: Iterable<Fix>, invisible?: number]
        | [altitude: number, label: Fix, vertices: Iterable<Fix>, invisible?: number]
    ) {
        if (typeof args[0] === "number") {
            const [altitude, label, vertices, invisible] = args as [altitude: number, label: Fix, vertices: Iterable<Fix>, invisible?: number];
            super(vertices);
            this.name = undefined;
            this.altitude = altitude;
            this.label = label;
            this.invisible = invisible;
        }
        else {
            const [name, altitude, label, vertices, invisible] = args as [name: string | SecondaryAirport, altitude: number, label: Fix, vertices: Iterable<Fix>, invisible?: number];
            super(vertices);
            this.name = typeof name === "string" ? name : name.code;
            this.altitude = altitude;
            this.label = label;
            this.invisible = invisible;
        }
    }
}
