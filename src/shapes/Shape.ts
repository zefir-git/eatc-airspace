import {Fix} from "../navigation/Fix.js";

/**
 * An ordered sequence of vertices.
 */
export abstract class Shape {
    readonly #vertices: Fix[];

    /**
     * @param vertices Ordered vertices comprising this shape.
     */
    protected constructor(vertices: Iterable<Fix>) {
        this.#vertices = Array.from(vertices);
    }

    /**
     * The vertices that define this shape.
     */
    public get vertices(): ReadonlyArray<Fix> {
        return this.#vertices;
    }

    /**
     * Add vertices to the beginning of this shape.
     *
     * @param vertices Vertices to add.
     */
    public prepend(...vertices: Fix[]) {
        this.#vertices.unshift(...vertices);
        return this;
    }

    /**
     * Add vertices to the end of this shape.
     *
     * @param vertices Vertices to add.
     */
    public append(...vertices: Fix[]) {
        this.#vertices.push(...vertices);
        return this;
    }

    /**
     * Join another shape to the end of this shape.
     *
     * @param shape The shape to join.
     */
    public join(shape: Shape) {
        this.#vertices.push(...shape.vertices);
        return this;
    }

    /**
     * Reverse the order of the vertices in this shape.
     */
    public reverse() {
        this.#vertices.reverse();
        return this;
    }
}
