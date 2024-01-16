import { Regex } from "../../patterns/Regex";

const name = new Regex("name", "[a-zA-Z]+[a-zA-Z0-9_-]+");
name.setTokens(["rgba", "radial-gradient", "linear-gradient"]);

export default name;
