import 'array.prototype.flatmap/auto';
export type Lines = string | typeof whitespace | Lines[];
declare const whitespace: unique symbol;
export declare function formatLines(...lines: Lines[]): string;
export declare function formatLinesWithSpaces(spacesPerIndent: number, ...lines: Lines[]): string;
export declare function spaceBetween(...lines: Lines[][]): Lines[];
export {};
//# sourceMappingURL=format-lines.d.ts.map