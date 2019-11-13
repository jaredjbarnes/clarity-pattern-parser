import CompositePattern from "./CompositePattern.js";
import CompositeNode from "../../ast/CompositeNode.js";
import ParseError from "../ParseError.js";
import OptionalComposite from "./OptionalComposite.js";

export default class RepeatComposite extends CompositePattern {
  constructor(name, pattern, divider) {
    super(name, divider != null ? [pattern, divider] : [pattern]);

    this._pattern = this.children[0];
    this._divider = this.children[1];

    this._assertArguments();
    this._reset();
  }

  _assertArguments() {
    if (this._pattern instanceof OptionalComposite) {
      throw new Error(
        "Invalid Arguments: The pattern cannot be a optional pattern."
      );
    }
  }

  _reset(cursor) {
    this.cursor = null;
    this.mark = null;
    this.nodes = [];

    if (cursor != null) {
      this.cursor = cursor;
      this.mark = this.cursor.mark();
    }
  }

  parse(cursor) {
    this._reset(cursor);
    this._tryPattern();

    return this.node;
  }

  _tryPattern() {
    while (true) {
      try {
        this.nodes.push(this._pattern.parse(this.cursor));
        this.cursor.next();

        if (this._divider != null) {
          const mark = this.cursor.mark();
          try{
            this.nodes.push(this._divider.parse(this.cursor));
            this.cursor.next();
          } catch(error){
            this.cursor.moveToMark(mark);
            this._processMatch();
            break;
          }
        }
      } catch (error) {
        this._processMatch();
        break;
      }
    }
  }

  _processMatch() {
    if (this.nodes.length === 0) {
      throw new ParseError(
        `Did not find a repeating match of ${this.name}.`,
        this.mark.index,
        this
      );
    } else {
      this.node = new CompositeNode(
        this.name,
        this.nodes[0].startIndex,
        this.nodes[this.nodes.length - 1].endIndex
      );

      this.node.children = this.nodes;
      this.cursor.setIndex(this.node.endIndex);
    }
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new RepeatComposite(name, this._pattern, this._divider);
  }
}
