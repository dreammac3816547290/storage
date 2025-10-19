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
