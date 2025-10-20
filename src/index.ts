// type ValueStringUnion = "boolean" | "number" | "string";

// type ColumnInput<
//   Name extends string,
//   ValueString extends ValueStringUnion,
//   Nullable extends boolean
// > = {
//   name: Name;
//   type: ValueString;
//   nullable: Nullable;
// };

// type ColumnOutput<
//   Name extends string,
//   ValueString extends ValueStringUnion,
//   Nullable extends boolean
// > = ColumnInput<Name, ValueString, Nullable>;

// type ColumnOutputUnion = ColumnOutput<string, ValueStringUnion, boolean>;

// type ColumnName<C> = C extends ColumnOutput<infer Name, any, any>
//   ? Name
//   : never;

// type TransformColumns<ColumnOutputs> =
//   ColumnOutputs extends readonly ColumnOutputUnion[]
//     ? {
//         [C in ColumnOutputs[number] as ColumnName<C>]: C;
//       }
//     : never;

// export function Column<
//   Name extends string,
//   ValueString extends ValueStringUnion,
//   Nullable extends boolean
// >(
//   input: ColumnInput<Name, ValueString, Nullable>
// ): ColumnOutput<Name, ValueString, Nullable> {
//   return input;
// }

// type TableInput<Name extends string, ColumnOutputs> = {
//   name: Name;
//   columns: ColumnOutputs;
// };

// type TableOutput<
//   Name extends string,
//   ColumnOutputs,
//   TransformColumnsOutput extends TransformColumns<ColumnOutputs>
// > = {
//   name: Name;
//   columns: TransformColumnsOutput;
// };

// type TableOutputUnion = TableOutput<string, any, any>;

// type TableName<T> = T extends TableOutput<infer Name, any, any> ? Name : never;

// type TransformTables<TableOutputs> =
//   TableOutputs extends readonly TableOutputUnion[]
//     ? {
//         [T in TableOutputs[number] as TableName<T>]: T;
//       }
//     : never;

// export function Table<
//   Name extends string,
//   ColumnOutputs,
//   TransformColumnsOutput extends TransformColumns<ColumnOutputs>
// >({
//   name,
//   columns,
// }: TableInput<Name, ColumnOutputs>): TableOutput<
//   Name,
//   ColumnOutputs,
//   TransformColumnsOutput
// > {
//   if (!Array.isArray(columns)) throw new Error("table creation error");
//   return {
//     name,
//     columns: Object.fromEntries(columns.map((column) => [column.name, column])),
//   };
// }

// type SchemaInput<TableOutputs> = { tables: TableOutputs };

// type SchemaOutput<
//   TableOutputs,
//   TransformTablesOutput extends TransformTables<TableOutputs>
// > = {
//   tables: TransformTablesOutput;
// };

// export function Schema<
//   TableOutputs,
//   TransformTablesOutput extends TransformTables<TableOutputs>
// >({
//   tables,
// }: SchemaInput<TableOutputs>): SchemaOutput<
//   TableOutputs,
//   TransformTablesOutput
// > {
//   if (!Array.isArray(tables)) throw new Error("schema creation error");
//   return {
//     tables: Object.fromEntries(tables.map((table) => [table.name, table])),
//   };
// }

// const schema = Schema({
//   tables: [
//     Table({
//       name: "product",
//       columns: [
//         Column({ name: "id", type: "number", nullable: false }),
//         Column({ name: "name", type: "string", nullable: false }),
//         Column({ name: "price", type: "number", nullable: false }),
//       ] as const,
//     }),
//     Table({
//       name: "order",
//       columns: [
//         Column({ name: "id", type: "number", nullable: false }),
//         // Column({
//         //   name: "product_id",
//         //   type: "reference",
//         //   data: Reference({ table: "product", column: "id" }),
//         // }),
//         Column({ name: "quantity", type: "number", nullable: false }),
//       ] as const,
//     }),
//   ] as const,
// });

////////////////////////////////////////////////////////////////////////////////////////////////////

// type ValueStringUnion = "boolean" | "number" | "string" | "reference";

// type Extend<Value, Target, Param> = Value extends Target ? Param : {};

// type ReferenceInput<
//   SchemaObject,
//   ParentTableName extends GetTableNames<SchemaObject>,
//   ParentColumnName extends GetColumnNames<
//     GetTable<SchemaObject, ParentTableName>
//   >,
//   TableName extends GetTableNames<SchemaObject>,
//   ColumnName extends GetColumnNames<GetTable<SchemaObject, TableName>>
// > = TableName extends ParentTableName
//   ? ColumnName extends ParentColumnName
//     ? never
//     : {
//         data: {
//           table: TableName;
//           column: ColumnName;
//         };
//       }
//   : {
//       data: {
//         table: TableName;
//         column: ColumnName;
//       };
//     };

