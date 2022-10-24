import { Literal, Or, Repeat, And, Regex} from "../../index";


const space = new Literal("space", " ");
const tab = new Literal("tab", "\t");
const newLine = new Literal("new-line", "\n");
const carriageReturn = new Literal("carriage-return", "\r");
const windowsReturn = new Literal("windows-return", "\r\n");
const doubleForwardSlash = new Literal("double-forward-slash", "//");
const slashStar = new Literal("slash-star", "/*");
const starSlash = new Literal("star-slash", "*/");

const lineEnd = new Or("lineEnd", [
    windowsReturn,
    newLine,
    carriageReturn
  ]);

const lineCommentContent = new Repeat("line-comment-content", new Regex("not-line-end", "[^\r][^\n]|[^\n]"));
const blockCommentContent = new Repeat("block-comment-content", new Regex("not-start-slash", "[^*][^/]"));

const lineComment = new And("line-comment", [
    doubleForwardSlash,
    lineCommentContent,
    lineEnd
]);

const blockComment = new And("block-comment", [
    slashStar,
    blockCommentContent,
    starSlash
]);

const whitespace = new Or("whitespace", [
    space,
    tab,
    lineComment,
    blockComment
]);

export default whitespace;



