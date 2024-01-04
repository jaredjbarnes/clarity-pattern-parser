import ParseError from "./ParseError";
import Node from "../ast/Node";
import Pattern from "./Pattern";
import Cursor from "./Cursor";

export default class Literal extends Pattern {
  private _literal: string;
  private _node: Node | null = null;
  private _cursor!: Cursor;
  private _firstIndex: number = 0;
  private _substring: string = "";
  private _hasContextualTokenAggregation = false;

  constructor(name: string, literal: string, isOptional = false) {
    super("literal", name, [], isOptional);
    this._literal = literal;
    this.assertArguments();
  }

  private assertArguments() {
    if (this._literal.length < 1) {
      throw new Error(
        "Invalid Arguments: The `literal` argument needs to be at least one character long."
      );
    }
  }

  parse(cursor: Cursor) {
    this.resetState(cursor);
    this.tryToParse();

    return this._node;
  }

  private resetState(cursor: Cursor) {
    this._cursor = cursor;
    this._firstIndex = this._cursor.mark();
    this._substring = this._cursor.text.substring(
      this._firstIndex,
      this._firstIndex + this._literal.length
    );
    this._node = null;
  }

  private tryToParse() {
    if (this._substring === this._literal) {
      this.processResult();
    } else {
      this.processError();
    }
  }

  private processError() {
    this._node = null;

    if (!this._isOptional) {
      const message = `ParseError: Expected '${this._literal}' but found '${this._substring}'.`;
      const parseError = new ParseError(message, this._cursor.getIndex(), this);
      this._cursor.throwError(parseError);
    }
  }

  private processResult() {
    this._node = new Node(
      "literal",
      this.name,
      this._firstIndex,
      this._firstIndex + this._literal.length - 1,
      [],
      this._substring
    );

    this._cursor.index = this._node.lastIndex;
    this._cursor.addMatch(this, this._node);
  }

  clone(name = this._name, isOptional = this._isOptional) {
    const pattern = new Literal(name, this._literal, isOptional);
    pattern._hasContextualTokenAggregation =
      this._hasContextualTokenAggregation;
    return pattern;
  }

  getTokens() {
    const parent = this._parent;
    const hasParent = parent != null;

    if (this._hasContextualTokenAggregation && hasParent) {
      const aggregateTokens = [];
      const nextTokens = parent.getNextTokens(this);

      for (let nextToken of nextTokens) {
        aggregateTokens.push(this._literal + nextToken);
      }

      return aggregateTokens;
    }

    return [this._literal];
  }

  getNextTokens(_reference: Pattern): string[] {
    return [];
  }

  enableContextTokenAggregation() {
    this._hasContextualTokenAggregation = true;
  }

  disableContextTokenAggregation() {
    this._hasContextualTokenAggregation = false;
  }
}
