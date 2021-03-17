import CompositePattern from "./CompositePattern";
import CompositeNode from "../../ast/CompositeNode";
import ParseError from "../../patterns/ParseError";
import OptionalValue from "../value/OptionalValue";
import OptionalComposite from "./OptionalComposite";
import Permutor from "../../Permutor";
import Pattern from "../Pattern";
import Cursor from "../../Cursor";

const permutor = new Permutor();

export default class AndComposite extends CompositePattern {
  public index!: number;
  public nodes!: CompositeNode[];
  public node!: CompositeNode | null;
  public cursor!: Cursor;
  public mark!: number;

  constructor(name: string, patterns: Pattern[] = []) {
    super("and-composite", name, patterns);
    this._assertArguments();
  }

  private _assertArguments() {
    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: AndValue needs to have more than one value pattern."
      );
    }
  }

  private _reset(cursor: Cursor) {
    this.index = 0;
    this.nodes = [];
    this.node = null;
    this.cursor = cursor;
    this.mark = this.cursor.mark();
  }

  parse(cursor: Cursor) {
    this._reset(cursor);
    this._tryPatterns();

    return this.node;
  }

  private _tryPatterns() {
    while (true) {
      const pattern = this._children[this.index];
      const node = pattern.parse(this.cursor) as CompositeNode;

      if (this.cursor.hasUnresolvedError()) {
        this.cursor.moveToMark(this.mark);
        break;
      } else {
        this.nodes.push(node);
      }

      if (!this._next()) {
        this._processValue();
        break;
      }
    }
  }

  private _next() {
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

  private _hasMorePatterns() {
    return this.index + 1 < this._children.length;
  }

  private _assertRestOfPatternsAreOptional() {
    const areTheRestOptional = this.children.every((pattern, index) => {
      return (
        index <= this.index ||
        pattern instanceof OptionalValue ||
        pattern instanceof OptionalComposite
      );
    });

    if (!areTheRestOptional) {
      const parseError = new ParseError(
        `Could not match ${this.name} before string ran out.`,
        this.index,
        this
      );
      this.cursor.throwError(parseError);
    }
  }

  private _processValue() {
    if (!this.cursor.hasUnresolvedError()) {
      this.nodes = this.nodes.filter((node) => node != null);

      const lastNode = this.nodes[this.nodes.length - 1];
      const startIndex = this.mark;
      const endIndex = lastNode.endIndex;

      this.node = new CompositeNode(
        "and-composite",
        this.name,
        startIndex,
        endIndex
      );

      this.node.children = this.nodes;

      this.cursor.index = this.node.endIndex;
      this.cursor.addMatch(this, this.node);
    } else {
      this.node = null;
    }
  }

  clone(name?: string) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new AndComposite(name, this._children);
  }

  getPossibilities(rootPattern?: Pattern) {
    if (rootPattern == null || !(rootPattern instanceof Pattern)) {
      rootPattern = this;
    }

    const possibilities = this.children.map((child) =>
      child.getPossibilities(rootPattern)
    );
    return permutor.permute(possibilities);
  }

  getTokens() {
    let tokens: string[] = [];

    for (let x = 0; x < this._children.length; x++) {
      const child = this._children[x];

      if (
        child instanceof OptionalValue ||
        child instanceof OptionalComposite
      ) {
        tokens = tokens.concat(child.getTokens());
      } else {
        tokens = tokens.concat(child.getTokens());
        break;
      }
    }

    return tokens;
  }
}
