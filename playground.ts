// circular extends: A extends C<B>, B extends D<A> // fail
// A extends B<A> // fail in generic declaration, success in conditional type
// Transform<Result> extends infer Names
// Circular
// multilayer infer: infer { name: ... } get column names, infer type, infer param => Column<"id" | "reference", "id", never> if param does not match
// extends _Name<infer Name> & _Type<infer Type> & _Param<infer Param>
// Fix<T> type to map to the correct one according to constraint
// function A<Names extends Fix<Names>>(input: Names) // immediate check
// separate structure { type: "number" | "reference", data?: any } and constraint { type: "number", data: {} } | { type: "reference", data: {...} }
// function type to create transform argument that maps generic types ? e.g. MapArray<Arr, TransformFunc>
// object vs Object
// partially known generic type <A, B, unknown> extends <infer A, infer B, any>

////////////////////////////////////////////////////////////////////////////////////////////////////

type ColumnTypeStringUnion = "number" | "reference";

type Intersect<A, B> = A extends object
  ? A extends readonly any[]
    ? A extends readonly []
      ? []
      : B extends readonly []
      ? []
      : A extends readonly [infer HeadA, ...infer RestA]
      ? B extends readonly [infer HeadB, ...infer RestB]
        ? [Intersect<HeadA, HeadB>, ...Intersect<RestA, RestB>] // array
        : never
      : never
    : {
        [K in keyof A | keyof B]: K extends keyof A
          ? K extends keyof B
            ? Intersect<A[K], B[K]>
            : A[K]
          : K extends keyof B
          ? B[K]
          : never;
      } // object
  : A & B; // primitive

type ColumnName<Name extends string> = {
  name: Name;
};

type ColumnType<TypeString extends ColumnTypeStringUnion> = {
  type: TypeString;
};

type ColumnData<Data extends object> = {
  data: Data;
};

type ReferenceColumn<ColumnName extends string> = {
  column: ColumnName;
};

type GetColumnName<Input> = Input extends ColumnName<infer Name> ? Name : never;

type GetColumnNames<Input> = Input extends readonly any[]
  ? GetColumnName<Input[number]>
  : never;

type FixColumn<Input, ColumnNames extends string> = (Input extends ColumnName<
  infer Name
>
  ? ColumnName<Name>
  : ColumnName<string>) &
  (Input extends ColumnType<infer TypeString>
    ? ColumnType<TypeString>
    : ColumnType<ColumnTypeStringUnion>) &
  (Input extends ColumnType<"number">
    ? Input extends ColumnData<infer Data> // number
      ? ColumnData<never>
      : {}
    : Input extends ColumnData<infer Data> // reference
    ? Data extends ReferenceColumn<infer ColumnName> // has data
      ? ColumnName extends ColumnNames
        ? ColumnData<ReferenceColumn<ColumnName>>
        : ColumnData<ReferenceColumn<ColumnNames>>
      : ColumnData<ReferenceColumn<ColumnNames>>
    : ColumnData<ReferenceColumn<ColumnNames>>); // no data

type FixColumns<Input, ColumnNames extends string> = Input extends readonly []
  ? []
  : Input extends [infer Head, ...infer Rest]
  ? [FixColumn<Head, ColumnNames>, ...FixColumns<Rest, ColumnNames>]
  : [];

function Table<Input>(
  input: Intersect<Input, FixColumns<Input, GetColumnNames<Input>>>
) {}

// const table = Table([
//   { name: "id", type: "number" },
//   { name: "reference", type: "reference", data: { column: "id" } },
// ] as const);

function Column<Input, ColumnNames extends string>(
  input: Intersect<Input, FixColumn<Input, ColumnNames>>
): FixColumn<Input, ColumnNames> {
  return input;
}

const table = Table([
  Column({ name: "id", type: "number" }),
  Column({ name: "reference", type: "reference", data: { column: "id" } }),
] as const);

// type FInput<Name, Type> = Type extends "number" ? number : never;
// type FOutput<Name, Type> = { name: Name; type: Type };

// function func<Input extends FInput<Name, Type>, Name, Type>(
//   input: Input
// ): FOutput<Name, Type> {
//   return {} as any;
// }

// const output: FOutput<"id", "number"> = func("123"); // propagate type from output to input

////////////////////////////////////////////////////////////////////////////////////////////////////

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

// type SchemaInput<TableOutputs, TransformTablesOutput> = {
//   tables: TableOutputs;
// };

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
// }: SchemaInput<TableOutputs, TransformTablesOutput>): SchemaOutput<
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
// > = {
//   data: {
//     table: TableName;
//     column: ColumnName;
//   };
// };

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

// type TableInput<SchemaObject, Name extends string, ColumnOutputs> = {
//   name: Name;
//   columns: ColumnOutputs;
// };

// type TableOutput<
//   SchemaObject,
//   Name extends string,
//   ColumnOutputs,
//   TransformColumnsOutput extends TransformColumns<ColumnOutputs>
// > = {
//   name: Name;
//   columns: TransformColumnsOutput;
// };

// type TableOutputUnion = TableOutput<any, string, any, any>;

// type GetTableName<T> = T extends TableOutput<any, infer Name, any, any>
//   ? Name
//   : never;

// type GetColumnNames<T> = T extends TableOutput<any, any, any, any>
//   ? keyof T["columns"]
//   : never;

// type GetColumn<T, ColumnName> = T extends TableOutput<
//   any,
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
//   SchemaObject,
//   Name extends string,
//   ColumnOutputs,
//   TransformColumnsOutput extends TransformColumns<ColumnOutputs>
// >({
//   name,
//   columns,
// }: TableInput<SchemaObject, Name, ColumnOutputs>): TableOutput<
//   SchemaObject,
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

// type SchemaInput<TableOutputs, TransformTablesOutput> = {
//   tables: TableOutputs extends TableOutput<
//     TransformTablesOutput,
//     infer A,
//     infer B,
//     infer C
//   >[]
//     ? TableOutputs
//     : never;
// };

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
// }: SchemaInput<TableOutputs, TransformTablesOutput>): SchemaOutput<
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

// type Values = "number" | "reference";

// // type ColumnInput<
// //   Names extends string,
// //   Name extends Names,
// //   Value extends Values
// // > = Value extends "number"
// //   ? {
// //       name: Name;
// //       type: "number";
// //     }
// //   : {
// //       name: Name;
// //       type: "reference";
// //       data: { column: Exclude<Names, Name> };
// //     };

// type FixColumnInput<Input> = (Input extends _name<infer Name>
//   ? _name<Name> // not Input, because only a single property is being asserted
//   : _name<string>) &
//   (Input extends _type<infer Value> ? _type<Value> : _type<Values>) &
//   (Input extends _type<"reference">
//     ? Input extends _data<infer Param>
//       ? _data<Param>
//       : _data<Object>
//     : Input extends _data<infer Param>
//     ? _data<never>
//     : {}); // {} or _data<never>

// type FixColumnsInput<Input> = Input extends readonly any[]
//   ? {
//       [Key in keyof Input]: Key extends Stringify<infer Index>
//         ? FixColumnInput<Input[Key]>
//         : Input[Key];
//     }
//   : [];

// // type Fix<A> = A;
// // type Test<A extends Fix<A>> = A; // not allowed

// function series<Input>(input: Intersect<Input, FixColumnsInput<Input>>) {}

// // function series<Input>(input: Input & FixColumnsInput<Input>) {}

