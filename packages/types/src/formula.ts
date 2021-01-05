export type TFormulaName = 'if' | 'equal';
export type TFormulaType = 'operator' | 'property' | 'function' | 'symbol' | 'constant';
export type TFormulaResultType = 'number' | 'checkbox' | 'text' | 'date';
export type TFormulaValueType = 'number' | 'string';
export type TFormulaSymbolName = 'false' | 'true';

export type Tuple2<T extends TResultTypeFormula> = [T, T];
export type Tuple12<T1 extends TResultTypeFormula, T2 extends TResultTypeFormula> = [T1, T2, T2];
export type Tuple3<T extends TResultTypeFormula> = [T, T, T];

// Result types

export type TCheckboxResultTypeFormula =
	| IPropertyFormula<'checkbox'>
	| ISymbolFormula<'false', 'checkbox'>
	| ISymbolFormula<'true', 'checkbox'>
	| TOperatorFormula;

export type TTextResultTypeFormula =
	| IPropertyFormula<'text'>
	| IConstantFormula<'text', 'string'>
	| IConstantFormula<'text', 'number'>;
export type TNumberResultTypeFormula = IPropertyFormula<'number'> | INumberConstantFormula;
export type TDateResultTypeFormula = IPropertyFormula<'date'>;
export type TResultTypeFormula =
	| TCheckboxResultTypeFormula
	| TTextResultTypeFormula
	| TNumberResultTypeFormula
	| TDateResultTypeFormula;

export type Tuple2AnyResultType =
	| Tuple2<TTextResultTypeFormula>
	| Tuple2<TCheckboxResultTypeFormula>
	| Tuple2<TDateResultTypeFormula>
	| Tuple2<TNumberResultTypeFormula>;

export type Tuple3AnyResultType<T extends TResultTypeFormula> =
	| Tuple12<T, TTextResultTypeFormula>
	| Tuple12<T, TCheckboxResultTypeFormula>
	| Tuple12<T, TDateResultTypeFormula>
	| Tuple12<T, TNumberResultTypeFormula>;

// Operators

export type TOperatorName = THybridFunctionName;
export interface IOperatorFormula<RT extends TFormulaResultType, O extends TOperatorName, A extends any> {
	type: 'operator';
	result_type: RT;
	operator: O;
	name: O;
	args: A;
}

export type EqualOperatorFormula = IOperatorFormula<'checkbox', 'equal', Tuple2AnyResultType>;
export type UnequalOperatorFormula = IOperatorFormula<'checkbox', 'unequal', Tuple2AnyResultType>;
export type AndOperatorFormula = IOperatorFormula<'checkbox', 'and', Tuple2<TCheckboxResultTypeFormula>>;
export type OrOperatorFormula = IOperatorFormula<'checkbox', 'or', Tuple2<TCheckboxResultTypeFormula>>;
export type LargerOperatorFormula = IOperatorFormula<'checkbox', 'larger', Tuple2<TCheckboxResultTypeFormula>>;
export type LargerEqOperatorFormula = IOperatorFormula<'checkbox', 'largerEq', Tuple2<TCheckboxResultTypeFormula>>;
export type SmallerOperatorFormula = IOperatorFormula<'checkbox', 'smaller', Tuple2<TCheckboxResultTypeFormula>>;
export type SmallerEqOperatorFormula = IOperatorFormula<'checkbox', 'smallerEq', Tuple2<TCheckboxResultTypeFormula>>;
export type NotOperatorFormula = IOperatorFormula<'checkbox', 'not', [TCheckboxResultTypeFormula]>;

export type SubtractOperatorFormula = IOperatorFormula<'number', 'subtract', Tuple2<TNumberResultTypeFormula>>;
export type DivideOperatorFormula = IOperatorFormula<'number', 'divide', Tuple2<TNumberResultTypeFormula>>;
export type MultipleOperatorFormula = IOperatorFormula<'number', 'multiple', Tuple2<TNumberResultTypeFormula>>;
export type PowOperatorFormula = IOperatorFormula<'number', 'pow', Tuple2<TNumberResultTypeFormula>>;
export type ModOperatorFormula = IOperatorFormula<'number', 'mod', Tuple2<TNumberResultTypeFormula>>;
export type UnaryMinusOperatorFormula = IOperatorFormula<'number', 'unaryMinus', [TNumberResultTypeFormula]>;
export type UnaryPlusOperatorFormula = IOperatorFormula<'number', 'unaryPlus', [TNumberResultTypeFormula]>;

