import { NotionConstants } from '@nishans/constants';
import { INotionCache, RecordMap, TData, TDataType } from '@nishans/types';

/**
 * Save all the items of a recordMap in internal cache
 * @param recordMap The recordMap to save to cache
 */
export function saveToCache(
  recordMap: Partial<RecordMap>,
  cache: INotionCache,
  cb?: (key: TDataType, data_id: string, data: TData) => any,
  space_id?: string
) {
  // Loop through each of the cache keys
  // Store all the values of that particular key thats present in the recordMap in the cache
  NotionConstants.dataTypes().forEach((key) => {
    if (recordMap[key])
      Object.entries(recordMap[key] as Record<any, any>).forEach(
        ([record_id, record_value]) => {
          const data = record_value.value;
          if(data){
            if (space_id && space_id !== '') data.space_id = space_id;
            cache[key].set(record_id, data);
            cb && cb(key, record_id, data);
          }
        }
      );
  });
}
