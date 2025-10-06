import {FrequencyHandoff} from "../FrequencyHandoff.js";
import {Beacon} from "../navigation/Beacon.js";
import {Radius} from "../shapes/Radius.js";
import {Shape} from "../shapes/Shape.js";
import {WakeSeparation} from "../WakeSeparation.js";
import {Fix} from "../navigation/Fix.js";
import {SpeedRestriction} from "./SpeedRestriction.js";

export interface AirspaceOptions {
    /**
     * ATC approach callsign pronunciation.
     */
    approachCallsign: string;

    /**
     * ATC departure callsign pronunciation.
     */
    departureCallsign: string;

    /**
     * Airspace boundary.
     */
    boundary: Radius | Shape;

    /**
     * Airspace beacons.
     */
    beacons: ReadonlyArray<Beacon>;

    /**
     * The centre of the airspace.
     */
    center: Fix;

    /**
     * The ground altitude in feet.
     */
    elevation: number;

    /**
     * Minimum selectable altitude (1100 to 2500 above {@link elevation}).
     */
    floorAltitude: number;

    /**
     * Minimum altitude above which departures can leave the airspace without having to divert.
     */
    departureDiversionAltitude: number;

    /**
     * The highest altitude displayed in feet instead of flight level.
     * For simplicity, QNH is always 1013hPa.
     */
    transitionalAltitude: number;

    /**
     * Minimum initial altitude for arrivals (1000+ above {@link floorAltitude}).
     */
    descentAltitude: number;

    /**
     * Maximum selectable altitude (1000+ above {@link descentAltitude}).
     */
    ceilingAltitude: number;

    /**
     * Maximum departure altitude when SID is enabled (2000+ above {@link ceilingAltitude}).
     */
    departureAltitude: number;

    /**
     * Hand-off frequencies for departures.
     */
    departureFrequencies?: FrequencyHandoff[];

    /**
     * Speed restrictions.
     */
    speedRestriction: SpeedRestriction;

    /**
     * Whether arrivals entering the airspace inbound an approach beacon should automatically follow an approach route.
     */
    automaticApproach: boolean;

    /**
     * Whether arrivals should spawn precisely at the entrypoints without random deviation.
     */
    strictEntrypoints: boolean;

    /**
     * Minimum allowed distance between aircraft, in nautical miles.
     */
    separationDistance: number;

    /**
     * Whether to use US-style callsign pronunciation and runway names.
     * E.g. ‘American three forty-five’ for AAL345, and ‘Runway twenty-two left’ for RWY 22L.
     */
    usPronunciation: boolean;

    /**
     * Occurrence of letters in callsigns, specified as the reciprocal of the provided value.
     */
    callsignLettersFrequency: number;

    /**
     * Whether to display altitudes in metres instead of feet.
     */
    metric: boolean;

    /**
     * Whether to display altimeter in inHg instead of hPa.
     */
    altimeterInHg: boolean;

    /**
     * Airspace magnetic variance in degrees (positive is east).
     */
    magneticVariance: number;

    /**
     * Default zoom level (higher is more zoomed in).
     */
    zoom: number;

    /**
     * Wake turbulence separation matrix.
     */
    wakeSeparation?: WakeSeparation;
}
