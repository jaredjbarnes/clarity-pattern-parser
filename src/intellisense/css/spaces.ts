import { Regex } from "../../patterns/Regex";

const spaces = new Regex("spaces", "\\s+");
spaces.setTokens([" "])

export default spaces;
