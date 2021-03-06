import { NotionValidators } from '../libs';

it(`schema_unit=title`, () => {
	expect(() =>
		NotionValidators.checkDateSchemaUnit(
			{
				schema_id: 'title',
				type: 'title',
				name: 'Title'
			},
			'value',
			[]
		)
	).toThrow();
});

it(`schema_unit=formula.text`, () => {
	expect(() =>
		NotionValidators.checkDateSchemaUnit(
			{
				schema_id: 'formula.text',
				type: 'formula',
				formula: {
					result_type: 'number'
				},
				name: 'Formula'
			} as any,
			'value',
			[]
		)
	).toThrow();
});

it(`schema_unit=date`, () => {
	expect(() =>
		NotionValidators.checkDateSchemaUnit(
			{
				schema_id: 'date',
				type: 'date',
				name: 'Date'
			},
			'value',
			[]
		)
	).not.toThrow();
});

it(`schema_unit=formula.date`, () => {
	expect(() =>
		NotionValidators.checkDateSchemaUnit(
			{
				schema_id: 'formula.text',
				type: 'formula',
				formula: {
					result_type: 'date'
				},
				name: 'Formula'
			} as any,
			'value',
			[]
		)
	).not.toThrow();
});
