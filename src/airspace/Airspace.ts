import {FrequencyHandoff} from "../FrequencyHandoff.js";
import {Beacon} from "../navigation/Beacon.js";
import {Fix} from "../navigation/Fix.js";
import {NamedFix} from "../navigation/NamedFix.js";
import {PrimaryAirport} from "../PrimaryAirport.js";
import {Registry} from "../Registry.js";
import {Radius} from "../shapes/Radius.js";
import {Shape} from "../shapes/Shape.js";
import {WakeCategory} from "../WakeCategory.js";
import {WakeSeparation} from "../WakeSeparation.js";
import {AirspaceOptions} from "./AirspaceOptions.js";
import {SpeedRestriction} from "./SpeedRestriction.js";

export class Airspace extends Registry implements AirspaceOptions {
    public readonly altimeterInHg: boolean;
    public readonly approachCallsign: string;
    public readonly automaticApproach: boolean;
    public readonly boundary: Radius | Shape;
    public readonly callsignLettersFrequency: number;
    public readonly ceilingAltitude: number;
    public readonly center: Fix;
    public readonly departureAltitude: number;
    public readonly departureCallsign: string;
    public readonly departureDiversionAltitude: number;
    public readonly departureFrequencies: FrequencyHandoff[];
    public readonly descentAltitude: number;
    public readonly elevation: number;
    public readonly floorAltitude: number;
    public readonly magneticVariance: number;
    public readonly metric: boolean;
    public readonly separationDistance: number;
    public readonly speedRestriction: SpeedRestriction;
    public readonly strictEntrypoints: boolean;
    public readonly transitionalAltitude: number;
    public readonly usPronunciation: boolean;
    public readonly wakeSeparation: WakeSeparation;
    public readonly zoom: number;


    readonly #beacons: Beacon[];
    #primaryAirport: PrimaryAirport | null = null;

    /**
     * @param options The airspace options.
     */
    public constructor({
        approachCallsign = "Approach",
        departureCallsign = "Departure",
        boundary = new Radius(30),
        beacons,
        center,
        elevation,
        floorAltitude,
        departureDiversionAltitude,
        transitionalAltitude = 6000,
        descentAltitude,
        ceilingAltitude = descentAltitude + 1000,
        departureAltitude = ceilingAltitude + 2000,
        departureFrequencies,
        speedRestriction = new SpeedRestriction(),
        automaticApproach = true,
        strictEntrypoints = true,
        separationDistance,
        usPronunciation,
        callsignLettersFrequency = 2,
        metric = false,
        altimeterInHg = false,
        magneticVariance = 0,
        zoom = 7,
        wakeSeparation = new WakeSeparation({
            [WakeCategory.SUPER_HEAVY]: [[3, 0], [4, 100], [5, 120], [5, 140], [6, 160], [8, 180]],
            [WakeCategory.UPPER_HEAVY]: [[0, 0], [3, 0], [4, 0], [4, 100], [5, 120], [7, 140]],
            [WakeCategory.LOWER_HEAVY]: [[0, 0], [0, 0], [3, 0], [3, 80], [4, 100], [6, 120]],
            [WakeCategory.UPPER_MEDIUM]: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 120]],
            [WakeCategory.LOWER_MEDIUM]: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [4, 100]],
            [WakeCategory.LIGHT]: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 80]],
        }),
    }: AirspaceOptions) {
        super();
        this.approachCallsign = approachCallsign;
        this.departureCallsign = departureCallsign;
        this.boundary = boundary;
        this.#beacons = Array.from(beacons);
        this.center = center;
        this.elevation = elevation;
        this.floorAltitude = floorAltitude;
        this.departureDiversionAltitude = departureDiversionAltitude;
        this.transitionalAltitude = transitionalAltitude;
        this.descentAltitude = descentAltitude;
        this.ceilingAltitude = ceilingAltitude;
        this.departureAltitude = departureAltitude;
        this.departureFrequencies = departureFrequencies;
        this.speedRestriction = speedRestriction;
        this.automaticApproach = automaticApproach;
        this.strictEntrypoints = strictEntrypoints;
        this.separationDistance = separationDistance;
        this.usPronunciation = usPronunciation;
        this.callsignLettersFrequency = callsignLettersFrequency;
        this.metric = metric;
        this.altimeterInHg = altimeterInHg;
        this.magneticVariance = magneticVariance;
        this.zoom = zoom;
        this.wakeSeparation = wakeSeparation;

        this.addFix(...this.beacons)
            .addFix(NamedFix.fromFix(this.center, "@center"));
    }

    public get beacons(): ReadonlyArray<Beacon> {
        return this.#beacons;
    }

    /**
     * Add a beacon to this airspace.
     *
     * @param beacon The beacon to add.
     */
    public addBeacon(beacon: Beacon): Airspace {
        this.#beacons.push(beacon);
        this.addFix(beacon);
        return this;
    }

    /**
     * Set the primary airport for this airspace.
     *
     * @param primaryAirport The primary airport.
     * @throws {@link !Error} If the primary airport is already set.
     */
    public setPrimaryAirport(primaryAirport: PrimaryAirport): Airspace {
        if (this.#primaryAirport !== null)
            throw new Error("Primary airport is already set");
        this.#primaryAirport = primaryAirport;
        try {
            this.addRunway(...primaryAirport.runways)
        }
        catch (e) {}
        return this;
    }

    /**
     * Get the primary airport for this airspace.
     *
     * @throws {@link !Error} If the primary airport is not set.
     */
    public getPrimaryAirport(): PrimaryAirport {
        if (this.#primaryAirport === null)
            throw new Error("Primary airport is not set");
        return this.#primaryAirport;
    }
}
