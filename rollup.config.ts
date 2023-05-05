import typescript from '@rollup/plugin-typescript';
import {defineConfig} from 'rollup';

export default defineConfig({
	input: [
		'src/main.ts',
	],
	output: {
		dir: 'dist',
		format: 'esm',
		entryFileNames: '[name].mjs',
	},
	plugins: [
		typescript({
			sourceMap: false,
			include: 'src/**.ts',
			compilerOptions: {
				allowImportingTsExtensions: false,
			},
		}),
	],
});
