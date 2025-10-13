import { Pattern } from "../patterns/Pattern";
import { IGenerator } from "./igenerator";

export interface IVisitor {
    begin(generator: IGenerator): void;
    end(): void;
    header(usedPatterns: string[]): string;
    footer(): string;

    context(pattern: Pattern, depth: number): string;
    expression(pattern: Pattern, depth: number): string;
    literal(pattern: Pattern, depth: number): string;
    not(pattern: Pattern, args: string[], depth: number): string;
    optional(pattern: Pattern, args: string[], depth: number): string;
    options(pattern: Pattern, args: string[], depth: number): string;
    reference(pattern: Pattern, depth: number): string;

    regex(pattern: Pattern, depth: number): string;
    infiniteRepeat(pattern: Pattern, depth: number): string;
    finiteRepeat(pattern: Pattern, depth: number): string
    rightAssociated(pattern: Pattern, args: string[], depth: number): string;
    sequence(pattern: Pattern, args: string[], depth: number): string;
    takeUntil(pattern: Pattern, args: string[], depth: number): string;
}