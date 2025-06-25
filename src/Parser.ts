import {Aircraft} from "./Aircraft.js";
import {Airline} from "./Airline.js";
import {Airspace} from "./airspace/Airspace.js";
import {SpeedRestriction} from "./airspace/SpeedRestriction.js";
import {CompositeMap} from "./CompositeMap.js";
import {EntryPoint} from "./EntryPoint.js";
import {FrequencyHandoff} from "./FrequencyHandoff.js";
import {Arrival} from "./navigation/Arrival.js";
import {Beacon} from "./navigation/Beacon.js";
import {CardinalDirection} from "./navigation/CardinalDirection.js";
import {Departure} from "./navigation/Departure.js";
import {Fix} from "./navigation/Fix.js";
import {ApproachFix} from "./navigation/ApproachFix.js";
import {SidFix} from "./navigation/SidFix.js";
import {Ini} from "./parseIni.js";
import {PrimaryAirport} from "./PrimaryAirport.js";
import {Runway} from "./Runway.js";
import {RunwayConfiguration} from "./RunwayConfiguration.js";
import {SecondaryAirport} from "./SecondaryAirport.js";
import {Area} from "./shapes/Area.js";
import {CircleArea} from "./shapes/CircleArea.js";
import {Polyline} from "./shapes/Polyline.js";
import {Radius} from "./shapes/Radius.js";
import {WakeCategory} from "./WakeCategory.js";
import {WakeSeparation} from "./WakeSeparation.js";

export class Parser {
    private constructor() {}

    static #decimalDegrees: boolean = false;

    /**
     * Create airspace from INI file.
     *
     * @param data The parsed INI file data.
     * @throws {@link !Error} If the data format is invalid.
     */
    public static fromIni(data: Ini): Airspace {
        const format = this.formatIni(data);

        const [approachCallsign, departureCallsign] = format.airspace.name.split(",").map(c => c.trim());
        if (approachCallsign === "" || departureCallsign === "" || approachCallsign === undefined || departureCallsign === undefined)
            throw new Error("airspace.name must be in the format: approach callsign, departure callsign");

        const boundary = format.airspace.boundary !== undefined ? new Polyline(
            format.airspace.boundary.map(this.parseFix.bind(this))) : new Radius(format.airspace.radius!);

        const asp = new Airspace({
            altimeterInHg: format.airspace.inches,
            approachCallsign,
            automaticApproach: format.airspace.automatic,
            beacons: format.airspace.beacons.map(this.parseBeacon.bind(this)),
            boundary,
            callsignLettersFrequency: format.airspace.letters,
            ceilingAltitude: format.airspace.ceiling,
            center: this.parseFix(format.airspace.center),
            departureAltitude: format.airspace.diversionaltitude,
            departureCallsign,
            departureDiversionAltitude: format.airspace.diversionaltitude,
            departureFrequencies: format.airspace.handoff?.map(this.parseHandoff.bind(this)),
            descentAltitude: format.airspace.descentaltitude,
            elevation: format.airspace.elevation,
            floorAltitude: format.airspace.floor,
            magneticVariance: format.airspace.magneticvar,
            metric: format.airspace.metric,
            separationDistance: format.airspace.separation,
            speedRestriction: this.parseSpeedRestriction(format.airspace.speedrestriction,
                format.airspace.localizerspeed),
            strictEntrypoints: format.airspace.strictspawn,
            transitionalAltitude: format.airspace.transitionaltitude,
            usPronunciation: format.airspace.usa,
            wakeSeparation: this.parseWakeSeparation(format.airspace.wake),
            zoom: format.airspace.zoom,
        });

        const [primaryName, primaryPronunciation] = format.airspace.name.split(",").map(c => c.trim());
        if (primaryName === "" || primaryName === undefined)
            throw new Error("airport1.name must be in the format: name, pronunciation");

        asp.setPrimaryAirport(
            new PrimaryAirport(
                format.primaryAirport.code,
                primaryName,
                primaryPronunciation,
                format.primaryAirport.climbaltitude,
            )
                .addRunways(...format.primaryAirport.runways.map(this.parseRunway.bind(this)))
                .addSids(...format.primaryAirport.sids?.map(s => this.parseSid(asp, s)) ?? [])
                .addAirlines(...format.primaryAirport.airlines.map(this.parseAirline.bind(this)))
                .addEntryPoints(...format.primaryAirport.entrypoints.map(this.parseEntryPoint.bind(this))),
        );

        for (const secondary of format.secondaryAirports) {
            const [secondaryName, secondaryPronunciation] = secondary.name.split(",").map(c => c.trim());
            if (secondaryName === "" || secondaryName === undefined)
                throw new Error("Secondary airport name must be in the format: name, pronunciation");
            const beacon = asp.beacons.find(b => b.name === secondary.inboundBeacon);
            if (beacon === undefined)
                throw new Error("Secondary airport beacon must be in the list of airspace beacons.");
            asp.addSecondaryAirport(new SecondaryAirport(
                    secondary.code,
                    secondaryName,
                    secondaryPronunciation,
                    secondary.climbaltitude,
                    secondary.flow,
                    beacon,
                )
                    .addRunways(...secondary.runways.map(this.parseRunway.bind(this)))
                    .addSids(...secondary.sids?.map(s => this.parseSid(asp, s)) ?? [])
                    .addAirlines(...secondary.airlines.map(this.parseAirline.bind(this)))
                    .addEntryPoints(...secondary.entrypoints.map(this.parseEntryPoint.bind(this))),
            );
        }

        for (const area of format.areas) {
            if (area.shape === "circle") {
                const labelPos = area.labelpos !== undefined ? this.parseFix(area.labelpos) : void 0;
                const drawDegrees = area.drawdegrees !== undefined
                                    ? area.drawdegrees.split(",").map(c => Number.parseFloat(c.trim()))
                                    : void 0;
                if (drawDegrees !== undefined && drawDegrees.length !== 2)
                    throw new Error("Circle area drawdegrees must be in the format: start, end");


                if (area.name !== undefined)
                    asp.addArea(new CircleArea(
                        area.name,
                        area.altitude,
                        this.parseFix(area.position),
                        area.radius,
                        labelPos,
                        drawDegrees as [number, number],
                    ));
                else
                    asp.addArea(new CircleArea(
                        area.altitude,
                        this.parseFix(area.position),
                        area.radius,
                        labelPos,
                        drawDegrees as [number, number],
                    ));
            }
            else {
                const labelPos = area.labelpos !== undefined ? this.parseFix(area.labelpos) : void 0;
                const vertices = area.points.map(this.parseFix.bind(this));
                if (area.name !== undefined)
                    asp.addArea(new Area(
                        area.name,
                        area.altitude,
                        vertices,
                        labelPos,
                        area.draw,
                    ));
                else
                    asp.addArea(new Area(
                        area.altitude,
                        vertices,
                        labelPos,
                        area.draw,
                    ));
            }
        }

        for (const config of this.parseConfigurations(asp, format.configurations))
            asp.addConfig(config);

        for (const e of format.departures.entries())
            for (const departure of this.parseDepartures(asp, e))
                asp.addDeparture(departure);

        for (const e of format.approaches.entries())
            for (const arrival of this.parseArrivals(asp, e))
                asp.addArrival(arrival);

        for (const plane of format.planetypes)
            asp.addAircraft(this.parsePlaneType(plane));

        for (const line of format.lines)
            asp.draw(this.parseLine(line));

        return asp;
    }

