import CompositePattern from "./CompositePattern.js";
import CompositeNode from "../../ast/CompositeNode.js";
import ParseError from "../ParseError.js";
import OptionalComposite from "./OptionalComposite.js";
import Pattern from "../Pattern.js";

export default class RepeatComposite extends CompositePattern {
  constructor(name, pattern, divider) {
    super(
      "repeat-composite",
      name,
      divider != null ? [pattern, divider] : [pattern]
    );
    this._pattern = this.children[0];
    this._divider = this.children[1];
    this._assertArguments();
  }

  _assertArguments() {
    if (this._pattern instanceof OptionalComposite) {
      throw new Error(
        "Invalid Arguments: The pattern cannot be a optional pattern."
      );
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

      if (this.cursor.hasUnresolvedError()) {
        this._processMatch();
        break;
      } else {
        this.nodes.push(node);

        if (node.endIndex === this.cursor.lastIndex()) {
          this._processMatch();
          break;
        }

        this.cursor.next();

        if (this._divider != null) {
          const mark = this.cursor.mark();
          const node = this._divider.parse(this.cursor);

          if (this.cursor.hasUnresolvedError()) {
            this.cursor.moveToMark(mark);
            this._processMatch();
            break;
          } else {
            this.nodes.push(node);
            this.cursor.next();
          }
        }
      }
    }
  }

  _processMatch() {
    this.cursor.resolveError();

    if (this.nodes.length === 0) {
      this.cursor.throwError(
        new ParseError(
          `Did not find a repeating match of ${this.name}.`,
          this.mark,
          this
        )
      );
      this.node = null;
    } else {
      this.node = new CompositeNode(
        "repeat-composite",
        this.name,
        this.nodes[0].startIndex,
        this.nodes[this.nodes.length - 1].endIndex
      );

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

  getCurrentMark() {
    return this.mark;
  }

  getPossibilities(rootPattern) {
    if (rootPattern == null || !(rootPattern instanceof Pattern)) {
      rootPattern = this;
    }

    if (this._divider != null) {
      const dividerPossibilities = this._divider.getPossibilities(rootPattern);

      return this._pattern
        .getPossibilities(rootPattern)
        .map(possibility => {
          return dividerPossibilities.map(divider => {
            return `${possibility}${divider}`;
          });
        })
        .reduce((acc, value) => {
          return acc.concat(value);
        }, []);
    } else {
      return this._pattern.getPossibilities(rootPattern);
    }
  }
}
