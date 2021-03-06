import { NotionIdz } from '@nishans/idz';
import { NotionLogger } from '@nishans/logger';
import { NotionOperations } from '@nishans/operations';
import { ICollection, TSchemaUnit } from '@nishans/types';
import { INotionCoreOptions } from '../';
import NotionData from './Data';

/**
 * A class to represent a column schema of a collection
 * @noInheritDoc
 */

export default class SchemaUnit<T extends TSchemaUnit> extends NotionData<ICollection, Record<string, any>> {
	schema_id: string;

	constructor (arg: INotionCoreOptions & { schema_id: string }) {
		super({ ...arg, type: 'collection' });
		this.schema_id = arg.schema_id;
	}

	async update (arg: T) {
		const data = this.getCachedData();
		data.schema[this.schema_id] = { ...data.schema[this.schema_id], ...arg };
		await NotionOperations.executeOperations(
			[ NotionOperations.Chunk.collection.update(this.id, [], { schema: JSON.parse(JSON.stringify(data.schema)) }) ],
			this.getProps()
		);
		this.logger && NotionLogger.method.info(`UPDATE collection ${this.id}`);
	}

	async delete () {
		const data = this.getCachedData();
		const schema_unit = data.schema[this.schema_id];
		if (schema_unit.type !== 'title') {
			delete data.schema[this.schema_id];
			await NotionOperations.executeOperations(
				[ NotionOperations.Chunk.collection.update(this.id, [], { schema: JSON.parse(JSON.stringify(data.schema)) }) ],
				this.getProps()
			);
			this.logger && NotionLogger.method.info(`DELETE collection ${this.id}`);
			return new SchemaUnit({ schema_id: this.schema_id, id: this.id, ...this.getProps() });
		} else NotionLogger.error(`Title schema unit cannot be deleted`);
	}

	async duplicate () {
		const data = this.getCachedData(),
			id = NotionIdz.Generate.shortId();
		const schema_unit = data.schema[this.schema_id];
		if (schema_unit.type !== 'title') {
			data.schema[id] = data.schema[this.schema_id];
			await NotionOperations.executeOperations(
				[ NotionOperations.Chunk.collection.update(this.id, [], { schema: JSON.parse(JSON.stringify(data.schema)) }) ],
				this.getProps()
			);
			this.logger && NotionLogger.method.info(`UPDATE collection ${this.id}`);
		} else NotionLogger.error(`Title schema unit cannot be duplicated`);
		return new SchemaUnit({ schema_id: id, id: this.id, ...this.getProps() });
	}

	getCachedChildData () {
		return this.getCachedData().schema[this.schema_id];
	}
}