    private static formatIni(data: Ini): Parser.Format {
        let airspace;
        if (data.airspace !== undefined) {
            if (data.airspace.decimaldegrees !== undefined) {
                if (typeof data.airspace.decimaldegrees !== "boolean")
                    throw new Error("airspace.decimaldegrees is must be a boolean.");
                this.#decimalDegrees = data.airspace.decimaldegrees;
            }
            else this.#decimalDegrees = false;

            if (typeof data.airspace.inches !== "boolean") {
                console.warn("Warning: airspace.inches is not set. Defaulting to false.");
                data.airspace.inches = false;
            }
            const inches = data.airspace.inches;

            if (typeof data.airspace.name !== "string")
                throw new Error("airspace.name is required and must be a string.");
            const name = data.airspace.name;

            if (typeof data.airspace.automatic !== "boolean")
                throw new Error("airspace.automatic is required and must be a boolean.");
            const automatic = data.airspace.automatic;

            if (!Array.isArray(data.airspace.beacons) || data.airspace.beacons.some(b => typeof b !== "string"))
                throw new Error("airspace.beacons is required and must be a list of strings.");
            if (data.airspace.beacons.length === 0)
                throw new Error("airspace.beacons must have at least one element.");
            const beacons = data.airspace.beacons as string[];

            if (data.airspace.boundary !== undefined
                && (!Array.isArray(data.airspace.boundary)
                    || data.airspace.boundary.some(b => typeof b !== "string")))
                throw new Error("airspace.boundary must be a list of strings.");
            const boundary = data.airspace.boundary as string[] | undefined;
            if (boundary !== undefined && boundary.length === 0)
                throw new Error("airspace.boundary must have at least one element.");

            if (data.airspace.radius !== undefined && typeof data.airspace.radius !== "number")
                throw new Error("airspace.radius is required and must be a number.");
            const radius = data.airspace.radius;

            if (boundary === undefined && radius === undefined)
                throw new Error("Either airspace.boundary or airspace.radius is required.");

            if (boundary !== undefined && radius !== undefined)
                console.warn(
                    "Warning: Both airspace.boundary and airspace.radius are set. airspace.boundary will be used.");

            if (typeof data.airspace.letters !== "number")
                throw new Error("airspace.letters is required and must be a number.");
            const letters = data.airspace.letters;

            if (typeof data.airspace.ceiling !== "number")
                throw new Error("airspace.ceiling is required and must be a number.");
            const ceiling = data.airspace.ceiling;

            if (typeof data.airspace.center !== "string")
                throw new Error("airspace.center is required and must be a string.");
            const center = data.airspace.center;

            if (typeof data.airspace.above !== "number")
                throw new Error("airspace.above is required and must be a number.");
            const above = data.airspace.above;

            if (typeof data.airspace.diversionaltitude !== "number")
                throw new Error("airspace.diversionaltitude is required and must be a number.");
            const diversionaltitude = data.airspace.diversionaltitude;

            if (data.airspace.handoff !== undefined
                && (!Array.isArray(data.airspace.handoff)
                    || data.airspace.handoff.some(b => typeof b !== "string")))
                throw new Error("airspace.handoff must be a list of strings.");
            const handoff = data.airspace.handoff as string[] | undefined;
            if (handoff !== undefined && handoff.length === 0)
                throw new Error("airspace.handoff must have at least one element.");

            if (typeof data.airspace.descentaltitude !== "number")
                throw new Error("airspace.descentaltitude is required and must be a number.");
            const descentaltitude = data.airspace.descentaltitude;

            if (typeof data.airspace.elevation !== "number")
                throw new Error("airspace.elevation is required and must be a number.");
            const elevation = data.airspace.elevation;

            if (typeof data.airspace.floor !== "number")
                throw new Error("airspace.floor is required and must be a number.");
            const floor = data.airspace.floor;

            if (typeof data.airspace.magneticvar !== "number")
                throw new Error("airspace.magneticvar is required and must be a number.");
            const magneticvar = data.airspace.magneticvar;

            if (typeof data.airspace.metric !== "boolean")
                throw new Error("airspace.metric is required and must be a boolean.");
            const metric = data.airspace.metric;

            if (typeof data.airspace.separation !== "number")
                throw new Error("airspace.separation is required and must be a number.");
            const separation = data.airspace.separation;

            if (typeof data.airspace.speedrestriction !== "string") {
                console.warn("Warning: airspace.speedrestriction is not set. Defaulting to 0, 300, 10000, 250.");
                data.airspace.speedrestriction = "0, 300, 10000, 250";
            }
            const speedrestriction = data.airspace.speedrestriction;

            if (typeof data.airspace.localizerspeed !== "string")
                throw new Error("airspace.localizerspeed is required and must be a string.");
            const localizerspeed = data.airspace.localizerspeed;

            if (typeof data.airspace.strictspawn !== "boolean")
                throw new Error("airspace.strictspawn is required and must be a boolean.");
            const strictspawn = data.airspace.strictspawn;

            if (typeof data.airspace.transitionaltitude !== "number")
                throw new Error("airspace.transitionaltitude is required and must be a number.");
            const transitionaltitude = data.airspace.transitionaltitude;

            if (typeof data.airspace.usa !== "boolean")
                throw new Error("airspace.usa is required and must be a boolean.");
            const usa = data.airspace.usa;

            if (data.airspace.wake !== undefined
                && (!Array.isArray(data.airspace.wake)
                    || data.airspace.wake.some(b => typeof b !== "string")))
                throw new Error("airspace.wake must be a list of strings.");
            const wake = data.airspace.wake as string[] | undefined;
            if (wake !== undefined && wake.length === 6)
                throw new Error("airspace.wake must have exactly 6 elements.");

            if (typeof data.airspace.zoom !== "number")
                throw new Error("airspace.zoom is required and must be a number.");
            const zoom = data.airspace.zoom;

            airspace = {
                inches,
                name,
                automatic,
                beacons,
                boundary,
                radius,
                letters,
                ceiling,
                center,
                above,
                diversionaltitude,
                handoff,
                descentaltitude,
                elevation,
                floor,
                magneticvar,
                metric,
                separation,
                speedrestriction,
                localizerspeed,
                strictspawn,
                transitionaltitude,
                usa,
                wake,
                zoom,
            };
        }
        else
            throw new Error("The [airspace] section is required.");


        let primaryAirport;
        if (data.airport1 !== undefined) {
            if (typeof data.airport1.name !== "string")
                throw new Error("airport1.name is required and must be a string.");
            const name = data.airport1.name;

            if (typeof data.airport1.code !== "string")
                throw new Error("airport1.code is required and must be a string.");
            const code = data.airport1.code;
            if (code.length !== 4)
                console.warn(`Warning: airport1.code length is ${code.length}, recommended is 4.`);

            if (!Array.isArray(data.airport1.runways) || data.airport1.runways.some(r => typeof r !== "string"))
                throw new Error("airport1.runways is required and must be a list of strings.");
            if (data.airport1.runways.length === 0)
                throw new Error("airport1.runways must have at least one element.");
            const runways = data.airport1.runways as string[];

            if (typeof data.airport1.climbaltitude !== "number")
                throw new Error("airport1.climbaltitude is required and must be a number.");
            const climbaltitude = data.airport1.climbaltitude;

            if (data.airport1.sids !== undefined
                && (!Array.isArray(data.airport1.sids)
                    || data.airport1.sids.some(s => typeof s !== "string")))
                throw new Error("airport1.sids must be a list of strings.");
            const sids = data.airport1.sids as string[] | undefined;
            if (sids !== undefined && sids.length === 0)
                throw new Error("airport1.sids must have at least one element.");

            if (!Array.isArray(data.airport1.entrypoints) || data.airport1.entrypoints.some(e => typeof e !== "string"))
                throw new Error("airport1.entrypoints is reqruired and must be a list of strings.");
            if (data.airport1.entrypoints.length === 0)
                throw new Error("airport1.entrypoints must have at least one element.");
            const entrypoints = data.airport1.entrypoints as string[];

            if (!Array.isArray(data.airport1.airlines) || data.airport1.airlines.some(a => typeof a !== "string"))
                throw new Error("airport1.airlines is required and must be a list of strings.");
            if (data.airport1.airlines.length === 0)
                throw new Error("airport1.airlines must have at least one element.");
            const airlines = data.airport1.airlines as string[];

            primaryAirport = {
                name,
                code,
                runways,
                climbaltitude,
                sids,
                entrypoints,
                airlines,
            };
        }
        else
            throw new Error("The [airport1] section is required.");

        const secondaryAirports: Parser.Format["secondaryAirports"] = [];
        for (const [key, secondaryAirport] of Object.entries(data)
            .filter(([k]) => k.startsWith("airport"))
            .slice(1)) {
            if (typeof secondaryAirport.name !== "string")
                throw new Error(`${key}.name is required and must be a string.`);
            const name = secondaryAirport.name;

            if (typeof secondaryAirport.code !== "string")
                throw new Error(`${key}.code is required and must be a string.`);
            const code = secondaryAirport.code;
            if (code.length !== 2)
                console.warn(`Warning: ${key}.code length is ${code.length}, recommended is 2.`);

            if (!Array.isArray(secondaryAirport.runways) || secondaryAirport.runways.some(r => typeof r !== "string"))
                throw new Error(`${key}.runways must be a list of strings.`);
            if (secondaryAirport.runways.length === 0)
                throw new Error(`${key}.runways must have at least one element.`);
            const runways = secondaryAirport.runways as string[];

            if (typeof secondaryAirport.flow !== "number")
                throw new Error(`${key}.flow is required and must be a number.`);
            const flow = secondaryAirport.flow;

            if (typeof secondaryAirport.inboundbeacon !== "string")
                throw new Error(`${key}.inboundbeacon is required and must be a string.`);
            const inboundBeacon = secondaryAirport.inboundbeacon;

            if (!Array.isArray(secondaryAirport.entrypoints) || secondaryAirport.entrypoints.some(
                e => typeof e !== "string"))
                throw new Error(`${key}.entrypoints is required and must be a list of strings.`);
            if (secondaryAirport.entrypoints.length === 0)
                throw new Error(`${key}.entrypoints must have at least one element.`);
            const entrypoints = secondaryAirport.entrypoints as string[];

            if (!Array.isArray(secondaryAirport.airlines) || secondaryAirport.airlines.some(a => typeof a !== "string"))
                throw new Error(`${key}.airlines is required and must be a list of strings.`);
            if (secondaryAirport.airlines.length === 0)
                throw new Error(`${key}.airlines must have at least one element.`);
            const airlines = secondaryAirport.airlines as string[];

            if (typeof secondaryAirport.climbaltitude !== "number")
                throw new Error(`${key}.climbaltitude is required and must be a number.`);
            const climbaltitude = secondaryAirport.climbaltitude;

            if (secondaryAirport.sids !== undefined
                && (!Array.isArray(secondaryAirport.sids)
                    || secondaryAirport.sids.some(s => typeof s !== "string")))
                throw new Error(`${key}.sids must be a list of strings.`);
            const sids = secondaryAirport.sids as string[] | undefined;
            if (sids !== undefined && sids.length === 0)
                throw new Error(`${key}.sids must have at least one element.`);

            secondaryAirports.push({
                name,
                code,
                runways,
                flow,
                inboundBeacon,
                entrypoints,
                airlines,
                climbaltitude,
                sids,
            });
        }

        const areas: Parser.Format["areas"] = [];
        for (const [key, area] of Object.entries(data).filter(([k]) => k.startsWith("area"))) {
            if (typeof area.altitude !== "number")
                throw new Error(`${key}.altitude is required and must be a number.`);
            const altitude = area.altitude;

            if (area.name !== undefined && typeof area.name !== "string")
                throw new Error(`${key}.name must be a string.`);
            const name = area.name;

            if (area.labelpos !== undefined && typeof area.labelpos !== "string")
                throw new Error(`${key}.labelpos must be a string.`);
            const labelpos = area.labelpos;

            if (area.shape === "circle") {
                if (typeof area.radius !== "number")
                    throw new Error(`${key}.radius is required and must be a number.`);
                const radius = area.radius;

                if (typeof area.position !== "string")
                    throw new Error(`${key}.radius is required and must be a string.`);
                const position = area.position;

                if (area.drawdegrees !== undefined && typeof area.drawdegrees !== "string")
                    throw new Error(`${key}.drawdegrees must be a string.`);
                const drawdegrees = area.drawdegrees;

                areas.push({altitude, name, labelpos, shape: "circle", radius, position, drawdegrees});
            }
            else if (area.shape === "polygon") {
                if (!Array.isArray(area.points) || area.points.some(p => typeof p !== "string"))
                    throw new Error(`${key}.points is required and must be a list of strings.`);
                const points = area.points as string[];

                if (area.draw !== undefined && typeof area.draw !== "number")
                    throw new Error(`${key}.points is required and must be a number.`);
                const draw = area.draw;

                areas.push({altitude, name, labelpos, shape: "polygon", points, draw});
            }
            else
                throw new Error(`${key}.shape is required and must be "circle", or "polygon"; got "${area.shape}".`);
        }

        const configurations: Parser.Format["configurations"] = [];
        if (data.configurations !== undefined) {
            for (const [key, configuration] of Object.entries(data.configurations)) {
                if (!key.startsWith("config"))
                    throw new Error(`configurations.${key} must be in the format "configN"`);
                if (!Array.isArray(configuration) || configuration.some(c => typeof c !== "string"))
                    throw new Error(`configurations.${key} must be a list of strings.`);
                if (configuration.length === 0)
                    throw new Error(`configurations.${key} must have at least one element.`);

                configurations.push(configuration as string[]);
            }
        }

        const departures: Parser.Format["departures"] = new Map();
        for (const [key, departure] of Object.entries(data).filter(([k]) => k.startsWith("departure"))) {
            if (typeof departure.runway !== "string")
                throw new Error(`${key}.runway is required and must be a string.`);
            if (departures.has(departure.runway))
                throw new Error(`${key} is duplicate departure with ${key}.runway "${departure.runway}".`);

            const routes: string[][] = [];
            for (const [routeKey, route] of Object.entries(departure).filter(([k]) => k.startsWith("route"))) {
                if (!Array.isArray(route) || route.some(r => typeof r !== "string"))
                    throw new Error(`${key}.${routeKey} must be a list of strings.`);
                if (route.length < 2)
                    throw new Error(`${key}.${routeKey} must have at least two elements.`);
                routes.push(route as string[]);
            }
            if (routes.length === 0)
                throw new Error(`${key} must have at least one route.`);

            departures.set(departure.runway, routes);
        }

        const approaches: Parser.Format["approaches"] = new CompositeMap();
        for (const [key, approach] of Object.entries(data).filter(([k]) => k.startsWith("approach"))) {
            if (typeof approach.runway !== "string")
                throw new Error(`${key}.runway is required and must be a string.`);
            const runway = approach.runway;

            if (typeof approach.beacon !== "string")
                throw new Error(`${key}.beacon is required and must be a string.`);
            const beacon = approach.beacon;

            if (approaches.has([runway, beacon]))
                throw new Error(
                    `${key} is duplicate approach with ${key}.runway "${runway}" and ${key}.beacon "${beacon}".`);

            const routes: string[][] = [];
            for (const [routeKey, route] of Object.entries(approach).filter(([k]) => k.startsWith("route"))) {
                if (!Array.isArray(route) || route.some(r => typeof r !== "string"))
                    throw new Error(`${key}.${routeKey} must be a list of strings.`);
                if (route.length < 3)
                    throw new Error(`${key}.${routeKey} must have at least three elements.`);
                routes.push(route as string[]);
            }
            if (routes.length === 0)
                throw new Error(`${key} must have at least one route.`);

            approaches.set([runway, beacon], routes);
        }

        let planetypes: Parser.Format["planetypes"];
        if (data.planetypes !== undefined) {
            if (!Array.isArray(data.planetypes.types) || data.planetypes.types.some(t => typeof t !== "string"))
                throw new Error(`planetypes.types is required and must be a list of strings.`);
            if (data.planetypes.types.length === 0)
                throw new Error(`planetypes.types must have at least one element.`);
            planetypes = data.planetypes.types as string[];
        }
        else planetypes = [];

        const lines: Parser.Format["lines"] = [];
        if (data.background !== undefined) {
            for (const [key, line] of Object.entries(data.background).filter(([k]) => k.startsWith("line"))) {
                if (!Array.isArray(line) || line.some(l => typeof l !== "string"))
                    throw new Error(`background.${key} must be a list of strings.`);
                if (line.length < 1)
                    throw new Error(`background.${key} must have at least one element.`);
                lines.push(line as string[]);
            }
        }
        for (const [key, line] of Object.entries(data.airspace).filter(([k]) => k.startsWith("line"))) {
            if (!Array.isArray(line) || line.some(l => typeof l !== "string"))
                throw new Error(`airspace.${key} must be a list of strings.`);
            if (line.length < 1)
                throw new Error(`airspace.${key} must have at least one element.`);
            lines.push(line as string[]);
        }

        return {
            airspace,
            primaryAirport,
            secondaryAirports,
            areas,
            configurations,
            departures,
            approaches,
            planetypes,
            lines,
        };
    }

