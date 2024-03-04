import type {DiscriminatedUnion} from 'src/types';

{
	type sample = {
		foo: 'foo';
	} | {
		bar: 'bar';
	};

	type actual = DiscriminatedUnion<sample>;

	type expect = {
		foo: 'foo';
		bar: undefined;
	} | {
		foo: undefined;
		bar: 'bar';
	};

	const test: expect = {} as actual;
}
