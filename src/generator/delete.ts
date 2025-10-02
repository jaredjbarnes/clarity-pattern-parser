import { Context } from "../patterns/Context";
import { Expression } from "../patterns/Expression";
import { Literal } from "../patterns/Literal";
import { Reference } from "../patterns/Reference";
import { Repeat } from "../patterns/Repeat";
import { Sequence } from "../patterns/Sequence";
import { Options } from "../patterns/Options";
import { Optional } from "../patterns/Optional";
import { TakeUntil } from "../patterns/TakeUntil";

new Context("expression",
    new Expression("expression", [
        new Sequence("prefix-expression", [
            new Literal("pre", "pre"),
            new Reference("expression")
        ]),
        new Sequence("postfix-expression", [
            new Reference("expression"),
            new Literal("post", "post")
        ]),
        new Sequence("infix-expression", [
            new Reference("expression"),
            new Literal(" and ", " and "),
            new Reference("expression")
        ]),
        new Expression("item", [
            new Options("names", [
                new Literal("john", "John"),
                new Literal("Jane", "Jane")
            ]),
            new Reference("array")
        ])
    ]), [
    new Literal("john", "John"),
    new Options("names", [
        new Literal("john", "John"),
        new Literal("Jane", "Jane")
    ]),
    new Literal("space", "\\s+"),
    new Literal("comma", "\\s*,\\s*"),
    new Expression("item", [
        new Options("names", [
            new Literal("john", "John"),
            new Literal("Jane", "Jane")
        ]),
        new Reference("array")
    ]),
    new Repeat("items",
        new Expression("item", [
            new Options("names", [
                new Literal("john", "John"),
                new Literal("Jane", "Jane")
            ]),
            new Reference("array")
        ]), { min: 1, divider: new Literal("comma", "\\s*,\\s*") }),
    new Sequence("array", [
        new Literal("[", "["),
        new Optional("optional-space",
            new Literal("space", "\\s+")),
        new Optional("optional-items",
            new Repeat("items",
                new Expression("item", [
                    new Options("names", [
                        new Literal("john", "John"),
                        new Literal("Jane", "Jane")
                    ]),
                    new Reference("array")
                ]), { min: 1, divider: new Literal("comma", "\\s*,\\s*") })),
        new Optional("optional-space",
            new Literal("space", "\\s+")),
        new Literal("]", "]")
    ]),
    new Sequence("prefix-expression", [
        new Literal("pre", "pre"),
        new Reference("expression")
    ]),
    new Sequence("postfix-expression", [
        new Reference("expression"),
        new Literal("post", "post")
    ]),
    new Sequence("infix-expression", [
        new Reference("expression"),
        new Literal(" and ", " and "),
        new Reference("expression")
    ]),
    new TakeUntil("take-until",
        new Literal("</script", "</script"))
])