// type ReferenceOutput<
//   SchemaObject,
//   ParentTableName extends GetTableNames<SchemaObject>,
//   ParentColumnName extends GetColumnNames<
//     GetTable<SchemaObject, ParentTableName>
//   >,
//   TableName extends GetTableNames<SchemaObject>,
//   ColumnName extends GetColumnNames<GetTable<SchemaObject, TableName>>
// > = ReferenceInput<
//   SchemaObject,
//   ParentTableName,
//   ParentColumnName,
//   TableName,
//   ColumnName
// >;

// // type GetReferenceTable<R> = R extends ReferenceOutput<
// //   any,
// //   any,
// //   any,
// //   infer TableName,
// //   any
// // >
// //   ? TableName
// //   : never;

// // type GetReferenceColumn<R> = R extends ReferenceOutput<
// //   any,
// //   any,
// //   any,
// //   any,
// //   infer ColumnName
// // >
// //   ? ColumnName
// //   : never;

// type ColumnInput<
//   SchemaObject,
//   ParentTableName extends GetTableNames<SchemaObject>,
//   Name extends string,
//   ValueString extends ValueStringUnion,
//   Nullable extends boolean,
//   Param extends Extend<
//     ValueString,
//     "reference",
//     ReferenceOutput<
//       SchemaObject,
//       ParentTableName,
//       Name extends GetColumnNames<GetTable<SchemaObject, ParentTableName>>
//         ? Name
//         : never,
//       GetTableNames<SchemaObject>,
//       GetColumnNames<GetTable<SchemaObject, ParentTableName>>
//     >
//   >
// > = {
//   name: Name;
//   type: ValueString;
//   nullable: Nullable;
// } & Param;

// type ColumnOutput<
//   SchemaObject,
//   ParentTableName extends GetTableNames<SchemaObject>,
//   Name extends string,
//   ValueString extends ValueStringUnion,
//   Nullable extends boolean,
//   Param extends Extend<
//     ValueString,
//     "reference",
//     ReferenceOutput<
//       SchemaObject,
//       ParentTableName,
//       Name extends GetColumnNames<GetTable<SchemaObject, ParentTableName>>
//         ? Name
//         : never,
//       GetTableNames<SchemaObject>,
//       GetColumnNames<GetTable<SchemaObject, ParentTableName>>
//     >
//   >
// > = ColumnInput<
//   SchemaObject,
//   ParentTableName,
//   Name,
//   ValueString,
//   Nullable,
//   Param
// >;

// type ColumnOutputUnion = ColumnOutput<
//   SchemaOutput<any, any>,
//   string,
//   string,
//   ValueStringUnion,
//   boolean,
//   any
// >;

// type GetColumnName<C> = C extends ColumnOutput<
//   any,
//   any,
//   infer Name,
//   any,
//   any,
//   any
// >
//   ? Name
//   : never;

// type TransformColumns<ColumnOutputs> =
//   ColumnOutputs extends readonly ColumnOutputUnion[]
//     ? {
//         [C in ColumnOutputs[number] as GetColumnName<C>]: C;
//       }
//     : never;

// export function Column<
//   SchemaObject,
//   ParentTableName extends GetTableNames<SchemaObject>,
//   Name extends string,
//   ValueString extends ValueStringUnion,
//   Nullable extends boolean,
//   Param extends Extend<
//     ValueString,
//     "reference",
//     ReferenceOutput<
//       SchemaObject,
//       ParentTableName,
//       Name extends GetColumnNames<GetTable<SchemaObject, ParentTableName>>
//         ? Name
//         : never,
//       GetTableNames<SchemaObject>,
//       GetColumnNames<GetTable<SchemaObject, ParentTableName>>
//     >
//   >
// >(
//   input: ColumnInput<
//     SchemaObject,
//     ParentTableName,
//     Name,
//     ValueString,
//     Nullable,
//     Param
//   >
// ): ColumnOutput<
//   SchemaObject,
//   ParentTableName,
//   Name,
//   ValueString,
//   Nullable,
//   Param
// > {
//   return input;
// }

// type TableInput<Name extends string, ColumnOutputs> = {
//   name: Name;
//   columns: ColumnOutputs;
// };

// type TableOutput<
//   Name extends string,
//   ColumnOutputs,
//   TransformColumnsOutput extends TransformColumns<ColumnOutputs>
// > = {
//   name: Name;
//   columns: TransformColumnsOutput;
// };

