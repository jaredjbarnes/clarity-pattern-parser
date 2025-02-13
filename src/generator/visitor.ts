import { RepeatOptions } from "../patterns/Repeat";

export interface Visitor {
    header?: () => string;
    footer?: () => string;

    context(name: string, pattern: string, context: string[]):string;
    expression(name: string, patterns: string[]):string;
    literal(name: string, token: string): string;
    not(name: string, pattern: string): string;
    optional(name: string, pattern: string): string;
    options(name: string, patterns: string[]): string;
    reference(name: string): string;

    regex(name: string, regexString): string;
    repeat(name: string, pattern: string, options: RepeatOptions): string;
    "right-associated"(): string;
    sequence(name: string, patterns: string[]): string;
}