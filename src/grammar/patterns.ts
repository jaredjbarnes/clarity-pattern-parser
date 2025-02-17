import { Pattern } from "../patterns/Pattern";
import { Grammar, GrammarOptions } from "./Grammar";

const kebabRegex = /-([a-z])/g; // Define the regex once

function kebabToCamelCase(str: string) {
    return str.replace(kebabRegex, (_, char) => char.toUpperCase());
}

export function patterns(strings: TemplateStringsArray, ...values: any) {
    const combinedString = strings.reduce(
        (result, str, i) => result + str + (values[i] || ''),
        ''
    );

    const result: Record<string, Pattern> = {};
    const patterns = Grammar.parseString(combinedString);

    Object.keys(patterns).forEach(k => {
        result[kebabToCamelCase(k)] = patterns[k];
    });

    return result;
}

export function createPatternsTemplate(options: GrammarOptions){
    return function patterns(strings: TemplateStringsArray, ...values: any) {
        const combinedString = strings.reduce(
            (result, str, i) => result + str + (values[i] || ''),
            ''
        );
    
        const result: Record<string, Pattern> = {};
        const patterns = Grammar.parseString(combinedString, options);
    
        Object.keys(patterns).forEach(k => {
            result[kebabToCamelCase(k)] = patterns[k];
        });
    
        return result;
    }
}