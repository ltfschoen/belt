/* eslint-disable @typescript-eslint/naming-convention */
import type {Dict, JsonObject} from './types';

import {ok} from 'assert';

/**
 * Utility nil buffer constant
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ATU8_NIL = /*#__PURE__*/new Uint8Array(0);


// eslint-disable-next-line @typescript-eslint/naming-convention
export const __UNDEFINED = void 0;

/**
 * The value `8n`
 */
export const XG_8 = 8n;

/**
 * The value `16n`
 */
export const XG_16 = 8n;

/**
 * The value `32n`
 */
export const XG_32 = 8n;


/**
 * The frequently-used "no-operation" function
 */
export const F_NOOP = () => {};  // eslint-disable-line


/**
 * The seldomnly-used "identity" function
 */
export const F_IDENTITY =(w: any) => w;  // eslint-disable-line


/**
 * Creates a proper-case string
 */
export const proper = (s_input: string): string => s_input? s_input.split(/[\s_]+/g).map(s => s[0].toUpperCase()+s.slice(1)).join(' '): s_input;


/**
 * Converts given identifier to "snake_case"
 */
export const snake = (s_ident: string): string => s_ident.toUpperCase() === s_ident
	// depending on upper or mixed case
	? s_ident.toLowerCase().replace(/[^a-z0-9$]+/g, '_')
	: s_ident.replace(/(?<!^)(?:[^a-zA-Z0-9$]*([A-Z])|[^a-zA-Z0-9$]+)/g, (s_ignore, s_cap) => '_'+(s_cap || '')).toLowerCase();

/**
 * Converts given identifier to "PascalCase"
 */
// if all uppercase; make lower
export const pascal = (s_ident: string): string => (s_ident.toUpperCase() === s_ident? pascal(s_ident.toLowerCase()): s_ident)
	// convert to pascal
	.replace(/(?:^|[^A-Za-z0-9$])([\w0-9$])/g, (s_ignore, s_letter) => s_letter.toUpperCase());


/**
 * Simple test for whether a value is a Uint8Array or not
 */
export const is_bytes = (z: unknown): z is Uint8Array => z instanceof Uint8Array;

/**
 * Simple test for whether a value is an array or not
 */
export const is_array = <w_type=unknown>(z: unknown): z is Array<w_type> => Array.isArray(z);

/**
 * Simple test for whether a deserialized JSON value is a plain object (dict) or not
 */
export const is_dict = (z: unknown): z is JsonObject => z? 'object' === typeof z && !is_array(z): false;

/**
 * Strict test for whether an ES object is a plain object (dict) or not
 */
export const is_dict_es = (z: unknown): z is JsonObject => Object === z?.constructor;


/**
 * Fold array into an object
 */
export const fold = <w_out, w_value>(a_in: Iterable<w_value>, f_fold: (z_value: w_value, i_each: number) => Dict<w_out>): Dict<w_out> => {
	const h_out = {};
	let i_each = 0;
	for(const z_each of a_in) {
		Object.assign(h_out, f_fold(z_each, i_each++));
	}

	return h_out;
};


/**
 * Creates a new array by inserting an item in between every existing item
 */
export const interjoin = <
	w_item extends any,
	w_insert extends any,
>(a_input: w_item[], w_insert: w_insert): Array<w_item | w_insert> => {
	const a_output: Array<w_item | w_insert> = [];

	for(let i_each=0, nl_items=a_input.length; i_each<nl_items-1; i_each++) {
		a_output.push(a_input[i_each]);
		a_output.push(w_insert);
	}

	if(a_input.length) a_output.push(a_input.at(-1)!);

	return a_output;
};

/**
 * Removes duplicates from an array, keeping only the first occurrence.
 * @param z_identify - if specified and a string, identifies the key of each item to use as an identifier
 * if specified and a function, used as a callback to produce the comparison key
 * if omitted, compares items using full equality `===`
 */
export const deduplicate = <
	z_item extends any,
	s_key extends keyof z_item=keyof z_item,
