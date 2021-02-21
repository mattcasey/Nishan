import colors from 'colors';
import { ChildIndexOutofBoundError } from '../../src';

it(`ChildIndexOutofBoundError`, () => {
	expect(new ChildIndexOutofBoundError(3, 2, 'data').message).toBe(
		colors.bold.red(`Parent doesn't contain any children at index 3.\nParent child container data contains 2 items.`)
	);
});