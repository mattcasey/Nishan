import { NotionConstants } from '@nishans/constants';
import { NotionErrors } from '@nishans/errors';
import { TFormulaResultType, TSchemaUnitType } from '@nishans/types';

/**
 * Get the appropriate formula result_type from the passed schema_unit type
 * @param type The schema_unit type
 * @returns The appropriate formula result_type
 */
export function getResultTypeFromSchemaType (type: TSchemaUnitType): TFormulaResultType {
	switch (type) {
		case 'checkbox':
			return 'checkbox';
		case 'created_time':
		case 'last_edited_time':
		case 'date':
			return 'date';
		case 'email':
		case 'file':
		case 'created_by':
		case 'last_edited_by':
		case 'multi_select':
		case 'select':
		case 'phone_number':
		case 'url':
		case 'title':
		case 'text':
			return 'text';
		case 'number':
			return 'number';
		default:
			throw new NotionErrors.unsupported_property_type(type, [], type, NotionConstants.schemaUnitTypes());
	}
}
