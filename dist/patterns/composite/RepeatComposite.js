import CompositePattern from "./CompositePattern";
import CompositeNode from "../../ast/CompositeNode";
import ParseError from "../ParseError";
import OptionalComposite from "./OptionalComposite";
export default class RepeatComposite extends CompositePattern {
    constructor(name, pattern, divider) {
        super("repeat-composite", name, divider != null ? [pattern, divider] : [pattern]);
        this.nodes = [];
        this.mark = 0;
        this.node = null;
        this._pattern = this.children[0];
        this._divider = this.children[1];
        this._assertArguments();
    }
    _assertArguments() {
        if (this._pattern instanceof OptionalComposite) {
            throw new Error("Invalid Arguments: The pattern cannot be a optional pattern.");
        }
    }
    _reset(cursor) {
        this.nodes = [];
        this.cursor = cursor;
        this.mark = this.cursor.mark();
    }
    parse(cursor) {
        this._reset(cursor);
        this._tryPattern();
        return this.node;
    }
    _tryPattern() {
        while (true) {
            const node = this._pattern.parse(this.cursor);
            if (this.cursor.hasUnresolvedError() || node == null) {
                this._processMatch();
                break;
            }
            else {
                this.nodes.push(node);
                if (node.endIndex === this.cursor.lastIndex()) {
                    this._processMatch();
                    break;
                }
                this.cursor.next();
                if (this._divider != null) {
                    const mark = this.cursor.mark();
                    const node = this._divider.parse(this.cursor);
                    if (this.cursor.hasUnresolvedError() || node == null) {
                        this.cursor.moveToMark(mark);
                        this._processMatch();
                        break;
                    }
                    else {
                        this.nodes.push(node);
                        if (node.endIndex === this.cursor.lastIndex()) {
                            this._processMatch();
                            break;
                        }
                        this.cursor.next();
                    }
                }
            }
        }
    }
    _processMatch() {
        const endsOnDivider = this.nodes.length % 2 === 0;
        this.cursor.resolveError();
        if (endsOnDivider) {
            this.cursor.throwError(new ParseError(`Did not find a repeating match of ${this.name}.`, this.mark, this));
            this.node = null;
        }
        else {
            this.node = new CompositeNode("repeat-composite", this.name, this.nodes[0].startIndex, this.nodes[this.nodes.length - 1].endIndex);
            this.node.children = this.nodes;
            this.cursor.index = this.node.endIndex;
            this.cursor.addMatch(this, this.node);
        }
    }
    clone(name) {
        if (typeof name !== "string") {
            name = this.name;
        }
        return new RepeatComposite(name, this._pattern, this._divider);
    }
    getTokens() {
        return this._pattern.getTokens();
    }
}
//# sourceMappingURL=RepeatComposite.js.map