// type TableOutputUnion = TableOutput<string, any, any>;

// type GetTableName<T> = T extends TableOutput<infer Name, any, any>
//   ? Name
//   : never;

// type GetColumnNames<T> = T extends TableOutput<any, any, any>
//   ? keyof T["columns"]
//   : never;

// type GetColumn<T, ColumnName> = T extends TableOutput<
//   any,
//   any,
//   infer TransformColumnsOutput
// >
//   ? ColumnName extends keyof TransformColumnsOutput
//     ? T["columns"][ColumnName]
//     : never
//   : never;

// type TransformTables<TableOutputs> =
//   TableOutputs extends readonly TableOutputUnion[]
//     ? {
//         [T in TableOutputs[number] as GetTableName<T>]: T;
//       }
//     : never;

// export function Table<
//   Name extends string,
//   ColumnOutputs,
//   TransformColumnsOutput extends TransformColumns<ColumnOutputs>
// >({
//   name,
//   columns,
// }: TableInput<Name, ColumnOutputs>): TableOutput<
//   Name,
//   ColumnOutputs,
//   TransformColumnsOutput
// > {
//   if (!Array.isArray(columns)) throw new Error("table creation error");
//   return {
//     name,
//     columns: Object.fromEntries(columns.map((column) => [column.name, column])),
//   };
// }

// type SchemaInput<TableOutputs> = { tables: TableOutputs };

// type SchemaOutput<
//   TableOutputs,
//   TransformTablesOutput extends TransformTables<TableOutputs>
// > = {
//   tables: TransformTablesOutput;
// };

// type GetTableNames<S> = S extends SchemaOutput<any, any>
//   ? keyof S["tables"]
//   : never;

// type GetTable<S, TableName> = S extends SchemaOutput<
//   any,
//   infer TransformTablesOutput
// >
//   ? TableName extends keyof TransformTablesOutput
//     ? S["tables"][TableName]
//     : never
//   : never;

// export function Schema<
//   TableOutputs,
//   TransformTablesOutput extends TransformTables<TableOutputs>
// >({
//   tables,
// }: SchemaInput<TableOutputs>): SchemaOutput<
//   TableOutputs,
//   TransformTablesOutput
// > {
//   if (!Array.isArray(tables)) throw new Error("schema creation error");
//   return {
//     tables: Object.fromEntries(tables.map((table) => [table.name, table])),
//   };
// }

// const schema = Schema({
//   tables: [
//     Table({
//       name: "product",
//       columns: [
//         Column({ name: "id", type: "number", nullable: false }),
//         Column({ name: "name", type: "string", nullable: false }),
//         Column({ name: "price", type: "number", nullable: false }),
//       ] as const,
//     }),
//     Table({
//       name: "order",
//       columns: [
//         Column({ name: "id", type: "number", nullable: false }),
//         // Column({
//         //   name: "product_id",
//         //   type: "reference",
//         //   data: Reference({ table: "product", column: "id" }),
//         // }),
//         Column({ name: "quantity", type: "number", nullable: false }),
//       ] as const,
//     }),
//   ] as const,
// });

////////////////////////////////////////////////////////////////////////////////////////////////////

type ValueStringUnion = "boolean" | "number" | "string" | "reference";

type Extend<Value, Target, Param> = Value extends Target ? Param : {};

type ReferenceInput<
  SchemaObject,
  ParentTableName extends GetTableNames<SchemaObject>,
  ParentColumnName extends GetColumnNames<
    GetTable<SchemaObject, ParentTableName>
  >,
  TableName extends GetTableNames<SchemaObject>,
  ColumnName extends GetColumnNames<GetTable<SchemaObject, TableName>>
> = TableName extends ParentTableName
  ? ColumnName extends ParentColumnName
    ? never
    : {
        data: {
          table: TableName;
          column: ColumnName;
        };
      }
  : {
      data: {
        table: TableName;
        column: ColumnName;
      };
    };

type ReferenceOutput<
  SchemaObject,
  ParentTableName extends GetTableNames<SchemaObject>,
  ParentColumnName extends GetColumnNames<
    GetTable<SchemaObject, ParentTableName>
  >,
  TableName extends GetTableNames<SchemaObject>,
  ColumnName extends GetColumnNames<GetTable<SchemaObject, TableName>>
> = ReferenceInput<
  SchemaObject,
  ParentTableName,
  ParentColumnName,
  TableName,
  ColumnName
>;

