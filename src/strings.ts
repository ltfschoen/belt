import type {A} from 'ts-toolbelt';

/**
 * An integer string
 */
export type IntStr = `${bigint}`;

/**
 * Base58 string
 */
export type NaiveBase58 = A.Type<string, 'base58'>;

/**
 * Base64 string
 */
export type NaiveBase64 = A.Type<string, 'base64'>;

/**
 * Base93 string
 */
export type NaiveBase93 = A.Type<string, 'base93'>;

/**
 * Base222 string
 */
export type NaiveBase222 = A.Type<string, 'base222'>;


/**
 * JSON string
 */
export type NaiveJsonString = A.Type<string, 'json'>;


interface HexMethods {
	toLowerCase(): NaiveHexLower;
	toUpperCase(): NaiveHexUpper;
}

interface HexLowerMethods extends HexMethods {
	concat(...a_lowers: NaiveHexLower[]): NaiveHexLower;
	concat(...a_uppers: (NaiveHexUpper | NaiveHexMixed)[]): NaiveHexMixed;
}

interface HexUpperMethods extends HexMethods {
	concat(...a_uppers: NaiveHexUpper[]): NaiveHexUpper;
	concat(...a_lowers: (NaiveHexLower | NaiveHexMixed)[]): NaiveHexMixed;
}

/**
 * Hexadecimal-encoded bytes in lowercase
 */
export type NaiveHexLower<s_subtype extends string=string> = A.Type<HexLowerMethods & s_subtype, 'hex-lower'>;

/**
 * Hexadecimal-encoded bytes in uppercase
 */
export type NaiveHexUpper<s_subtype extends string=string> = A.Type<HexUpperMethods & s_subtype, 'hex-upper'>;

/**
 * Hexadecimal-encoded bytes in mixed case
 */
export type NaiveHexMixed<s_subtype extends string=string> = A.Type<HexMethods & s_subtype, 'hex-lower' | 'hex-upper'>;