    private static parseBeacon(data: string) {
        const [name, latitude, longitude, hold, pronunciation] = data.split(",").map(d => d.trim());
        if (name === undefined || name === "")
            throw new Error("Beacon name is required and must be a non-empty string.");
        let holdingPattern: Beacon.HoldingPattern | undefined;
        if (hold !== undefined && hold !== "" && hold !== "0" && !Number.isNaN(Number.parseFloat(hold))) {
            const θ = Number.parseFloat(hold);
            holdingPattern = new Beacon.HoldingPattern(Math.abs(θ),
                θ < 0 ? Beacon.TurnDirection.LEFT : Beacon.TurnDirection.RIGHT);
        }
        return Beacon.fromFix(this.parseCoordinates(latitude, longitude), name, pronunciation, holdingPattern);
    }

    private static parseFix(data: string) {
        const [latitude, longitude] = data.split(",").map(d => d.trim());
        return this.parseCoordinates(latitude, longitude);
    }

    private static parseCoordinates(latitude?: string, longitude?: string) {
        if (latitude === undefined || latitude === "")
            throw new Error("Fix latitude is required and must be a non-empty string.");
        if (longitude === undefined || longitude === "")
            throw new Error("Fix longitude is required and must be a non-empty string.");
        if (/^[NS-]?\d+(?:\.\d+)?$/i.test(latitude) && /^[EW-]?\d+(?:\.\d+)?$/i.test(longitude)) {
            if (!this.#decimalDegrees && (/^\d+(?:\.\d+)?$/i.test(latitude) || /^\d+(?:\.\d+)?$/i.test(longitude)))
                throw new Error("Only latitude and longitude coordinates are supported by this parser. Numeric coordinates encountered and airspace.decimaldegrees is not true.");
            const latSign = latitude.toUpperCase().startsWith("S") || latitude.toUpperCase().startsWith("-") ? -1 : 1;
            const lonSign = longitude.toUpperCase().startsWith("W") || longitude.toUpperCase().startsWith("-") ? -1 : 1;
            const lat = Number.parseFloat(latitude.replace(/^[NS-]/i, ""));
            const lon = Number.parseFloat(longitude.replace(/^[EW-]/i, ""));
            if (Number.isNaN(lat))
                throw new Error(`Cannot parse decimal degrees latitude in coordinates ${latitude}, ${longitude}`);
            if (Number.isNaN(lon))
                throw new Error(`Cannot parse decimal degrees longitude in coordinates ${latitude}, ${longitude}`);
            return new Fix(lat * latSign, lon * lonSign);
        }
        else
            return Fix.fromDms(latitude, longitude);
    }

    private static parseHandoff(data: string) {
        const [heading, callsign, pronunciation, frequency] = data.split(",").map(d => d.trim());
        if (heading === undefined || heading === "" || Number.isNaN(Number.parseFloat(heading)))
            throw new Error("Handoff heading is required and must be a number.");
        if (callsign === undefined || callsign === "")
            throw new Error("Handoff ATC callsign is required and must be a non-empty string.");
        if (pronunciation === undefined || pronunciation === "")
            throw new Error("Handoff ATC pronunciation is required and must be a non-empty string.");
        if (frequency !== undefined && Number.isNaN(Number.parseFloat(frequency)))
            throw new Error("Handoff frequency must be a number.");
        return new FrequencyHandoff(Number.parseFloat(heading), callsign, pronunciation,
            frequency !== undefined ? Number.parseFloat(frequency) : undefined);
    }

    private static parseSpeedRestriction(speedrestriction: string, localizerspeed: string) {
        const [radius, radiusSpeed, altitude, altitudeSpeed] = speedrestriction.split(",").map(d => d.trim());
        const [locDistance, locSpeed] = localizerspeed.split(",").map(d => d.trim());
        if (radius === undefined || radius === "" || Number.isNaN(Number.parseFloat(radius)))
            throw new Error("Speed restriction radius is required and must be a number.");
        if (radiusSpeed === undefined || radiusSpeed === "" || Number.isNaN(Number.parseFloat(radiusSpeed)))
            throw new Error("Speed restriction speed within radius is required and must be a number.");
        if (locDistance === undefined || locDistance === "" || Number.isNaN(Number.parseFloat(locDistance)))
            throw new Error("Localiser speed restriction distance is required and must be a number.");
        if (locSpeed === undefined || locSpeed === "" || Number.isNaN(Number.parseFloat(locSpeed)))
            throw new Error("Localiser speed restriction speed is required and must be a number.");
        if (altitude !== undefined) {
            if (Number.isNaN(Number.parseFloat(altitude)))
                throw new Error("Altitude restriction altitude must be a number.");
            if (altitudeSpeed === undefined || altitudeSpeed === "" || Number.isNaN(altitudeSpeed))
                throw new Error("Altitude restriction speed at altitude is required and must be a number.");
            return new SpeedRestriction(
                new SpeedRestriction.WithinRadius(Number.parseFloat(radius), Number.parseFloat(radiusSpeed)),
                new SpeedRestriction.BelowAltitude(Number.parseFloat(altitude), Number.parseFloat(altitudeSpeed)),
                new SpeedRestriction.OnLocaliser(Number.parseFloat(locDistance), Number.parseFloat(locSpeed)),
            );
        }
        return new SpeedRestriction(
            new SpeedRestriction.WithinRadius(Number.parseFloat(radius), Number.parseFloat(radiusSpeed)),
            void 0,
            new SpeedRestriction.OnLocaliser(Number.parseFloat(locDistance), Number.parseFloat(locSpeed)),
        );
    }

    private static parseWakeSeparation(data?: string[]): WakeSeparation | undefined {
        if (data === undefined || data.length !== 6)
            return undefined;
        return new WakeSeparation({
            [WakeCategory.SUPER_HEAVY]: this.parseWakeRow(data[0]!),
            [WakeCategory.UPPER_HEAVY]: this.parseWakeRow(data[1]!),
            [WakeCategory.LOWER_HEAVY]: this.parseWakeRow(data[2]!),
            [WakeCategory.UPPER_MEDIUM]: this.parseWakeRow(data[3]!),
            [WakeCategory.LOWER_MEDIUM]: this.parseWakeRow(data[4]!),
            [WakeCategory.LIGHT]: this.parseWakeRow(data[5]!),
        });
    }

    private static parseWakeRow(data: string): WakeSeparation.Row {
        const cats = data.split(",").map(d => d.trim());
        if (cats.length !== 6)
            throw new Error("Each wake separation matrix row must have 6 categories.");
        return cats.map(c => {
            const [distance, interval] = c.split("/").map(d => Number.parseFloat(d.trim()));
            if (distance === undefined || interval === undefined)
                throw new Error("Wake separation matrix cells must be in the format: distance/interval.");
            if (Number.isNaN(distance) || Number.isNaN(interval))
                throw new Error("Non-numeric value provided in wake separation matrix cell.");
            return [distance, interval] as WakeSeparation.Separation;
        }) as WakeSeparation.Row;
    }

    private static parseRunway(data: string): Runway {
        const [
            id, name, latitude, longitude, heading, length, displaced, displaced2, elevation, glideslope, localizer,
            glideslope2, localizer2, beacon, distance, beacon2, distance2, towerFrequency, towerPronunciation,
        ] = data.split(",").map(d => d.trim());
        if (id === undefined || id === "")
            throw new Error("Runway identifier is required and must be a non-empty string.");

        if (name === undefined || name === "")
            throw new Error("Runway name is required and must be a non-empty string.");
        if (!/^((0?[1-9])|([1-2]\d)|(3[0-6]))[LCR]?$/i.test(name))
            throw new Error(
                `Runway name must be in the format: [1–36] optionally followed by L, C, or R. Got: ${name}`);
        const runwayName = name.toUpperCase() as `${number}${"L" | "C" | "R" | ""}`;

        const fix = this.parseCoordinates(latitude, longitude);

        if (heading === undefined)
            throw new Error("Runway true heading is required.");
        const headingNumber = Number.parseFloat(heading);
        if (Number.isNaN(headingNumber))
            throw new Error("Runway true heading must be a number.");

        if (length === undefined)
            throw new Error("Runway length is required.");
        const lengthNumber = Number.parseFloat(length);
        if (Number.isNaN(lengthNumber))
            throw new Error("Runway length must be a number.");

        const displacedNumber = displaced === undefined ? 0 : Number.parseFloat(displaced);
        if (Number.isNaN(displacedNumber))
            throw new Error("Runway displaced threshold must be a number.");

        const displaced2Number = displaced2 === undefined ? 0 : Number.parseFloat(displaced2);
        if (Number.isNaN(displaced2Number))
            throw new Error("Runway displaced threshold must be a number.");

        const elevationNumber = elevation === undefined ? 0 : Number.parseFloat(elevation);
        if (Number.isNaN(elevationNumber))
            throw new Error("Runway elevation must be a number.");

        const glideslopeNumber = glideslope === undefined ? 3 : Number.parseFloat(glideslope);
        if (Number.isNaN(glideslopeNumber))
            throw new Error("Runway glideslope must be a number.");

        const localizerNumber = localizer === undefined ? headingNumber : Number.parseFloat(localizer);
        if (Number.isNaN(localizerNumber))
            throw new Error("Runway localizer must be a number.");

        const glideslope2Number = glideslope2 === undefined ? 3 : Number.parseFloat(glideslope2);
        if (Number.isNaN(glideslope2Number))
            throw new Error("Runway opposite glideslope must be a number.");

        const localizer2Number = localizer2 === undefined ? (headingNumber + 180) % 360 : Number.parseFloat(localizer2);
        if (Number.isNaN(localizer2Number))
            throw new Error("Runway opposite localizer must be a number.");

        let beaconFix: Runway.LocalizerFix | undefined;
        if (beacon !== undefined && beacon !== "0" && beacon !== "") {
            if (distance === undefined || distance === "0" || distance === "")
                throw new Error("Runway beacon distance is required when beacon name is set.");
            const distanceNumber = Number.parseFloat(distance);
            if (Number.isNaN(distanceNumber))
                throw new Error("Runway beacon distance must be a number.");
            beaconFix = new Runway.LocalizerFix(beacon, distanceNumber);
        }

        let beacon2Fix: Runway.LocalizerFix | undefined;
        if (beacon2 !== undefined && beacon2 !== "0" && beacon2 !== "") {
            if (distance2 === undefined || distance2 === "0" || distance2 === "")
                throw new Error("Runway opposite beacon distance is required when beacon name is set.");
            const distance2Number = Number.parseFloat(distance2);
            if (Number.isNaN(distance2Number))
                throw new Error("Runway opposite beacon distance must be a number.");
            beacon2Fix = new Runway.LocalizerFix(beacon2, distance2Number);
        }

        const towerFrequencyNumber = towerFrequency === undefined ? 0 : Number.parseFloat(towerFrequency);
        if (Number.isNaN(towerFrequencyNumber))
            throw new Error("Runway tower frequency must be a number.");

        return new Runway({
            id,
            name: runwayName,
            position: fix,
            bearing: headingNumber,
            length: lengthNumber,
            displaced: displacedNumber,
            elevation: elevationNumber,
            glideslope: glideslopeNumber,
            localizer: localizerNumber,
            localizerFix: beaconFix,
            towerFrequency: towerFrequencyNumber,
            towerPronunciation,
            opposite: {
                displaced: displaced2Number,
                glideslope: glideslope2Number,
                localizer: localizer2Number,
                localizerFix: beacon2Fix,
            },
        });
    }

    private static parseSid(asp: Airspace, data: string): SidFix {
        const [name, latitude, longitude, pronunciation] = data.split(",").map(d => d.trim());
        if (name !== undefined && latitude === undefined && longitude === undefined && pronunciation === undefined) {
            const beacon = asp.beacons.find(b => b.name.toUpperCase() === name.toUpperCase());
            if (beacon === undefined)
                throw new Error(`Sid ${name} specifies just the beacon, but the beacon is not defined in airspace.beacons.`);
            return beacon;
        }
        if (name === undefined || name === "")
            throw new Error("SID name is required and must be a non-empty string.");
        return SidFix.fromFix(this.parseCoordinates(latitude, longitude), name, pronunciation);
    }

    private static parseAirline(data: string): Airline {
        const [name, amount, type, pronunciation, direction] = data.split(",").map(d => d.trim());
        if (name === undefined || name === "")
            throw new Error("Airline name is required and must be a non-empty string.");

        if (amount === undefined)
            throw new Error("Airline amount is required and must be a non-empty string.");
        const amountNumber = Number.parseFloat(amount);
        if (Number.isNaN(amountNumber))
            throw new Error("Airline amount must be a number.");

        if (type === undefined || type === "")
            throw new Error("Airline plane type is required and must be a non-empty string.");
        const types = type.split("/").map(t => t.trim());
        if (types.length === 0)
            throw new Error("At least one airline plane type is required.");

        let directions = new Set<CardinalDirection | number>();
        if (direction !== undefined) {
            const segments = direction.match(/[a-z]|\d{1,3}/gi);
            if (segments === null)
                throw new Error(
                    `Airline direction must be in the format: NESW, or nesw, or number/number/…, e.g. 090/260/360; got ${direction}`);
            for (const d of segments) {
                const heading = Number.parseFloat(d);
                if (Number.isNaN(heading))
                    directions.add(heading);
                else switch (d.toUpperCase()) {
                    case "N":
                        directions.add(CardinalDirection.NORTH);
                        break;
                    case "E":
                        directions.add(CardinalDirection.EAST);
                        break;
                    case "S":
                        directions.add(CardinalDirection.SOUTH);
                        break;
                    case "W":
                        directions.add(CardinalDirection.WEST);
                        break;
                    default:
                        throw new Error(`Invalid airline direction: ${d}`);
                }
            }
        }

        return new Airline(name, amountNumber, new Set(types), directions, pronunciation);
    }

    private static parseEntryPoint(data: string): EntryPoint {
        const [bearing, beacon, altitude] = data.split(",").map(d => d.trim());
        if (bearing === undefined)
            throw new Error("Entry point bearing is required.");
        const bearingNumber = Number.parseFloat(bearing);
        if (Number.isNaN(bearingNumber))
            throw new Error("Entry point bearing must be a number.");

        let altitudeNumber: number | undefined;
        if (altitude !== undefined) {
            if (Number.isNaN(altitudeNumber))
                throw new Error("Entry point altitude must be a number.");
        }

        return new EntryPoint(bearingNumber, altitudeNumber, beacon);
    }

    private static parseConfigurations(asp: Airspace, data: string[][]): RunwayConfiguration[] {
        const configs: RunwayConfiguration[] = [];
        for (const config of data) {
            const rc = new RunwayConfiguration();
            for (const d of config) {
                const [score, id, usage, offsetheading, nosid] = d.split(",").map(d => d.trim());
                if (score === undefined)
                    throw new Error("Runway configuration score is required.");
                const scoreNumber = Number.parseFloat(score);
                if (Number.isNaN(scoreNumber))
                    throw new Error("Runway configuration score must be a number.");

                if (id === undefined)
                    throw new Error("Runway configuration runway id is required.");

                if (usage === undefined)
                    throw new Error("Runway configuration runway id is required.");

                const land = usage.includes("land");
                const start = usage.includes("start");
                const rev = usage.includes("rev");
                const int = usage.includes("int");
                const track = usage.includes("track");

                const runway = rev ? asp.getRunway(id).reverse() : asp.getRunway(id);

                let offsetHeadingNumber: number | undefined;
                if (offsetheading !== undefined) {
                    offsetHeadingNumber = Number.parseFloat(offsetheading);
                    if (Number.isNaN(offsetHeadingNumber))
                        throw new Error("Runway configuration offset heading must be a number.");
                }

                const isNosid = nosid === "nosid";

                rc.add(scoreNumber, runway, {
                    land,
                    depart: start,
                    intersection: int,
                    backtrack: track,
                    initialHeading: offsetHeadingNumber,
                    noSID: isNosid,
                });
            }
            configs.push(rc);
        }
        return configs;
    }

    private static parsePlaneType(data: string): Aircraft {
        const [
            type, category, minspeed, maxspeed, minturnrate, maxturnrate, mindescentrate, maxdescentrate,
            minfinalapproachspeed, maxfinalapproachspeed, minaccel, maxaccel, manufacturer, minrollangle, maxrollangle,
            minrollrate, maxrollrate, minclimbrate, maxclimbrate,
        ] = data.split(",").map(d => d.trim());

        if (type === undefined || type === "")
            throw new Error("Aircraft type is required.");

        let cat: WakeCategory;
        switch (category) {
            case "1":
                cat = WakeCategory.SUPER_HEAVY;
                break;
            case "2":
                cat = WakeCategory.UPPER_HEAVY;
                break;
            case "3":
                cat = WakeCategory.LOWER_HEAVY;
                break;
            case "4":
                cat = WakeCategory.UPPER_MEDIUM;
                break;
            case "5":
                cat = WakeCategory.LOWER_MEDIUM;
                break;
            case "6":
                cat = WakeCategory.LIGHT;
                break;
            default:
                throw new Error(`Invalid plane category: ${category}`);
        }

        if (minspeed === undefined)
            throw new Error("Aircraft minspeed is required.");
        const minspeedNumber = Number.parseFloat(minspeed);
        if (Number.isNaN(minspeedNumber))
            throw new Error("Aircraft minspeed must be a number.");

        if (maxspeed === undefined)
            throw new Error("Aircraft maxspeed is required.");
        const maxspeedNumber = Number.parseFloat(maxspeed);
        if (Number.isNaN(maxspeedNumber))
            throw new Error("Aircraft maxspeed must be a number.");

        if (minturnrate === undefined)
            throw new Error("Aircraft minturnrate is required.");
        const minturnrateNumber = Number.parseFloat(minturnrate);
        if (Number.isNaN(minturnrateNumber))
            throw new Error("Aircraft minturnrate must be a number.");

        if (maxturnrate === undefined)
            throw new Error("Aircraft maxturnrate is required.");
        const maxturnrateNumber = Number.parseFloat(maxturnrate);
        if (Number.isNaN(maxturnrateNumber))
            throw new Error("Aircraft maxturnrate must be a number.");

        if (mindescentrate === undefined)
            throw new Error("Aircraft mindescentrate is required.");
        const mindescentrateNumber = Number.parseFloat(mindescentrate);
        if (Number.isNaN(mindescentrateNumber))
            throw new Error("Aircraft mindescentrate must be a number.");

        if (maxdescentrate === undefined)
            throw new Error("Aircraft maxdescentrate is required.");
        const maxdescentrateNumber = Number.parseFloat(maxdescentrate);
        if (Number.isNaN(maxdescentrateNumber))
            throw new Error("Aircraft maxdescentrate must be a number.");

        if (minfinalapproachspeed === undefined)
            throw new Error("Aircraft minfinalapproachspeed is required.");
        const minfinalapproachspeedNumber = Number.parseFloat(minfinalapproachspeed);
        if (Number.isNaN(minfinalapproachspeedNumber))
            throw new Error("Aircraft minfinalapproachspeed must be a number.");

        if (maxfinalapproachspeed === undefined)
            throw new Error("Aircraft maxfinalapproachspeed is required.");
        const maxfinalapproachspeedNumber = Number.parseFloat(maxfinalapproachspeed);
        if (Number.isNaN(maxfinalapproachspeedNumber))
            throw new Error("Aircraft maxfinalapproachspeed must be a number.");

        if (minaccel === undefined)
            throw new Error("Aircraft minaccel is required.");
        const minaccelNumber = Number.parseFloat(minaccel);
        if (Number.isNaN(minaccelNumber))
            throw new Error("Aircraft minaccel must be a number.");

        if (maxaccel === undefined)
            throw new Error("Aircraft maxaccel is required.");
        const maxaccelNumber = Number.parseFloat(maxaccel);
        if (Number.isNaN(maxaccelNumber))
            throw new Error("Aircraft maxaccel must be a number.");

        let minRollAngleNumber: number | undefined;
        if (minrollangle !== undefined && minrollangle !== "0") {
            minRollAngleNumber = Number.parseFloat(minrollangle);
            if (Number.isNaN(minRollAngleNumber))
                throw new Error("Aircraft minrollangle must be a number.");
        }

        let maxRollAngleNumber: number | undefined;
        if (maxrollangle !== undefined && maxrollangle !== "0") {
            maxRollAngleNumber = Number.parseFloat(maxrollangle);
            if (Number.isNaN(maxRollAngleNumber))
                throw new Error("Aircraft maxrollangle must be a number.");
        }

        let minRollRateNumber: number | undefined;
        if (minrollrate !== undefined && minrollrate !== "0") {
            minRollRateNumber = Number.parseFloat(minrollrate);
            if (Number.isNaN(minRollRateNumber))
                throw new Error("Aircraft minrollrate must be a number.");
        }

        let maxRollRateNumber: number | undefined;
        if (maxrollrate !== undefined && maxrollrate !== "0") {
            maxRollRateNumber = Number.parseFloat(maxrollrate);
            if (Number.isNaN(maxRollRateNumber))
                throw new Error("Aircraft maxrollrate must be a number.");
        }

        let minClimbRateNumber: number | undefined;
        if (minclimbrate !== undefined && minclimbrate !== "0") {
            minClimbRateNumber = Number.parseFloat(minclimbrate);
            if (Number.isNaN(minClimbRateNumber))
                throw new Error("Aircraft minclimbrate must be a number.");
        }

        let maxClimbRateNumber: number | undefined;
        if (maxclimbrate !== undefined && maxclimbrate !== "0") {
            maxClimbRateNumber = Number.parseFloat(maxclimbrate);
            if (Number.isNaN(maxClimbRateNumber))
                throw new Error("Aircraft maxclimbrate must be a number.");
        }

        return new Aircraft({
            acceleration: [minaccelNumber, maxaccelNumber],
            approachSpeed: [minfinalapproachspeedNumber, maxfinalapproachspeedNumber],
            bankAngle: [minRollAngleNumber ?? 25, maxRollAngleNumber ?? 30],
            bankRate: [minRollRateNumber ?? 3, maxRollRateNumber ?? 5],
            category: cat,
            climbRate: [minClimbRateNumber ?? mindescentrateNumber * 2, maxClimbRateNumber ?? maxdescentrateNumber * 2],
            descentRate: [mindescentrateNumber, maxdescentrateNumber],
            manufacturer,
            speed: [minspeedNumber, maxspeedNumber],
            turnRate: [minturnrateNumber, maxturnrateNumber],
            type: type,
        });
    }

    private static parseLine(data: string[]) {
        const [points, rawColor] = data[0]!.match(/,/g)?.length !== 1 ? [data.slice(1), data[0]!] : [data, void 0];
        const fixes = points.map(this.parseFix.bind(this));
        let color: Polyline.Color | Polyline.RGB | undefined;
        if (rawColor !== undefined) {
            switch (rawColor) {
                case "airspace":
                    color = Polyline.Color.AIRSPACE;
                    break;
                case "coast":
                    color = Polyline.Color.COAST;
                    break;
                case "runway":
                    color = Polyline.Color.RUNWAY;
                    break;
                default: {
                    const [r, g, b] = rawColor.split(",").map(d => Number.parseInt(d, 10));
                    if (
                        r !== undefined && g !== undefined && b !== undefined
                        && !Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)
                    )
                        color = new Polyline.RGB(r, g, b);
                    else
                        throw new Error(`Invalid value for line color: ${rawColor}`);
                }
            }
        }
        return new Polyline(fixes, color);
    }

