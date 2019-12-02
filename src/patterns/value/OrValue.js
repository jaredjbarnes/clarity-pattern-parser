import ValuePattern from "./ValuePattern.js";
import ValueNode from "../../ast/ValueNode.js";
import Cursor from "../../Cursor.js";
import StackInformation from "../StackInformation.js";
import OptionalValue from "./OptionalValue.js";
import ParseError from "../ParseError.js";

export default class OrValue extends ValuePattern {
  constructor(name, patterns) {
    super(name, patterns);
    this._assertArguments();
  }

  _assertArguments() {
    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: OrValue needs to have more than one value pattern."
      );
    }

    const hasOptionalChildren = this._children.some(
      pattern => pattern instanceof OptionalValue
    );

    if (hasOptionalChildren) {
      throw new Error("OrValues cannot have optional values.");
    }
  }

  _reset(cursor, parseError) {
    this.cursor = null;
    this.mark = null;
    this.index = 0;
    this.errors = [];
    this.node = null;
    this.parseError = parseError;

    if (cursor != null) {
      this.cursor = cursor;
      this.mark = cursor.mark();
    }

    if (parseError == null){
      this.parseError = new ParseError();
    }
  }

  parse(cursor, parseError) {
    this._reset(cursor, parseError);
    this._assertCursor();
    this._tryPattern();

    return this.node;
  }

  _assertCursor() {
    if (!(this.cursor instanceof Cursor)) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
  }

  _tryPattern() {
    while (true) {
      const pattern = this._children[this.index];

      try {
        const node = pattern.parse(this.cursor, this.parseError);

        this.node = new ValueNode(
          this.name,
          node.value,
          node.startIndex,
          node.endIndex
        );

        this.cursor.setIndex(this.node.endIndex);
        break;
      } catch (error) {
        this.errors.push(error);

        if (this.index + 1 < this._children.length) {
          this.index++;
          this.cursor.moveToMark(this.mark);
        } else {
          this.throwError();
        }
      }
    }
  }

  throwError() {
    const error = this.errors.reduce((furthestError, nextError) => {
      if (furthestError.index > nextError.index) {
        return furthestError;
      } else {
        return nextError;
      }
    });

    error.stack.push(new StackInformation(this.mark, this));

    throw error;
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new OrValue(name, this._children);
  }

  getCurrentMark(){
    return this.mark;
  }
}
