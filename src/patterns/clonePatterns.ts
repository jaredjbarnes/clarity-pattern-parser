import { Pattern } from "./Pattern";

export function clonePatterns(patterns: Pattern[]): Pattern[] {
    return patterns.map(p => p.clone());
}