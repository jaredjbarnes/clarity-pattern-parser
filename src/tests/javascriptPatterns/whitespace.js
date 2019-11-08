import OrComposite from "../../patterns/composite/OrComposite.js";
import Literal from "../../patterns/value/Literal.js";
import NotValue from "../../patterns/value/NotValue.js";
import OrValue from "../../patterns/value/OrValue.js";
import RepeatValue from "../../patterns/value/RepeatValue.js";
import AndValue from "../../patterns/value/AndValue.js";

const space = new Literal("space", " ");
const tab = new Literal("tab", "\t");
const newLine = new Literal("new-line", "\n");
const carriageReturn = new Literal("carriage-return", "\r");
const windowsReturn = new Literal("windows-return", "\r\n");
const doubleForwardSlash = new Literal("double-forward-slash", "//");
const slashStar = new Literal("slash-star", "/*");
const starSlash = new Literal("star-slash", "*/");

const lineEnd = new OrValue("lineEnd", [
    windowsReturn,
    newLine,
    carriageReturn
  ]);

const lineCommentContent = new RepeatValue("line-comment-content", new NotValue("not-line-end", lineEnd));
const blockCommentContent = new RepeatValue("block-comment-content", new NotValue("not-start-slash", starSlash));

const lineComment = new AndValue("line-comment", [
    doubleForwardSlash,
    lineCommentContent,
    lineEnd
]);

const blockComment = new AndValue("block-comment", [
    slashStar,
    blockCommentContent,
    starSlash
]);

const whitespace = new OrComposite("whitespace", [
    space,
    tab,
    lineComment,
    blockComment
]);

export default whitespace;



