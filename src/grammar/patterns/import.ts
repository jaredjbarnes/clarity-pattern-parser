import { Sequence } from "../../patterns/Sequence";
import { Repeat } from "../../patterns/Repeat";
import { Literal } from "../../patterns/Literal";
import { Regex } from "../../patterns/Regex";
import { literal } from "./literal";
import { Options } from "../../patterns/Options";
import { body } from "./body";
import { allSpaces, lineSpaces } from "./spaces";
import { Optional } from "../../patterns/Optional";

const optionalSpaces = new Optional("optional-spaces", allSpaces);
const optionalLineSpaces = new Optional("options-line-spaces", lineSpaces);

const importNameDivider = new Regex("import-name-divider", "(\\s+)?,(\\s+)?");
importNameDivider.setTokens([", "]);

const name = new Regex("import-name", "[^}\\s,]+");
name.setTokens(["[IMPORT_NAME]"]);

const importKeyword = new Literal("import", "import");
const useParamsKeyword = new Literal("use-params", "use params");
const asKeyword = new Literal("as", "as");
const fromKeyword = new Literal("from", "from");
const openBracket = new Literal("open-bracket", "{");
const closeBracket = new Literal("close-bracket", "}");

const importNameAlias = name.clone("import-name-alias");
const importAlias = new Sequence("import-alias", [name, lineSpaces, asKeyword, lineSpaces, importNameAlias]);
const importedNames = new Repeat("imported-names", new Options("import-names", [importAlias, name]), { divider: importNameDivider });
const paramName = name.clone("param-name");
const paramNames = new Repeat("param-names", paramName, { divider: importNameDivider });
const resource = literal.clone("resource");

const useParams = new Sequence("import-params", [
    useParamsKeyword,
    optionalLineSpaces,
    openBracket,
    optionalSpaces,
    paramNames,
    optionalSpaces,
    closeBracket
]);

const withParamsKeyword = new Literal("with-params", "with params");
const withParamsStatement = new Optional("optional-with-params-statement", new Sequence("with-params-statement", [
    withParamsKeyword,
    optionalLineSpaces,
    openBracket,
    optionalSpaces,
    body.clone("with-params-body"),
    optionalSpaces,
    closeBracket
]));

const importFromStatement = new Sequence("import-from", [
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

export const importStatement = new Options("import-statement", [
    useParams,
    importFromStatement
]);


