import OrComposite from "../../patterns/composite/OrComposite";
import Literal from "../../patterns/value/Literal";
import NotValue from "../../patterns/value/NotValue";
import OrValue from "../../patterns/value/OrValue";
import RepeatValue from "../../patterns/value/RepeatValue";
import AndValue from "../../patterns/value/AndValue";

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



