import {Fix} from "../navigation/Fix.js";
import {Polyline} from "./Polyline.js";

/**
 * A circle approximated from lines, drawn clockwise.
 */
export class Circle extends Polyline {
    /**
     * @param center The centre of the circle.
     * @param radius The radius of the circle, in nautical miles.
     * @param color The color of the circle.
     * @param [segments=360] The number of vertices used to approximate the circle.
     */
    public constructor(
        public readonly center: Fix,
        public readonly radius: number,
        color: Polyline.Color | Polyline.RGB,
        segments: number = 360
    ) {
        super([], color);

        for (let i = 0; i < segments; ++i)
            this.append(
                this.center.destination(Fix.radToDeg((2 * Math.PI * i) / segments), this.radius)
            );
    }

    /**
     * Get an arc from the circle.
     *
     * @param start Bearing in degrees from true north where the arc starts.
     * @param end Bearing in degrees from true north where the arc ends.
     */
    public arc(start: number, end: number): Polyline;

    /**
     * Get an arc from the circle.
     *
     * @param start The fix to determine the start bearing of the arc.
     * @param end The fix to determine the end bearing of the arc.
     */
    public arc(start: Fix, end: Fix): Polyline;

    public arc(...args: [start: number, end: number] | [start: Fix, end: Fix]): Polyline {
        if (typeof args[0] === "number") {
            const [start, end] = args as [number, number];

            // normalise the angles
            const startAngle = ((start % 360) + 360) % 360;
            const endAngle = ((end % 360) + 360) % 360;

            return new Polyline(
                this.vertices
                    .map((v) => [this.center.initialBearing(v), v] as const)
                    .filter(([θ]) => (startAngle <= endAngle) ? (θ >= startAngle && θ <= endAngle) : (θ >= startAngle || θ <= endAngle))
                    .sort(([θa], [θb]) => θa - θb)
                    .map(([, v]) => v),
                this.color
            );
        }
        else {
            const [start, end] = args as [Fix, Fix];
            return this.arc(this.center.initialBearing(start), this.center.initialBearing(end));
        }
    }

    /**
     * Get an anti-clockwise arc from the circle.
     *
     * @param start Bearing in degrees from true north where the arc starts.
     * @param end Bearing in degrees from true north where the arc ends.
     */
    public ccArc(start: number, end: number): Polyline;

    /**
     * Get an anti-clockwise arc from the circle.
     *
     * @param start The fix to determine the start bearing of the arc.
     * @param end The fix to determine the end bearing of the arc.
     */
    public ccArc(start: Fix, end: Fix): Polyline;

    public ccArc(...args: [number, number] | [Fix, Fix]): Polyline {
        // Cast needed as TypeScript doesn’t know which overload we’re calling
        return this.arc(...args as [any, any]).reverse();
    }
}
