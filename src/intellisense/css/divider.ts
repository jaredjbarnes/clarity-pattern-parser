import { Regex } from "../../patterns/Regex";

const divider = new Regex(",", "\\s*[,]\\s*");
divider.setTokens([", "]);

export default divider;