// type Intersect<A, B> = A extends readonly []
//   ? []
//   : B extends readonly []
//   ? []
//   : A extends readonly [infer FirstA, ...infer RestA]
//   ? B extends readonly [infer FirstB, ...infer RestB]
//     ? // A extends readonly any[]
//       // ? B extends readonly any[]
//       //   ? A["length"] extends B["length"]
//       //     ? {
//       //         // array
//       //         [K in keyof A | keyof B]: K extends Stringify<infer Index>
//       //           ? K extends keyof A
//       //             ? K extends keyof B
//       //               ? A[K] & B[K]
//       //               : A[K]
//       //             : K extends keyof B
//       //             ? B[K]
//       //             : never
//       //           : K extends keyof A
//       //           ? A[K]
//       //           : K extends keyof B
//       //           ? B[K]
//       //           : never;
//       //       }
//       //     : never
//       //   : never
//       [Intersect<FirstA, FirstB>, ...Intersect<RestA, RestB>]
//     : never
//   : {
//       // object
//       [K in keyof A | keyof B]: K extends keyof A
//         ? K extends keyof B
//           ? A[K] & B[K] // use Intersect, separate primitives
//           : A[K]
//         : K extends keyof B
//         ? B[K]
//         : never;
//     };

// type FCI = Intersect<
//   {
//     name: "reference";
//     type: "reference";
//     data: undefined;
//   },
//   FixColumnInput<{
//     name: "reference";
//     type: "reference";
//     data: undefined;
//   }>
// >;

// // type FCI_1 = {
// //   name: "reference";
// //   type: "reference";
// //   data: undefined;
// // } & FixColumnInput<{
// //   name: "reference";
// //   type: "reference";
// //   data: undefined;
// // }>; // evaluates to never instead of intersection

// // type FCI_2 = Intersect<
// //   {
// //     name: "reference";
// //     type: "reference";
// //     data: undefined;
// //   },
// //   FixColumnInput<{
// //     name: "reference";
// //     type: "reference";
// //     data: undefined;
// //   }>
// // >;

// // type FCI_3 = Intersect<
// //   [
// //     { name: "id"; type: "number" },
// //     { name: "reference"; type: "reference"; data: undefined }
// //   ],
// //   FixColumnsInput<
// //     [
// //       { name: "id"; type: "number" },
// //       { name: "reference"; type: "reference"; data: undefined }
// //     ]
// //   >
// // >;

// // const fci_1: FCI = { name: "reference", type: "reference", data: undefined };

// // const fci_2 = series([
// //   { name: "id", type: "number" },
// //   { name: "reference", type: "reference", data: {} },
// // ] as const);

// // const columns = [
// //   { name: "id", type: "number" },
// //   { name: "reference", type: "reference", data: undefined },
// // ] as const;

// // type X = typeof columns extends any[] ? true : false;
// // type Y = readonly any[] extends any[] ? true : false; // false
// // type Z = any[] extends readonly any[] ? true : false; // true

// // const fci_3 = series(columns);

// // type fci_4 = [number, string] & [boolean, Object];

// type _name<Name extends string> = {
//   name: Name;
// };

// type _type<Value extends Values> = {
//   type: Value;
// };

// type _data<Param extends Object> = {
//   data: Param;
// };

// type ZZZ = {
//   name: "reference";
//   type: "reference";
//   data: { column: "id" };
// } extends _name<infer Name> & _type<infer Value> & _data<infer Param>
//   ? Name
//   : never;

////////////////////////////////////////////////////////////////////////////////////////////////////

// type Values = "number" | "reference";

// type Column<
//   Names extends string,
//   Name extends Names,
//   Value extends Values
// > = Value extends "number"
//   ? {
//       name: Name;
//       type: "number";
//     }
//   : {
//       name: Name;
//       type: "reference";
//       data: { column: Exclude<Names, Name> };
//     };

// function series<Names extends string, Input>(
//   input: // Column<Names, Names, Values>[]
//   Input extends {
//     [K in keyof Input]: K extends Stringify<infer Index>
//       ? Input[K] extends Column<Names, infer Name, infer Value>
//         ? Input[K]
//         : never
//       : Input[K];
//   }
//     ? Input
//     : never
// ) {}

// const a = series([
//   { name: "id", type: "number" },
//   { name: "reference", type: "reference", data: { column: "id" } }, // fail
// ] as const);

////////////////////////////////////////////////////////////////////////////////////////////////////

// type Values = "number" | "reference";

// type Column<Names, Name, Value> = Name extends string
//   ? Value extends Values
//     ? Names extends readonly any[]
//       ? {
//           name: Name;
//           type: Value;
//           data: Value extends "number"
//             ? {}
//             : { column: Exclude<Names[number], Name> };
//         }
//       : never
//     : never
//   : never;

// type Transform<Result> = {
//   [K in keyof Result]: K extends Stringify<infer Index> // keyof creates string types, not number
//     ? Result[K] extends Column<any, infer Name, infer Value>
//       ? Name
//       : never
//     : Result[K];
// };

// type Inject<Names, Result> = {
//   [K in keyof Result]: K extends Stringify<infer Index>
//     ? Result[K] extends Column<any, infer Name, infer Value>
//       ? Column<Names, Name, Value>
//       : never
//     : Result[K];
// };

// // type Series<Names, Result> = Names extends Transform<Result> ? Result : never; // delayed check for Names

// // function series<Names, Result>(input: Series<Names, Result>) {}

// type Series<Names extends Transform<Result>, Result> = Result extends Inject<
//   Names,
//   Result
// >
//   ? Result
//   : never; // immediate check for Names

// // type Shadow<Names, Result extends Inject<Names, Result>> = Result;

// // type Series<Names extends Transform<Result>, Result> = Shadow<Names, Result>; // immediate check for Names

// function series<Names extends Transform<Result>, Result>(
//   input: Series<Names, Result>
// ) {}

// const a = series([
//   { name: "id", type: "number", data: {} },
//   { name: "reference", type: "reference", data: { column: "id" } },
// ] as const);

////////////////////////////////////////////////////////////////////////////////////////////////////

type And<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false;

type Or<A extends boolean, B extends boolean> = A extends true
  ? true
  : B extends true
  ? true
  : false;

type Not<A extends boolean> = A extends true ? false : true;

type Reverse<S extends string> = S extends ""
  ? ""
  : S extends CombineSS<infer A, infer B>
  ? CombineSS<Reverse<B>, A>
  : never;

type R = Reverse<"abcdef">;

type Digits = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type Stringify<A extends number> = `${A}`;
type CombineNN<A extends Digits, B extends number> = `${A}${B}`;
type CombineSS<A extends string, B extends string> = `${A}${B}`;
type CombineNS<A extends Digits, B extends string> = `${A}${B}`;
type Negative<A extends string> = A extends "0" ? "0" : `-${A}`; // prevent -0
type Positive<A extends string> = A extends "0"
  ? "0"
  : A extends Negative<infer PosA>
  ? never
  : A;
type Inverse<A extends string> = A extends Negative<infer PosA>
  ? PosA
  : Negative<A>;
type Abs<A extends string> = A extends Negative<infer PosA> ? PosA : A;
type Pair<A extends string, B extends string> = [A, B];

type StringToNumber<S extends string> = S extends Stringify<infer N>
  ? N
  : never;

type W = "12345" extends CombineSS<infer A, infer B> ? B : never;
type X = "12345" extends CombineNN<infer A, infer B> ? B : never;
type Y = "12345" extends Stringify<infer A> ? A : never;
type Z = StringToNumber<"12345">;

type PreMap = {
  0: never;
  1: 0;
  2: 1;
  3: 2;
  4: 3;
  5: 4;
  6: 5;
  7: 6;
  8: 7;
  9: 8;
};