    private static parseDepartures(asp: Airspace, data: [runway: string, routes: string[][]]): Departure[] {
        const departures: Departure[] = [];

        const [runwayId, rev] = data[0].split(",").map(d => d.trim());
        if (runwayId === undefined)
            throw new Error("Departure runway id is required.");
        const isRev = rev === "rev";
        const runway = isRev ? asp.getRunway(runwayId).reverse() : asp.getRunway(runwayId);

        for (const route of data[1]) {
            const [name, pronunciation] = route[0]!.split(",").map(d => d.trim());
            if (name === undefined || name === "")
                throw new Error("Departure name is required and must be a non-empty string.");
            if (name.length > 7)
                console.warn(
                    `Warning: Departure ${name} name is longer than 7 characters. Display limited to 7 characters in-game.`);
            const [, , initialClimb] = route[1]!.split(",").map(d => d.trim());
            let initialClimbNumber: number | undefined;
            if (initialClimb !== undefined) {
                initialClimbNumber = Number.parseFloat(initialClimb);
                if (Number.isNaN(initialClimbNumber))
                    throw new Error("Departure initialclimb must be a number.");
            }
            const fixes = route.slice(1).map(this.parseFix.bind(this));
            if (initialClimbNumber !== undefined)
                departures.push(new Departure(
                    name,
                    pronunciation,
                    runway,
                    initialClimbNumber!,
                    fixes,
                ));
            else
                departures.push(new Departure(
                    name,
                    pronunciation,
                    runway,
                    fixes,
                ));
        }
        return departures;
    }

