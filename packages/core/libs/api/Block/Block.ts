import { NotionCache } from '@nishans/cache';
import { NotionDiscourse } from '@nishans/discourse';
import { NotionEndpoints } from '@nishans/endpoints';
import { TBlockInput } from '@nishans/fabricator';
import { NotionIdz } from '@nishans/idz';
import { INotionRepositionParams, NotionLineage } from '@nishans/lineage';
import { NotionLogger } from '@nishans/logger';
import { NotionOperations } from '@nishans/operations';
import { FilterType, FilterTypes, UpdateType, UpdateTypes } from '@nishans/traverser';
import { IDiscussion, IPage, ISpace, TBasicBlockType, TBlock, TData, TTextFormat } from '@nishans/types';
import { NotionUtils } from '@nishans/utils';
import { CreateMaps, Discussion, INotionCoreOptions, PopulateMap } from '../../';
import { transformToMultiple } from '../../utils';
import Data from '../Data';

/**
 * A class to represent block of Notion
 * @noInheritDoc
 */
class Block<T extends TBlock, A extends TBlockInput> extends Data<T> {
	constructor (arg: INotionCoreOptions) {
		super({ ...arg, type: 'block' });
	}

	async getCachedParentData () {
		const data = this.getCachedData();
		return (await NotionCache.fetchDataOrReturnCached(data.parent_table, data.parent_id, this.getProps())) as TData;
	}

	async reposition (arg?: INotionRepositionParams) {
		const data = this.getCachedData();
		if (data.parent_table === 'space')
			await NotionOperations.executeOperations(
				[
					NotionLineage.positionChildren<ISpace>('pages', {
						logger: this.logger,
						child_id: this.id,
						position: arg,
						parent: await this.getCachedParentData(),
						parent_type: 'block'
					})
				],
				this.getProps()
			);
		else if (data.parent_table === 'block')
			await NotionOperations.executeOperations(
				[
					NotionLineage.positionChildren<IPage>('content', {
						logger: this.logger,
						child_id: this.id,
						position: arg,
						parent: await this.getCachedParentData(),
						parent_type: 'block'
					})
				],
				this.getProps()
			);
	}

	/**
   * Duplicate the current block
   * @param infos Array of objects containing information regarding the position and id of the duplicated block
   * @returns A block map
   */
	async duplicate (infos: number | string[]) {
		const block_map = CreateMaps.block(),
			block = this.getCachedData();
		const ids: string[] =
			typeof infos === 'number'
				? Array(infos).fill(NotionIdz.Generate.id())
				: infos.map((info) => NotionIdz.Generate.id(info));

		for (let index = 0; index < ids.length; index++) {
			const block_id = ids[index];
			if (block.type === 'collection_view' || block.type === 'collection_view_page') {
				await NotionOperations.executeOperations(
					[
						NotionOperations.Chunk.block.update(block_id, [], {
							id: block_id,
							type: 'copy_indicator',
							parent_id: block.parent_id,
							parent_table: 'block',
							alive: true
						})
					],
					this.getProps()
				);

				// ! How to save to local cache, need to poll the notion's server to see if the duplicated block has been created
				await NotionEndpoints.Mutations.enqueueTask(
					{
						task: {
							eventName: 'duplicateBlock',
							request: {
								sourceBlockId: block.id,
								targetBlockId: block_id,
								addCopyName: true
							}
						}
					},
					this.getProps()
				);
			} else {
				const duplicated_block = {
					...block,
					id: block_id,
					copied_from: block.id
				};
				await NotionOperations.executeOperations(
					[ NotionOperations.Chunk.block.update(block_id, [], JSON.parse(JSON.stringify(duplicated_block))) ],
					this.getProps()
				);
				this.cache.block.set(block_id, JSON.parse(JSON.stringify(duplicated_block)));
			}
			this.logger && NotionLogger.method.info(`CREATE block ${block_id}`);
			await PopulateMap.block(block, block_map, this.getProps());
		}
		return block_map;
	}

	/**
   * Update a block's properties and format
   * @param args Block update format and properties options
   */
	async update (args: Partial<A>) {
		const data = this.getCachedData() as any;
		this.logger && NotionLogger.method.info(`UPDATE block ${data.id}`);
		NotionUtils.deepMerge(data, args);
		await NotionOperations.executeOperations(
			[
				NotionOperations.Chunk.block.update(this.id, [], {
					properties: data.properties,
					format: data.format,
					...this.updateLastEditedProps()
				})
			],
			this.getProps()
		);
	}

	/**
   * Convert the current block to a different basic block
   * @param type `TBasicBlockType` basic block types
   */
	async convertTo (type: TBasicBlockType) {
		const data = this.getCachedData() as any;
		data.type = type;
		this.logger && NotionLogger.method.info(`UPDATE block ${data.id}`);
		await NotionOperations.executeOperations(
			[
				NotionOperations.Chunk.block.update(this.id, [ 'type' ], type),
				NotionOperations.Chunk.block.update(this.id, [], this.updateLastEditedProps())
			],
			this.getProps()
		);
	}

