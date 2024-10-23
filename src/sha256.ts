// /* eslint-disable one-var */
// /* eslint-disable prefer-const */
// import {bytes, dataview} from './data';

// export const uint32_ternary = (xw_if: number, xw_then: number, xw_else: number): number => (xw_if & xw_then) ^ (~xw_if & xw_else);

// export const uint32_majority = (xw_a: number, xw_b: number, xw_c: number): number => (xw_a & xw_b) ^ (xw_a & xw_c) ^ (xw_b & xw_c);

// export const uint32_rotr = (xw_value: number, ib_shift: number): number => (xw_value << (32 - ib_shift)) | (xw_value >>> ib_shift);

// const ATU32_SHA256K = /* @__PURE__ */ new Uint32Array([
// 	0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
// 	0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
// 	0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
// 	0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
// 	0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
// 	0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
// 	0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
// 	0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
// ]);

// const atu32_tmp = /* @__PURE__ */ new Uint32Array(64);

// export const sha256_sync = (atu8_data: Uint8Array): Uint8Array => {
// 	let
// 	xw_a = 0x6a09e667,
// 	xw_b = 0xbb67ae85,
// 	xw_c = 0x3c6ef372,
// 	xw_d = 0xa54ff53a,
// 	xw_e = 0x510e527f,
// 	xw_f = 0x9b05688c,
// 	xw_g = 0x1f83d9ab,
// 	xw_h = 0x5be0cd19,
// 	atu8_buffer = bytes(64),
// 	nb_data = atu8_data.length,
// 	dv_buffer = dataview(atu8_buffer.buffer),
// 	ib_r = 0;

// 	const process = (nb_offset: number) => {
// 		for(let iw=0; iw<16; iw++, nb_offset+=4) atu32_tmp[iw] = dv_buffer.getUint32(nb_offset, false);
// 		for(let iw=16; iw<64; iw++) {
// 			const xw_15 = atu32_tmp[iw-15];
// 			const xw_2 = atu32_tmp[iw-2];
// 			const xw_s0 = uint32_rotr(xw_15, 7) ^ uint32_rotr(xw_15, 18) ^ (xw_15 >>> 3);
// 			const xw_s1 = uint32_rotr(xw_2, 17) ^ uint32_rotr(xw_2, 19) ^ (xw_2 >>> 10);
// 			atu32_tmp[iw] = (xw_s1 + atu32_tmp[iw-7] + xw_s0 + atu32_tmp[iw-16]) | 0;
// 		}

// 		let
// 		xw_ta = xw_a,
// 		xw_tb = xw_b,
// 		xw_tc = xw_c,
// 		xw_td = xw_d,
// 		xw_te = xw_e,
// 		xw_tf = xw_f,
// 		xw_tg = xw_g,
// 		xw_th = xw_h;
// 		for(let ib=0; ib<64; ib++) {
// 			const xw_sigma1 = uint32_rotr(xw_te, 6) ^ uint32_rotr(xw_te, 11) ^ uint32_rotr(xw_te, 25);
// 			const xw_t1 = (xw_th + xw_sigma1 + uint32_ternary(xw_te, xw_tf, xw_tg) + ATU32_SHA256K[ib] + atu32_tmp[ib]) | 0;
// 			const xw_sigma0 = uint32_rotr(xw_ta, 2) ^ uint32_rotr(xw_ta, 13) ^ uint32_rotr(xw_ta, 22);
// 			const xw_t2 = (xw_sigma0 + uint32_majority(xw_ta, xw_tb, xw_c)) | 0;
// 			xw_th = xw_tg;
// 			xw_tg = xw_tf;
// 			xw_tf = xw_te;
// 			xw_te = (xw_td + xw_t1) | 0;
// 			xw_td = xw_tc;
// 			xw_tc = xw_tb;
// 			xw_tb = xw_ta;
// 			xw_ta = (xw_t1 + xw_t2) | 0;
// 		}

// 		xw_a += xw_ta | 0;
// 		xw_b += xw_tb | 0;
// 		xw_c += xw_tc | 0;
// 		xw_d += xw_td | 0;
// 		xw_e += xw_te | 0;
// 		xw_f += xw_tf | 0;
// 		xw_g += xw_tg | 0;
// 		xw_h += xw_th | 0;
// 	};

// 	for(let ib_pos=0; ib_pos<nb_data;) {
// 		const nb_rem = Math.min(64 - ib_pos, nb_data - ib_pos);
// 		if(64 === nb_rem) {
// 			for(; nb_data-ib_pos>=64; ib_pos+=64) process(ib_pos);
// 			continue;
// 		}

// 		ib_r += nb_rem;
// 		ib_pos += nb_rem;
// 		if(64 === ib_r) {
// 			process(0);
// 			ib_r = 0;
// 		}
// 	}

// 	atu32_tmp.fill(0);
// 	atu8_buffer[ib_];
// };
