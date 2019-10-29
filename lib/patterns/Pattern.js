import Alternation from "./Alternation.js";
import Literal from "./Literal.js";
import Repetition from "./Repetition.js";
import Sequence from "./Sequence.js";

export default class Pattern {
    constructor(name, parsers) {}

    parse(cursor) {}

    static sequence(name, ...parsers) {
        return new Sequence(name, ...parsers);
    }
}
//# sourceMappingURL=Pattern.js.map