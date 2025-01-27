import { Pattern } from "./Pattern";
import { Reference } from "./Reference";

export function isRecursivePattern(pattern: Pattern) {
    let onPattern = pattern.parent;
    let depth = 0;

    while (onPattern != null) {
        if (onPattern.id === pattern.id) {
            depth++;
        }

        onPattern = onPattern.parent;

        if (depth > 1){
            return true;
        }
    }

    return false;
}