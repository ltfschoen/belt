import type {A} from 'ts-toolbelt';

import type {NaiveJsonString} from './strings';


/**
 * Shortcut for a very common type pattern
 */
export type Dict<w_value=string> = Record<string, w_value>;


/**
 * Shortcut for another common type pattern
 */
export type Promisable<w_value=unknown> = w_value | Promise<w_value>;

/**
 * Shortcut for another common type pattern
 */
export type Arrayable<w_value> = w_value | w_value[];

/**
 * Shortcut for another common type pattern
 */
export type NestedArrayable<w_value> = w_value | (w_value | NestedArrayable<w_value>)[];

/**
 * Shortcut for another common type pattern
 */
export type Nilable<w_value> = w_value | null | undefined;

/**
 * Shortcut for another common type pattern
 */
export type Falsible<w_value> = Nilable<w_value> | 0 | false | '';



/**
 * Root type for all objects considered to be parsed JSON objects
 */
export interface JsonObject<w_inject extends any=never> {  // eslint-disable-line
	[k: string]: JsonValue<w_inject>;
}

/**
 * Union of "valuable", primitive JSON value types
 */
export type JsonPrimitive =
	| boolean
	| number
	| string;

/**
 * All primitive JSON value types
 */
export type JsonPrimitiveNullable<w_inject extends any=never> =
	| JsonPrimitive
	| null
	| w_inject;

/**
 * JSON Array
 */
export type JsonArray<w_inject extends any=never> = JsonValue<w_inject>[];

/**
 * All JSON value types
 */
export type JsonValue<w_inject extends any=never> =
	| JsonPrimitiveNullable<w_inject>
	| JsonArray<w_inject>
	| JsonObject<w_inject>
	| Arrayable<undefined>;

/**
 * Removes JSON interfaces from a type
 */
export type RemoveJsonInterfaces<w_type> = Exclude<A.Compute<Exclude<Extract<w_type, object>, JsonArray>>, JsonObject>;

/**
 * Reinterprets the given type as being JSON-compatible
 */
export type AsJson<
	z_test extends JsonValue | {} | {}[],
> = z_test extends JsonValue? z_test
	: z_test extends Array<infer w_type>
		? AsJson<w_type>[]
		: {
			[si_each in keyof z_test]: AsJson<z_test[si_each]>;
		};


// augment global functions
declare global {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface JSON {
		/**
		 * Converts a JavaScript Object Notation (JSON) string into an object.
		 * @param text A valid JSON string.
		 * @param reviver A function that transforms the results. This function is called for each member of the object.
		 * If a member contains nested objects, the nested objects are transformed before the parent object is.
		 */
		parse<
			w_revive=never,
		>(text: string, reviver?: (this: any, key: string, value: any) => w_revive): JsonValue<w_revive>;

		/**
		 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
		 * @param value A JavaScript value, usually an object or array, to be converted.
		 * @param replacer A function that transforms the results.
		 * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
		 */
		stringify(value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number): NaiveJsonString;

		/**
		 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
		 * @param value A JavaScript value, usually an object or array, to be converted.
		 * @param replacer An array of strings and numbers that acts as an approved list for selecting the object properties that will be stringified.
		 * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
		 */
		// eslint-disable-next-line @typescript-eslint/unified-signatures
		stringify(value: any, replacer?: (number | string)[] | null, space?: string | number): NaiveJsonString;
	}
}
