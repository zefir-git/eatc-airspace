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
     * @param initialClimb The initial climb altitude in feet for departures. This value may be overridden on a per-SID
     *     basis.
     * @param [pronunciation] The pronunciation of the airport name, used by arriving traffic.
     */
    public constructor(
        public readonly code: string,
        public readonly name: string,
        public readonly pronunciation: string | undefined,
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
     * Add runways to this airport.
     *
     * @param runways The runways to add.
     * @throws {@link !Error} If the runway is a reverse runway.
     */
    public addRunways(...runways: Runway[]) {
        for (const runway of runways) {
            if (runway.isReverse())
                throw new Error("Reverse runways cannot be added to airports.");
            this.#runways.add(runway);
        }
        return this;
    }

    /**
     * Add SIDs to this airport.
     *
     * @param sids The SIDs to add.
     */
    public addSids(...sids: SidFix[]) {
        for (const sid of sids)
            this.#sids.add(sid);
        return this;
    }

    /**
     * Add airlines to this airport.
     *
     * @param airlines The airlines to add.
     */
    public addAirlines(...airlines: Airline[]) {
        for (const airline of airlines)
            this.#airlines.add(airline);
        return this;
    }

    /**
     * Add entry points to this airport.
     *
     * @param entryPoints The entry points to add.
     */
    public addEntryPoints(...entryPoints: EntryPoint[]) {
        for (const entryPoint of entryPoints)
            this.#entryPoints.add(entryPoint);
        return this;
    }
}