>(a_items: z_item[], z_identify?: s_key | ((z_item: z_item) => any)): typeof a_items => {
	// compare items exactly by default
	let a_keys: any[] = a_items;

	// identify argument
	if(z_identify) {
		// use object property
		if('string' === typeof z_identify) {
			a_keys = a_items.map(w => w[z_identify]);
		}
		// use identity function
		else if('function' === typeof z_identify) {
			a_keys = a_items.map(z_identify);
		}
		else {
			throw new TypeError(`Invalid identifier argument value: ${String(z_identify)}`);
		}
	}

	// prep keys set
	const as_keys = new Set<any>();

	// prep output
	const a_unique: z_item[] = [];

	// each item in list
	for(let i_item=0, nl_items=a_items.length; i_item<nl_items; i_item++) {
		const w_key = a_keys[i_item];

		// already in set; skip
		if(as_keys.has(w_key)) continue;

		// add to keys set
		as_keys.add(w_key);

		// add to items
		a_unique.push(a_items[i_item]);
	}

	return a_unique;
};

/**
 * Escape all special regex characters to turn a string into a verbatim match pattern
 * @param s_input input string
 * @returns escaped string ready for RegExp constructor
 */
export const escape_regex = (s_input: string): string => s_input.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');


/**
 * Typed alias to `Object.create`
 */
export const oc: <
	h_source extends object | null,
>(h_object: h_source, gc_props?: PropertyDescriptorMap) => object = Object.create;


/**
 * Typed alias to `Object.assign`
 */
export const oda: <
	h_object extends {},
	h_extend extends {},
>(h_object: h_object, h_extend: h_extend) => h_object & h_extend = Object.assign;


/**
 * Typed alias to `Object.keys`
 */
export const odk: <
	si_key extends string,
	w_value extends any,
>(h_object: Record<si_key, w_value>) => si_key[] = Object.keys;


/**
 * Typed alias to `Object.values`
 */
export const odv: <
	w_value extends any,
>(h_object: Record<any, w_value>) => w_value[] = Object.values;


/**
 * Typed alias to `Object.entries`
 */
export const ode: <
	si_key extends string,
	w_value extends any,
>(h_object: Record<si_key, w_value>) => [si_key, w_value][] = Object.entries;


/**
 * Typed alias to `Object.fromEntries`
 */
export const ofe: <
	as_keys extends string,
	w_values extends any,
>(a_entries: Iterable<[as_keys, w_values]>) => Record<as_keys, w_values> = Object.fromEntries;


/**
 * Map object entries
 */
export const odem = <
	w_out extends any,
	si_key extends string,
	w_value extends any,
>(
	h_object: Record<si_key, w_value>,
	f_map: (g_entry: [si_key, w_value], i_index: number, a_all: [si_key, w_value][]) => w_out
): w_out[] => ode(h_object).map(f_map);


/**
 * Reduce object entries to an arbitrary type
 */
export const oder = <
	w_out extends any,
	si_key extends string,
	w_value extends any,
>(
	h_thing: Record<si_key, w_value>,
	f_reduce: (w_prev: w_out, g_entry: [si_key, w_value], i_index: number, a_all: [si_key, w_value][]) => w_out,
	w_init: w_out
): w_out => ode(h_thing).reduce(f_reduce, w_init);


/**
 * Reduce object entries to an array via concatenation (with filtering)
 */
export const oderac = <
	w_out extends any,
	si_key extends string,
	w_value extends any,
>(
	h_thing: Record<si_key, w_value>,
	f_concat: (si_key: si_key, w_value: w_value, i_entry: number) => w_out,
	b_add_undefs=false
): w_out[] => oder(h_thing, (a_out: w_out[], [si_key, w_value], i_entry) => {
	// invoke callback and capture return value
	const w_add = f_concat(si_key, w_value, i_entry);

	// add result to array iff not undefined or if undefined values are explictly allowed
	if(__UNDEFINED !== w_add || b_add_undefs) a_out.push(w_add);

	return a_out;
}, []);


