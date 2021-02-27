import { NotionCacheClass } from '@nishans/cache';
import { warn } from '@nishans/errors';
import { Logger, RepositionParams } from '@nishans/fabricator';
import { NotionOperationsClass, Operation } from '@nishans/operations';
import { TData, TDataType } from '@nishans/types';
import { ChildTraverser, FilterTypes, IterateAndDeleteOptions, IterateAndGetOptions, IterateAndUpdateOptions, NishanArg, positionChildren, UpdateTypes } from '../';
import { constructLogger } from '../utils';

/**
 * A class to update and control data specific stuffs
 * @noInheritDoc
 */

export default class NotionData<T extends TData> extends NotionCacheClass {
  id: string;
  type: TDataType;
  #init_cache = false;
  protected logger: Logger;
  user_id: string;
  Operations: NotionOperationsClass;

  constructor(arg: NishanArg & { type: TDataType }) {
    super(arg);
    this.type = arg.type;
    this.id = arg.id;
    this.#init_cache = false;
    this.logger = constructLogger(arg.logger);
    this.user_id = arg.user_id;
    this.Operations = new NotionOperationsClass(arg)
  }

  protected getLastEditedProps() {
    return { last_edited_time: Date.now(), last_edited_by_table: "notion_user", last_edited_by_id: this.user_id }
  }

  protected updateLastEditedProps(data?:TData){
    const target = data ?? this.getCachedData() as any;
    target.last_edited_time = Date.now();
    target.last_edited_by_table = "notion_user";
    target.last_edited_by_id = this.user_id;
  }

  /**
   * Get the cached data using the current data id
   */
  getCachedData() {
    const data = this.cache[this.type].get(this.id);
    if (!data)
      warn(`${this.type}:${this.id} doesnot exist in the cache`);
    else if((data as any).alive === false)
      warn(`${this.type}:${this.id} is not alive`);
    return data as T;
  }

  async updateCachedData(){
    await this.updateCacheManually([[this.id, this.type]])
  }

  /**
   * Delete the cached data using the id
   */
  protected deleteCachedData() {
    this.cache[this.type].delete(this.id);
  }

  protected addToChildArray(parent_type: TDataType, parent: TData, position: RepositionParams) {
    this.Operations.pushToStack(positionChildren({ logger: this.logger, child_id: this.id, position, parent, parent_type }))
  }

  updateCacheLocally(arg: Partial<T>, keys: ReadonlyArray<(keyof T)>) {
    const parent_data = this.getCachedData(), data = arg;

    Object.entries(arg).forEach(([key, value])=>{
      if(keys.includes(key as keyof T))
        parent_data[key as keyof T] = value;
      else
        delete (data as any)[key]
    })

    this.logger && this.logger("UPDATE", this.type as any, this.id)
    this.Operations.pushToStack(
      Operation[this.type].update(this.id, [], data)
    );
  }

  async initializeCacheForThisData() {
    if (!this.#init_cache && this.type !== "notion_user") {
      await this.initializeCacheForSpecificData(this.id, this.type)
      this.#init_cache = true;
    }
  }

  protected async deleteIterate<TD, C = any[]>(args: FilterTypes<TD>, options: IterateAndDeleteOptions<T, C>, transform: ((id: string) => TD | undefined | Promise<TD | undefined>), cb?: (id: string, data: TD) => void | Promise<any>) {
    if(options?.initialize_cache ?? true) await this.initializeCacheForThisData()
    return await ChildTraverser.delete<T, TD, C>(args, transform, {
      parent_id: this.id,
      parent_type: this.type,
      ...this.getProps(),
      ...options
    }, cb);
  }

  protected async updateIterate<TD, RD, C = any[]>(args: UpdateTypes<TD, RD>, options: IterateAndUpdateOptions<T, C>, transform: ((id: string) => TD | undefined | Promise<TD | undefined>), cb?: (id: string, data: TD, updated_data: RD, container: C) => any) {
    if(options?.initialize_cache ?? true) await this.initializeCacheForThisData();
    return await ChildTraverser.update<T, TD, RD, C>(args, transform, {
      parent_type: this.type,
      parent_id: this.id,
      ...this.getProps(),
      ...options
    }, cb);
  }

  protected async getIterate<RD, C>(args: FilterTypes<RD>, options: IterateAndGetOptions<T, C>, transform: ((id: string) => RD | undefined | Promise<RD | undefined>), cb?: (id: string, data: RD, container: C) => any) {
    if(options?.initialize_cache ?? true) await this.initializeCacheForThisData();
    return await ChildTraverser.get<T, RD, C>(args, transform, {
      parent_id: this.id,
      parent_type: this.type,
      ...this.getProps(),
      ...options,
    }, cb);
  }

  getProps() {
    return {
      token: this.token,
      interval: this.interval,
      user_id: this.user_id,
      shard_id: this.Operations.shard_id,
      space_id: this.Operations.space_id,
      cache: this.cache,
      logger: this.logger,
      stack: this.Operations.stack,
      notion_operation_plugins: this.Operations.getPlugins()
    } as Omit<NishanArg, "id">
  }
}