    private static parseArrivals(asp: Airspace, data: [[runway: string, beacon: string], string[][]]): Arrival[] {
        const arrivals: Arrival[] = [];

        const [runwayString, beaconString] = data[0];
        const [runwayId, rev] = runwayString.split(",").map(d => d.trim());
        if (runwayId === undefined)
            throw new Error("Arrival runway id is required.");
        const isRev = rev === "rev";
        const runway = isRev ? asp.getRunway(runwayId).reverse() : asp.getRunway(runwayId);

        const beacon = beaconString.includes(",")
                       ? this.parseBeacon(beaconString)
                       : asp.beacons.find(b => b.name.toUpperCase() === beaconString.toUpperCase());
        if (beacon === undefined)
            throw new Error(`Beacon ${beaconString} is not defined in airspace beacons.`);

        for (const route of data[1]) {
            const [inboundHeadingString, name, pronunciation] = route[0]!.split(",").map(d => d.trim());

            const inboundHeading = inboundHeadingString !== undefined && inboundHeadingString !== "0"
                                   ? Number.parseFloat(inboundHeadingString)
                                   : undefined;
            if (inboundHeading !== undefined && Number.isNaN(inboundHeading))
                throw new Error("Arrival inboundheading must be a number.");

            if (name === undefined || name === "")
                throw new Error("Arrival name is required and must be a non-empty string.");
            if (name.length > 7)
                console.warn(
                    `Warning: Arrival ${name} name is longer than 7 characters. Display limited to 7 characters in-game.`);

            const fixes = route.slice(1, -1).map(this.parseApproachFix.bind(this));

            const terminationString = route.slice(-1)[0]!;

            const [a, b, c] = terminationString.split(",").map(d => d.trim()) as [string, ...string[]];
            let termination: Arrival.Termination;
            if (a === "end") {
                if (b === undefined)
                    termination = new Arrival.End();
                else if (b === "hold")
                    termination = new Arrival.Hold();
                else {
                    const heading = Number.parseFloat(b);
                    if (Number.isNaN(heading))
                        throw new Error(`Arrival hold heading must be a number, got: ${b}`);
                    termination = new Arrival.End(heading);
                }
            }
            else {
                const distance = Number.parseFloat(a);
                if (Number.isNaN(distance))
                    throw new Error(`Arrival ILS intercept distance must be a number, got: ${a}`);

                const altitude = b !== undefined && b !== "0"
                                 ? Number.parseFloat(b)
                                 : undefined;
                if (altitude !== undefined && Number.isNaN(altitude))
                    throw new Error(`Arrival ILS intercept max altitude must be a number, got: ${b}`);

                const speed = c !== undefined && c !== "0"
                             ? Number.parseFloat(c)
                             : undefined;
                if (speed !== undefined && Number.isNaN(speed))
                    throw new Error(`Arrival ILS intercept max speed must be a number, got: ${c}`);

                termination = new Arrival.IlsIntercept(distance, altitude, speed);
            }

            if (inboundHeading !== undefined)
                arrivals.push(new Arrival(
                    name,
                    pronunciation,
                    [runway],
                    beacon,
                    inboundHeading,
                    fixes,
                    termination,
                ));
            else
                arrivals.push(new Arrival(
                    name,
                    pronunciation,
                    [runway],
                    beacon,
                    fixes,
                    termination,
                ));
        }

        return arrivals;
    }

