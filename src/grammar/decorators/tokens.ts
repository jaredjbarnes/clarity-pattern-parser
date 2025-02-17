import { Pattern } from "../../patterns/Pattern";
import { Regex } from "../../patterns/Regex";
import { Decorator } from "../Grammar";

export const tokens: Decorator = (pattern: Pattern, arg: any) => {
    if (pattern.type === "regex" && Array.isArray(arg)) {
        const regex = pattern as Regex;
        const tokens: string[] = [];

        arg.forEach(token => {
            if (typeof token === "string") {
                tokens.push(token);
            }
        });

        regex.setTokens(tokens);
    }
};