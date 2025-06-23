import {Fix} from "../navigation/Fix.js";
import {Shape} from "./Shape.js";

/**
 * A polyline with an optional colour.
 */
export class Polyline extends Shape {
    /**
     * @param vertices Ordered vertices comprising the polyline.
     * @param [color=Polyline.Color.AIRSPACE] The color of the polyline.
     */
    public constructor(
        vertices: Fix[],
        public readonly color: Polyline.Color | Polyline.RGB = Polyline.Color.AIRSPACE,
    ) {
        super(vertices);
    }
}

export namespace Polyline {
    /**
     * Colours configured in-game by the user.
     */
    export const enum Color {
        /**
         * Colour for coastlines, rivers, lakes, etc.
         */
        COAST = "coast",

        /**
         * Colour for areas, such as CTAs, TMAs, CTRs, etc.
         */
        AIRSPACE = "airspace",

        /**
         * The colour in which active runways and localisers are drawn.
         */
        RUNWAY = "runway"
    }

    /**
     * A custom RGB colour.
     */
    export class RGB {
        /**
         * @param r The red component (0–255).
         * @param g The green component (0–255).
         * @param b The blue component (0–255).
         * @throw {@link !RangeError} If any component is out of [0, 255] range.
         */
        public constructor(public readonly r: number, public readonly g: number, public readonly b: number) {
            if (r < 0 || r > 255)
                throw new RangeError("Red component must be in the range [0, 255]");
            if (g < 0 || g > 255)
                throw new RangeError("Green component must be in the range [0, 255]");
            if (b < 0 || b > 255)
                throw new RangeError("Blue component must be in the range [0, 255]");
        }

        /**
         * Create RGB colour from a number. You can specify a hex number, e.g. 0x00FF00.
         *
         * @param hex A 3-byte unsigned integer.
         * @throw {@link !RangeError} If the number is not a 3-byte unsigned integer.
         */
        public static hex(hex: number): RGB {
            if (hex < 0 || hex > 0xFFFFFF)
                throw new RangeError("Hex colour must be a 3-byte unsigned integer");
            return new RGB((hex >> 16) & 0xFF, (hex >> 8) & 0xFF, hex & 0xFF);
        }
    }
}
