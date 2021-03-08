import { NotionCache } from '@nishans/cache';
import { NotionGraphqlCommonBlockResolvers } from '../../../libs/Resolvers/utils/commonBlockResolvers';

it(`parent`, async () => {
	const block_1: any = { parent_id: 'block_2', parent_table: 'block' },
		block_2: any = { id: 'block_2' },
		cache: any = {
			...NotionCache.createDefaultCache(),
			block: new Map([ [ 'block_2', block_2 ] ])
		};

	const data = await NotionGraphqlCommonBlockResolvers.parent(
		block_1,
		{},
		{
			cache,
			token: 'token',
			user_id: 'notion_user_1',
			interval: 0
		}
	);
	expect(data).toStrictEqual(block_2);
});

it(`space`, async () => {
	const block_1: any = { space_id: 'space_1' },
		space_1: any = { id: 'space_1' },
		cache: any = {
			...NotionCache.createDefaultCache(),
			space: new Map([ [ 'space_1', space_1 ] ])
		};

	const data = await NotionGraphqlCommonBlockResolvers.space(
		block_1,
		{},
		{
			cache,
			token: 'token',
			user_id: 'notion_user_1',
			interval: 0
		}
	);
	expect(data).toStrictEqual(space_1);
});
