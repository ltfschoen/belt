/* eslint-disable prefer-const */
import type {Dict} from './types';

import {__UNDEFINED, F_NOOP, transform_values} from './belt';

/**
 * Promise-based version of `setTimeout()`
 * @param xt_wait - number of milliseconds to wait
 * @returns Promise that resolves once the timeout has occurred
 */
export const timeout = (xt_wait: number): Promise<void> => new Promise(fk_resolve => setTimeout(() => fk_resolve(__UNDEFINED), xt_wait));

/**
 * Attempts to execute a given async function, timing out after the given number of milliseconds.
 * Optionally accepts `Infinity` for the wait argument.
 * @param xt_wait - number of milliseconds to wait
 * @param f_attempt - the async function to execute
 * @returns Promise that resolves once the timeout has occurred
 */
export const timeout_exec = <
	w_return extends any=any,
>(xt_wait: number, f_attempt?: () => Promise<w_return>): Promise<
	[w_return, 0] | [undefined, 1]
> => new Promise((fk_resolve, fe_reject) => {
	// whether the timeout occurred
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
	const i_pending: number = Number.isFinite(xt_wait)
		? (setTimeout as Window['setTimeout'])(() => {
			// mark as timed out
			b_timed_out = true;

			// resolve promise
			fk_resolve([__UNDEFINED, 1]);
		}, xt_wait)
		: 0;
});


export interface WithTimeoutConfig<w_value extends any> {
	trip: () => void;
	run: () => Promise<w_value>;
}

export const with_timeout = <
	w_value extends any,
>(
	xt_wait: number,
	g_with: WithTimeoutConfig<w_value>
): Promise<w_value> => new Promise((fk_resolve, fe_reject) => {
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
	}, xt_wait);

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


export const abortable = (
	f_run: () => AsyncGenerator
): [Promise<void>, (e_throw?: Error | undefined) => Promise<void>] => {
	// defer two
	let [dp_finished, fke_finished] = defer<void>();
	let [dp_aborted, fke_aborted] = defer<void>();

	// abort signal state
	let xc_abort = 0;

	// error value
	let z_error: Error | undefined;

	// go async
	void (async() => {
		// start iterating 
		// eslint-disable-next-line @typescript-eslint/naming-convention
		for await(let _w_ignore of f_run()) {
			// break on abort signal
			if(xc_abort) {
				// abort loudly
				if(z_error) fke_finished(void 0, z_error);

				// exit and resolve abort Promise
				return fke_aborted();
			}
		}

		// resolve finish Promise
		fke_finished();
	})();

	// return the Promise and a callback to set the abort flag
	return [dp_finished, (e_throw?: Error) => {
		// set abort flag
		xc_abort = 1;

		// set optional throw
		z_error = e_throw;

		// return Promise
		return dp_aborted;
	}];
};


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


/**
 * Convenient way to connect async/await flow with callback-based methods.
 * 
 * Creates a new Promise and combines the resolve and reject functions into a single callback.
 * 
 * Example:
 * ```ts
 * // create a new Promise and get its resolver callback
 * const [dp_complete, fke_resolve] = defer<boolean>();
 * 
 * // call some method that uses callbacks
 * do_something_with_callback((value: string, err?: Error) => {
 * 	if('done' === value) fke_resolve(true, err);
 * });
 * 
 * // if there was an error, this will throw via Promise rejection
 * // otherwise, this will return the boolean passed to the resolver
 * return await dp_complete;
 * ```
 * 
 * @returns a Promise that resolves with the value passed to the resolver's return value,
 * or throws with the value passed to the resolver's rejection argument
 */
export const defer = <w_return extends any=any>(): [
	Promise<w_return>,
	w_return extends void | undefined
		? (w_return?: w_return, e_reject?: Error) => void
		: (w_return: w_return, e_reject?: Error) => void,
] => {
	let fk_resolve: w_return extends void | undefined
		? (w_return?: w_return, e_reject?: Error) => void
		: (w_return: w_return, e_reject?: Error) => void;

	let fe_reject: (e_reject: Error) => void;

	return [
		new Promise<w_return>((fk, fe) => {
			fk_resolve = fk as typeof fk_resolve;
			fe_reject = fe;
		}),
		((w_return?: w_return, e_reject?: Error) => {
			if(e_reject) {
				fe_reject(e_reject);
			}
			else {
				fk_resolve(w_return);
			}
		}) as typeof fk_resolve,
	];
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
	const h_mapped: Dict<ReturnType<typeof defer>> = transform_values(h_input, () => defer());

	return {
		promises: transform_values(h_mapped, a_defer => a_defer[0]) as {
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
