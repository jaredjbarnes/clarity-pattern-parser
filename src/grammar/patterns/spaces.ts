import { Regex } from "../../patterns/Regex";

export const spaces = new Regex("spaces", "[ \\t]+");
spaces.setTokens([" "]);