import { IOperation } from '@nishans/types';
import { View } from '../../../src';
import { createDefaultCache } from '../../../utils/createDefaultCache';

it('getCollection', () => {
	const collection_1 = {
			schema: {
				title: {
					type: 'title',
					name: 'Title'
				}
			}
		} as any,
		collection_view_1 = { parent_id: 'block_1', id: 'collection_view_1' } as any,
		cache = {
			...createDefaultCache(),
			block: new Map([ [ 'block_1', { collection_id: 'collection_1', id: 'block_1' } ] ]),
			collection: new Map([ [ 'collection_1', collection_1 as any ] ]),
			collection_view: new Map([ [ 'collection_view_1', collection_view_1 ] ])
		} as any,
		stack: IOperation[] = [];

	const view = new View({
		cache,
		id: 'collection_view_1',
		interval: 0,
		shard_id: 123,
		space_id: 'space_1',
		stack,
		token: 'token',
		user_id: 'user_root_1'
	});

	expect(view.getCollection()).toStrictEqual(collection_1);
});

it('getCachedParentData', () => {
	const collection_view_1 = { parent_id: 'block_1', id: 'collection_view_1' } as any,
		cache = {
			...createDefaultCache(),
			block: new Map([ [ 'block_1', { collection_id: 'collection_1', id: 'block_1' } ] ]),
			collection_view: new Map([ [ 'collection_view_1', collection_view_1 ] ])
		} as any,
		stack: IOperation[] = [];

	const view = new View({
		cache,
		id: 'collection_view_1',
		interval: 0,
		shard_id: 123,
		space_id: 'space_1',
		stack,
		token: 'token',
		user_id: 'user_root_1'
	});

	expect(view.getCachedParentData()).toStrictEqual({ collection_id: 'collection_1', id: 'block_1' });
});