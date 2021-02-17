import { GalleryView } from '../../../src';
import { createDefaultCache } from '../../../utils/createDefaultCache';

it(`GalleryView`, () => {
	new GalleryView({
		cache: createDefaultCache(),
		id: 'collection_view_1',
		interval: 0,
		shard_id: 123,
		space_id: 'space_1',
		stack: [],
		token: 'token',
		user_id: 'user_1'
	});
});