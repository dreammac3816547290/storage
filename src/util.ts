export type Intersect<A, B> = A extends object
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

export type Warning<Message extends object> = {
  warning: Message;
};

export type IntersectWarnings<T extends readonly any[]> = T extends []
  ? {}
  : T extends [infer Head, ...infer Rest]
  ? Head extends Warning<infer HeadMessage>
    ? IntersectWarnings<Rest> extends Warning<infer RestMessage> // head is warning
      ? Warning<HeadMessage & RestMessage> // both warning
      : Warning<HeadMessage> // only head warning
    : IntersectWarnings<Rest> extends Warning<infer RestMessage> // head is not warning
    ? Warning<RestMessage> // only rest warning
    : Head & IntersectWarnings<Rest> // no warning
  : never;
