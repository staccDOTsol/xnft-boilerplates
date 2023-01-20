export type Truthy<T> = T extends false | "" | 0 | null | undefined ? never : T;
export declare const truthy: <T>(value: T) => value is Truthy<T>;
//# sourceMappingURL=truthy.d.ts.map