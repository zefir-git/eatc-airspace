import {Runway} from "../Runway.js";
import {Fix} from "./Fix.js";
import {Route} from "./Route.js";

/**
 * Represents a departure waypoint route used for Standard Instrument Departures (SIDs).
 * This class enables more realistic SID implementation compared to {@link SidFix}.
 */
export class Departure extends Route<Fix> {
    /**
     * The name or identifier of this departure, for example, ‘UMLAT1F’.
     * Note that the game will display a maximum of seven characters.
     */
    public readonly name: string;

    /**
     * The phonetic pronunciation of the departure name, for example, ‘Umlat one foxtrot’.
     */
    public readonly pronunciation?: string;

    /**
     * The departure runway.
     */
    public readonly runway: Runway;

    /**
     * Optional initial climb altitude, in feet.
     * If not specified, the default {@link PrimaryAirport#initialClimb} value will be used.
     */
    public readonly initialClimb?: number;

    /**
     * The sequence of fixes (waypoints) that define the departure route.
     */
    public readonly route: Fix[];

    /**
     * @param name The departure name or identifier, e.g. ‘UMLAT1F’. Display limited to 7 characters in-game.
     * @param pronunciation The phonetic pronunciation of the departure name, e.g. ‘Umlat one foxtrot’.
     * @param runway The departure runway.
     * @param initialClimb Optional initial climb altitude, in feet.
     * @param route The ordered list of fixes defining the departure path.
     */
    public constructor(name: string, pronunciation: string | undefined, runway: Runway, initialClimb: number, route: Fix[]);
    /**
     * @param name The departure name or identifier, e.g. ‘UMLAT1F’. Display limited to 7 characters in-game.
     * @param pronunciation The phonetic pronunciation of the departure name, e.g. ‘Umlat one foxtrot’.
     * @param runway The departure runway.
     * @param route The ordered list of fixes defining the departure path.
     */
    public constructor(name: string, pronunciation: string | undefined, runway: Runway, route: Fix[]);
    public constructor(
        name: string,
        pronunciation: string | undefined,
        runway: Runway,
        ...args: [initialClimb: number, route: Fix[]] | [route: Fix[]]
    ) {
        super();
        this.name = name;
        this.pronunciation = pronunciation;
        this.runway = runway;
        if (args.length === 2) {
            this.initialClimb = args[0];
            this.route = args[1];
        }
        else {
            this.route = args[0];
        }
    }
}
