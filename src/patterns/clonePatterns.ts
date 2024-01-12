import { Pattern } from "./Pattern";

export function clonePatterns(patterns: Pattern[], isOptional?: boolean): Pattern[] {
    return patterns.map(p => p.clone(p.name, isOptional))
}