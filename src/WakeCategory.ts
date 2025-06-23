/**
 * Aircraft wake turbulence category, based on MTOW and wingspan.
 */
export enum WakeCategory {
    /**
     * MTOW ∈ (100, ∞) tonnes and wingspan ∈ (72, +∞) metres.
     */
    SUPER_HEAVY = 1,

    /**
     * MTOW ∈ (100, ∞) tonnes and wingspan ∈ (60, 72] metres.
     */
    UPPER_HEAVY = 2,

    /**
     * MTOW ∈ (100, ∞) tonnes and wingspan ∈ [0, 60] metres.
     */
    LOWER_HEAVY = 3,

    /**
     * MTOW ∈ (15, 100] tonnes and wingspan ∈ (32, +∞) metres.
     */
    UPPER_MEDIUM = 4,

    /**
     * MTOW ∈ (15, 100] tonnes and wingspan ∈ [0, 32] metres.
     */
    LOWER_MEDIUM = 5,

    /**
     * MTOW ∈ [0, 15] tonnes.
     */
    LIGHT = 6
}
