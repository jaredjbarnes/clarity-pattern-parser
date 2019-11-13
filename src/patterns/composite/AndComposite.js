import CompositePattern from "./CompositePattern.js";
import CompositeNode from "../../ast/CompositeNode.js";
import Cursor from "../../Cursor.js";
import ParseError from "../../patterns/ParseError.js";
import StackInformation from "../StackInformation.js";
import OptionalValue from "../value/OptionalValue.js";
import OptionalComposite from "./OptionalComposite.js";

export default class AndComposite extends CompositePattern {
  constructor(name, patterns) {
    super(name, patterns);
    this._assertArguments();
  }

  _assertArguments() {
    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: AndValue needs to have more than one value pattern."
      );
    }
  }

  _reset(cursor) {
    this.cursor = null;
    this.index = 0;
    this.nodes = [];
    this.node = null;

    if (cursor != null) {
      this.cursor = cursor;
      this.mark = this.cursor.mark();
    }
  }

  parse(cursor) {
    this._reset(cursor);
    this._assertCursor();
    this._tryPatterns();

    return this.node;
  }

  _assertCursor() {
    if (!(this.cursor instanceof Cursor)) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
  }

  _tryPatterns() {
    while (true) {
      const pattern = this._children[this.index];

      try {
        this.nodes.push(pattern.parse(this.cursor));
      } catch (error) {
        error.stack.push(new StackInformation(this.mark, this));
        throw error;
      }

      if (!this._next()) {
        this._processValue();
        break;
      }
    }
  }

  _next() {
    if (this._hasMorePatterns()) {
      if (this.cursor.hasNext()) {
        // If the last result was a failed optional, then don't increment the cursor.
        if (this.nodes[this.nodes.length - 1] != null) {
          this.cursor.next();
        }

        this.index++;
        return true;
      } else if (this.nodes[this.nodes.length - 1] == null) {
        this.index++;
        return true;
      }

      this._assertRestOfPatternsAreOptional();
      return false;
    } else {
      return false;
    }
  }

  _hasMorePatterns() {
    return this.index + 1 < this._children.length;
  }

  _assertRestOfPatternsAreOptional() {
    const areTheRestOptional = this.children.every((pattern, index) => {
      return (
        index <= this.index ||
        pattern instanceof OptionalValue ||
        pattern instanceof OptionalComposite
      );
    });

    if (!areTheRestOptional) {
      throw new ParseError(
        `Could not match ${this.name} before string ran out.`
      );
    }
  }

  _processValue() {
    this.nodes = this.nodes.filter(node => node != null);

    const lastNode = this.nodes[this.nodes.length - 1];
    const startIndex = this.mark.index;
    const endIndex = lastNode.endIndex;

    this.node = new CompositeNode(this.name, startIndex, endIndex);
    this.node.children = this.nodes;

    this.cursor.setIndex(this.node.endIndex);
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new AndComposite(name, this._children);
  }
}
