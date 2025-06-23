import {Airline} from "./Airline.js";
import {EntryPoint} from "./EntryPoint.js";
import {SidFix} from "./navigation/SidFix.js";
import {Runway} from "./Runway.js";

/**
 * The primary airport.
 */
export class PrimaryAirport {
    readonly #runways = new Set<Runway>();
    readonly #sids = new Set<SidFix>();
    readonly #airlines = new Set<Airline>();
    readonly #entryPoints = new Set<EntryPoint>();

    /**
     * @param code The identifier displayed in the game for selecting the airspace, typically the airspace ID or the
     *     airport ICAO code.
     * @param name The official name of the airport.
     * @param pronunciation The pronunciation of the airport name, used by arriving traffic.
     * @param initialClimb The initial climb altitude in feet for departures. This value may be overridden on a per-SID
     *     basis.
     */
    public constructor(
        public readonly code: string,
        public readonly name: string,
        public readonly pronunciation: string,
        public readonly initialClimb: number,
    ) {}

    /**
     * The runways at this airport.
     */
    public get runways(): ReadonlySet<Runway> {
        return this.#runways;
    }

    /**
     * The SIDs of this airport.
     *
     * If the airspace contains {@link Departure} routes for a runway of this airport, only the {@link Departure} routes
     * will be used for that runway. SIDs specified here will be rendered on the screen and can be used as markers.
     */
    public get sids(): ReadonlySet<SidFix> {
        return this.#sids;
    }

    /**
     * The airlines at this airport.
     */
    public get airlines(): ReadonlySet<Airline> {
        return this.#airlines;
    }

    /**
     * Add a runway to this airport.
     *
     * @param runway The runway to add.
     * @throws {@link !Error} If the runway is a reverse runway.
     */
    public addRunway(runway: Runway) {
        if (runway.isReverse())
            throw new Error("Reverse runways cannot be added to airports.");
        this.#runways.add(runway);
    }

    /**
     * Add a SID to this airport.
     *
     * @param sid The SID to add.
     */
    public addSid(sid: SidFix) {
        this.#sids.add(sid);
    }

    /**
     * Add an airline to this airport.
     *
     * @param airline The airline to add.
     */
    public addAirline(airline: Airline) {
        this.#airlines.add(airline);
    }

    /**
     * Add an entry point to this airport.
     *
     * @param entryPoint The entry point to add.
     */
    public addEntry(entryPoint: EntryPoint) {
        this.#entryPoints.add(entryPoint);
    }
}
