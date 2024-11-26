/* eslint-disable prefer-const */
import type {NaiveBase58, NaiveBase64, NaiveBase93, NaiveHexLower} from './strings';
import type {JsonObject, JsonValue, StringKeysOf, NaiveJsonString} from './types';

import crypto from 'crypto';
import {XG_8, is_array, is_dict_es, is_string, entries, from_entries, transform_values, die, try_sync} from './belt.js';

export const SI_HASH_ALGORITHM_SHA256 = 'SHA-256';
export const SI_HASH_ALGORITHM_SHA384 = 'SHA-384';
export const SI_HASH_ALGORITHM_SHA512 = 'SHA-512';

// eslint-disable-next-line @typescript-eslint/naming-convention
const S_UUID_V4 = 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx';
// eslint-disable-next-line @typescript-eslint/naming-convention
const R_UUID_V4 = /[xy]/g;

// @ts-expect-error in case crypto global is not defined
// export const uuid_v4 = globalThis.crypto?.randomUUID? () => crypto.randomUUID(): (): string => {
	export const uuid_v4 = crypto?.randomUUID? () => crypto.randomUUID(): (): string => {
	let xt_now = Date.now();
	if('undefined' !== typeof performance) xt_now += performance.now();
	return S_UUID_V4.replace(R_UUID_V4, (s) => {
		const x_r = (xt_now + (Math.random()*16)) % 16 | 0;
		xt_now = Math.floor(xt_now / 16);
		return ('x' === s? x_r: (x_r & 0x3) | 0x8).toString(16);
	});
};


type Uint8ArrayConstructorParams =
	| []
	| [length: number]
	| [array: ArrayLike<number> | ArrayBufferLike]
	| [buffer: ArrayBufferLike, byteOffset?: number, length?: number];


/**
 * Typed alias to `JSON.stringify`
 */
export const stringify_json: <
	w_string extends string=NaiveJsonString,
>(
	w_json: JsonValue,
	f_replacer?: Parameters<typeof JSON.stringify>[1],
	z_space?: Parameters<typeof JSON.stringify>[2],
) => w_string = JSON.stringify;


/**
 * Strongly typed alias to `JSON.parse`
 */
export const parse_json: <
	w_value extends JsonValue<void|undefined>=JsonValue,
>(
	sx_json: string,
	f_reviver?: Parameters<typeof JSON.parse>[1],
) => w_value = JSON.parse;


/**
 * Attempts to parse the given JSON string, returning `undefined` on parse error instead of throwing
 * @param sx_json 
 * @returns 
 */
export const parse_json_safe = <
	w_out extends JsonValue<void|undefined>=JsonValue,
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
>(sx_json: string): w_out | undefined => try_sync<w_out, SyntaxError>(_ => parse_json<w_out>(sx_json))[0];

/**
 * @deprecated Use {@link parse_json_safe} instead.
 */
export const safe_json = parse_json_safe;


/**
 * Converts a JSON object (in memory) into its canonical form. Must be valid JSON with no cycles
 * and must not contain any non-JSON values. Objects are sorted by keys, arrays are not sorted
 * since order matters.
 * @param w_json JSON-compatible value to canonicalize
 * @returns canonicalized JSON value
 */
export const canonicalize_json = <
	w_json extends JsonValue,
>(w_json: w_json): w_json => {
	// JSON object
	if(is_dict_es(w_json)) {
		// sort all keys
		const h_sorted: JsonObject = from_entries(entries(w_json).sort((a_a, a_b) => a_a[0] < a_b[0]? -1: 1));

		// traverse on children
		for(const si_key in h_sorted) {
			h_sorted[si_key] = canonicalize_json(h_sorted[si_key] as JsonObject);
		}

		w_json = h_sorted as w_json;
	}
	// JSON array
	else if(is_array(w_json)) {
		w_json = w_json.map(w_item => canonicalize_json(w_item)) as w_json;
	}

	// boolean, number, string, or null
	return w_json;
};


/**
 * Helps reduce codesize
 * @param a_args 
 * @returns 
 */
export const bytes = (...a_args: Uint8ArrayConstructorParams): Uint8Array => new Uint8Array(...a_args as [number]);


/**
 * Helps reduce codesize
 * @param a_args 
 * @returns 
 */
export const dataview = (...a_args: [buffer: ArrayBufferLike, byteOffset?: number, byteLength?: number]): DataView => new DataView(...a_args as [ArrayBufferLike]);


