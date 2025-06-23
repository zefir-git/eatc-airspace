import {NamedFix} from "./navigation/NamedFix.js";
import {Runway} from "./Runway.js";

/**
 * A registry for storing and retrieving airspace components.
 *
 * The following fixes are automatically registered by an {@link Airspace}:
 *  - `@center` — {@link Airspace#center}
 */
export class Registry {
    protected readonly fixes = new Map<string, NamedFix>();
    protected readonly runways = new Map<string, Runway>();

    /** @internal */
    protected constructor() {}

    /**
     * Store a named fix in the registry.
     *
     * @param fix The fix to store.
     */
    public addFix(...fix: NamedFix[]) {
        for (const b of fix) {
            const existing = this.fixes.get(b.name);
            if (existing !== undefined) {
                if ((existing.latitude !== b.latitude || existing.longitude !== b.longitude))
                    throw new Registry.CollisionError(NamedFix, b.name,
                        `with a different location: ${existing.latitude}, ${existing.longitude}`);
                else continue;
            }
            this.fixes.set(b.name, b);
        }
        return this;
    }

    /**
     * Retrieve a named fix from the registry.
     *
     * @param name The name of the fix to retrieve.
     * @throws {NotRegisteredError} If the fix is not registered in the registry.
     */
    public getFix(name: string): NamedFix {
        return this.fixes.get(name) ?? (() => {throw new Registry.NotRegisteredError(NamedFix, name);})();
    }

    /**
     * Store a runway in the registry.
     *
     * @param runway The runway to store.
     */
    public addRunway(...runway: Runway[]) {
        for (const r of runway) {
            if (this.runways.has(r.id))
                throw new Registry.CollisionError(Runway, r.id);
        }
        return this;
    }

    /**
     * Retrieve a runway from the registry.
     *
     * @param id The ID of the runway to retrieve.
     * @throws {NotRegisteredError} If the runway is not registered in the registry.
     */
    public getRunway(id: string): Runway {
        return this.runways.get(id) ?? (() => {throw new Registry.NotRegisteredError(Runway, id);})();
    }
}

export namespace Registry {
    /**
     * Thrown to indicate that a requested key is not registered in the registry.
     */
    export class NotRegisteredError extends Error {
        public constructor(type: Function, key: string) {
            super(`Key ${type.name} ${key} is not registered.`);
        }
    }

    /**
     * Thrown to indicate that a requested key is already registered in the registry.
     */
    export class CollisionError extends Error {
        public constructor(type: Function, key: string, description?: string) {
            super(`Key ${type.name} ${key} is already registered${
                description !== undefined
                ? ` ${description}`
                : ""
            }.`);
        }
    }
}
