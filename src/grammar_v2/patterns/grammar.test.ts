import fs from "fs";
import { grammar } from "./grammar";
import path from "path";

const dir = path.join(__dirname, "./cpat.cpat");
const text = fs.readFileSync(dir, "utf8");

describe("grammar", () => {
    test("syntax version", () => {
        const { ast, cursor } = grammar.exec("syntax 1.0", true);

        expect(ast).toBeDefined();
    });

    test("import", () => {
        const { ast, cursor } = grammar.exec('import {pattern} from "resource"', true);

        expect(ast).toBeDefined();
    });

    test("import with params", () => {
        const { ast, cursor } = grammar.exec('import {pattern} from "resource" with params {param = "value"}', true);

        expect(ast).toBeDefined();
    });

    test("use params", () => {
        const { ast, cursor } = grammar.exec('use params { param }', true);

        expect(ast).toBeDefined();
    });

    test("literal", () => {
        const { ast, cursor } = grammar.exec('literal = "Hello, world!"', true);

        expect(ast).toBeDefined();
    });

    test("regex", () => {
        const { ast, cursor } = grammar.exec('regex = /Hello, world!/', true);

        expect(ast).toBeDefined();
    });

    test("comment", () => {
        const { ast, cursor } = grammar.exec('# Comment', true);

        expect(ast).toBeDefined();
    });

    test("sequence", () => {
        const { ast, cursor } = grammar.exec('sequence = "Hello" + "world"', true);

        expect(ast).toBeDefined();
    });

    test("options", () => {
        const { ast, cursor } = grammar.exec('options = "Hello" | "world"', true);

        expect(ast).toBeDefined();
    });

    test("greedy options", () => {
        const { ast, cursor } = grammar.exec('greedyOptions = "Hello" <|> "world"', true);

        expect(ast).toBeDefined();
    });

    test("repeat", () => {
        const { ast, cursor } = grammar.exec('repeat = (Hello)+', true);

        expect(ast).toBeDefined();
    });

    test("repeat zero or more", () => {
        const { ast, cursor } = grammar.exec('repeat = (Hello)*', true);

        expect(ast).toBeDefined();
    });

    test("repeat with bounds", () => {
        const { ast, cursor } = grammar.exec('repeat = (Hello){2, 4}', true);

        expect(ast).toBeDefined();
    });

    test("repeat with upper limit", () => {
        const { ast, cursor } = grammar.exec('repeat = (Hello){, 4}', true);

        expect(ast).toBeDefined();
    });

    test("repeat with lower limit", () => {
        const { ast, cursor } = grammar.exec('repeat = (Hello){1,}', true);

        expect(ast).toBeDefined();
    });
    
    test("repeat with delimiter", () => {
        const { ast, cursor } = grammar.exec('repeat = (Hello, "world")+', true);

        expect(ast).toBeDefined();
    });

    test("repeat with trim delimiter", () => {
        const { ast, cursor } = grammar.exec('repeat = (Hello, "world" trim)+', true);

        expect(ast).toBeDefined();
    });

    test("cpat", () => {
        const { ast, cursor } = grammar.exec(text, true);

        expect(ast).toBeDefined();
    });


});