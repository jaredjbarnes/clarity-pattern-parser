import type { Pattern } from "../patterns/Pattern";
import { Grammar, type GrammarOptions } from "./Grammar";

const kebabRegex = /-([a-z])/g;

function kebabToCamelCase(str: string) {
  return str.replace(kebabRegex, (_, char) => char.toUpperCase());
}

export function patterns(strings: TemplateStringsArray, ...values: unknown[]) {
  const combinedString = strings.reduce(
    (result, str, i) => result + str + (values[i] ? String(values[i]) : ""),
    ""
  );

  const result: Record<string, Pattern> = {};
  const patterns = Grammar.parseString(combinedString);

  Object.keys(patterns).forEach(k => {
    result[kebabToCamelCase(k)] = patterns[k];
  });

  return result;
}

export function createPatternsTemplate(options: GrammarOptions) {
  return function patterns(strings: TemplateStringsArray, ...values: unknown[]) {
    const combinedString = strings.reduce(
      (result, str, i) => result + str + (values[i] ? String(values[i]) : ""),
      ""
    );

    const result: Record<string, Pattern> = {};
    const patterns = Grammar.parseString(combinedString, options);

    Object.keys(patterns).forEach(k => {
      result[kebabToCamelCase(k)] = patterns[k];
    });

    return result;
  };
}
