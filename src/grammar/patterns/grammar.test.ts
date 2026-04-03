import { grammar } from "./grammar";
import { Node } from "../../ast/Node";

describe("grammar", () => {
    test("syntax version", () => {
        const { ast } = grammar.exec("syntax 1.0");

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "syntax")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "syntax")?.value).toBe("syntax");
        expect(ast?.find((p: Node) => p.name === "syntaxVersion")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "syntaxVersion")?.value).toBe("1.0");
    });

    test("import", () => {
        const { ast } = grammar.exec('import {pattern} from "resource"');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "importStatement")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "import")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "import")?.value).toBe("import");
        expect(ast?.find((p: Node) => p.name === "patternName")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("pattern");
        expect(ast?.find((p: Node) => p.name === "from")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "from")?.value).toBe("from");
        expect(ast?.find((p: Node) => p.name === "resource")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "resource")?.value).toBe('"resource"');
    });

    test("import with params", () => {
        const { ast } = grammar.exec('import {pattern} from "resource" with params {param = "value"}');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "importStatement")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "import")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "import")?.value).toBe("import");
        expect(ast?.find((p: Node) => p.name === "patternName")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("pattern");
        expect(ast?.find((p: Node) => p.name === "from")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "from")?.value).toBe("from");
        expect(ast?.find((p: Node) => p.name === "resource")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "resource")?.value).toBe('"resource"');
        expect(ast?.find((p: Node) => p.name === "withParamsExpr")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "withParamsExpr")?.value).toBe("with params {param = \"value\"}");
        expect(ast?.find((p: Node) => p.name === "statements")?.find((p: Node) => p.name === "param = \"value\"")).toBeDefined();
    });

    test("use params", () => {
        const { ast } = grammar.exec('use params { param }');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "useParamsStatement")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "useParamsStatement")?.value).toBe("use params { param }");
        expect(ast?.find((p: Node) => p.name === "useParams")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "useParams")?.value).toBe("use params");
        expect(ast?.find((p: Node) => p.name === "useParamPatterns")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "useParamPatterns")?.value).toBe("param");
    });

    test("literal", () => {
        const { ast } = grammar.exec('literal = "Hello, world!"');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")?.value).toBe("literal = \"Hello, world!\"");
        expect(ast?.find((p: Node) => p.name === "patternName")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("literal");
        expect(ast?.find((p: Node) => p.name === "literal")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "literal")?.value).toBe("\"Hello, world!\"");
    });


    test("regex", () => {
        const { ast } = grammar.exec('regex = /Hello, world!/');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")?.value).toBe("regex = /Hello, world!/");
        expect(ast?.find((p: Node) => p.name === "patternName")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("regex");
        expect(ast?.find((p: Node) => p.name === "regex")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "regex")?.value).toBe("/Hello, world!/");
    });

    test("regex stops at first unescaped slash", () => {
        const { ast } = grammar.exec('expr = /regex/ + ("Text" <|> /regex/)');

        expect(ast).toBeDefined();
        const regexNodes = ast?.findAll((p: Node) => p.name === "regex");
        expect(regexNodes?.length).toBe(2);
        expect(regexNodes?.[0].value).toBe("/regex/");
        expect(regexNodes?.[1].value).toBe("/regex/");
    });

    test("regex allows escaped slashes", () => {
        const { ast } = grammar.exec('pattern = /a\\/b/');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "regex")?.value).toBe('/a\\/b/');
    });

    test("comment", () => {
        const { ast } = grammar.exec('# Comment');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "comment")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "comment")?.value).toBe("# Comment");
    });

    test("sequence", () => {
        const { ast } = grammar.exec('sequence = "Hello" + "world"');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")?.value).toBe("sequence = \"Hello\" + \"world\"");
        expect(ast?.find((p: Node) => p.name === "patternName")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("sequence");
        expect(ast?.find((p: Node) => p.name === "sequenceExpr")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "sequenceExpr")?.value).toBe("\"Hello\" + \"world\"");
    });

    test("options", () => {
        const { ast } = grammar.exec('options = "Hello" | "world"');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")?.value).toBe("options = \"Hello\" | \"world\"");
        expect(ast?.find((p: Node) => p.name === "patternName")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("options");
        expect(ast?.find((p: Node) => p.name === "optionsExpr")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "optionsExpr")?.value).toBe("\"Hello\" | \"world\"");
    });

    test("greedy options", () => {
        const { ast } = grammar.exec('greedyOptions = "Hello" <|> "world"');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")?.value).toBe("greedyOptions = \"Hello\" <|> \"world\"");
        expect(ast?.find((p: Node) => p.name === "patternName")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("greedyOptions");
        expect(ast?.find((p: Node) => p.name === "greedyOptionsExpr")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "greedyOptionsExpr")?.value).toBe("\"Hello\" <|> \"world\"");
    });

    test("repeat", () => {
        const { ast } = grammar.exec('repeat = (Hello)+');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")?.value).toBe("repeat = (Hello)+");
        expect(ast?.find((p: Node) => p.name === "patternName")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("repeat");
        expect(ast?.find((p: Node) => p.name === "repeatExpr")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "repeatExpr")?.value).toBe("(Hello)+");
    });

    test("repeat zero or more", () => {
        const { ast } = grammar.exec('repeat = (Hello)*');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")?.value).toBe("repeat = (Hello)*");
        expect(ast?.find((p: Node) => p.name === "patternName")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("repeat");
        expect(ast?.find((p: Node) => p.name === "repeatExpr")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "repeatExpr")?.value).toBe("(Hello)*");
    });

    test("repeat with bounds", () => {
        const { ast } = grammar.exec('repeat = (Hello){2, 4}');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")?.value).toBe("repeat = (Hello){2, 4}");
        expect(ast?.find((p: Node) => p.name === "patternName")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("repeat");
        expect(ast?.find((p: Node) => p.name === "repeatExpr")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "repeatExpr")?.value).toBe("(Hello){2, 4}");
    });

    test("repeat with upper limit", () => {
        const { ast } = grammar.exec('repeat = (Hello){, 4}');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")?.value).toBe("repeat = (Hello){, 4}");
        expect(ast?.find((p: Node) => p.name === "patternName")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("repeat");
        expect(ast?.find((p: Node) => p.name === "repeatExpr")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "repeatExpr")?.value).toBe("(Hello){, 4}");
    });

    test("repeat with lower limit", () => {
        const { ast } = grammar.exec('repeat = (Hello){1,}');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")?.value).toBe("repeat = (Hello){1,}");
        expect(ast?.find((p: Node) => p.name === "patternName")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("repeat");
        expect(ast?.find((p: Node) => p.name === "repeatExpr")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "repeatExpr")?.value).toBe("(Hello){1,}");
    });

    test("repeat with delimiter", () => {
        const { ast } = grammar.exec('repeat = (Hello, "world")+');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")?.value).toBe("repeat = (Hello, \"world\")+");
        expect(ast?.find((p: Node) => p.name === "patternName")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("repeat");
        expect(ast?.find((p: Node) => p.name === "repeatExpr")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "repeatExpr")?.value).toBe("(Hello, \"world\")+");
    });

    test("repeat with trim delimiter", () => {
        const { ast } = grammar.exec('repeat = (Hello, "world" trim)+');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternAssignment")?.value).toBe("repeat = (Hello, \"world\" trim)+");
        expect(ast?.find((p: Node) => p.name === "patternName")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("repeat");
        expect(ast?.find((p: Node) => p.name === "repeatExpr")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "repeatExpr")?.value).toBe("(Hello, \"world\" trim)+");
    });

    test("take until", () => {
        const { ast } = grammar.exec('script-text = ?->| "</script"');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "takeUntilExpr")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "takeUntilExpr")?.value).toBe('?->| "</script"');
        expect(ast?.find((p: Node) => p.name === "anyChar")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "upTo")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "wall")).toBeDefined();
    });

    test("import alias", () => {
        const { ast } = grammar.exec('import {value as alias} from "resource"');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "importAlias")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "patternName")?.value).toBe("value");
        expect(ast?.find((p: Node) => p.name === "as")?.value).toBe("as");
        expect(ast?.find((p: Node) => p.name === "importNameAlias")?.value).toBe("alias");
    });

    test("decorator without parens", () => {
        const { ast } = grammar.exec('@record\nspaces = /\\s+/');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "nameDecorationStatement")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "decorationName")?.value).toBe("record");
    });

    test("decorator with empty args", () => {
        const { ast } = grammar.exec('@tokens()\nspaces = /\\s+/');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "methodDecorationStatement")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "decorationName")?.value).toBe("tokens");
    });

    test("decorator with args", () => {
        const { ast } = grammar.exec('@tokens([" "])\nspaces = /\\s+/');

        expect(ast).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "methodDecorationStatement")).toBeDefined();
        expect(ast?.find((p: Node) => p.name === "decorationName")?.value).toBe("tokens");
        expect(ast?.find((p: Node) => p.name === "jsonArray")).toBeDefined();
    });

});