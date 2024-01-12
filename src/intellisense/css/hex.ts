import { Regex } from "../../patterns/Regex";

const hex = new Regex("hex", "#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}");
hex.setTokens(["#000", "#FFF"]);

export default hex;
