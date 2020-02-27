import { RegexValue } from "../../index.js";

const hex = new RegexValue("#______", "#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}");

export default hex;
