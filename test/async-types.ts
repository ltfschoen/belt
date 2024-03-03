
import {
	defer,
} from 'src/async';

{
	const [dp_void, fk_void] = defer<void>();

	const [dp_undef, fk_undef] = defer<undefined>();

	const [dp_string, fk_string] = defer<string>();
}

