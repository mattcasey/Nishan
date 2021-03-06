import { INotionCacheOptions, NotionCache } from '@nishans/cache';
import { TBlock } from '@nishans/types';

export const NotionGraphqlNotionUserResolvers = {
	last_edited_by: async ({ last_edited_by_id }: TBlock, _: any, ctx: INotionCacheOptions) =>
		await NotionCache.fetchDataOrReturnCached('notion_user', last_edited_by_id, ctx),
	created_by: async ({ created_by_id }: TBlock, _: any, ctx: INotionCacheOptions) =>
		await NotionCache.fetchDataOrReturnCached('notion_user', created_by_id, ctx)
};