export type AddOperatorFormula = IOperatorFormula<
	'text',
	'add',
	Tuple2<TTextResultTypeFormula> | Tuple2<TNumberResultTypeFormula>
>;
export type IfOperatorFormula = IOperatorFormula<'text', 'if', Tuple3AnyResultType<TCheckboxResultTypeFormula>>;

export type TTextOperatorFormula = AddOperatorFormula | IfOperatorFormula;

export type TCheckboxOperatorFormula =
	| AndOperatorFormula
	| OrOperatorFormula
	| EqualOperatorFormula
	| UnequalOperatorFormula
	| LargerOperatorFormula
	| LargerEqOperatorFormula
	| SmallerOperatorFormula
	| SmallerEqOperatorFormula
	| NotOperatorFormula;

export type TNumberOperatorFormula =
	| SubtractOperatorFormula
	| DivideOperatorFormula
	| MultipleOperatorFormula
	| PowOperatorFormula
	| ModOperatorFormula
	| UnaryMinusOperatorFormula
	| UnaryPlusOperatorFormula;

export type TOperatorFormula = TTextOperatorFormula | TCheckboxOperatorFormula | TNumberOperatorFormula;

// Constants

export interface ISymbolCheckboxFormula {
	name: TFormulaSymbolName;
	result_type: 'checkbox';
	type: 'symbol';
}

export type TSymbolFormulaName = 'e' | 'pi' | 'true' | 'false';
export type TSymbolResultType = 'number' | 'checkbox';
export interface ISymbolFormula<N extends TSymbolFormulaName, RT extends TSymbolResultType> {
	type: 'symbol';
	result_type: RT;
	name: N;
}

export type TSymbolFormula =
	| ISymbolFormula<'e', 'number'>
	| ISymbolFormula<'pi', 'number'>
	| ISymbolFormula<'true', 'checkbox'>
	| ISymbolFormula<'false', 'checkbox'>;

export interface IPropertyFormula<RT extends TFormulaResultType> {
	type: 'property';
	id: string;
	name: string;
	result_type: RT;
}

export type TPropertyFormula =
	| IPropertyFormula<'checkbox'>
	| IPropertyFormula<'text'>
	| IPropertyFormula<'date'>
	| IPropertyFormula<'number'>;

export interface IConstantFormula<RT extends TFormulaResultType, VT extends TFormulaValueType> {
	type: 'constant';
	result_type: RT;
	value_type: VT;
	value: string;
}

export type INumberConstantFormula = IConstantFormula<'number', 'number'>;
export type ITextConstantFormula = IConstantFormula<'text', 'string'>;

export type TConstantFormula = IConstantFormula<'text', 'string'> | IConstantFormula<'text', 'number'>;

// Hybrid Functions

export type THybridFunctionName =
	| 'unaryMinus'
	| 'unaryPlus'
	| 'add'
	| 'subtract'
	| 'multiple'
	| 'divide'
	| 'pow'
	| 'mod'
	| 'and'
	| 'or'
	| 'larger'
	| 'largerEq'
	| 'smaller'
	| 'smallerEq'
	| 'not'
	| 'length'
	| 'format'
	| 'equal'
	| 'unequal'
	| 'if'
	| TFunctionName;

export type EqualFunctionFormula = IFunctionFormula<'checkbox', 'equal', Tuple2AnyResultType>;
export type UnequalFunctionFormula = IFunctionFormula<'checkbox', 'unequal', Tuple2AnyResultType>;

export interface IFunctionFormula<RT extends TFormulaResultType, N extends THybridFunctionName, A extends any> {
	type: 'function';
	result_type: RT;
	name: N;
	args: A;
}

export type AndFunctionFormula = IFunctionFormula<'checkbox', 'and', Tuple2<TCheckboxResultTypeFormula>>;
export type OrFunctionFormula = IFunctionFormula<'checkbox', 'or', Tuple2<TCheckboxResultTypeFormula>>;
export type LargerFunctionFormula = IFunctionFormula<'checkbox', 'larger', Tuple2<TCheckboxResultTypeFormula>>;
export type LargerEqFunctionFormula = IFunctionFormula<'checkbox', 'largerEq', Tuple2<TCheckboxResultTypeFormula>>;
export type SmallerFunctionFormula = IFunctionFormula<'checkbox', 'smaller', Tuple2<TCheckboxResultTypeFormula>>;
export type SmallerEqFunctionFormula = IFunctionFormula<'checkbox', 'smallerEq', Tuple2<TCheckboxResultTypeFormula>>;
export type NotFunctionFormula = IFunctionFormula<'checkbox', 'not', [TCheckboxResultTypeFormula]>;