type LessEqualDigit<D extends Digits> = D extends never
  ? never
  : D | LessEqualDigit<PreMap[D]>;

type LessDigit<D extends Digits> = LessEqualDigit<PreMap[D]>;

type IsEqual<A, B> = A extends B ? (B extends A ? true : false) : false;

type IsGreaterEqualPositiveStringReverse<
  A extends string,
  B extends string
> = B extends ""
  ? true
  : A extends ""
  ? false
  : A extends CombineNS<infer DigitA, infer RestA>
  ? B extends CombineNS<infer DigitB, infer RestB>
    ? IsEqual<RestA, RestB> extends true
      ? DigitB extends LessEqualDigit<DigitA> // check DigitB <= DigitA
        ? true
        : false
      : IsGreaterPositiveStringReverse<RestA, RestB>
    : never
  : never;

type IsGreaterEqualPositiveString<
  A extends string,
  B extends string
> = IsGreaterEqualPositiveStringReverse<Reverse<A>, Reverse<B>>;

type IsGreaterEqualPositive<
  A extends number,
  B extends number
> = IsGreaterEqualPositiveString<Stringify<A>, Stringify<B>>;

type IsGreaterPositiveStringReverse<
  A extends string,
  B extends string
> = A extends ""
  ? false
  : B extends ""
  ? true
  : A extends CombineNS<infer DigitA, infer RestA>
  ? B extends CombineNS<infer DigitB, infer RestB>
    ? IsEqual<RestA, RestB> extends true
      ? DigitB extends LessDigit<DigitA> // check DigitB < DigitA
        ? true
        : false
      : IsGreaterPositiveStringReverse<RestA, RestB>
    : never
  : never;

type IsGreaterPositiveString<
  A extends string,
  B extends string
> = IsGreaterPositiveStringReverse<Reverse<A>, Reverse<B>>;

type IsGreaterPositive<
  A extends number,
  B extends number
> = IsGreaterPositiveString<Stringify<A>, Stringify<B>>;

type A = IsGreaterEqualPositive<10, 20>;
type B = IsGreaterEqualPositive<10, 10>;
type C = IsGreaterEqualPositive<20, 10>;
type D = IsGreaterPositive<10, 20>;
type E = IsGreaterPositive<10, 10>;
type F = IsGreaterPositive<20, 10>;

type AddMap = {
  0: { 0: 0; 1: 1; 2: 2; 3: 3; 4: 4; 5: 5; 6: 6; 7: 7; 8: 8; 9: 9 };
  1: { 0: 1; 1: 2; 2: 3; 3: 4; 4: 5; 5: 6; 6: 7; 7: 8; 8: 9; 9: 10 };
  2: { 0: 2; 1: 3; 2: 4; 3: 5; 4: 6; 5: 7; 6: 8; 7: 9; 8: 10; 9: 11 };
  3: { 0: 3; 1: 4; 2: 5; 3: 6; 4: 7; 5: 8; 6: 9; 7: 10; 8: 11; 9: 12 };
  4: { 0: 4; 1: 5; 2: 6; 3: 7; 4: 8; 5: 9; 6: 10; 7: 11; 8: 12; 9: 13 };
  5: { 0: 5; 1: 6; 2: 7; 3: 8; 4: 9; 5: 10; 6: 11; 7: 12; 8: 13; 9: 14 };
  6: { 0: 6; 1: 7; 2: 8; 3: 9; 4: 10; 5: 11; 6: 12; 7: 13; 8: 14; 9: 15 };
  7: { 0: 7; 1: 8; 2: 9; 3: 10; 4: 11; 5: 12; 6: 13; 7: 14; 8: 15; 9: 16 };
  8: { 0: 8; 1: 9; 2: 10; 3: 11; 4: 12; 5: 13; 6: 14; 7: 15; 8: 16; 9: 17 };
  9: { 0: 9; 1: 10; 2: 11; 3: 12; 4: 13; 5: 14; 6: 15; 7: 16; 8: 17; 9: 18 };
  10: { 0: 10; 1: 11; 2: 12; 3: 13; 4: 14; 5: 15; 6: 16; 7: 17; 8: 18; 9: 19 };
};

type AddPositiveStringReverse<
  A extends string,
  B extends string,
  Carry extends 0 | 1 = 0
> = A extends ""
  ? B extends ""
    ? Carry extends 0
      ? ""
      : "1"
    : AddPositiveStringReverse<B, Stringify<Carry>>
  : B extends ""
  ? AddPositiveStringReverse<A, Stringify<Carry>>
  : A extends CombineNS<infer DigitA, infer RestA>
  ? B extends CombineNS<infer DigitB, infer RestB>
    ? Reverse<
        Stringify<AddMap[Carry extends 0 ? DigitA : AddMap[DigitA][1]][DigitB]>
      > extends CombineNS<infer Digit, infer Rest>
      ? CombineNS<
          Digit,
          AddPositiveStringReverse<RestA, RestB, Rest extends "" ? 0 : 1>
        >
      : never
    : never
  : never;

type AddPositiveString<A extends string, B extends string> = Reverse<
  AddPositiveStringReverse<Reverse<A>, Reverse<B>>
>;

type AddPositive<A extends number, B extends number> = StringToNumber<
  AddPositiveString<Stringify<A>, Stringify<B>>
>;

type A1 = AddPositive<1589, 94321>;
type A2 = 12 extends AddPositive<5, infer A> ? A : never;

type MultiplyMap = {
  0: { 0: 0; 1: 0; 2: 0; 3: 0; 4: 0; 5: 0; 6: 0; 7: 0; 8: 0; 9: 0 };
  1: { 0: 0; 1: 1; 2: 2; 3: 3; 4: 4; 5: 5; 6: 6; 7: 7; 8: 8; 9: 9 };
  2: { 0: 0; 1: 2; 2: 4; 3: 6; 4: 8; 5: 10; 6: 12; 7: 14; 8: 16; 9: 18 };
  3: { 0: 0; 1: 3; 2: 6; 3: 9; 4: 12; 5: 15; 6: 18; 7: 21; 8: 24; 9: 27 };
  4: { 0: 0; 1: 4; 2: 8; 3: 12; 4: 16; 5: 20; 6: 24; 7: 28; 8: 32; 9: 36 };
  5: { 0: 0; 1: 5; 2: 10; 3: 15; 4: 20; 5: 25; 6: 30; 7: 35; 8: 40; 9: 45 };
  6: { 0: 0; 1: 6; 2: 12; 3: 18; 4: 24; 5: 30; 6: 36; 7: 42; 8: 48; 9: 54 };
  7: { 0: 0; 1: 7; 2: 14; 3: 21; 4: 28; 5: 35; 6: 42; 7: 49; 8: 56; 9: 63 };
  8: { 0: 0; 1: 8; 2: 16; 3: 24; 4: 32; 5: 40; 6: 48; 7: 56; 8: 64; 9: 72 };
  9: { 0: 0; 1: 9; 2: 18; 3: 27; 4: 36; 5: 45; 6: 54; 7: 63; 8: 72; 9: 81 };
};

// type MultiplyStringReverse<
//   A extends string,
//   B extends string
// > = A extends Stringify<Digits & infer DigitA>
//   ? B extends Stringify<Digits & infer DigitB>
//     ? Reverse<Stringify<MultiplyMap[DigitA][DigitB]>>
//     : MultiplyStringReverse<B, A>
//   : A extends CombineSS<infer DigitCharA, infer RestA>
//   ? AddStringReverse<
//       MultiplyStringReverse<DigitCharA, B>,
//       CombineNS<0, MultiplyStringReverse<RestA, B>>
//     >
//   : never;

