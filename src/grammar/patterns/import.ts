import { And } from "../../patterns/And";
import { Repeat } from "../../patterns/Repeat";
import { Literal } from "../../patterns/Literal";
import { Regex } from "../../patterns/Regex";
import { literal } from "./literal";

const spaces = new Regex("spaces", "\\s+", true);
const importNameDivider = new Regex("import-name-divider", "(\\s+)?,(\\s+)?");
const importKeyword = new Literal("import", "import");
const fromKeyword = new Literal("from", "from");
const openBracket = new Literal("open-bracket", "{");
const closeBracket = new Literal("close-bracket", "}");
const name = new Regex("import-name", "[^}\\s,]+");
const importedNames = new Repeat("imported-names", name, { divider: importNameDivider });
const optionalSpaces = spaces.clone("optional-spaces", true);

export const importStatement = new And("import-statement", [
    importKeyword,
    optionalSpaces,
    openBracket,
    optionalSpaces,
    importedNames,
    optionalSpaces,
    closeBracket,
    optionalSpaces,
    fromKeyword,
    spaces,
    literal.clone("url"),
]);
