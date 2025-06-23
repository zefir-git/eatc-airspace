import {CardinalDirection} from "./CardinalDirection.js";

export class Fix {
    /**
     * Mean radius of Earth, in metres.
     */
    public static readonly R = 6371e3;
    /**
     * Metres in a nautical mile.
     */
    public static readonly NMI = 1852;
    /**
     * Feet in a metre.
     */
    public static readonly FT = 0.3048;
    private static readonly cardinalToSign: ReadonlyMap<CardinalDirection, 1 | -1> = new Map([
        [CardinalDirection.NORTH, 1],
        [CardinalDirection.EAST, 1],
        [CardinalDirection.SOUTH, -1],
        [CardinalDirection.WEST, -1],
    ]);

    /**
     * @param latitude The latitude, in degrees, of this fix.
     * @param longitude The longitude, in degrees, of this fix.
     */
    constructor(public readonly latitude: number, public readonly longitude: number) {}

    /**
     * Create fix from DMS coordinates string.
     *
     * This method accepts a wide range of formats and notations for DMS (degrees, minutes, seconds) coordinates.
     * However, the following criteria must always be satisfied:
     *
     * - Degrees, minutes, and seconds must all be present (even if 0), and in that order.
     * - Degrees ∈ [0, 180).
     * - Minutes ∈ [0, 60).
     * - Seconds ∈ [0, 60).
     * - A cardinal direction must be indicated by the first occurrence of either a case-insensitive character N, E, S,
     * or W, or a ‘+’, dash (‘-’), or minus (‘−’) sign, present anywhere in the coordinate string.
     *
     * @example fromDMS("512930N", "0011311W")
     * @example fromDMS("512839.63N", "0002559.82W")
     * @example fromDMS("51° 34' 45.0732\" N", "0° 36' 29.8230\" E")
     *
     * @param latitude Latitude in DMS.
     * @param longitude Longitude in DMS.
     *
     * @throws {@link !SyntaxError} If the DMS components cannot be determined from the string.
     * @throws {@link !RangeError} If the DMS components are not within the expected ranges.
     */
    public static fromDms(latitude: string, longitude: string): Fix {
        return new Fix(
            this.parseDms(latitude),
            this.parseDms(longitude),
        );
    }

    /**
     * Create a fix from 3-dimensional cartesian coordinates.
     *
     * @param coordinates 3D cartesian coordinates.
     */
    public static fromCartesian([x, y, z]: readonly [x: number, y: number, z: number]): Fix {
        return Fix.fromRadians(Math.asin(z), Math.atan2(y, x));
    }

    /**
     * Create a new fix from latitude and longitude in radians.
     *
     * @param φ Latitude, in radians.
     * @param λ Longitude, in radians.
     */
    public static fromRadians(φ: number, λ: number): Fix {
        return new Fix(Fix.radToDeg(φ), Fix.radToDeg(λ));
    }

    /**
     * Convert degrees to radians.
     *
     * @param deg Degrees.
     * @returns Radians.
     */
    public static degToRad(deg: number) {
        return deg * Math.PI / 180;
    }

    /**
     * Convert radians to degrees.
     * @param rad Radians.
     * @returns Degrees.
     */
    public static radToDeg(rad: number) {
        return rad * 180 / Math.PI;
    }

    private static determineDmsSign(dms: string): 1 | -1 {
        return this.cardinalToSign.get(
                /[NESW]/.exec(dms)?.[0]?.toUpperCase() as CardinalDirection,
            )
            ?? (/[-−]/.test(dms) ? -1 : 1);
    }

    private static parseDms(dms: string): number {
        const sign = this.determineDmsSign(dms);
        const [d, m, s] = (
            /^\D*(\d{1,3}?(?:\.\d+)?)\D*(\d{1,2}(?:\.\d+)?)\D*(\d{1,2}(?:\.\d+)?)\D*$/
                .exec(dms)
                ?.slice(1)
                .map(Number.parseFloat)
        ) as [number, number, number] | null ?? (() => {
            throw new SyntaxError(`Unable to determine DMS in coordinate: ${dms}`);
        })();

        if (s < 0 || s >= 60)
            throw new RangeError(`Seconds (${s}) out of range in coordinate: ${dms}`);
        if (m < 0 || m >= 60)
            throw new RangeError(`Minutes (${m}) out of range in coordinate: ${dms}`);
        if (d < 0 || d >= 180)
            throw new RangeError(`Degrees (${d}) out of range in coordinate: ${dms}`);

        return sign * (d + m / 60 + s / 3600);
    }

    /**
     * Get the coordinates of this fix in radians.
     */
    public toRadians(): [φ: number, λ: number] {
        return [Fix.degToRad(this.latitude), Fix.degToRad(this.longitude)];
    }

