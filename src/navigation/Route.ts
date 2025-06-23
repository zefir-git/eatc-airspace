import {Fix} from "./Fix.js";

export abstract class Route<T extends Fix> {
    /**
     * The fixes of this route.
     */
    protected readonly fixes: T[] = [];
}
