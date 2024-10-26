import {expect, describe, test} from 'bun:test';

import {timeout_exec, defer, microtask} from '../dist/mjs/async';
import {MutexPool} from '../dist/mjs/mutex-pool';


describe('MutexPool', () => {
	test('waits while busy and lets net microtick process', async() => {
		// create new pool with single mutex
		const k_pool = MutexPool(1);

		// acquire mutex
		const f_release = await k_pool.acquire();

		// flag when it was released
		let c_ticks = 0;

		// defer a Promise
		const [dp_other, fke_other] = defer();

		// attempt to acquire another mutex
		void k_pool.acquire().then(() => {
			fke_other(c_ticks);
		});

		// allow some ticks
		await timeout_exec(100, () => dp_other);

		// increment tick counter
		c_ticks++;

		// release it
		await f_release();

		// increment tick counter
		c_ticks++;

		// go async
		await microtask();

		// increment again
		c_ticks++;

		// exepct resolved value to be tick counter before last increment
		expect(await dp_other).toBe(c_ticks-1);
	});
});