/**
 * Performs SHA-256 hash on the given data.
 * @param atu8_data data to hash
 * @returns the hash digest
 */
export const sha256 = async(atu8_data: Uint8Array): Promise<Uint8Array> => bytes(await crypto.subtle.digest(SI_HASH_ALGORITHM_SHA256, atu8_data));


/**
 * Performs SHA-256(SHA-256(data))
 * @param atu8_data data to hash
 * @returns the hash digest
 */
export const sha256d = async(atu8_data: Uint8Array): Promise<Uint8Array> => {
	const atu8_1 = await sha256(atu8_data);
	const atu8_2 = await sha256(atu8_1);
	zero_out(atu8_1);
	return atu8_2;
};


/**
 * Performs SHA-384 hash on the given data.
 * @param atu8_data data to hash
 * @returns the hash digest
 */
export const sha384 = async(atu8_data: Uint8Array): Promise<Uint8Array> => bytes(await crypto.subtle.digest(SI_HASH_ALGORITHM_SHA384, atu8_data));


/**
 * Performs SHA-512 hash on the given data.
 * @param atu8_data data to hash
 * @returns the hash digest
 */
export const sha512 = async(atu8_data: Uint8Array): Promise<Uint8Array> => bytes(await crypto.subtle.digest(SI_HASH_ALGORITHM_SHA512, atu8_data));


/**
 * Imports a {@link CryptoKey} from raw bytes
 * @param atu8_sk - the key's raw bytes
 * @param z_algo - the algorithm argument passed to `SubtleCrypto#importKey()`
 * @param da_usages - key usages argument
 * @returns the imported {@link CryptoKey}
 */
export const import_key = (
	atu8_sk: Uint8Array,
	z_algo: Parameters<SubtleCrypto['importKey']>[2],
	da_usages: Parameters<SubtleCrypto['importKey']>[4],
	b_extractable=false
): Promise<CryptoKey> => crypto.subtle.importKey('raw', atu8_sk, z_algo, b_extractable, da_usages);


/**
 * Performs HMAC signing of the given message, **not the digest**.
 * @param atu8_sk private key
 * @param atu8_message message to sign, **not the digest**.
 * @returns HMAC signature
 */
export const hmac = async(
	atu8_sk: Uint8Array,
	atu8_message: Uint8Array,
	si_algo: 'SHA-256'|'SHA-384'|'SHA-512'=SI_HASH_ALGORITHM_SHA256
): Promise<Uint8Array> => {
	// import signing private key
	const dk_sign = await import_key(atu8_sk, {
		name: 'HMAC',
		hash: {name:si_algo},
	}, ['sign']);

	// construct hmac signature
	return bytes(await crypto.subtle.sign('HMAC', dk_sign, atu8_message));
};


/**
 * Performs HKDF on the given IKM
 * @param atu8_ikm - the input key material bytes
 * @param ni_bits - number of bits to target
 * @param atu8_salt - salt bytes
 * @param atu8_info - optional info bytes
 * @param si_algo - hashing algorithm to use
 */
export const hkdf = async(
	atu8_ikm: Uint8Array,
	ni_bits: number,
	atu8_salt: Uint8Array,
	atu8_info: Uint8Array=bytes(),
	si_algo: 'SHA-256'|'SHA-384'|'SHA-512'=SI_HASH_ALGORITHM_SHA256
): Promise<Uint8Array> => {
	// import deriving key
	const dk_derive = await import_key(atu8_ikm, 'HKDF', ['deriveBits']);

	// derive the bits
	return bytes(await crypto.subtle.deriveBits({
		name: 'HKDF',
		hash: si_algo,
		salt: atu8_salt,
		info: atu8_info,
	}, dk_derive, ni_bits));
};


/**
 * Wipe the contents of a buffer so that sensitive data does not outlive garbage collection.
 */
export const zero_out = (atu8_data: number[] | Uint8Array | Uint16Array): void => {
	// overwrite the contents
	atu8_data.fill(0);

	// make sure the engine does not optimize away the above memory wipe instruction
	// @ts-expect-error signature IS compatible with both types
	if(0 !== atu8_data.reduce((c_sum: number, x_value: number) => c_sum + x_value, 0)) die('Failed to zero out sensitive memory region');
};


export const encode_length_prefix_u16 = (atu8_data: Uint8Array): Uint8Array => {
	// prep buffer to serialize encoded extension
	const atu8_encoded = concat([
		bytes(2),  // 2 bytes for length prefix
		atu8_data,
	]);

	// use big-endian to encode length prefix
	new DataView(atu8_encoded.buffer).setUint16(atu8_encoded.byteOffset, atu8_data.byteLength, false);

	// return encoded buffer
	return atu8_encoded;
};


