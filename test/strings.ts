import {describe, test, expect} from 'bun:test';

import {
	proper,
	snake,
	pascal,
} from '../dist/mjs/strings';

describe('proper', () => {
	test('undefined', () => {
		expect(proper((void 0)!)).toBe(void 0);
	});

	test('empty', () => {
		expect(proper('')).toBe('');
	});

	test('" " => " "', () => {
		expect(proper(' ')).toBe(' ');
	});

	test('"  " => " "', () => {
		expect(proper('  ')).toBe(' ');
	});

	test('"_" => " "', () => {
		expect(proper('_')).toBe(' ');
	});

	test('"_ " => " "', () => {
		expect(proper('_ ')).toBe(' ');
	});

	test('" _" => " "', () => {
		expect(proper(' _')).toBe(' ');
	});

	test('"a" => "A"', () => {
		expect(proper('a')).toBe('A');
	});

	test('" a" => " A"', () => {
		expect(proper(' a')).toBe(' A');
	});

	test('"_a" => " A"', () => {
		expect(proper('_a')).toBe(' A');
	});

	test('"ab" => "Ab"', () => {
		expect(proper('ab')).toBe('Ab');
	});

	test('"a b" => "A B"', () => {
		expect(proper('a b')).toBe('A B');
	});

	test('"a_b" => "A B"', () => {
		expect(proper('a_b')).toBe('A B');
	});

	test('"abc" => "Abc"', () => {
		expect(proper('abc')).toBe('Abc');
	});

	test('"a bc" => "A Bc"', () => {
		expect(proper('a bc')).toBe('A Bc');
	});

	test('"a_bc" => "Ab C"', () => {
		expect(proper('a_bc')).toBe('A Bc');
	});

	test('"ab c" => "A Bc"', () => {
		expect(proper('ab c')).toBe('Ab C');
	});

	test('"ab_c" => "Ab C"', () => {
		expect(proper('ab_c')).toBe('Ab C');
	});
});

describe('snake', () => {
	test('undefined', () => {
		expect(snake((void 0)!)).toBe(void 0);
	});

	test('empty', () => {
		expect(snake('')).toBe('');
	});

	test('" " => "_"', () => {
		expect(snake(' ')).toBe('_');
	});

	test('"  " => "_"', () => {
		expect(snake('  ')).toBe('_');
	});

	test('"_" => "_"', () => {
		expect(snake('_')).toBe('_');
	});

	test('"_ " => "_"', () => {
		expect(snake('_ ')).toBe('_');
	});

	test('" _" => "_"', () => {
		expect(snake(' _')).toBe('_');
	});

	test('"A" => "a"', () => {
		expect(snake('A')).toBe('a');
	});

	test('" A" => "a"', () => {
		expect(snake(' A')).toBe('_a');
	});

	test('"_A" => "_a"', () => {
		expect(snake('_A')).toBe('_a');
	});

	test('"AB" => "ab"', () => {
		expect(snake('AB')).toBe('ab');
	});

	test('"Ab" => "ab"', () => {
		expect(snake('Ab')).toBe('ab');
	});

	test('"aB" => "a_b"', () => {
		expect(snake('aB')).toBe('a_b');
	});

	test('"A B" => "a_b"', () => {
		expect(snake('A B')).toBe('a_b');
	});

	test('"A_B" => "A_B"', () => {
		expect(snake('A_B')).toBe('a_b');
	});

	test('"ABC" => "abc"', () => {
		expect(snake('ABC')).toBe('abc');
	});

	test('"ABc" => "a_bc"', () => {
		expect(snake('ABc')).toBe('a_bc');
	});

	test('"AbC" => "ab_c"', () => {
		expect(snake('AbC')).toBe('ab_c');
	});

	test('"aBC" => "a_bc"', () => {
		expect(snake('aBC')).toBe('a_b_c');
	});

	test('"Ab C" => "ab_c"', () => {
		expect(snake('Ab C')).toBe('ab_c');
	});

	test('"A Bc" => "a_bc"', () => {
		expect(snake('A Bc')).toBe('a_bc');
	});

	test('"Abc" => "abc"', () => {
		expect(snake('Abc')).toBe('abc');
	});

	test('"abC" => "ab_c"', () => {
		expect(snake('abC')).toBe('ab_c');
	});

	test('"aBc" => "a_bc"', () => {
		expect(snake('aBc')).toBe('a_bc');
	});
});


describe('pascal', () => {
	test('undefined', () => {
		expect(pascal((void 0)!)).toBe(void 0);
	});

	test('empty', () => {
		expect(pascal('')).toBe('');
	});

	test('" " => ""', () => {
		expect(pascal(' ')).toBe('');
	});

	test('"  " => ""', () => {
		expect(pascal('  ')).toBe('');
	});

	test('"_" => "_"', () => {
		expect(pascal('_')).toBe('_');
	});

	test('"_ " => "_"', () => {
		expect(pascal('_ ')).toBe('_');
	});

	test('" _" => "_"', () => {
		expect(pascal(' _')).toBe('_');
	});

	test('"A" => "A"', () => {
		expect(pascal('A')).toBe('A');
	});

	test('"a" => "A"', () => {
		expect(pascal('a')).toBe('A');
	});

	test('" a" => "A"', () => {
		expect(pascal(' a')).toBe('A');
	});

	test('"_a" => "_a"', () => {
		expect(pascal('_a')).toBe('_a');
	});

	test('"a " => "A"', () => {
		expect(pascal('a ')).toBe('A');
	});

	test('"a_" => "a"', () => {
		expect(pascal('a_')).toBe('A');
	});

	test('"AB" => "Ab"', () => {
		expect(pascal('AB')).toBe('Ab');
	});

	test('"Ab" => "Ab"', () => {
		expect(pascal('Ab')).toBe('Ab');
	});

	test('"aB" => "AB"', () => {
		expect(pascal('aB')).toBe('AB');
	});

	test('"ab" => "Ab"', () => {
		expect(pascal('ab')).toBe('Ab');
	});

	test('"A B" => "AB"', () => {
		expect(pascal('A B')).toBe('AB');
	});

	test('"A_B" => "AB"', () => {
		expect(pascal('A_B')).toBe('AB');
	});

	test('"ABC" => "Abc"', () => {
		expect(pascal('ABC')).toBe('Abc');
	});

	test('"ABc" => "ABc"', () => {
		expect(pascal('ABc')).toBe('ABc');
	});

	test('"AbC" => "AbC"', () => {
		expect(pascal('AbC')).toBe('AbC');
	});

	test('"aBC" => "ABC"', () => {
		expect(pascal('aBC')).toBe('ABC');
	});

	test('"aBCd" => "ABCd"', () => {
		expect(pascal('aBCd')).toBe('ABCd');
	});

	test('"ab c" => "AbC"', () => {
		expect(pascal('ab c')).toBe('AbC');
	});

	test('"a bc" => "ABc"', () => {
		expect(pascal('a bc')).toBe('ABc');
	});

	test('"ab_c" => "AbC"', () => {
		expect(pascal('ab_c')).toBe('AbC');
	});

	test('"a_bc" => "ABc"', () => {
		expect(pascal('a_bc')).toBe('ABc');
	});

	test('"abC" => "AbC"', () => {
		expect(pascal('abC')).toBe('AbC');
	});

	test('"aBc" => "ABc"', () => {
		expect(pascal('aBc')).toBe('ABc');
	});

	test('"Abc" => "Abc"', () => {
		expect(pascal('Abc')).toBe('Abc');
	});
});