	/**
   * Delete the current block
   */
	async delete () {
		const data = this.getCachedData(),
			parent_data = await this.getCachedParentData();

		if (data.parent_table === 'space')
			await NotionLineage.updateChildContainer<ISpace>(
				data.parent_table,
				data.parent_id,
				false,
				this.id,
				'pages',
				this.getProps()
			);
		else if (data.parent_table === 'block')
			await NotionLineage.updateChildContainer<IPage>(
				data.parent_table,
				data.parent_id,
				false,
				this.id,
				'content',
				this.getProps()
			);

		data.alive = false;
		this.logger && NotionLogger.method.info(`DELETE block ${data.id}`);
		this.logger && NotionLogger.method.info(`UPDATE ${data.parent_table} ${parent_data.id}`);

		await NotionOperations.executeOperations(
			[
				NotionOperations.Chunk.block.update(this.id, [], {
					alive: false,
					...this.updateLastEditedProps(data)
				}),
				NotionOperations.Chunk[data.parent_table].update(data.parent_id, [], this.updateLastEditedProps())
			],
			this.getProps()
		);
	}

	/**
   * Transfer a block from one parent page to another page
   * @param new_parent_id Id of the new parent page
   */
	async transfer (new_parent_id: string) {
		await NotionCache.fetchDataOrReturnCached('block', new_parent_id, this.getProps());

		const data = this.getCachedData(),
			parent_data = (await NotionCache.fetchDataOrReturnCached('block', data.parent_id, this.getProps())) as IPage,
			new_parent_data = this.cache.block.get(new_parent_id) as IPage;

		data.parent_id = new_parent_id;
		parent_data.content = parent_data.content.filter((id) => id !== data.id);
		new_parent_data.content.push(data.id);

		this.logger && NotionLogger.method.info(`UPDATE block ${data.id}`);
		this.logger && NotionLogger.method.info(`UPDATE block ${parent_data.id}`);
		this.logger && NotionLogger.method.info(`UPDATE block ${new_parent_data.id}`);

		await NotionOperations.executeOperations(
			[
				NotionOperations.Chunk.block.update(this.id, [], {
					...this.getLastEditedProps(),
					parent_id: new_parent_id,
					parent_table: 'block',
					alive: true
				}),
				NotionOperations.Chunk.block.listRemove(parent_data.id, [ 'content' ], { id: data.id }),
				NotionOperations.Chunk.block.listAfter(new_parent_id, [ 'content' ], { after: '', id: data.id }),
				NotionOperations.Chunk.block.update(parent_data.id, [], this.updateLastEditedProps(parent_data)),
				NotionOperations.Chunk.block.update(new_parent_id, [], this.updateLastEditedProps(new_parent_data))
			],
			this.getProps()
		);
	}

	async createDiscussions (
		args: {
			context?: TTextFormat;
			discussion_id?: string;
			comments: { text: TTextFormat; id?: string }[];
		}[]
	) {
		return (await NotionDiscourse.Discussions.create(
			args.map((arg) => ({ ...arg, block_id: this.id })),
			this.getProps()
		)).map((discussion) => new Discussion({ id: discussion.id, ...this.getProps() }));
	}

	async updateDiscussion (arg: UpdateType<IDiscussion, { context?: TTextFormat; resolved?: boolean }>) {
		return (await this.updateDiscussions(transformToMultiple(arg), false))[0];
	}

	async updateDiscussions (
		args: UpdateTypes<IDiscussion, { context?: TTextFormat; resolved?: boolean }>,
		multiple?: boolean
	) {
		return await this.updateIterate<IDiscussion, { context?: TTextFormat; resolved?: boolean }, Discussion[]>(
			args,
			{
				multiple,
				child_ids: 'discussions' as any,
				child_type: 'discussion',
				container: []
			},
			(child_id) => this.cache.discussion.get(child_id),
			async (id, _, __, discussions) => {
				discussions.push(
					new Discussion({
						id,
						...this.getProps()
					})
				);
			}
		);
	}

	async deleteDiscussion (arg: FilterType<IDiscussion>) {
		return (await this.deleteDiscussions(transformToMultiple(arg), false))[0];
	}

	async deleteDiscussions (args: FilterTypes<IDiscussion>, multiple?: boolean) {
		return await this.deleteIterate<IDiscussion, Discussion[]>(
			args,
			{
				child_path: 'discussions' as any,
				multiple,
				child_ids: 'discussions' as any,
				child_type: 'discussion',
				container: []
			},
			(child_id) => this.cache.discussion.get(child_id)
		);
	}

	async getDiscussion (arg?: FilterType<IDiscussion>) {
		return (await this.getDiscussions(transformToMultiple(arg), false))[0];
	}

	async getDiscussions (args?: FilterTypes<IDiscussion>, multiple?: boolean) {
		return await this.getIterate<IDiscussion, Discussion[]>(
			args,
			{ container: [], multiple, child_ids: 'discussions' as any, child_type: 'discussion' },
			(discussion_id) => this.cache.discussion.get(discussion_id),
			async (id, __, container) => container.push(new Discussion({ ...this.getProps(), id }))
		);
	}
}

export default Block;