export const decode_length_prefix_u16 = (atu8_encoded: Uint8Array): [Uint8Array, Uint8Array] => {
	// use big-endian to decode length prefix
	const ib_terminus = new DataView(atu8_encoded.buffer).getUint16(atu8_encoded.byteOffset, false) + 2;

	// return decoded payload buffer and everything after it
	return [atu8_encoded.subarray(2, ib_terminus), atu8_encoded.subarray(ib_terminus)];
};


/**
 * UTF-8 encodes the given text to an Uint8Array.
 * @param s_text text to encode
 * @returns UTF-8 encoded Uint8Array
 */
export const text_to_bytes = (s_text: string): Uint8Array => new TextEncoder().encode(s_text);


/**
 * UTF-8 decodes the given Uint8Array to text.
 * @param atu8_text UTF-8 encoded data to decode
 * @returns text
 */
export const bytes_to_text = (atu8_text: Uint8Array): string => new TextDecoder().decode(atu8_text);


/**
 * Converts the given base64-encoded string to a buffer, then UTF-8 decodes it.
 * @param sx_buffer input base64-encoded string
 * @returns text
 */
export const base64_to_text = (sx_buffer: string): string => bytes_to_text(base64_to_bytes(sx_buffer));


/**
 * UTF-8 encodes the given text, then converts it to a base64-encoded string.
 * @param s_text text to encode
 * @returns output base64-encoded string
 */
export const text_to_base64 = (s_text: string): NaiveBase64 => bytes_to_base64(text_to_bytes(s_text));


/**
 * Attempts to JSON stringify the given primitive/object and subsequently UTF-8 encode it.
 * @param w_json JSON-compatible value to encode
 * @returns UTF-8 encoded Uint8Array
 */
export const json_to_bytes = (w_json: JsonValue): Uint8Array => text_to_bytes(stringify_json(w_json));


/**
 * UTF-8 decodes the given Uint8Array and subsequently attempts to JSON parse it.
 * @param atu8_json UTF-8 encoded JSON string data
 * @returns parsed JSON value
 */
export const bytes_to_json = (atu8_json: Uint8Array): JsonValue => parse_json(bytes_to_text(atu8_json));


/**
 * Encodes the given 32-bit unsigned integer in big-endian format to a new buffer.
 * @param xg_uint 
 * @returns 
 */
export const uint32_to_bytes_be = (xg_uint: number | bigint): Uint8Array => {
	// prep array buffer
	const ab_buffer = new Uint32Array(1).buffer;

	// write to buffer
	new DataView(ab_buffer).setUint32(0, Number(xg_uint), false);

	// wrap as uint8array
	return bytes(ab_buffer);
};


/**
 * Decodes a 32-bit unsigned integer in big-endian format from a buffer (optionally at the given position).
 * @param n_uint 
 * @returns 
 */
export const bytes_to_uint32_be = (atu8_buffer: Uint8Array, ib_offset=0): number => new DataView(atu8_buffer.buffer).getUint32(atu8_buffer.byteOffset + ib_offset, false);


/**
 * Encodes the given unsigned bigint in big-endian format to a new 32-byte buffer, or whatever size is given.
 * @param xg_value - the value to encode 
 * @param nb_size - size of the buffer to create
 * @returns the encoded buffer
 */
export const biguint_to_bytes_be = (xg_value: bigint, nb_size=32): Uint8Array => {
	// prep buffer of the appropriate size
	let atu8_out = bytes(nb_size);

	let ib_write = nb_size;

	while(xg_value > 0n) {
		atu8_out[--ib_write] = Number(xg_value & 0xffn);
		xg_value >>= XG_8;
	}

	return atu8_out;
};

/**
 * @deprecated Use {@link biguint_to_bytes_be} instead.
 */
export const bigint_to_bytes_be = biguint_to_bytes_be;


/**
 * Decodes an unsigned bigint in big-endian format from a buffer
 * @param atu8_bytes 
 * @returns 
 */
export const bytes_to_biguint_be = (atu8_bytes: Uint8Array): bigint => atu8_bytes.reduce((xg_out, xb_value) => (xg_out << XG_8) | BigInt(xb_value), 0n);

/**
 * @deprecated Use {@link bytes_to_biguint_be} instead.
 */
export const bytes_to_bigint_be = bytes_to_biguint_be;


