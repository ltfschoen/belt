import type {NaiveBase64} from 'dist/mjs/strings';

import {describe, test, expect} from 'bun:test';

import {base58_to_bytes, bytes_to_base58, bytes_to_text, sha256} from 'src/data';

import {
	cast,
} from '../dist/mjs/belt';

import {
	bytes_to_biguint_be,
	biguint_to_bytes_be,
	bytes,
	bytes_to_hex,
	canonicalize_json,
	text_to_base64,
	base64_to_text,
	concat,
	text_to_bytes,
	bytes_to_base64_slim,
	base64_to_bytes_slim,
	sha512,
	bytes_to_base64,
	base64_to_bytes,
	bytes_to_base93,
	base93_to_bytes,
} from '../dist/mjs/data';



describe('biguint_to_bytes_be + bytes_to_biguint_be', () => {
	const hm_expect = new Map([
		[0n, [0]],
		[1n, [1]],
		[2n, [2]],

		[0x7en, [0x7e]],
		[0x7fn, [0x7f]],
		[0x80n, [0x80]],
		[0x81n, [0x81]],
		[0xffn, [0xff]],
		[0x100n, [0x01, 0x00]],
		[0x101n, [0x01, 0x01]],
		[0x10fn, [0x01, 0x0f]],
		[0x110n, [0x01, 0x10]],
		[0x1ffn, [0x01, 0xff]],
		[0x200n, [0x02, 0x00]],

		[0xfedcba9876543210n, [0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10]],
	]);

	for(const [xg_in, a_out] of hm_expect.entries()) {
		const atu8_expect = bytes(32);
		atu8_expect.set(a_out, 32-a_out.length);
		const atu8_actual = biguint_to_bytes_be(xg_in);

		const sb16_data = bytes_to_hex(atu8_expect).replace(/^(00)+(?=\d)/, '');

		test(`${xg_in} => 0x${sb16_data}`, () => {
			expect(atu8_actual).toEqual(atu8_expect);
		});

		test(`0x${sb16_data} => ${xg_in}`, () => {
			expect(bytes_to_biguint_be(atu8_actual)).toEqual(xg_in);
		});
	}
});

describe('canonicalize_json', () => {
	test('flat object', () => {
		expect(JSON.stringify(canonicalize_json({
			b: 'B',
			c: 'C',
			a: 'A',
		}))).toEqual(JSON.stringify({
			a: 'A',
			b: 'B',
			c: 'C',
		}));
	});

	test('object w/ depth=1', () => {
		expect(JSON.stringify(canonicalize_json({
			b: {
				y: 1,
				x: 0,
				z: 2,
			},
			c: 'C',
			a: 'A',
		}))).toEqual(JSON.stringify({
			a: 'A',
			b: {
				x: 0,
				y: 1,
				z: 2,
			},
			c: 'C',
		}));
	});

	test('order is preserved in array', () => {
		expect(JSON.stringify(canonicalize_json({
			b: ['Z', 'B', 'X'],
			c: 'C',
			a: 'A',
		}))).toEqual(JSON.stringify({
			a: 'A',
			b: ['Z', 'B', 'X'],
			c: 'C',
		}));
	});

	test('kitchend sink', () => {
		expect(JSON.stringify(canonicalize_json({
			false: false,
			true: true,
			2: 2,
			0: 0,
			1: 1,
			null: null,
			empty: '',
			string: 'string',
			array_0: [],
			array_1: ['array'],
			array_2: ['2', '1'],
			array_nest_strs: ['c', ['b', ['a']]],
			array_nest_obj: [{
				a: {
					z: [],
					b: {
						c: 'd',
					},
				},
			}],
			b: {
				z: [2, 1, {}],
				x: 0,
			},
		}))).toEqual(JSON.stringify({
			0: 0,
			1: 1,
			2: 2,
			array_0: [],
			array_1: ['array'],
			array_2: ['2', '1'],
			array_nest_obj: [{
				a: {
					b: {
						c: 'd',
					},
					z: [],
				},
			}],
			array_nest_strs: ['c', ['b', ['a']]],
			b: {
				x: 0,
				z: [2, 1, {}],
			},
			empty: '',
			false: false,
			null: null,
			string: 'string',
			true: true,
		}));
	});
});

describe('base64', () => {
	for(const [s_variant, f_encoder, f_decoder] of [
		['default', bytes_to_base64, base64_to_bytes],
		['slim', bytes_to_base64_slim, base64_to_bytes_slim],
	] as const) {
		const h_tests = {
			'b': 'Yg==',
			'bl': 'Ymw=',
			'bla': 'Ymxh',
			'blak': 'Ymxhaw==',
			'blake': 'Ymxha2U=',
			'\0': 'AA==',
			'\0\0': 'AAA=',
			'\0\0\0': 'AAAA',
			'\0\0\0\0': 'AAAAAA==',
			'👍✅': '8J+RjeKchQ==',
		};

		for(const [s_input, s_output] of Object.entries(h_tests)) {
			test(`${s_variant}: ${s_input} => ${s_output}`, () => {
				expect(f_encoder(text_to_bytes(s_input))).toBe(cast<NaiveBase64>(s_output));
			});

			test(`${s_variant}: ${s_output} => ${s_input}`, () => {
				expect(bytes_to_text(f_decoder(s_output))).toBe(s_input);
			});
		}
	}
});

describe('noise', async() => {
	const atu8_noise = concat([
		await sha512(text_to_bytes('noise-0')),
		await sha512(text_to_bytes('noise-1')),
		await sha512(text_to_bytes('noise-2')),
		await sha512(text_to_bytes('noise-3')),
	]);

	const a_transcoders = [
		['base64-default', bytes_to_base64, base64_to_bytes],
		['base64-slim', bytes_to_base64_slim, base64_to_bytes_slim],
		['base58', bytes_to_base58, base58_to_bytes],
		['base93', bytes_to_base93, base93_to_bytes],
	] as const;

	for(const [s_variant, f_encoder, f_decoder] of a_transcoders) {
		test(`${s_variant}: @0-${atu8_noise.length}`, () => {
			// test all slices
			for(let i_slice=0; i_slice<atu8_noise.length; i_slice++) {
				const atu8_sample = atu8_noise.subarray(i_slice);

				expect(f_decoder(f_encoder(atu8_sample))).toEqual(atu8_sample);
			}
		});
	}
});
