import { GalleryView } from '../../../src';
import { default_nishan_arg } from '../../utils/defaultNishanArg';

afterEach(() => {
	jest.restoreAllMocks();
});

it(`GalleryView`, () => {
	new GalleryView(default_nishan_arg);
});
