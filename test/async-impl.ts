import {expect, describe, test} from 'bun:test';

import {
	timeout,
	timeout_exec,
	defer,
} from '../dist/mjs/async';

describe('timeout_exec', () => {
	test('void', async() => {
		const [w_return, xc_timed_out] = await timeout_exec(10e3, () => timeout(10));

		expect(w_return).toBeUndefined();
		expect(xc_timed_out).toBe(0);
	});

	test('timed out', async() => {
		const [w_return, xc_timed_out] = await timeout_exec(10, () => timeout(10e3));

		expect(w_return).toBeUndefined();
		expect(xc_timed_out).toBe(1);
	});

	test('value', async() => {
		const [s_return, xc_timed_out] = await timeout_exec(10e3, () => Promise.resolve('data'));

		expect(s_return).toEqual('data');
		expect(xc_timed_out).toBe(0);
	});

	test('infinite wait time', async() => {
		const [s_return, xc_timed_out] = await timeout_exec(Infinity, () => Promise.resolve('data'));

		expect(s_return).toEqual('data');
		expect(xc_timed_out).toBe(0);
	});
});

describe('defer', () => {
	test('void', async() => {
		const [dp_done, fke_done] = defer<void>();

		setTimeout(() => {
			fke_done();
		}, 10);

		expect(await dp_done).toBeUndefined();
	});

	test('undefined', async() => {
		const [dp_done, fke_done] = defer<undefined>();

		setTimeout(() => {
			fke_done(void 0);
		}, 10);

		expect(await dp_done).toBeUndefined();
	});

	test('string', async() => {
		const [dp_done, fke_done] = defer<string>();

		setTimeout(() => {
			fke_done('data');
		}, 10);

		expect(await dp_done).toBe('data');
	});

	test('error', () => {
		const [dp_done, fke_done] = defer<string>();

		setTimeout(() => {
			fke_done(null, Error('reason'));
		}, 10);

		return expect(dp_done).rejects.toThrow('reason');
	});
});
