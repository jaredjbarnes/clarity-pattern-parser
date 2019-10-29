export default class Or {
  constructor(parsers) {
    this.parsers = parsers.map(parser => parser.clone());
    this.cursor = null;
    this.index = 0;
    this.mark = null;
    this.errors = [];

    this.assertParsers();
  }

  assertParsers() {
    this.parsers.forEach(parser => {
      if (typeof parser.parse !== "function") {
        throw new Error(
          "Invalid Argument: An Alternation can only accept parsers."
        );
      }
    });

    if (this.parsers.length < 2) {
      throw new Error(
        "Invalid Arguments: An Alternation needs at least two options."
      );
    }
  }

  parse(cursor) {
    this.reset(cursor);
    this.tryParser();
  }

  reset(cursor) {
    this.cursor = cursor;
    this.index = 0;
    this.mark = this.cursor.mark();
    this.errors = [];
  }

  tryParser() {
    const parser = this.parsers[this.index];

    try {
      return parser.parse(cursor);
    } catch (error) {
      this.errors.push(error);

      if (this.index + 1 < this.parsers.length) {
        this.index++;
        this.cursor.moveToMark(this.mark);
        return this.tryParser();
      }

      this.throwError();
    }
  }

  throwError() {
    const furthestError = this.errors.reduce((furthestError, error) => {
      return furthestError.index > error.index ? furthestError : error;
    });

    if (furthestError != null) {
      throw furthestError;
    }
  }

  clone(){
    return new Or(this.parsers);
  }
}