type MultiplyPositiveStringReverse<
  A extends string,
  B extends string
> = A extends Stringify<Digits>
  ? B extends Stringify<Digits>
    ? Reverse<Stringify<MultiplyMap[StringToNumber<A>][StringToNumber<B>]>>
    : MultiplyPositiveStringReverse<B, A>
  : A extends CombineSS<infer DigitCharA, infer RestA>
  ? AddPositiveStringReverse<
      MultiplyPositiveStringReverse<DigitCharA, B>,
      CombineNS<0, RemoveZero<MultiplyPositiveStringReverse<RestA, B>>>
    >
  : never;

type MultiplyString<A extends string, B extends string> = A extends Negative<
  infer PosA
>
  ? Inverse<MultiplyString<PosA, B>>
  : B extends Negative<infer PosB>
  ? Inverse<MultiplyString<A, PosB>>
  : Reverse<MultiplyPositiveStringReverse<Reverse<A>, Reverse<B>>>;

type Multiply<A extends number, B extends number> = StringToNumber<
  MultiplyString<Stringify<A>, Stringify<B>>
>;

type M1 = Multiply<12345, -37>;

type KeyOf<Obj, Value> = {
  [K in keyof Obj & Digits]: Obj[K] extends Value ? K : never;
}[keyof Obj & Digits];

type RemoveZero<S extends string> = S extends "0" ? "" : S;
type RemoveLeadZeros<S extends string> = S extends CombineSS<".", infer SS>
  ? SS // stop at dot
  : S extends CombineNS<0, infer SS>
  ? RemoveLeadZeros<SS>
  : S; // stop if not zero

type SubtractPositiveStringReverse<
  A extends string,
  B extends string
> = IsEqual<A, B> extends true
  ? "0"
  : B extends ""
  ? A
  : A extends CombineNS<infer DigitA, infer RestA>
  ? B extends CombineNS<infer DigitB, infer RestB>
    ? DigitB extends LessEqualDigit<DigitA> // DigitA >= DigitB
      ? CombineNS<
          KeyOf<AddMap[DigitB], DigitA>, // find DigitC such that AddMap[DigitB][DigitC] extends DigitA
          RemoveZero<SubtractPositiveStringReverse<RestA, RestB>>
        >
      : CombineNS<
          KeyOf<AddMap[DigitB], StringToNumber<CombineNN<1, DigitA>>>,
          RemoveZero<
            SubtractPositiveStringReverse<
              SubtractPositiveStringReverse<RestA, "1">,
              RestB
            >
          >
        >
    : never
  : never;

// : IsGreaterEqualPositiveStringReverse<A, B> extends true
// ? SubtractPositiveStringReverse<B, A>
// assume A >= B

type SubtractPositiveString<A extends string, B extends string> = Reverse<
  SubtractPositiveStringReverse<Reverse<A>, Reverse<B>>
>;

type SubtractPositive<A extends number, B extends number> = StringToNumber<
  SubtractPositiveString<Stringify<A>, Stringify<B>>
>;

type S1 = SubtractPositive<12345, 9999>;
type S2 = SubtractPositive<9182, 1928>;

type AddString<A extends string, B extends string> = A extends Negative<
  infer PosA
>
  ? B extends Negative<infer PosB>
    ? // Inverse
      Negative<AddPositiveString<PosA, PosB>> // AB neg
    : IsGreaterPositiveString<PosA, B> extends true // A neg B pos
    ? // Inverse
      Negative<SubtractPositiveString<PosA, B>> // abs A > abs B
    : SubtractPositiveString<B, PosA> // abs A <= abs B
  : B extends Negative<infer PosB>
  ? IsGreaterPositiveString<A, PosB> extends true // A pos B neg
    ? SubtractPositiveString<A, PosB> // abs A > abs B
    : // Inverse
      Negative<SubtractPositiveString<PosB, A>> // abs A <= abs B
  : AddPositiveString<A, B>; // AB pos

type Add<A extends number, B extends number> = StringToNumber<
  AddString<Stringify<A>, Stringify<B>>
>;

type AA1 = Add<123, 67>;
type AA2 = Add<20, -37>;
type AA3 = Add<-37, 20>;
type AA4 = Add<-512, -1234>;

type SubtractString<A extends string, B extends string> = AddString<
  A,
  Inverse<B>
>;

type Subtract<A extends number, B extends number> = StringToNumber<
  SubtractString<Stringify<A>, Stringify<B>>
>;

type SS1 = Subtract<10, -27>;
type SS2 = Subtract<90, 120>;
type SS3 = Subtract<123, 77>;
type SS4 = Subtract<-37, -60>;
type SS5 = Subtract<-60, -37>;
type SS6 = Subtract<10 | -3, -7 | 20>;
type SS7 = Subtract<0, 0>;
type SS8 = Subtract<100, 100>;
type SS9 = Subtract<-100, -100>;

// type MaxString<A extends string, B = A> = B extends A
//   ? IsGreaterEqualPositiveString<B, Exclude<A, B>> extends true
//     ? B
//     : never
//   : never;

type MaxString<A extends string, B = A> = B extends A
  ? SubtractString<B, Exclude<A, B>> extends Positive<infer _> // all b - a pair non-negative
    ? B
    : never
  : never;

type Max<A extends number> = StringToNumber<MaxString<Stringify<A>>>;

type M = Max<10 | 5 | -25 | 99 | -100>;

type MaxDigitDiv<A extends string, B extends string, C = Digits> = Max<
  C extends Digits
    ? IsGreaterEqualPositiveString<
        A,
        MultiplyString<B, Stringify<C>>
      > extends true
      ? C
      : never
    : never
> &
  Digits;

type MaxDigitDivReverse<A extends string, B extends string, C = Digits> = Max<
  C extends Digits
    ? IsGreaterEqualPositiveStringReverse<
        A,
        MultiplyPositiveStringReverse<B, Stringify<C>>
      > extends true
      ? C
      : never
    : never
> &
  Digits;

type MDD1 = MaxDigitDiv<"9", "3">;
type MDD2 = MaxDigitDiv<"5", "32">;

type T1 = MultiplyString<"32", "0">;
type T2 = IsGreaterEqualPositiveString<"5", T1>;

// type FloorDivString<A extends string, B extends string> = A extends Negative<
//   infer PosA
// >
//   ? MultiplyString<FloorDivString<PosA, B>, B> extends PosA // a neg
//     ? Negative<FloorDivString<PosA, B>> // if (posA // B) * B === posA
//     : Negative<AddPositiveString<FloorDivString<PosA, B>, "1">> // - (posA // B + 1)
//   : IsGreaterEqualPositiveString<A, B> extends true // a pos
//   ? IsGreaterEqualPositiveString<A, CombineSS<B, "0">> extends true // a >= b
//     ? never // a >= 10b
//     : Stringify<MaxDigitDiv<A, B>> // b <= a < 10b thus 1 <= a // b <= 9
//   : "0"; // a < b

// type FloorDivString<A extends string, B extends string> = A extends Negative<
//   infer PosA
// >
//   ? MultiplyString<FloorDivString<PosA, B>, B> extends PosA // a neg
//     ? Negative<FloorDivString<PosA, B>> // if (posA // B) * B === posA
//     : Negative<AddPositiveString<FloorDivString<PosA, B>, "1">> // - (posA // B + 1)
//   : IsGreaterEqualPositiveString<A, CombineSS<B, "0">> extends true // a pos
//   ? never // a >= 10b
//   : Stringify<MaxDigitDiv<A, B>>; // a < 10b thus a // b <= 9

