import {describe, test} from 'bun:test';

import {
	abortable,
} from '../dist/mjs/async';


describe('abortable', () => {
	const f_runner = async function *() {
		await timeout(1e3);

		yield;
	};

	const [dp_finished, f_abort] = abortable();
});
