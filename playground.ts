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