// type FloorDivModString<A extends string, B extends string> = A extends Negative<
//   infer PosA
// >
//   ? ["0", "0"] // a neg
//   : IsGreaterEqualPositiveString<A, CombineSS<B, "0">> extends true // a pos
//   ? Reverse<A> extends CombineNS<infer DigitA, Reverse<infer RestA>> // a >= 10b
//     ? ["0", "0"]
//     : never
//   : [
//       Stringify<MaxDigitDiv<A, B>>,
//       SubtractPositiveString<A, MultiplyString<B, Stringify<MaxDigitDiv<A, B>>>>
//     ]; // a < 10b thus a // b <= 9;

type FloorDivModStringReverse<
  A extends string,
  B extends string
> = IsGreaterEqualPositiveStringReverse<A, CombineSS<"0", B>> extends true
  ? A extends CombineNS<infer DigitA, infer RestA> // a >= 10b
    ? FloorDivModStringReverse<RestA, B> extends Pair<
        infer PrevDiv,
        infer PrevMod
      >
      ? FloorDivModStringReverse<CombineNS<DigitA, PrevMod>, B> extends Pair<
          // (prevmod * 10 + digit) //% b
          infer NextDiv, // <= 9
          infer NextMod
        >
        ? [CombineSS<NextDiv, PrevDiv>, NextMod] // div = prevdiv * 10 + nextdiv, mod = nextmod
        : never
      : never
    : never
  : [
      Stringify<MaxDigitDivReverse<A, B>>,
      SubtractPositiveStringReverse<
        A,
        MultiplyPositiveStringReverse<B, Stringify<MaxDigitDivReverse<A, B>>>
      >
    ]; // a < 10b thus a // b <= 9;

type FloorDivModString<A extends string, B extends string> = A extends Negative<
  infer PosA
>
  ? FloorDivModStringReverse<Reverse<PosA>, Reverse<B>> extends Pair<
      infer RevDiv, // positive & reverse
      infer RevMod // positive & reverse
    >
    ? RevMod extends "0"
      ? Pair<
          Negative<Reverse<RevDiv>>, // - div
          "0"
        >
      : Pair<
          Negative<Reverse<AddPositiveStringReverse<RevDiv, "1">>>, // - (div + 1)
          SubtractPositiveString<B, Reverse<RevMod>> // b - mod
        >
    : never
  : FloorDivModStringReverse<Reverse<A>, Reverse<B>> extends Pair<
      infer RevDiv,
      infer RefMod
    >
  ? Pair<Reverse<RevDiv>, Reverse<RefMod>>
  : never;

type FloorDivMod<A extends number, B extends number> = FloorDivModString<
  Stringify<A>,
  Stringify<B>
> extends Pair<infer Div, infer Mod>
  ? [StringToNumber<Div>, StringToNumber<Mod>]
  : never;

type FF1 = FloorDivMod<32, 7>;
type FF2 = FloorDivMod<729, 27>;
type FF3 = FloorDivMod<-32, 7>;
type FF4 = FloorDivMod<-729, 27>;
type FF5 = FloorDivMod<5, 32>;
type FF6 = FloorDivMod<-5, 32>;
type FF7 = FloorDivMod<-12345, 98>;
type FF8 = FloorDivMod<67945, 107>;

type FloorDivString<A extends string, B extends string> = FloorDivModString<
  A,
  B
>[0];
// FloorDivModString<
//   A,
//   B
// > extends Pair<infer Div, infer Mod>
//   ? Div
//   : never;

type FloorDiv<A extends number, B extends number> = StringToNumber<
  FloorDivString<Stringify<A>, Stringify<B>>
>;

type F1 = FloorDiv<32, 7>;
type F2 = FloorDiv<729, 27>;
type F3 = FloorDiv<-32, 7>;
type F4 = FloorDiv<-729, 27>;
type F5 = FloorDiv<5, 32>;
type F6 = FloorDiv<-5, 32>;
type F7 = FloorDiv<-12345, 98>;
type F8 = FloorDiv<67945, 107>;

// type ModuloString<A extends string, B extends string> = A extends Negative<
//   infer PosA
// >
//   ? ModuloString<SubtractString<B, ModuloString<PosA, B>>, B> // (b - (-a % b)) % b
//   : never;

type ModuloString<A extends string, B extends string> = FloorDivModString<
  A,
  B
>[1];
// FloorDivModString<
//   A,
//   B
// > extends Pair<infer Div, infer Mod>
//   ? Mod
//   : never;

type Modulo<A extends number, B extends number> = StringToNumber<
  ModuloString<Stringify<A>, Stringify<B>>
>;

type MM1 = Modulo<32, 7>;
type MM2 = Modulo<729, 27>;
type MM3 = Modulo<-32, 7>;
type MM4 = Modulo<-729, 27>;
type MM5 = Modulo<5, 32>;
type MM6 = Modulo<-5, 32>;
type MM7 = Modulo<-12345, 98>;
type MM8 = Modulo<67945, 107>;

type Dot<A extends string, B extends string> = `${A}.${B}`;
// B extends "" ? `${A}` : `${A}.${B}`; // break type inference

type Length<A extends string> = A extends ""
  ? 0
  : A extends CombineSS<infer S, infer Rest>
  ? AddPositive<Length<Rest>, 1>
  : never;

// type PadZero<S extends string, L extends number> = L extends 0
//   ? S
//   : S extends ""
//   ? PadZero<"0", Subtract<L, 1>>
//   : S extends CombineSS<infer A, infer B>
//   ? CombineSS<A, PadZero<B, Subtract<L, 1>>>
//   : never;

type Repeat<S extends string, Count extends number> = Count extends 0
  ? ""
  : Stringify<Count> extends Negative<infer A>
  ? ""
  : CombineSS<S, Repeat<S, Subtract<Count, 1>>>;

type PadZero<S extends string, Count extends number> = Count extends 0
  ? S
  : Stringify<Count> extends Negative<infer A>
  ? S
  : IsGreaterPositive<Count, Length<S>> extends true // Count > Length<S>
  ? CombineSS<S, Repeat<"0", Subtract<Count, Length<S>>>>
  : S;

type HasChar<S extends string, C extends string> = S extends ""
  ? false
  : S extends CombineSS<infer A, infer Rest>
  ? Or<A extends C ? true : false, HasChar<Rest, C>>
  : never;

type IsDecimalString<S extends string> = HasChar<S, ".">;

type ShiftRightStringReverse<
  LeftReverse extends string,
  RightReverse extends string,
  Count extends number,
  I extends number = 0
> = Count extends I
  ? Dot<RightReverse, LeftReverse>
  : LeftReverse extends CombineSS<infer LeftDigitString, infer LeftRestRev>
  ? ShiftRightStringReverse<
      LeftRestRev extends "" ? "0" : LeftRestRev,
      CombineSS<RightReverse, LeftDigitString>,
      Count,
      AddPositive<I, 1>
    >
  : never;

type RemoveDecimalZeros<S extends string> = Reverse<
  RemoveLeadZeros<Reverse<S>>
>;

type DecimalString<S extends string, Count extends number> = Reverse<
  RemoveLeadZeros<ShiftRightStringReverse<Reverse<S>, "", Count>>
>;

type Decimal<Int extends number, Count extends number> = StringToNumber<
  DecimalString<Stringify<Int>, Count>
>;

type D1 = Decimal<1234567890, 5>;
type D2 = Decimal<1000000, 5>;
type D3 = Decimal<19, 5>;
type D4 = Length<"12345.678" extends Dot<infer A, infer B> ? B : never>;

type P1 = PadZero<"123", 2>;
type P2 = PadZero<"123", 7>;
type P3 = PadZero<"123", -10>;
type P4 = PadZero<"98765", 10>;

