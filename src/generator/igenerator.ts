import { Pattern } from "../patterns/Pattern";

export interface IGenerator {
    generate(pattern: Pattern): string;
    setDepth(depth: number): void;
}