    /**
     * Get the three-dimensional cartesian coordinates of this fix.
     */
    public toCartesian(): [x: number, y: number, z: number] {
        const [φ, λ] = this.toRadians();
        return [
            Fix.R * Math.cos(φ) * Math.cos(λ),
            Fix.R * Math.cos(φ) * Math.sin(λ),
            Fix.R * Math.sin(φ),
        ];
    }

    /**
     * Find the destination point from the current position given a bearing and distance.
     *
     * Uses the haversine formula to compute the new latitude and longitude after travelling a specified distance along
     * a given bearing on the Earth’s surface.
     *
     * @param bearing The bearing from this fix, in degrees from true north.
     * @param distance The distance, in nautical miles.
     * @returns A new Fix at the destination point.
     */
    public destination(bearing: number, distance: number): Fix {
        const [φ1, λ1] = this.toRadians();
        const θ = Fix.degToRad(bearing);

        /** distance in metres */
        const d = distance * Fix.NMI;
        /** angular distance */
        const δ = d / Fix.R;

        const φ2 = Math.asin(
            Math.sin(φ1) * Math.cos(δ)
            + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
        );
        const λ2 = λ1 + Math.atan2(
            Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
            Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
        );
        return Fix.fromRadians(φ2, λ2);
    }

    /**
     * Find the intersection point given two start points and bearings from those points.
     *
     * @param bearing The bearing from this fix, in degrees from true north.
     * @param other The other fix.
     * @param otherBearing The bearing from the other fix, in degrees from true north.
     * @returns A new Fix at the intersection point.
     */
    public bearingIntersection(bearing: number, other: Fix, otherBearing: number): Fix {
        const [φ1, λ1] = this.toRadians();
        const [φ2, λ2] = other.toRadians();

        const Δφ = φ2 - φ1;
        const Δλ = λ2 - λ1;

        const θ13 = Fix.degToRad(bearing);
        const θ23 = Fix.degToRad(otherBearing);

        /** angular distance */
        const δ12 = 2 * Math.asin(
            Math.sqrt(Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2)
        );

        /** initial/final bearings between points **/
        const θa = Math.acos(
            (Math.sin(φ2) - Math.sin(φ1) * Math.cos(δ12))
            / (Math.sin(δ12) * Math.cos(φ1))
        );
        const θb = Math.acos(
            (Math.sin(φ1) - Math.sin(φ2) * Math.cos(δ12))
            / (Math.sin(δ12) * Math.cos(φ2))
        );

        let θ12: number;
        let θ21: number;

        if (Math.sin(Δλ) > 0) {
            θ12 = θa;
            θ21 = 2 * Math.PI - θb;
        }
        else {
            θ12 = 2 * Math.PI - θa;
            θ21 = θb;
        }

        const α1 = θ13 - θ12;
        const α2 = θ23 - θ21;
        const α3 = Math.acos(
            -Math.cos(α1) * Math.cos(α2)
            + Math.sin(α1) * Math.sin(α2) * Math.cos(δ12)
        );

        /** angular distance */
        const δ13 = Math.atan2(
            Math.sin(δ12) * Math.sin(α1) * Math.sin(α2),
            Math.cos(α2) + Math.sin(α1) * Math.sin(α3)
        );

        const φ3 = Math.asin(
            Math.sin(φ1) * Math.cos(δ13)
            + Math.cos(φ1) * Math.sin(δ13) * Math.cos(θ13)
        );

        const Δλ13 = Math.atan2(
            Math.sin(θ13) * Math.sin(δ13) * Math.cos(φ1),
            Math.cos(δ13) - Math.sin(φ1) * Math.sin(φ3)
        );

        const λ3 = λ1 + Δλ13;

        return Fix.fromRadians(φ3, λ3);
    }

    /**
     * Find the great circle distance between two fixes.
     *
     * @param other The other fix.
     * @returns The distance between the two fixes, in metres.
     */
    public distance(other: Fix): number {
        const [φ1, λ1] = this.toRadians();
        const [φ2, λ2] = other.toRadians();
        const Δφ = φ2 - φ1;
        const Δλ = λ2 - λ1;
        const a = Math.sin(Δφ / 2) ** 2
            + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Fix.R * c;
    }

    /**
     * Find the initial bearing (forward azimuth) from this fix to another.
     *
     * @param other The other fix.
     * @returns The initial bearing (forward azimuth), in degrees from true north.
     */
    public initialBearing(other: Fix): number {
        const [φ1, λ1] = this.toRadians();
        const [φ2, λ2] = other.toRadians();
        const Δλ = λ2 - λ1;
        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2)
            - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        const θ = Math.atan2(y, x);
        return (Fix.radToDeg(θ) + 360) % 360;
    }
}
