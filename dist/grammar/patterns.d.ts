import type { Pattern } from "../patterns/Pattern";
import { type GrammarOptions } from "./Grammar";
export declare function patterns(strings: TemplateStringsArray, ...values: unknown[]): Record<string, Pattern>;
export declare function createPatternsTemplate(options: GrammarOptions): (strings: TemplateStringsArray, ...values: unknown[]) => Record<string, Pattern>;