type H1 = HasChar<"123", ".">;
type H2 = HasChar<"12.3", ".">;
type H3 = HasChar<"...", ".">;

type ID1 = IsDecimalString<"12.3">;
type ID2 = IsDecimalString<"12345">;

type N1 = "0" extends Negative<infer A> ? A : never;
type N2 = Negative<"0">; // contradiction

type AddFloatString<
  A extends string,
  B extends string
> = IsDecimalString<A> extends true
  ? IsDecimalString<B> extends true // A decimal
    ? A extends Dot<infer IntA, infer FracA> // AB decimal
      ? B extends Dot<infer IntB, infer FracB>
        ? IsGreaterEqualPositive<Length<FracA>, Length<FracB>> extends true
          ? DecimalString<
              AddString<
                CombineSS<IntA, FracA>,
                CombineSS<
                  IntB,
                  CombineSS<
                    FracB,
                    Repeat<"0", Subtract<Length<FracA>, Length<FracB>>>
                  >
                >
              >,
              Length<FracA>
            > // length FracA >= length FracB
          : AddFloatString<B, A> // length FracA < length FracB
        : never
      : never
    : AddFloatString<B, A> // A decimal B integer
  : IsDecimalString<B> extends true // A integer
  ? B extends Dot<infer IntB, infer FracB> // A integer B decimal
    ? DecimalString<
        AddString<
          CombineSS<A, Repeat<"0", Length<FracB>>>,
          CombineSS<IntB, FracB>
        >,
        Length<FracB>
      >
    : never
  : AddString<A, B>; // AB integer

type AddFloat<A extends number, B extends number> = StringToNumber<
  AddFloatString<Stringify<A>, Stringify<B>>
>;

type AF1 = AddFloat<12.34, 978>;
type AF2 = AddFloat<-12.34, 156>;
type AF3 = AddFloat<1.234, -100.5678>;
type AF4 = AddFloat<567, 1234>;
type AF5 = AddFloat<-567, -1234>;
type AF6 = AddFloat<-99.7, -102.3>;
type AF7 = AddFloat<-99.745, -102.39>;

type MultiplyFloatString<
  A extends string,
  B extends string
> = IsDecimalString<A> extends true
  ? IsDecimalString<B> extends true // A decimal
    ? A extends Dot<infer IntA, infer FracA> // AB decimal
      ? B extends Dot<infer IntB, infer FracB>
        ? DecimalString<
            MultiplyString<CombineSS<IntA, FracA>, CombineSS<IntB, FracB>>,
            AddPositive<Length<FracA>, Length<FracB>>
          >
        : never
      : never
    : MultiplyFloatString<B, A> // A decimal B integer
  : IsDecimalString<B> extends true // A integer
  ? B extends Dot<infer IntB, infer FracB> // A integer B decimal
    ? DecimalString<MultiplyString<A, CombineSS<IntB, FracB>>, Length<FracB>>
    : never
  : MultiplyString<A, B>; // AB integer

type MultiplyFloat<A extends number, B extends number> = StringToNumber<
  MultiplyFloatString<Stringify<A>, Stringify<B>>
>;

type MF1 = MultiplyFloat<12.34, 978>;
type MF2 = MultiplyFloat<-12.34, 156>;
type MF3 = MultiplyFloat<1.234, -100.5678>;
type MF4 = MultiplyFloat<567, 1234>;
type MF5 = MultiplyFloat<-567, -1234>;
type MF6 = MultiplyFloat<-99.7, -102.3>;
type MF7 = MultiplyFloat<-99.745, -102.39>;
type MF8 = MultiplyFloat<0.0105, 0.00123>;
type MF9 = MultiplyFloat<125005, 0.1000123>;
type MF10 = MultiplyFloat<120, 0.000135>;

////////////////////////////////////////////////////////////////////////////////////////////////////

// type EvenDigits = 0 | 2 | 4 | 6 | 8;

// // type OddDigits = 1 | 3 | 5 | 7 | 9;

// type Digits = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// // type Digit<D extends Digits> = D;

// // type IsEvenString<S extends string> = S extends Stringify<Digits>
// //   ? S extends Stringify<EvenDigits>
// //     ? true
// //     : false
// //   : S extends `${
// //       //   Digit<Digits>
// //       //   Digits
// //       //   infer A
// //       number // prefix consumes string 1 by 1
// //     }${infer Rest}`
// //   ? IsEvenString<Rest>
// //   : false;

// // type IsEven<N extends number> = IsEvenString<`${N}`>;

// type IsEven<N extends number> = N extends Digits
//   ? N extends EvenDigits
//     ? true
//     : false
//   : Stringify<N> extends CombineNN<number, infer Rest>
//   ? IsEven<Rest>
//   : false;

// type E0 = IsEven<0>;
// type E1 = IsEven<1>;
// type E2 = IsEven<2>;
// type E = IsEven<12345>;

////////////////////////////////////////////////////////////////////////////////////////////////////

// type SplitLastDigit<
//   Front extends number,
//   LastDigit extends Digits
// > = `${Front}${LastDigit}`;

// type D = "12345" extends SplitLastDigit<infer Front, infer LastDigit>
//   ? LastDigit
//   : never;

// type IsEvenString<S extends string> = S extends `${infer A}${infer B}`
//   ? IsEvenString<B>
//   : S extends `${EvenDigits}`
//   ? true
//   : false;

// type IsEven<N extends number, A extends any[] = []> = N extends A["length"]
//   ? true
//   : IsEven<N, [any, ...A]> extends true
//   ? false
//   : true;

// type E0 = IsEven<0>;
// type E1 = IsEven<1>;
// type E2 = IsEven<2>;

// // type IsEven<N extends number, A extends any[] = []> = N extends A["length"]
// //   ? true
// //   : N extends [any, ...A]["length"]
// //   ? false
// //   : IsEven<N, [any, any, ...A]>;

// type A = 37 extends infer A ? A : never; // not widened to number

// function check<S extends string>(text: S extends Reverse<S> ? S : never) {}

// const a = check("ab");

////////////////////////////////////////////////////////////////////////////////////////////////////

// type LowerCaseMap = {
//   A: "a";
//   B: "b";
//   C: "c";
//   D: "d";
//   E: "e";
//   F: "f";
//   G: "g";
//   H: "h";
//   I: "i";
//   J: "j";
//   K: "k";
//   L: "l";
//   M: "m";
//   N: "n";
//   O: "o";
//   P: "p";
//   Q: "q";
//   R: "r";
//   S: "s";
//   T: "t";
//   U: "u";
//   V: "v";
//   W: "w";
//   X: "x";
//   Y: "y";
//   Z: "z";
// };

// type UpperCaseMap = { [C in keyof LowerCaseMap as LowerCaseMap[C]]: C };

// type LowerCaseChars = keyof UpperCaseMap;

// type UpperCaseChars = keyof LowerCaseMap;

// type LowerCaseChar<C extends string> = C extends UpperCaseChars
//   ? LowerCaseMap[C]
//   : C;

// type LowerCase<S extends string> = S extends ""
//   ? ""
//   : S extends `${infer A}${infer B}`
//   ? `${LowerCaseChar<A>}${LowerCase<B>}`
//   : never;

// type IsLowerCase<S extends string> = LowerCase<S> extends S ? true : false;

// type UpperCaseChar<C extends string> = C extends LowerCaseChars
//   ? UpperCaseMap[C]
//   : C;

// type UpperCase<S extends string> = S extends ""
//   ? ""
//   : S extends `${infer A}${infer B}`
//   ? `${UpperCaseChar<A>}${UpperCase<B>}`
//   : never;

