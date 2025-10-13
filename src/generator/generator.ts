import { Pattern } from "../patterns/Pattern";
import { IVisitor } from "./ivisitor";

export class Generator {
    private _visitor: IVisitor;
    private _depth = 1;
    private _usedPatterns: Set<string>;
    private _terminalPatterns = [
        "literal",
        "regex",
        "repeat",
        "finite-repeat",
        "infinite-repeat",
        "reference",
        "context",
        "expression"
    ];

    constructor(visitor: IVisitor, depth = 0) {
        this._usedPatterns = new Set();
        this._visitor = visitor;
        this._depth = depth;
    }

    setDepth(depth: number) {
        this._depth = depth;
    }

    generate(pattern: Pattern): string {
        this._visitor.begin(this);

        const body = this._walkUp(pattern, (pattern: Pattern, args: string[]) => {
            const type = pattern.type;
            this._usedPatterns.add(type);

            switch (type) {
                case "context": {
                    return this._visitor.context(pattern, this._depth);
                }
                case "expression": {
                    return this._visitor.expression(pattern, this._depth);
                }
                case "literal": {
                    return this._visitor.literal(pattern, this._depth);
                }
                case "not": {
                    return this._visitor.not(pattern, args, this._depth);
                }
                case "optional": {
                    return this._visitor.optional(pattern, args, this._depth);
                }
                case "options": {
                    return this._visitor.options(pattern, args, this._depth);
                }
                case "reference": {
                    return this._visitor.reference(pattern, this._depth);
                }
                case "regex": {
                    return this._visitor.regex(pattern, this._depth);
                }
                case "infinite-repeat": {
                    return this._visitor.infiniteRepeat(pattern, this._depth);
                }
                case "finite-repeat": {
                    return this._visitor.finiteRepeat(pattern, this._depth);
                }
                case "right-associated": {
                    return this._visitor.rightAssociated(pattern, args, this._depth);
                }
                case "sequence": {
                    return this._visitor.sequence(pattern, args, this._depth);
                }
                case "take-until": {
                    return this._visitor.takeUntil(pattern, args, this._depth);
                }
            }
            throw Error("Cannot find pattern.");
        });


        const header = this._visitor.header(Array.from(this._usedPatterns));
        const footer = this._visitor.footer();

        this._visitor.end();

        return `${header}${body}${footer}`;
    }

    private _walkUp(pattern: Pattern, callback: (pattern: Pattern, args: string[]) => string): string {
        const results: string[] = [];

        if (this._terminalPatterns.includes(pattern.type)) {
            return callback(pattern, []);
        }

        pattern.children.forEach(p => {
            this._depth++;
            results.push(this._walkUp(p, callback));
            this._depth--;
        });

        const filteredResults = results.filter(s => s.length > 0);

        return callback(pattern, filteredResults);
    }
}