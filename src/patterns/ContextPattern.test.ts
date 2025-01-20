import { patterns } from "../grammar/patterns";
import { ContextPattern } from "./ContextPattern";
import { Literal } from "./Literal";
import { Reference } from "./Reference";
import { Sequence } from "./Sequence";

describe("ContextPattern", () => {
    test("Basic", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const jane = new Literal("jane", "Jane");
        const spaceReference = new Reference("space");

        const names = new Sequence("names", [john, spaceReference, jane]);
        const context = new ContextPattern("context", names, [space, names]);

        const { ast } = context.exec("John Jane");

        expect(ast?.toString()).toBe("John Jane");
    });

    test("With Grammar", ()=>{
        const {names} = patterns`
            john = "John"
            jane = "Jane"
            names = john + space + jane
            space = " "
        `;

        const { ast } = names.exec("John Jane");

        expect(ast?.toString()).toBe("John Jane");
    });
    
});