/**
 * Reduce object entries to an array via flattening
 */
export const oderaf = <
	w_out extends any,
	si_key extends string,
	w_value extends any,
>(
	h_thing: Record<si_key, w_value>,
	f_concat: (si_key: si_key, w_value: w_value, i_entry: number) => w_out[]
): w_out[] => oder(h_thing, (a_out, [si_key, w_value], i_entry) => [
	...a_out,
	...f_concat(si_key, w_value, i_entry),
], [] as w_out[]);


/**
 * Reduce object entries to an object via merging
 */
export const oderom = <
	w_value_out extends any,
	si_key_in extends string,
	w_value_in extends any,
	si_key_out extends string,
>(
	h_thing: Record<si_key_in, w_value_in>,
	f_merge: (si_key: si_key_in, w_value: w_value_in, i_index: number) => Record<si_key_in, w_value_out>
): Record<si_key_out, w_value_out> => oder(h_thing, (h_out, [si_key, w_value], i_index) => ({
	...h_out,
	...f_merge(si_key, w_value, i_index),
}), {}) as Record<si_key_out, w_value_out>;


/**
 * Reduce object entries to an object via transforming value function
 */
export const fodemtv = <
	w_out extends any,
	si_key extends string,
	w_value extends any,
>(
	h_thing: Record<si_key, w_value>,
	f_transform: (w_value: w_value, si_key: si_key, i_entry: number) => w_out
): {
	[si_key_out in keyof typeof h_thing]: w_out;
} => ofe(
	odem(h_thing, ([si_key, w_value], i_entry) => [si_key, f_transform(w_value, si_key, i_entry)])
) as {
	[si_key_out in keyof typeof h_thing]: w_out;
};


/**
 * Promise-based version of `setTimeout()`
 */
export const timeout = (xt_wait: number): Promise<void> => new Promise((fk_resolve) => {
	setTimeout(() => {
		fk_resolve(__UNDEFINED);
	}, xt_wait);
});


export const timeout_exec = <
	w_return extends any=any,
>(xt_wait: number, f_attempt?: () => Promise<w_return>): Promise<[w_return | undefined, 0 | 1]> => new Promise((fk_resolve, fe_reject) => {
		// infinite
	if(!Number.isFinite(xt_wait)) {
		void f_attempt?.().then(w => fk_resolve([w, 0])).catch(e => fe_reject(e));
		return;
	}

	let b_timed_out = false;

		// attempt callback
	f_attempt?.()
		.then((w_return: w_return) => {
				// already timed out
			if(b_timed_out) return;

				// cancel pending timer
			clearTimeout(i_pending);

				// resolve promise
			fk_resolve([w_return, 0]);
		})
		.catch((e_attempt) => {
			fe_reject(e_attempt);
		});

		// start waiting
	const i_pending = (setTimeout as Window['setTimeout'])(() => {
			// mark as timed out
		b_timed_out = true;

			// resolve promise
		fk_resolve([__UNDEFINED, 1]);
	}, xt_wait);
});


export interface WithTimeoutConfig<w_value extends any> {
	duration: number;
	trip: () => void;
	run: () => Promise<w_value>;
}

export const with_timeout = <w_value extends any>(g_with: WithTimeoutConfig<w_value>): Promise<w_value> => new Promise((fk_resolve, fe_reject) => {
		// state of completion
	let b_complete = false;

		// timer
	setTimeout(() => {
			// already completed
		if(b_complete) return;

			// now complete
		b_complete = true;

			// reject
		fe_reject(g_with.trip());
	}, g_with.duration);

		// run task
	g_with.run().then((w_value: w_value) => {
			// already failed
		if(b_complete) return;

			// now complete
		b_complete = true;

			// resolve
		fk_resolve(w_value);
	}).catch(fe_reject);
});


/**
 * A Promise that never fulfills nor rejects
 */
export const forever = <w_type=void>(w_type?: w_type): Promise<w_type> => new Promise(F_NOOP);


/**
 * Promse-based version of `queueMicrotask()`
 */
