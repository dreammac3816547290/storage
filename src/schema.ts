import type {
  ArrayWarning,
  FixWarning,
  Intersect,
  IntersectWarnings,
  Warning,
} from "./util.js";

export type ColumnTypeStringUnion =
  | "boolean"
  | "number"
  | "string"
  | "reference";

export type _Name<T> = {
  name: T;
};

export type _Type<T> = {
  type: T;
};

export type _Nullable<T> = {
  nullable: T;
};

export type _Columns<T> = {
  columns: T;
};

export type ColumnName<Name extends string> = _Name<Name>;

export type ColumnType<TypeString extends ColumnTypeStringUnion> =
  _Type<TypeString>;

export type ColumnNullable<Nullable extends boolean> = _Nullable<Nullable>;

export type FixColumnInput<Input> = (Input extends ColumnName<infer Name>
  ? ColumnName<Name>
  : ColumnName<string>) &
  (Input extends ColumnType<infer TypeString>
    ? ColumnType<TypeString>
    : ColumnType<ColumnTypeStringUnion>) &
  (Input extends _Nullable<any>
    ? Input extends ColumnNullable<infer Nullable>
      ? ColumnNullable<Nullable>
      : ColumnNullable<boolean>
    : {});

export type ColumnOutput<Input> = IntersectWarnings<
  [
    Input extends ColumnName<infer Name>
      ? ColumnName<Name>
      : Warning<_Name<"string">>,
    Input extends ColumnType<infer TypeString>
      ? ColumnType<TypeString>
      : Warning<_Type<"'boolean' | 'number' | 'string' | 'reference'">>,
    Input extends _Nullable<any>
      ? Input extends ColumnNullable<infer Nullable>
        ? ColumnNullable<Nullable>
        : Warning<_Nullable<"boolean">>
      : {} // no nullable
  ]
>;

export function Column<Input>(
  input: Intersect<Input, FixColumnInput<Input>>
): ColumnOutput<Input> {
  return { nullable: false, ...input } as any;
}

export type TableName<Name extends string> = _Name<Name>;

export type TableColumns<Columns extends readonly any[]> = _Columns<Columns>; // check

export type FixTableInput<Input> = (Input extends TableName<infer Name>
  ? TableName<Name>
  : TableName<string>) &
  (Input extends TableColumns<infer Columns>
    ? FixWarning<Columns>
    : TableColumns<[]>);

export type TableOutput<Input> = IntersectWarnings<
  [
    Input extends TableName<infer Name>
      ? TableName<Name>
      : Warning<_Name<"string">>,
    Input extends TableColumns<infer Columns>
      ? ArrayWarning<Columns> extends Warning<infer Message>
        ? Warning<_Columns<Message>>
        : TableColumns<Columns>
      : Warning<_Columns<"array">>
  ]
>;

export function Table<Input>(
  input: Intersect<Input, FixTableInput<Input>>
): TableOutput<Input> {
  return {} as any;
}

export type FixSchemaInput<Input> = {};

export type SchemaOutput<Input> = {};

export function Schema<Input>(
  input: Intersect<Input, FixSchemaInput<Input>>
): SchemaOutput<Input> {
  return {} as any;
}

const column = Column({ name: "id", type: "number" } as const);

const table = Table({
  name: "product",
  columns: [
    Column({ name: "id", type: "number" } as const),
    Column({ name: "name", type: "string" } as const),
    Column({ name: "price", type: "number" } as const),
  ] as const,
} as const);