// type GetReferenceTable<R> = R extends ReferenceOutput<
//   any,
//   any,
//   any,
//   infer TableName,
//   any
// >
//   ? TableName
//   : never;

// type GetReferenceColumn<R> = R extends ReferenceOutput<
//   any,
//   any,
//   any,
//   any,
//   infer ColumnName
// >
//   ? ColumnName
//   : never;

type ColumnInput<
  SchemaObject,
  ParentTableName extends GetTableNames<SchemaObject>,
  Name extends string,
  ValueString extends ValueStringUnion,
  Nullable extends boolean,
  Param extends Extend<
    ValueString,
    "reference",
    ReferenceOutput<
      SchemaObject,
      ParentTableName,
      Name extends GetColumnNames<GetTable<SchemaObject, ParentTableName>>
        ? Name
        : never,
      GetTableNames<SchemaObject>,
      GetColumnNames<GetTable<SchemaObject, ParentTableName>>
    >
  >
> = {
  name: Name;
  type: ValueString;
  nullable: Nullable;
} & Param;

type ColumnOutput<
  SchemaObject,
  ParentTableName extends GetTableNames<SchemaObject>,
  Name extends string,
  ValueString extends ValueStringUnion,
  Nullable extends boolean,
  Param extends Extend<
    ValueString,
    "reference",
    ReferenceOutput<
      SchemaObject,
      ParentTableName,
      Name extends GetColumnNames<GetTable<SchemaObject, ParentTableName>>
        ? Name
        : never,
      GetTableNames<SchemaObject>,
      GetColumnNames<GetTable<SchemaObject, ParentTableName>>
    >
  >
> = ColumnInput<
  SchemaObject,
  ParentTableName,
  Name,
  ValueString,
  Nullable,
  Param
>;

type ColumnOutputUnion = ColumnOutput<
  SchemaOutput<any, any>,
  string,
  string,
  ValueStringUnion,
  boolean,
  any
>;

type GetColumnName<C> = C extends ColumnOutput<
  any,
  any,
  infer Name,
  any,
  any,
  any
>
  ? Name
  : never;

type TransformColumns<ColumnOutputs> =
  ColumnOutputs extends readonly ColumnOutputUnion[]
    ? {
        [C in ColumnOutputs[number] as GetColumnName<C>]: C;
      }
    : never;

export function Column<
  SchemaObject,
  ParentTableName extends GetTableNames<SchemaObject>,
  Name extends string,
  ValueString extends ValueStringUnion,
  Nullable extends boolean,
  Param extends Extend<
    ValueString,
    "reference",
    ReferenceOutput<
      SchemaObject,
      ParentTableName,
      Name extends GetColumnNames<GetTable<SchemaObject, ParentTableName>>
        ? Name
        : never,
      GetTableNames<SchemaObject>,
      GetColumnNames<GetTable<SchemaObject, ParentTableName>>
    >
  >
>(
  input: ColumnInput<
    SchemaObject,
    ParentTableName,
    Name,
    ValueString,
    Nullable,
    Param
  >
): ColumnOutput<
  SchemaObject,
  ParentTableName,
  Name,
  ValueString,
  Nullable,
  Param
> {
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

type GetTableName<T> = T extends TableOutput<infer Name, any, any>
  ? Name
  : never;

type GetColumnNames<T> = T extends TableOutput<any, any, any>
  ? keyof T["columns"]
  : never;

type GetColumn<T, ColumnName> = T extends TableOutput<
  any,
  any,
  infer TransformColumnsOutput
>
  ? ColumnName extends keyof TransformColumnsOutput
    ? T["columns"][ColumnName]
    : never
  : never;

type TransformTables<TableOutputs> =
  TableOutputs extends readonly TableOutputUnion[]
    ? {
        [T in TableOutputs[number] as GetTableName<T>]: T;
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

type SchemaInput<TableOutputs, TransformTablesOutput> = {
  tables: TableOutputs;
};

type SchemaOutput<
  TableOutputs,
  TransformTablesOutput extends TransformTables<TableOutputs>
> = {
  tables: TransformTablesOutput;
};

type GetTableNames<S> = S extends SchemaOutput<any, any>
  ? keyof S["tables"]
  : never;

type GetTable<S, TableName> = S extends SchemaOutput<
  any,
  infer TransformTablesOutput
>
  ? TableName extends keyof TransformTablesOutput
    ? S["tables"][TableName]
    : never
  : never;

export function Schema<
  TableOutputs,
  TransformTablesOutput extends TransformTables<TableOutputs>
>({
  tables,
}: SchemaInput<TableOutputs, TransformTablesOutput>): SchemaOutput<
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
