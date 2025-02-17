import { Pattern } from "../patterns/Pattern";
import { GrammarOptions } from "./Grammar";
export declare function patterns(strings: TemplateStringsArray, ...values: any): Record<string, Pattern>;
export declare function createPatternsTemplate(options: GrammarOptions): (strings: TemplateStringsArray, ...values: any) => Record<string, Pattern>;