// type IsUpperCase<S extends string> = UpperCase<S> extends S ? true : false;

// type A = LowerCase<"aB3_">;
// type B = IsLowerCase<"aB3_">;
// type C = UpperCase<"aB3_">;
// type D = IsUpperCase<"AB3_">;

////////////////////////////////////////////////////////////////////////////////////////////////////

// type LowerCaseChars =
//   | "a"
//   | "b"
//   | "c"
//   | "d"
//   | "e"
//   | "f"
//   | "g"
//   | "h"
//   | "i"
//   | "j"
//   | "k"
//   | "l"
//   | "m"
//   | "n"
//   | "o"
//   | "p"
//   | "q"
//   | "r"
//   | "s"
//   | "t"
//   | "u"
//   | "v"
//   | "w"
//   | "x"
//   | "y"
//   | "z";

// type UpperCaseChars =
//   | "A"
//   | "B"
//   | "C"
//   | "D"
//   | "E"
//   | "F"
//   | "G"
//   | "H"
//   | "I"
//   | "J"
//   | "K"
//   | "L"
//   | "M"
//   | "N"
//   | "O"
//   | "P"
//   | "Q"
//   | "R"
//   | "S"
//   | "T"
//   | "U"
//   | "V"
//   | "W"
//   | "X"
//   | "Y"
//   | "Z";

// type LowerCaseChar<C extends UpperCaseChars> = "";

// type LowerCaseCharMap<C extends UpperCaseChars> = LowerCaseMap[C];

// type LowerCaseChar<C extends string> = C extends UpperCaseChars
//   ? LowerCaseCharMap<C>
//   : C;

// type LowerCase<S extends string> = S extends ""
//   ? ""
//   : S extends `${infer A}${infer B}`
//   ? `${A extends UpperCaseChars ? LowerCaseChar<A> : A}${LowerCase<B>}`
//   : never;

// type IsLowerCase<S extends string> = S extends ""
//   ? true
//   : S extends `${infer A}${infer B}`
//   ? A extends UpperCaseChars
//     ? false
//     : IsLowerCase<B>
//   : never;

// type IsLowerCase<S extends string> =
//   "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[number] extends S[number] ? false : true;

// type A = IsLowerCase<"Abcd">;

////////////////////////////////////////////////////////////////////////////////////////////////////

// type Index<T> = Exclude<keyof T, keyof any[]>;

// type DisjointArray<T extends readonly any[]> = Index<T> extends infer K // declare K
//   ? (
//       (
//         K extends Index<T> // distributive conditional type to partition Index<T>
//           ? (_: T[K] extends (infer I1)[] ? I1 : never) => void // infer I unionize the types inside each array
//           : never
//       ) extends (_: infer I2) => void // function argument intersect the distributive conditional type
//         ? I2
//         : never
//     ) extends never // intersection is empty
//     ? true
//     : false
//   : never;

// type D = DisjointArray<[number, number | string, string]>;
// type E = DisjointArray<["number", "string"]>;
// type F = DisjointArray<["string", string]>;

// type G = DisjointArray<[["number"], ["string"]]>;
// type H = DisjointArray<[["number"], ["number", "string"]]>;

////////////////////////////////////////////////////////////////////////////////////////////////////

// type Index<T> = Exclude<keyof T, keyof any[]>;

// type Disjoint<T extends readonly any[]> = Index<T> extends infer K // declare K
//   ? (
//       (K extends Index<T> ? (_: T[K]) => void : never) extends (
//         _: infer I
//       ) => void
//         ? I
//         : never
//     ) extends never
//     ? true
//     : false
//   : never;

// type D = Disjoint<[number, number | string, string]>;
// type E = Disjoint<["number", "string"]>;
// type F = Disjoint<["string", string]>;

// type G = Disjoint<[["number"], ["string"]]>;
// type H = Disjoint<[["number"], ["number", "string"]]>;

////////////////////////////////////////////////////////////////////////////////////////////////////

// type Intersect<T, K> = (K extends keyof T ? (_: T[K]) => void : never) extends (
//   _: infer I
// ) => void
//   ? I
//   : never;

// type Index<T extends readonly any[]> = Exclude<keyof T, keyof any[]>;

// type Intersection<T extends readonly any[]> = Intersect<T, Index<T>>;

// type A = Intersection<[number, number | string]>;
// type B = Intersection<["number", "number" | "string"]>;
// type C = Intersection<["string", string]>;

// type Disjoint<T extends readonly any[]> = Intersection<T> extends never
//   ? true
//   : false;

// type D = Disjoint<[number, number | string, string]>;
// type E = Disjoint<["number", "string"]>;
// type F = Disjoint<["string", string]>;

// // type DisjointArray<T extends readonly any[]> = Disjoint<{
// //   readonly [K in keyof T]: T[K] extends (infer I)[] ? I : never;
// // }>;

// type DisjointArray<T extends readonly any[]> = Disjoint<{
//   [K in keyof T]: T[K] extends (infer I)[] ? I : never;
// }>;

// type G = DisjointArray<[["number"], ["string"]]>;
// type H = DisjointArray<[["number"], ["number", "string"]]>;

////////////////////////////////////////////////////////////////////////////////////////////////////

// type Intersect<T, K> = (K extends keyof T ? (_: T[K]) => void : never) extends (
//   _: infer I
// ) => void
//   ? I
//   : never;

// type Index<T> = Exclude<keyof T, keyof any[]>;

// type Intersection<T> = Intersect<T, Index<T>>;

// type A = Intersection<[number, number | string]>;
// type B = Intersection<["number", "number" | "string"]>;
// type C = Intersection<["string", string]>;

// type Disjoint<T> = Intersection<T> extends never ? true : false;

// type D = Disjoint<[number, number | string, string]>;
// type E = Disjoint<["number", "string"]>;
// type F = Disjoint<["string", string]>;

// type DisjointArray<T> = Disjoint<{
//   [K in Index<T>]: T[K] extends (infer I)[] ? I : never;
// }>;

// type G = DisjointArray<[["number"], ["string"]]>;
// type H = DisjointArray<[["number"], ["number", "string"]]>;

////////////////////////////////////////////////////////////////////////////////////////////////////

// type Index<T extends readonly any[]> = Extract<keyof T, `${number}` | number>;

// type Index<T extends readonly any[]> = Exclude<keyof T, keyof any[]>;

// type Intersection<T extends readonly any[]> = Intersect<T, Index<T>>;

// type Disjoint<T extends readonly any[]> = Intersection<T> extends never
//   ? true
//   : false;

// type DisjointArray<T extends readonly any[]> = Disjoint<{
//   [K in Index<T>]: T[K] extends (infer I)[] ? I : never;
// }>;

////////////////////////////////////////////////////////////////////////////////////////////////////

// // type DisjointArray<T extends readonly any[]> = (
// //   (T extends any ? (_: T[keyof T]) => void : never) extends (_: infer I) => void
// //     ? I
// //     : never
// // ) extends never
// //   ? true
// //   : false;

// type DisjointArray<T extends readonly any[]> = (
//   (T[number] extends any ? (_: T[number]) => void : never) extends (
//     _: infer I
//   ) => void
//     ? I
//     : never
// ) extends never
//   ? true
//   : false;

// type D = DisjointArray<[number, number | string, string]>;
// type E = DisjointArray<["number", "string"]>;
// type F = DisjointArray<["string", string]>;

// type G = DisjointArray<[["number"], ["string"]]>;
// type H = DisjointArray<[["number"], ["number", "string"]]>;

////////////////////////////////////////////////////////////////////////////////////////////////////

