//#region src/index.d.ts
type ValueStringUnion = "boolean" | "number" | "string";
type ColumnInput<Name$1 extends string, ValueString extends ValueStringUnion, Nullable extends boolean> = {
  name: Name$1;
  type: ValueString;
  nullable: Nullable;
};
type ColumnOutput<Name$1 extends string, ValueString extends ValueStringUnion, Nullable extends boolean> = ColumnInput<Name$1, ValueString, Nullable>;
type ColumnOutputUnion = ColumnOutput<string, ValueStringUnion, boolean>;
type ColumnName<C$1> = C$1 extends ColumnOutput<infer Name, any, any> ? Name : never;
type TransformColumns<ColumnOutputs> = ColumnOutputs extends readonly ColumnOutputUnion[] ? { [C in ColumnOutputs[number] as ColumnName<C>]: C } : never;
declare function Column<Name$1 extends string, ValueString extends ValueStringUnion, Nullable extends boolean>(input: ColumnInput<Name$1, ValueString, Nullable>): ColumnOutput<Name$1, ValueString, Nullable>;
type TableInput<Name$1 extends string, ColumnOutputs> = {
  name: Name$1;
  columns: ColumnOutputs;
};
type TableOutput<Name$1 extends string, ColumnOutputs, TransformColumnsOutput extends TransformColumns<ColumnOutputs>> = {
  name: Name$1;
  columns: TransformColumnsOutput;
};
type TableOutputUnion = TableOutput<string, any, any>;
type TableName<T$1> = T$1 extends TableOutput<infer Name, any, any> ? Name : never;
type TransformTables<TableOutputs> = TableOutputs extends readonly TableOutputUnion[] ? { [T in TableOutputs[number] as TableName<T>]: T } : never;
declare function Table<Name$1 extends string, ColumnOutputs, TransformColumnsOutput extends TransformColumns<ColumnOutputs>>({
  name,
  columns
}: TableInput<Name$1, ColumnOutputs>): TableOutput<Name$1, ColumnOutputs, TransformColumnsOutput>;
type SchemaInput<TableOutputs> = {
  tables: TableOutputs;
};
type SchemaOutput<TableOutputs, TransformTablesOutput extends TransformTables<TableOutputs>> = {
  tables: TransformTablesOutput;
};
declare function Schema<TableOutputs, TransformTablesOutput extends TransformTables<TableOutputs>>({
  tables
}: SchemaInput<TableOutputs>): SchemaOutput<TableOutputs, TransformTablesOutput>;
//#endregion
export { Column, Schema, Table };
//# sourceMappingURL=index.d.cts.map