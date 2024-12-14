import { And } from "../../patterns/And";
import { Repeat } from "../../patterns/Repeat";
import { Literal } from "../../patterns/Literal";
import { Regex } from "../../patterns/Regex";
import { spaces } from "./spaces";
import { literal } from "./literal";

const importKeyword = new Literal("import", "import");
const fromKeyword = new Literal("from", "from");
const openBracket = new Literal("open-bracket", "{");
const closeBracket = new Literal("close-bracket", "}");
const name = new Regex("import-name", "[^} ]+");
const importedNames = new Repeat("imported-names", name, { divider: spaces });
const optionalSpaces = spaces.clone("optional-spaces", true);
const newLine = new Regex("new-line", "(\\r?\\n)+");

const importStatement = new And("import-statment", [
    importKeyword,
    spaces,
    openBracket,
    optionalSpaces,
    importedNames,
    optionalSpaces,
    closeBracket,
    spaces,
    fromKeyword,
    spaces,
    literal.clone("url"),
    optionalSpaces,
    newLine
]);

export const importBlock = new Repeat(
    "import-block",
    importStatement,
    {
        divider: newLine,
        min: 0,
        trimDivider: true
    });