/**
 * Concatenate a sequence of Uint8Arrays.
 * @param a_buffers the data to concatenate in order
 * @returns the concatenated output Uint8Array
 */
export const concat = (a_buffers: Uint8Array[]): Uint8Array => {
	const nb_out = a_buffers.reduce((c_bytes, atu8_each) => c_bytes + atu8_each.byteLength, 0);
	const atu8_out = bytes(nb_out);
	let ib_write = 0;
	for(const atu8_each of a_buffers) {
		atu8_out.set(atu8_each, ib_write);
		ib_write += atu8_each.byteLength;
	}

	return atu8_out;
};


/**
 * Concatenate two Uint8Arrays together.
 * @param atu8_buffer_a left side
 * @param atu8_buffer_b right side
 * @returns the concatenated output Uint8Array
 */
export const concat2 = (atu8_a: Uint8Array, atu8_b: Uint8Array): Uint8Array => {
	const atu8_out = bytes(atu8_a.length + atu8_b.length);
	atu8_out.set(atu8_a);
	atu8_out.set(atu8_b, atu8_a.length);
	return atu8_out;
};



// // cache function reference
// const sfcc = String.fromCharCode;

/**
 * Converts the given buffer to a hex string format in lowercase.
 * @param atu8_buffer input buffer
 * @returns output hex string
 */
export const bytes_to_hex = (atu8_buffer: Uint8Array): NaiveHexLower => atu8_buffer.reduce((s_out, xb_byte) => s_out+xb_byte.toString(16).padStart(2, '0'), '') as NaiveHexLower;


/**
 * Converts the given hex string into a buffer.
 * @param sx_hex input hex string
 * @returns output buffer
 */
export const hex_to_bytes = (sx_hex: string): Uint8Array => bytes(sx_hex.length / 2)
	.map((xb_ignore, i_char) => parseInt(sx_hex.slice(i_char * 2, (i_char * 2) + 2), 16));


/**
 * Converts the given buffer to a base64-encoded string using minimal code but at the expense of performance.
 * @param atu8_buffer input buffer
 * @returns output base64-encoded string
 */
export const bytes_to_base64_slim = (atu8_buffer: Uint8Array): NaiveBase64 => btoa(Array.from(atu8_buffer).map(xb => String.fromCharCode(xb)).join('')) as NaiveBase64;


/**
 * Converts the given base64-encoded string to a buffer using minimal code but at the expense of performance.
 * @param sx_buffer input base64-encoded string
 * @returns output buffer
 */
export const base64_to_bytes_slim = (sx_buffer: string): Uint8Array => bytes(atob(sx_buffer).split('').map(s => s.charCodeAt(0)));


const SX_CHARS_BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// adapted from <https://gist.github.com/jonleighton/958841>
/* eslint-disable no-multi-spaces */
/**
 * Converts the given buffer to a base64-encoded string.
 * @param atu8_buffer input buffer
 * @returns output base64-encoded string
 */
