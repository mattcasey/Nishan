import { SyncRecordValuesTuple } from '@nishans/endpoints';
import { INotionCache } from '@nishans/types';

/**
 * Returns the id and data_type tuple passed that is not present in the cache
 * @param update_cache_param Array of tuple of id and data_type to look for in the cache
 * @returns
 */
export function returnNonCachedData(
  update_cache_param: SyncRecordValuesTuple,
  cache: INotionCache
): SyncRecordValuesTuple {
  return update_cache_param.filter(
    (info) => !Boolean(cache[info[1]].get(info[0]))
  );
}