// type Disjoint<Type> = Type extends (infer Intersection)[]
//   ? Intersection extends never
//     ? true
//     : false
//   : never;

////////////////////////////////////////////////////////////////////////////////////////////////////

// // 1) canonical union -> intersection
// type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
//   k: infer I
// ) => void
//   ? I
//   : never;

// // 2) intersection of the tuple/array element types
// type ElementsIntersection<T extends readonly any[]> = UnionToIntersection<
//   T[number]
// >;

// // 3) final test: true if X extends the intersection of elements of T
// type ExtendsElementsIntersection<X, T extends readonly any[]> =
//   // if T has no elements, T[number] is `never` -> treat as false (or adjust as you want)
//   [T[number]] extends [never]
//     ? false
//     : X extends ElementsIntersection<T>
//     ? true
//     : false;

// type A = [{ a: number }, { b: string }];

// type I = ElementsIntersection<A>; // { a: number } & { b: string }

// type Check1 = ExtendsElementsIntersection<{ a: number; b: string }, A>; // true
// type Check2 = ExtendsElementsIntersection<{ a: number }, A>; // false
// type Check3 = ExtendsElementsIntersection<
//   { a: number; b: string; c: boolean },
//   A
// >; // true

// // Empty array case:
// type Empty = [];
// type CheckEmpty = ExtendsElementsIntersection<{}, Empty>; // false

////////////////////////////////////////////////////////////////////////////////////////////////////

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

// type ColumnName<C> = C extends ColumnOutput<
//   infer Name,
//   infer ValueString,
//   infer Nullable
// >
//   ? Name
//   : never;

// type TransformColumns<ColumnOutputs extends readonly ColumnOutputUnion[]> = {
//   [C in ColumnOutputs[number] as ColumnName<C>]: C;
// };

// function Column<
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
//   ColumnOutputs
// > = ColumnOutputs extends readonly ColumnOutputUnion[]
//   ? {
//       name: Name;
//       columns: TransformColumns<ColumnOutputs>;
//     }
//   : never;

// function Table<Name extends string, ColumnOutputs>({
//   name,
//   columns,
// }: TableInput<Name, ColumnOutputs>): TableOutput<Name, ColumnOutputs> {
//   return {
//     name,
//     columns: Object.fromEntries(columns.map((column) => [column.name, column])),
//   };
// }

// const table = Table({
//   name: "product",
//   columns: [
//     Column({ name: "id", type: "number", nullable: false }),
//     Column({ name: "name", type: "string", nullable: false }),
//     Column({ name: "price", type: "number", nullable: false }),
//   ],
// });

////////////////////////////////////////////////////////////////////////////////////////////////////

// const array = [true, 0, "string"] as const;
// const element = array.find((value) => value === "string")!;

// type A = ["a", "b", "c"];
// type B = "b" extends A[infer Index & keyof A] ? Index : never;

////////////////////////////////////////////////////////////////////////////////////////////////////

// type OptionalProperty<
//   Property extends string,
//   Type extends ParentType,
//   ParentType,
//   Default extends ParentType
// > = Type extends Default
//   ? {}
//   : { [K in Property]: Exclude<ParentType, Default> };

// type ColumnObject<
//   Name extends string,
//   ValueString extends ValueStrings,
//   Nullable extends boolean
// > = {
//   name: Name;
//   type: ValueString;
// } & OptionalProperty<"nullable", Nullable, boolean, false>;

// type ColumnObject<
//   Name extends string,
//   ValueString extends ValueStrings,
//   Nullable extends boolean
// > = {
//   name: Name;
//   type: ValueString;
// } & (Nullable extends true ? { nullable: true } : {});

////////////////////////////////////////////////////////////////////////////////////////////////////

// type ValueTypes = "boolean" | "number" | "string";

// type Infer<Str extends string> = Str extends `${infer A} ${infer B}`
//   ? A | Infer<B>
//   : Str;

// type ColumnType<
//   ValueTypeStr extends string,
//   ValueType extends Infer<ValueTypeStr>,
//   Nullable extends boolean
// > = {
//   type: ValueTypeStr;
//   nullable: Nullable;
// };

// function column<
//   ValueTypeStr extends string,
//   ValueType extends Infer<ValueTypeStr>,
//   Nullable extends boolean
// >(input: ColumnType<ValueTypeStr, ValueType, Nullable>) {
//   return input;
// }

// const col = column({ type: "boolean number", nullable: true });

////////////////////////////////////////////////////////////////////////////////////////////////////

// type Infer<Str extends ValueTypeString<ValueTypes>> =
//   Str extends `${infer A} ${infer B}`
//     ? B extends ValueTypeString<ValueTypes>
//       ? A | Infer<B>
//       : never
//     : Str;

// type ValueTypeString<ValueType extends ValueTypes> = boolean extends ValueType
//   ? `boolean${ValueTypeString<Exclude<ValueType, "boolean">>}`
//   : number extends ValueType
//   ? `number${ValueTypeString<Exclude<ValueType, "number">>}`
//   : string extends ValueType
//   ? `string${ValueTypeString<Exclude<ValueType, "string">>}`
//   : "";

// type X = boolean | number extends infer A | infer B ? A : never;
// type Spread<X> = X extends infer A | Exclude<X, A> ? true : false;

////////////////////////////////////////////////////////////////////////////////////////////////////

// type ValueTypes = "boolean" | "number" | "string";

// type ValueTypeString<ValueType extends ValueTypes> = boolean extends ValueType
//   ? `boolean${ValueTypeString<Exclude<ValueType, "boolean">>}`
//   : number extends ValueType
//   ? `number${ValueTypeString<Exclude<ValueType, "number">>}`
//   : string extends ValueType
//   ? `string${ValueTypeString<Exclude<ValueType, "string">>}`
//   : "";

// type ColumnType<
//   ValueType extends ValueTypes,
//   ValueTypeStr extends ValueTypeString<ValueType>,
//   Nullable extends boolean
// > = {
//   type: ValueTypeStr;
//   nullable: Nullable;
// };

// function column<
//   ValueType extends ValueTypes,
//   ValueTypeStr extends ValueTypeString<ValueType>,
//   Nullable extends boolean
// >(input: ColumnType<ValueType, ValueTypeStr, Nullable>) {
//   return input;
// }

// const col = column({ type: "number", nullable: true });

////////////////////////////////////////////////////////////////////////////////////////////////////

// type ValueTypes = "boolean" | "number" | "string";

// type ColumnType<ValueType extends ValueTypes, Nullable extends boolean> = {
//   type: ValueType;
//   nullable: Nullable;
// };

// function column<ValueType extends ValueTypes, Nullable extends boolean>(
//   input: ColumnType<ValueType, Nullable>
// ) {
//   return input;
// }

// const col = column({ type: "number", nullable: true });

////////////////////////////////////////////////////////////////////////////////////////////////////

// type Values = boolean | number | string | null;

// type ColumnType<Value extends Values> = {
//   type: boolean extends Value
//     ? "boolean"
//     : number extends Value
//     ? "number"
//     : string extends Value
//     ? "string"
//     : never;
//   nullable: null extends Value ? true : false;
// };

// function column<Value extends Values>(input: ColumnType<Value>) {
//   return input;
// }

// const col = column({ type: "boolean", nullable: true });

////////////////////////////////////////////////////////////////////////////////////////////////////

// type Circular<Key extends string> = {
//   [K in Key]: (self: Circular<Key>) => number;
// };

// function circular<Type extends string>(object: Circular<Type>) {
//   return object;
// }

// const object = circular({ a: (self) => 1, b: (self) => self.a(self) + 2 });