export const bytes_to_base64 = (atu8_buffer: Uint8Array): NaiveBase64 => {
	let s_out = '';
	const nb_buffer = atu8_buffer.byteLength;
	const nb_remainder = nb_buffer % 3;
	const nb_main = nb_buffer - nb_remainder;

	let xb_a = 0;
	let xb_b = 0;
	let xb_c = 0;
	let xb_d = 0;
	let xn_chunk = 0;

	// Main loop deals with bytes in chunks of 3
	for(let ib_offset=0; ib_offset<nb_main; ib_offset+=3) {
		// Combine the three bytes into a single integer
		xn_chunk = (atu8_buffer[ib_offset] << 16) | (atu8_buffer[ib_offset + 1] << 8) | atu8_buffer[ib_offset + 2];

		// Use bitmasks to extract 6-bit segments from the triplet
		xb_a = (xn_chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
		xb_b = (xn_chunk & 258048)   >> 12; // 258048   = (2^6 - 1) << 12
		xb_c = (xn_chunk & 4032)     >>  6; // 4032     = (2^6 - 1) << 6
		xb_d = xn_chunk & 63;               // 63       = 2^6 - 1

		// Convert the raw binary segments to the appropriate ASCII encoding
		s_out += SX_CHARS_BASE64[xb_a] + SX_CHARS_BASE64[xb_b] + SX_CHARS_BASE64[xb_c] + SX_CHARS_BASE64[xb_d];
	}

	// Deal with the remaining bytes and padding
	if(1 === nb_remainder) {
		xn_chunk = atu8_buffer[nb_main];

		xb_a = (xn_chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

		// Set the 4 least significant bits to zero
		xb_b = (xn_chunk & 3) << 4; // 3   = 2^2 - 1

		s_out += SX_CHARS_BASE64[xb_a] + SX_CHARS_BASE64[xb_b] + '==';
	}
	else if(2 === nb_remainder) {
		xn_chunk = (atu8_buffer[nb_main] << 8) | atu8_buffer[nb_main + 1];

		xb_a = (xn_chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
		xb_b = (xn_chunk & 1008)  >> 4;  // 1008  = (2^6 - 1) << 4

		// Set the 2 least significant bits to zero
		xb_c = (xn_chunk & 15) << 2; // 15    = 2^4 - 1

		s_out += SX_CHARS_BASE64[xb_a] + SX_CHARS_BASE64[xb_b] + SX_CHARS_BASE64[xb_c] + '=';
	}

	return s_out as NaiveBase64;
};
/* eslint-enable */


/**
 * Converts the given base64-encoded string to a buffer.
 * @param sb64_data input base64-encoded string
 * @returns output buffer
 */
export const base64_to_bytes = (sb64_data: string): Uint8Array => {
	const nl_padding = sb64_data.match(/=$/g)?.length || 0;
	sb64_data = sb64_data.replace(/=/g, '');

	let xb_work = 0;
	let nb_buffer = 0;

	const a_out: number[] = [];

	for(const s_char of sb64_data) {
		const xb_char = SX_CHARS_BASE64.indexOf(s_char);

		if(-1 === xb_char) die('Invalid base64 string');

		// add 6 bits from index to buffer
		xb_work = (xb_work << 6) | xb_char;
		nb_buffer += 6;

		do {
			if(nb_buffer >= 8) {
				a_out.push(xb_work >>> (nb_buffer - 8));
				nb_buffer -= 8;
			}
		} while(nb_buffer >= 8);
	}

	// Adjust for padding by removing bits added
	nb_buffer -= nl_padding * 2;

	// Convert remaining bits in the buffer to bytes (if any)
	while(nb_buffer >= 8) {
		a_out.push(xb_work >>> (nb_buffer - 8));
		nb_buffer -= 8;
	}

	return bytes(a_out);
};


/**
 * Converts the given UTF-8 friendly compact string to a buffer.
 * @param sx_buffer input string
 * @returns output buffer
 */
export const string8_to_bytes = (sx_buffer: string): Uint8Array => {
	const nl_pairs = sx_buffer.length;
	const atu8_buffer = bytes(nl_pairs);
	for(let i_read=0; i_read<nl_pairs; i_read++) {
		atu8_buffer[i_read] = sx_buffer.charCodeAt(i_read);
	}

	return atu8_buffer;
};


// inspired by <https://github.com/ticlo/jsonesc/blob/master/dist/base93.js>
// eslint-disable-next-line @typescript-eslint/naming-convention
const SX_CHARS_BASE93 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&'()*+,-./:;<=>?@[]^_`{|}~ ";

/**
 * Converts the given buffer to a base93-encoded string.
 * @param atu8_buffer input buffer
 * @returns output base93-encoded string
 */
export const bytes_to_base93 = (atu8_buffer: Uint8Array): NaiveBase93 => {
	let s_out = '';
	const nb_buffer = atu8_buffer.byteLength;

	let xb_encode = 0;
	let ni_shift = 0;

	for(let ib_each=0; ib_each<nb_buffer; ib_each++) {
		const xb_each = atu8_buffer[ib_each];
		xb_encode |= xb_each << ni_shift;
		ni_shift += 8;

		if(ni_shift > 13) {
			let xb_local = xb_encode & 0x1fff;
			if(xb_local > 456) {
				xb_encode >>= 13;
				ni_shift -= 13;
			}
			else {
				xb_local = xb_encode & 0x3fff;
				xb_encode >>= 14;
				ni_shift -= 14;
			}

			s_out += SX_CHARS_BASE93[xb_local % 93]+SX_CHARS_BASE93[(xb_local / 93) | 0];
		}
	}

	if(ni_shift > 0) {
		s_out += SX_CHARS_BASE93[xb_encode % 93];
		if(ni_shift > 7 || xb_encode > 92) {
			s_out += SX_CHARS_BASE93[(xb_encode / 93) | 0];
		}
	}

	return s_out as NaiveBase93;
};


/**
 * Converts the given base93-encoded string to a buffer.
 * @param sb93_data input base93-encoded string
 * @returns output buffer
 */
export const base93_to_bytes = (sb93_data: string): Uint8Array => {
	const a_out: number[] = [];

	let xb_decode = 0;
	let ni_shift = 0;
	let xb_work = -1;

	for(const s_char of sb93_data) {
		const xb_char = SX_CHARS_BASE93.indexOf(s_char);

		if(-1 === xb_char) die('Invalid base93 string');

		if(-1 === xb_work) {
			xb_work = xb_char;
			continue;
		}

		xb_work += xb_char * 93;
		xb_decode |= xb_work << ni_shift;
		ni_shift += (xb_work & 0x1fff) > 456? 13: 14;

		do {
			a_out.push(xb_decode & 0xff);
			xb_decode >>= 8;
			ni_shift -= 8;
		} while(ni_shift > 7);

		xb_work = -1;
	}

	if(-1 !== xb_work) a_out.push(xb_decode | (xb_work << ni_shift));

	return Uint8Array.from(a_out.slice(0, Math.ceil(sb93_data.length * 7 / 8)));
};


// inspired by <https://github.com/pur3miish/base58-js>
// eslint-disable-next-line @typescript-eslint/naming-convention
const SX_CHARS_BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
// eslint-disable-next-line @typescript-eslint/naming-convention
const A_CHARS_BASE58 = /*#__PURE__*/(() => {
	const a_out = Array(256).fill(-1);
	let i_char = 0;
	// eslint-disable-next-line prefer-const
	for(let s_char of SX_CHARS_BASE58) {
		a_out[s_char.charCodeAt(0)] = i_char++;
	}

	return a_out;
})();

export const bytes_to_base58 = (atu8_buffer: Uint8Array): NaiveBase58 => {
	const a_out: number[] = [];

	for(const xb_char of atu8_buffer) {
		let xb_carry = xb_char;
		for(let ib_sweep = 0; ib_sweep<a_out.length; ++ib_sweep) {
			const xb_value = (A_CHARS_BASE58[a_out[ib_sweep]] << 8) + xb_carry;
			a_out[ib_sweep] = SX_CHARS_BASE58.charCodeAt(xb_value % 58);
			xb_carry = (xb_value / 58) | 0;
		}

		while(xb_carry) {
			a_out.push(SX_CHARS_BASE58.charCodeAt(xb_carry % 58));
			xb_carry = (xb_carry / 58) | 0;
		}
	}

	for(const xb_char of atu8_buffer) {
		if(xb_char) {
			break;
		}
		else {
			a_out.push('1'.charCodeAt(0));
		}
	}

	a_out.reverse();

	return String.fromCharCode(...a_out) as NaiveBase58;
};

export const base58_to_bytes = (sb58_buffer: string): Uint8Array => {
	if(!sb58_buffer || !is_string(sb58_buffer)) {
		die(`Expected base58 string but got “${sb58_buffer}”`);
	}

	const m_invalid = sb58_buffer.match(/[IOl0]/gmu);
	if(m_invalid) {
		die(`Invalid base58 character “${String(m_invalid)}”`);
	}

	const m_lz = sb58_buffer.match(/^1+/gmu);
	const nl_psz = m_lz ? m_lz[0].length : 0;
	const nb_out = (((sb58_buffer.length - nl_psz) * (Math.log(58) / Math.log(256))) + 1) >>> 0;

	return bytes([
		...bytes(nl_psz),
		...sb58_buffer
			.match(/.{1}/gmu)!
			.map(sxb58 => SX_CHARS_BASE58.indexOf(sxb58))
			.reduce((atu8_out, ib_pos) => atu8_out.map((xb_char) => {
				const xb_tmp = (xb_char * 58) + ib_pos;
				ib_pos = xb_tmp >> 8;
				return xb_tmp;
			}), bytes(nb_out))
			.reverse()
			.filter((b_last => xb_each => (b_last = b_last || !!xb_each))(false)),
	]);
};

/**
 * Cryptographically strong random number in the range [0, 1)
 */
export const crypto_random = (): number => crypto.getRandomValues(bytes(1))[0] / (2 ** 32);

/**
 * Generate a cryptographically strong random int within a given range
 */
export const crypto_random_int = (x_a: number, x_b = 0): number => {
	const x_min = Math.floor(Math.min(x_a, x_b));
	const x_max = Math.ceil(Math.max(x_a, x_b));

	// confine to range
	return Math.floor(crypto_random() * (x_max - x_min)) + x_min;
};

