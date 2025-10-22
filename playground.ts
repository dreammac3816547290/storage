// type And<A extends boolean, B extends boolean> = A extends true
//   ? B extends true
//     ? true
//     : false
//   : false;

// type Or<A extends boolean, B extends boolean> = A extends true
//   ? true
//   : B extends true
//   ? true
//   : false;

// type Not<A extends boolean> = A extends true ? false : true;

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

type IsGreaterEqualStringReverse<
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
      : IsGreaterStringReverse<RestA, RestB>
    : never
  : never;

type IsGreaterEqualString<
  A extends string,
  B extends string
> = IsGreaterEqualStringReverse<Reverse<A>, Reverse<B>>;

type IsGreaterEqual<A extends number, B extends number> = IsGreaterEqualString<
  Stringify<A>,
  Stringify<B>
>;

type IsGreaterStringReverse<A extends string, B extends string> = A extends ""
  ? false
  : B extends ""
  ? true
  : A extends CombineNS<infer DigitA, infer RestA>
  ? B extends CombineNS<infer DigitB, infer RestB>
    ? IsEqual<RestA, RestB> extends true
      ? DigitB extends LessDigit<DigitA> // check DigitB < DigitA
        ? true
        : false
      : IsGreaterStringReverse<RestA, RestB>
    : never
  : never;

type IsGreaterString<
  A extends string,
  B extends string
> = IsGreaterStringReverse<Reverse<A>, Reverse<B>>;

type IsGreater<A extends number, B extends number> = IsGreaterString<
  Stringify<A>,
  Stringify<B>
>;

type A = IsGreaterEqual<10, 20>;
type B = IsGreaterEqual<10, 10>;
type C = IsGreaterEqual<20, 10>;
type D = IsGreater<10, 20>;
type E = IsGreater<10, 10>;
type F = IsGreater<20, 10>;

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

type AddStringReverse<
  A extends string,
  B extends string,
  Carry extends 0 | 1 = 0
> = A extends ""
  ? B extends ""
    ? Carry extends 0
      ? ""
      : "1"
    : AddStringReverse<B, Stringify<Carry>>
  : B extends ""
  ? AddStringReverse<A, Stringify<Carry>>
  : A extends CombineNS<infer DigitA, infer RestA>
  ? B extends CombineNS<infer DigitB, infer RestB>
    ? Reverse<
        Stringify<AddMap[Carry extends 0 ? DigitA : AddMap[DigitA][1]][DigitB]>
      > extends CombineNS<infer Digit, infer Rest>
      ? CombineNS<
          Digit,
          AddStringReverse<RestA, RestB, Rest extends "" ? 0 : 1>
        >
      : never
    : never
  : never;

type AddString<A extends string, B extends string> = Reverse<
  AddStringReverse<Reverse<A>, Reverse<B>>
>;

type Add<A extends number, B extends number> = StringToNumber<
  AddString<Stringify<A>, Stringify<B>>
>;

type A1 = Add<1589, 94321>;
type A2 = 12 extends Add<5, infer A> ? A : never;

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

type MultiplyStringReverse<
  A extends string,
  B extends string
> = A extends Stringify<Digits>
  ? B extends Stringify<Digits>
    ? Reverse<Stringify<MultiplyMap[StringToNumber<A>][StringToNumber<B>]>>
    : MultiplyStringReverse<B, A>
  : A extends CombineSS<infer DigitCharA, infer RestA>
  ? AddStringReverse<
      MultiplyStringReverse<DigitCharA, B>,
      CombineNS<0, MultiplyStringReverse<RestA, B>>
    >
  : never;

type MultiplyString<A extends string, B extends string> = Reverse<
  MultiplyStringReverse<Reverse<A>, Reverse<B>>
>;

type Multiply<A extends number, B extends number> = StringToNumber<
  MultiplyString<Stringify<A>, Stringify<B>>
>;

type M1 = Multiply<12345, 37>;

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

// function check<S>(text: S extends "a" ? S : never) {}

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
