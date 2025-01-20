import { patterns } from "../grammar/patterns";
import { Context } from "./Context";
import { Literal } from "./Literal";
import { Reference } from "./Reference";
import { Sequence } from "./Sequence";

describe("Context", () => {
    test("Basic", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const jane = new Literal("jane", "Jane");
        const spaceReference = new Reference("space");

        const names = new Sequence("names", [john, spaceReference, jane]);
        const context = new Context("context", names, [space, names]);

        const { ast } = context.exec("John Jane");

        expect(ast?.toString()).toBe("John Jane");
    });

    test("With Grammar", ()=>{
        const {names} = patterns`
            names = john + space + jane
            john = "John"
            jane = "Jane"
            space = " "
        `;

        const { ast } = names.exec("John Jane");

        expect(ast?.toString()).toBe("John Jane");
    });

});