export type SubtractFunctionFormula = IFunctionFormula<'number', 'subtract', Tuple2<TNumberResultTypeFormula>>;
export type DivideFunctionFormula = IFunctionFormula<'number', 'divide', Tuple2<TNumberResultTypeFormula>>;
export type MultipleFunctionFormula = IFunctionFormula<'number', 'multiple', Tuple2<TNumberResultTypeFormula>>;
export type PowFunctionFormula = IFunctionFormula<'number', 'pow', Tuple2<TNumberResultTypeFormula>>;
export type ModFunctionFormula = IFunctionFormula<'number', 'mod', Tuple2<TNumberResultTypeFormula>>;
export type UnaryMinusFunctionFormula = IFunctionFormula<'number', 'unaryMinus', [TNumberResultTypeFormula]>;
export type UnaryPlusFunctionFormula = IFunctionFormula<'number', 'unaryPlus', [TNumberResultTypeFormula]>;

export type AddFunctionFormula = IFunctionFormula<
	'text',
	'add',
	Tuple2<TTextResultTypeFormula> | Tuple2<TNumberResultTypeFormula>
>;
export type IfFunctionFormula = IFunctionFormula<'text', 'if', Tuple3AnyResultType<TCheckboxResultTypeFormula>>;

export type TTextFunctionFormula = IfFunctionFormula | AddFunctionFormula;

export type TCheckboxFunctionFormula =
	| EqualFunctionFormula
	| UnequalFunctionFormula
	| AndFunctionFormula
	| OrFunctionFormula
	| LargerFunctionFormula
	| LargerEqFunctionFormula
	| SmallerFunctionFormula
	| SmallerEqFunctionFormula
	| NotFunctionFormula;

export type TNumberFunctionFormula =
	| SubtractFunctionFormula
	| DivideFunctionFormula
	| MultipleFunctionFormula
	| PowFunctionFormula
	| ModFunctionFormula
	| UnaryMinusFunctionFormula
	| UnaryPlusFunctionFormula;

export type THybridFunctionFormula = TTextFunctionFormula | TNumberFunctionFormula | TCheckboxFunctionFormula;

// Functions

export type TFunctionName = 'concat' | 'join' | 'slice' | 'toNumber' | 'contains' | 'replace' | 'replaceAll';

export type ConcatFunctionFormula = IFunctionFormula<'text', 'concat', Tuple2<TTextResultTypeFormula>>;
export type JoinFunctionFormula = IFunctionFormula<'text', 'join', Array<IConstantFormula<'text', 'string'>>>;
export type SliceFunctionFormula = IFunctionFormula<
	'text',
	'slice',
	Tuple12<ITextConstantFormula, INumberConstantFormula>
>;
export type LengthFunctionFormula = IFunctionFormula<'number', 'length', [ITextConstantFormula]>;
export type FormatFunctionFormula = IFunctionFormula<'text', 'format', [TResultTypeFormula]>;
export type ToNumberFunctionFormula = IFunctionFormula<'number', 'toNumber', [TResultTypeFormula]>;
export type ContainsFunctionFormula = IFunctionFormula<'checkbox', 'contains', Tuple2<TTextResultTypeFormula>>;
export type ReplaceFunctionFormula = IFunctionFormula<
	'text',
	'replace',
	| Tuple12<TNumberResultTypeFormula, TTextResultTypeFormula>
	| Tuple12<TTextResultTypeFormula, TTextResultTypeFormula>
	| Tuple12<TCheckboxResultTypeFormula, TTextResultTypeFormula>
>;
export type ReplaceAllFunctionFormula = IFunctionFormula<
	'text',
	'replaceAll',
	| Tuple12<TNumberResultTypeFormula, TTextResultTypeFormula>
	| Tuple12<TTextResultTypeFormula, TTextResultTypeFormula>
	| Tuple12<TCheckboxResultTypeFormula, TTextResultTypeFormula>
>;

export type TFunctionFormula =
	| ConcatFunctionFormula
	| JoinFunctionFormula
	| SliceFunctionFormula
	| LengthFunctionFormula
	| FormatFunctionFormula
	| ToNumberFunctionFormula
	| ContainsFunctionFormula
	| ReplaceFunctionFormula
	| ReplaceAllFunctionFormula;

export type TFormula = TFunctionFormula | TOperatorFormula | TPropertyFormula | TSymbolFormula | THybridFunctionFormula;
