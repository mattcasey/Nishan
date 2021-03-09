import { NotionCacheInitializerTracker } from '../types';

export const cacheInitializerTracker = () => {
	return {
		block: new Map(),
		collection: new Map(),
		collection_view: new Map(),
		notion_user: new Map(),
		space: new Map(),
		user_root: new Map(),
		space_view: new Map(),
		user_settings: new Map()
	} as NotionCacheInitializerTracker;
};