    private static parseApproachFix(data: string) {
        const [latitude, longitude, altitude, speed] = data.split(",").map(d => d.trim());
        const fix = this.parseCoordinates(latitude, longitude);
        const altitudeNumber = altitude !== undefined && altitude !== "0"
                               ? Number.parseFloat(altitude)
                               : undefined;
        if (altitudeNumber !== undefined && Number.isNaN(altitudeNumber))
            throw new Error("Approach fix altitude must be a number.");
        const speedNumber = speed !== undefined && speed !== "0"
                            ? Number.parseFloat(speed)
                            : undefined;
        if (speedNumber !== undefined && Number.isNaN(speedNumber))
            throw new Error("Approach fix speed must be a number.");
        return new ApproachFix(fix.latitude, fix.longitude, altitudeNumber, speedNumber);
    }
}

/** @internal **/
export namespace Parser {
    /** @internal **/
    export interface Format {
        airspace: {
            inches: boolean;
            name: string;
            automatic: boolean;
            beacons: string[];
            boundary?: string[];
            radius?: number;
            letters: number;
            ceiling: number;
            center: string;
            above: number;
            diversionaltitude: number;
            handoff?: string[];
            descentaltitude: number;
            elevation: number;
            floor: number;
            magneticvar: number;
            metric: boolean;
            separation: number;
            speedrestriction: string;
            localizerspeed: string;
            strictspawn: boolean;
            transitionaltitude: number;
            usa: boolean;
            wake?: string[];
            zoom: number;
        };
        primaryAirport: {
            name: string;
            code: string;
            runways: string[];
            climbaltitude: number;
            sids?: string[];
            entrypoints: string[];
            airlines: string[];
        };
        secondaryAirports: {
            name: string;
            code: string;
            runways: string[];
            flow: number;
            inboundBeacon: string;
            entrypoints: string[];
            airlines: string[];
            climbaltitude: number;
            sids?: string[];
        }[];
        areas: ({
            altitude: number,
            name?: string,
            labelpos?: string,
        } & ({
            shape: "circle",
            radius: number,
            position: string,
            drawdegrees?: string,
        } | {
            shape: "polygon",
            points: string[],
            draw?: number,
        }))[];
        configurations: string[][];
        departures: Map<string, string[][]>;
        approaches: CompositeMap<[runway: string, beacon: string], string[][]>;
        planetypes: string[];
        lines: string[][];
    }
}