export const microtask = (): Promise<void> => new Promise((fk_resolve) => {
	queueMicrotask(() => {
		fk_resolve(__UNDEFINED);
	});
});


export const defer = <w_return extends any=any>(): [Promise<w_return>, (w_return: w_return, e_reject?: Error) => void] => {
	let fk_resolve: (w_return: w_return) => void;
	let fe_reject: (e_reject: Error) => void;

	const dp_promise = new Promise<w_return>((fk, fe) => {
		fk_resolve = fk;
		fe_reject = fe;
	});


	return [dp_promise, (w_return: w_return, e_reject?: Error) => {
		if(e_reject) {
			fe_reject(e_reject);
		}
		else {
			fk_resolve(w_return);
		}
	}];
};

export const defer_many = <
	h_input extends Dict<unknown>,
>(h_input: h_input): {
	promises: {
		[si_each in keyof typeof h_input]: Promise<typeof h_input[si_each]>;
	};
	resolve(h_resolves: {
		[si_each in keyof typeof h_input]?: typeof h_input[si_each];
	}): void;
	reject(h_rejects: {
		[si_each in keyof typeof h_input]?: Error;
	}): void;
} => {
	const h_mapped = fodemtv(h_input, () => defer());

	return {
		promises: fodemtv(h_mapped, a_defer => a_defer[0]) as {
			[si_each in keyof typeof h_input]: Promise<typeof h_input[si_each]>;
		},
		resolve(h_resolves) {
			for(const si_key in h_resolves) {
				h_mapped[si_key]?.[1](h_resolves[si_key]);
			}
		},
		reject(h_rejects) {
			for(const si_key in h_rejects) {
				h_mapped[si_key]?.[1](__UNDEFINED, h_rejects[si_key]);
			}
		},
	};
};


/**
 * Cryptographically strong random number
 */
export const crypto_random = (): number => crypto.getRandomValues(new Uint32Array(1))[0] / (2**32);


/**
 * Generate a random int within a given range
 */
export const random_int = (x_a: number, x_b=0): number => {
	const x_min = Math.floor(Math.min(x_a, x_b));
	const x_max = Math.ceil(Math.max(x_a, x_b));

	// confine to range
	return Math.floor(Math.random() * (x_max - x_min)) + x_min;
};


/**
 * Generate a cryptographically strong random int within a given range
 */
export const crypto_random_int = (x_a: number, x_b=0): number => {
	const x_min = Math.floor(Math.min(x_a, x_b));
	const x_max = Math.ceil(Math.max(x_a, x_b));

	// confine to range
	return Math.floor(crypto_random() * (x_max - x_min)) + x_min;
};

type TypedArray =
	| Int8Array
	| Uint8Array
	| Uint8ClampedArray
	| Int16Array
	| Uint16Array
	| Int32Array
	| Uint32Array
	| Float32Array
	| Float64Array;

/**
 * Shuffles an array
 */
export const shuffle = <
	w_list extends Array<any> | TypedArray,
// eslint-disable-next-line @typescript-eslint/naming-convention
>(a_items: w_list, f_random=random_int): w_list => {
	let i_item = a_items.length;

	while(i_item > 0) {
		const i_swap = f_random(--i_item);
		const w_item = a_items[i_item];
		a_items[i_item] = a_items[i_swap];
		a_items[i_swap] = w_item;
	}

	return a_items;
};

/**
 * Removes the first occurrence of the given item from the array
 * @param a_items 
 * @param w_item 
 * @returns 
 */
export const remove = <w_item>(a_items: w_item[], w_item: w_item): w_item[] => {
	const i_item = a_items.indexOf(w_item);
	if(i_item >= 0) a_items.splice(i_item, 1);
	return a_items;
};

/**
 * Throws an error, accepting an optional piece of data to attach to the object
 * @param s_msg 
 * @param w_data 
 */
export const die = (s_msg: string, w_data?: unknown): never => {
	throw oda(Error(s_msg), {data:w_data});
};
