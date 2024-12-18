import { And } from "../../patterns/And";
import { Repeat } from "../../patterns/Repeat";
import { Literal } from "../../patterns/Literal";
import { Regex } from "../../patterns/Regex";
import { literal } from "./literal";
import { Or } from "../../patterns/Or";
import { body } from "./body";
import { allSpaces, lineSpaces } from "./spaces";

const importNameDivider = new Regex("import-name-divider", "(\\s+)?,(\\s+)?");
const importKeyword = new Literal("import", "import");
const useParamsKeyword = new Literal("use-params", "use params");
const fromKeyword = new Literal("from", "from");
const openBracket = new Literal("open-bracket", "{");
const closeBracket = new Literal("close-bracket", "}");
const name = new Regex("import-name", "[^}\\s,]+");
const importedNames = new Repeat("imported-names", name, { divider: importNameDivider });
const paramName = name.clone("param-name");
const paramNames = new Repeat("param-names", paramName, { divider: importNameDivider });
const optionalSpaces = allSpaces.clone("optional-spaces", true);
const optionalLineSpaces = lineSpaces.clone("options-line-spaces", true);
const resource = literal.clone("resource");

const useParams = new And("import-params", [
    useParamsKeyword,
    optionalLineSpaces,
    openBracket,
    optionalSpaces,
    paramNames,
    optionalSpaces,
    closeBracket
]);

const withParamsKeyword = new Literal("with-params", "with params");
const withParamsStatement = new And("with-params-statement", [
    withParamsKeyword,
    optionalLineSpaces,
    openBracket,
    optionalSpaces,
    body,
    optionalSpaces,
    closeBracket
], true);

const importFromStatement = new And("import-from", [
    importKeyword,
    optionalLineSpaces,
    openBracket,
    optionalSpaces,
    importedNames,
    optionalSpaces,
    closeBracket,
    optionalLineSpaces,
    fromKeyword,
    optionalLineSpaces,
    resource,
    optionalLineSpaces,
    withParamsStatement
]);

export const importStatement = new Or("import-statement", [
    useParams,
    importFromStatement
]);


