import { TFormula, TFormulaResultType } from "@nishans/types";
import { formulateResultTypeFromSchemaType, formula_rt_map } from "../utils/returnFormulaResultType";
import { FormulaSchemaUnitInput, ISchemaMap, TResultType, TFormulaCreateInput } from "./types";

export function parseFormulaFromObject (formula: FormulaSchemaUnitInput['formula'], schema_map: ISchemaMap): TFormula {
	const res_formula = {
		args: []
	};
	function traverseFormula (parent: any, formula: TResultType | undefined) {
		if ((formula as TFormulaCreateInput).function) {
			const { function: function_name, args } = formula as TFormulaCreateInput,
				result_type = formula_rt_map.get(function_name),
        temp_args = [] as any;
			parent.push({
				name: function_name,
				type: 'function',
				result_type: result_type ?? (formula as any).result_type,
				args: temp_args
      });
      // ? FEAT:1:E unknown function used
			if (Array.isArray(args))
				for (let index = 0; index < args.length; index++) traverseFormula(temp_args, args[index] as any);
			else traverseFormula(temp_args, args);
		} else if (typeof formula === 'number') {
			parent.push({
				type: 'constant',
				value: formula.toString(),
				value_type: 'number',
				result_type: 'number'
			});
		} else if (typeof formula === 'boolean') {
			parent.push({
				type: 'symbol',
				name: formula.toString(),
				result_type: 'checkbox'
			});
		} else if (typeof formula === 'string') {
			parent.push({
				type: 'constant',
				value: formula.toString(),
				value_type: 'string',
				result_type: 'text'
			});
		} else {
			const schema_name = (formula as { property: string }).property,
				result = schema_map.get(schema_name);
			if (result) {
				const { schema_id, type } = result;
				let result_type: TFormulaResultType = '' as any;
				if (result.type === 'formula') result_type = result.formula.result_type;
				else result_type = formulateResultTypeFromSchemaType(type);
				parent.push({
					type: 'property',
					id: schema_id,
					name: result.name,
					result_type
				});
			}
		}
	}

	traverseFormula(res_formula.args, formula);
	return res_formula.args[0];
}