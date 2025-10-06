/** @internal */
const encodeKey = Symbol("#encodeKey");
/** @internal */
const decodeKey = Symbol("#decodeKey");

/**
 * The **`CompositeMap`** object holds key-value pairs and remembers the original insertion order of the keys.
 *
 * By
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/contributors.txt Mozilla Contributors}, {@link https://creativecommons.org/licenses/by-sa/2.5/ CC BY-SA 2.5}
 */
export class CompositeMap<
    K extends readonly (string | number | boolean | null)[],
    V
> implements Map<K, V> {
    /**
     * The **`[Symbol.iterator]()`** method of {@link CompositeMap `CompositeMap`} instances implements the
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols iterable protocol}
     * and allows `CompositeMap` objects to be consumed by most syntaxes expecting iterables, such as the
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax spread syntax}
     * and {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of `for...of`}
     * loops. It returns
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator map iterator object} that yields the key-value pairs of the map in insertion order.
     *
     * The initial value of this property is the same function object as the initial value of the
     * {@link entries `CompositeMap.prototype.entries`} property.
     *
     * By
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/Symbol.iterator/contributors.txt Mozilla Contributors}, {@link https://creativecommons.org/licenses/by-sa/2.5/ CC BY-SA 2.5}
     *
     * @returns A new iterable iterator object.
     */
    public readonly [Symbol.iterator] = this.entries.bind(this);
    readonly #map = new Map<string, V>();

    /**
     * The **`CompositeMap()`** constructor creates {@link CompositeMap `CompositeMap`} objects.
     *
     * By
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/contributors.txt Mozilla Contributors}, {@link https://creativecommons.org/licenses/by-sa/2.5/ CC BY-SA 2.5}
     *
     * @param [entries] An {@link !Array `Array`} or other
     *     {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols iterable}
     *     object whose elements are key-value pairs. (For example, arrays with two elements, such as `[[ 1, 'one' ],[
     *     2, 'two' ]]`.)  Each key-value pair is added to the new `CompositeMap`.
     */
    public constructor(entries?: Iterable<[K, V]>) {
        if (entries !== undefined) {
            for (const [key, value] of entries) {
                this.set(key, value);
            }
        }
    }

    /**
     * The **`size`** accessor property of {@link CompositeMap `CompositeMap`} instances returns the number of elements
     * in this map.
     *
     * By
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/size/contributors.txt Mozilla Contributors}, {@link https://creativecommons.org/licenses/by-sa/2.5/ CC BY-SA 2.5}
     */
    public get size(): number {
        return this.#map.size;
    }

    /** @internal */
    private static [encodeKey](key: readonly (string | number | boolean | null)[]): string {
        return JSON.stringify(key);
    }

    /** @internal */
    private static [decodeKey]<K extends readonly (string | number | boolean | null)[]>(encoded: string): K {
        return JSON.parse(encoded);
    }

    /**
     * The **`clear()`** method of {@link CompositeMap `CompositeMap`} instances removes all elements from this map.
     *
     * By
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear/contributors.txt Mozilla Contributors}, {@link https://creativecommons.org/licenses/by-sa/2.5/ CC BY-SA 2.5}
     */
    public clear(): void {
        this.#map.clear();
    }

    /**
     * The **`delete()`** method of {@link CompositeMap `CompositeMap`} instances removes the specified element from
     * this map by key.
     *
     * By
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete/contributors.txt Mozilla Contributors}, {@link https://creativecommons.org/licenses/by-sa/2.5/ CC BY-SA 2.5}
     *
     * @param key The composite key of the element to remove from the `CompositeMap` object.
     * @returns `true` if an element in the `CompositeMap` object existed and has been removed, or `false` if the
     *     element does not exist.
     */
    public delete(key: K): boolean {
        return this.#map.delete(CompositeMap[encodeKey](key));
    }

    /**
     * The **`entries()`** method of {@link CompositeMap `CompositeMap`} instances returns a new
     * *{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator map iterator}*
     * object that contains the `[key, value]` pairs for each element in this map in insertion order.
     *
     * By
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries/contributors.txt Mozilla Contributors}, {@link https://creativecommons.org/licenses/by-sa/2.5/ CC BY-SA 2.5}
     *
     * @returns A new
     *     {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator iterable iterator object}.
     */
    public* entries(): MapIterator<[K, V]> {
        for (const [encodedKey, value] of this.#map.entries()) {
            yield [CompositeMap[decodeKey](encodedKey), value];
        }
    }

    public get [Symbol.toStringTag](): string {
        return this.constructor.name;
    }

    /**
     * The **`forEach()`** method of {@link CompositeMap `CompositeMap`} instances executes a provided function once
     * per each key/value pair in this map, in insertion order.
     *
     * By
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach/contributors.txt Mozilla Contributors}, {@link https://creativecommons.org/licenses/by-sa/2.5/ CC BY-SA 2.5}
     *
     * @param callbackFn Function to execute for each element, taking three arguments:
     * <dl>
     *   <dt>`value`</dt>
     *   <dd>Value of each iteration.</dd>
     *   <dt>`key`</dt>
     *   <dd>Composite key of each iteration.</dd>
     *   <dt>`map`</dt>
     *   <dd>The map being iterated.</dd>
     * </dl>
     * @param [thisArg] A value to use as `this` when executing `callbackFn`.
     */
    public forEach(callbackFn: (value: V, key: K, map: CompositeMap<K, V>) => void, thisArg?: any): void {
        this.#map.forEach((value, encodedKey) => {
            callbackFn(value, CompositeMap[decodeKey](encodedKey), this);
        }, thisArg);
    }

    /**
     * The **`get()`** method of {@link CompositeMap `CompositeMap`} instances returns a specified element from this
     * map. If the value that is associated to the provided key is an object, then you will get a reference to that
     * object and any change made to that object will effectively modify it inside the `CompositeMap` object.
     *
     * By
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get/contributors.txt Mozilla Contributors}, {@link https://creativecommons.org/licenses/by-sa/2.5/ CC BY-SA 2.5}
     *
     * @param key The composite key of the element to return from the `CompositeMap` object.
     * @returns The element associated with the specified composite key, or {@link !undefined `undefined`} if the key
     *     can't be found in this map.
     */
    public get(key: K): V | undefined {
        return this.#map.get(CompositeMap[encodeKey](key));
    }

    /**
     * The **`has()`** method of {@link CompositeMap `CompositeMap`} instances returns a boolean indicating whether an
     * element with the specified key exists in this map or not.
     *
     * By
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has/contributors.txt Mozilla Contributors}, {@link https://creativecommons.org/licenses/by-sa/2.5/ CC BY-SA 2.5}
     *
     * @param key The composite key to test for presence in the `CompositeMap` object.
     * @returns `true` if an element with the specified key exists in the `CompositeMap` object; otherwise `false`.
     */
    public has(key: K): boolean {
        return this.#map.has(CompositeMap[encodeKey](key));
    }

    /**
     * The **`keys()`** method of {@link CompositeMap `CompositeMap`} instances returns a new
     * *{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator map iterator}*
     * object that contains the keys for each element in this map in insertion order.
     *
     * By
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/keys/contributors.txt Mozilla Contributors}, {@link https://creativecommons.org/licenses/by-sa/2.5/ CC BY-SA 2.5}
     *
     * @returns A new
     *     {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator iterable iterator object}.
     */
    public* keys(): MapIterator<K> {
        for (const encodedKey of this.#map.keys())
            yield CompositeMap[decodeKey](encodedKey);
    }

    /**
     * The **`set()`** method of {@link CompositeMap `CompositeMap`} instances adds or updates an entry in this map
     * with a specified key and a value.
     *
     * By
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set/contributors.txt Mozilla Contributors}, {@link https://creativecommons.org/licenses/by-sa/2.5/ CC BY-SA 2.5}
     *
     * @param key The composite key of the element to add to the `CompositeMap` object. The key may be a composite of
     *     any string, number, boolean, or `null`.
     * @param value The value of the element to add to the `CompositeMap` object. The value may be any
     *     {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures JavaScript type} (any
     *     {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#primitive_values primitive value} or any type of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#objects JavaScript object}).
     * @returns The `CompositeMap` object.
     */
    public set(key: K, value: V) {
        this.#map.set(CompositeMap[encodeKey](key), value);
        return this;
    }

    /**
     * The **`values()`** method of {@link CompositeMap `CompositeMap`} instances returns a new
     * *{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator map iterator}*
     * object that contains the values for each element in this map in insertion order.
     *
     * By
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/values/contributors.txt Mozilla Contributors}, {@link https://creativecommons.org/licenses/by-sa/2.5/ CC BY-SA 2.5}
     *
     * @returns A new
     *     {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator iterable iterator object}.
     */
    public* values(): MapIterator<V> {
        for (const value of this.#map.values()) {
            yield value;
        }
    }
}
