type ValueStringUnion = "boolean" | "number" | "string";

type ColumnInput<
  Name extends string,
  ValueString extends ValueStringUnion,
  Nullable extends boolean
> = {
  name: Name;
  type: ValueString;
  nullable: Nullable;
};

type ColumnOutput<
  Name extends string,
  ValueString extends ValueStringUnion,
  Nullable extends boolean
> = ColumnInput<Name, ValueString, Nullable>;

type ColumnOutputUnion = ColumnOutput<string, ValueStringUnion, boolean>;

type ColumnName<C> = C extends ColumnOutput<infer Name, any, any>
  ? Name
  : never;

type TransformColumns<ColumnOutputs> =
  ColumnOutputs extends readonly ColumnOutputUnion[]
    ? {
        [C in ColumnOutputs[number] as ColumnName<C>]: C;
      }
    : never;

export function Column<
  Name extends string,
  ValueString extends ValueStringUnion,
  Nullable extends boolean
>(
  input: ColumnInput<Name, ValueString, Nullable>
): ColumnOutput<Name, ValueString, Nullable> {
  return input;
}

type TableInput<Name extends string, ColumnOutputs> = {
  name: Name;
  columns: ColumnOutputs;
};

type TableOutput<
  Name extends string,
  ColumnOutputs,
  TransformColumnsOutput extends TransformColumns<ColumnOutputs>
> = {
  name: Name;
  columns: TransformColumnsOutput;
};

type TableOutputUnion = TableOutput<string, any, any>;

type TableName<T> = T extends TableOutput<infer Name, any, any> ? Name : never;

type TransformTables<TableOutputs> =
  TableOutputs extends readonly TableOutputUnion[]
    ? {
        [T in TableOutputs[number] as TableName<T>]: T;
      }
    : never;

export function Table<
  Name extends string,
  ColumnOutputs,
  TransformColumnsOutput extends TransformColumns<ColumnOutputs>
>({
  name,
  columns,
}: TableInput<Name, ColumnOutputs>): TableOutput<
  Name,
  ColumnOutputs,
  TransformColumnsOutput
> {
  if (!Array.isArray(columns)) throw new Error("table creation error");
  return {
    name,
    columns: Object.fromEntries(columns.map((column) => [column.name, column])),
  };
}

type SchemaInput<TableOutputs> = { tables: TableOutputs };

type SchemaOutput<
  TableOutputs,
  TransformTablesOutput extends TransformTables<TableOutputs>
> = {
  tables: TransformTablesOutput;
};

export function Schema<
  TableOutputs,
  TransformTablesOutput extends TransformTables<TableOutputs>
>({
  tables,
}: SchemaInput<TableOutputs>): SchemaOutput<
  TableOutputs,
  TransformTablesOutput
> {
  if (!Array.isArray(tables)) throw new Error("schema creation error");
  return {
    tables: Object.fromEntries(tables.map((table) => [table.name, table])),
  };
}

const schema = Schema({
  tables: [
    Table({
      name: "product",
      columns: [
        Column({ name: "id", type: "number", nullable: false }),
        Column({ name: "name", type: "string", nullable: false }),
        Column({ name: "price", type: "number", nullable: false }),
      ] as const,
    }),
    Table({
      name: "order",
      columns: [
        Column({ name: "id", type: "number", nullable: false }),
        // Column({
        //   name: "product_id",
        //   type: "reference",
        //   data: Reference({ table: "product", column: "id" }),
        // }),
        Column({ name: "quantity", type: "number", nullable: false }),
      ] as const,
    }),
  ] as const,
});

////////////////////////////////////////////////////////////////////////////////////////////////////
