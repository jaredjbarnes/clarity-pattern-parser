import { Regex } from "../../patterns/Regex";

const spaces = new Regex(" ", "\\s+");
spaces.setTokens([" "])

export default spaces;
