import Cursor from "./Cursor";
export default class TextSuggester {
    constructor() {
        this.cursor = null;
        this.result = null;
        this.text = "";
        this.match = null;
        this.error = null;
        this.patternMatch = null;
        this.matchedText = "";
        this.rootPattern = null;
        this.tokens = {
            startIndex: 0,
            values: [],
        };
        this.options = [];
        this.parseStack = [];
    }
    suggest(text, pattern) {
        var _a, _b, _c;
        this.reset();
        this.text = text;
        this.rootPattern = pattern;
        // If no text all options are available.
        if (text.length === 0) {
            return {
                pattern: null,
                astNode: null,
                match: null,
                error: null,
                options: {
                    startIndex: 0,
                    values: pattern.getTokens(),
                },
                isComplete: false,
                parseStack: [],
            };
        }
        this.parse();
        this.saveParseStack();
        this.saveMatchedText();
        this.saveMatch();
        this.saveError();
        this.saveOptions();
        this.saveNextToken();
        return {
            pattern: ((_a = this.patternMatch) === null || _a === void 0 ? void 0 : _a.pattern) || null,
            astNode: ((_b = this.patternMatch) === null || _b === void 0 ? void 0 : _b.astNode) || null,
            match: this.match,
            error: this.error,
            options: this.tokens,
            isComplete: ((_c = this.cursor) === null || _c === void 0 ? void 0 : _c.didSuccessfullyParse()) || false,
            parseStack: this.parseStack,
        };
    }
    reset() {
        this.cursor = null;
        this.result = null;
        this.text = "";
        this.match = null;
        this.error = null;
        this.patternMatch = null;
        this.matchedText = "";
        this.rootPattern = null;
        this.tokens = {
            startIndex: 0,
            values: [],
        };
        this.options = [];
        this.parseStack = [];
    }
    parse() {
        var _a;
        this.rootPattern = this.rootPattern;
        this.cursor = new Cursor(this.text || "");
        this.cursor.startRecording();
        this.result = ((_a = this.rootPattern) === null || _a === void 0 ? void 0 : _a.parse(this.cursor)) || null;
        this.patternMatch = this.cursor.lastMatch;
    }
    saveParseStack() {
        var _a;
        this.parseStack = ((_a = this.cursor) === null || _a === void 0 ? void 0 : _a.history.getLastParseStack()) || [];
    }
    saveMatchedText() {
        var _a, _b;
        if (((_a = this.patternMatch) === null || _a === void 0 ? void 0 : _a.astNode) != null) {
            this.matchedText =
                ((_b = this.text) === null || _b === void 0 ? void 0 : _b.substring(0, this.patternMatch.astNode.endIndex + 1)) || "";
        }
    }
    saveMatch() {
        var _a;
        const node = (_a = this.patternMatch) === null || _a === void 0 ? void 0 : _a.astNode;
        if (node == null) {
            this.match = null;
            return;
        }
        let endIndex = this.matchedText.length - 1;
        this.match = {
            text: this.matchedText,
            startIndex: 0,
            endIndex: endIndex,
        };
    }
    saveError() {
        var _a;
        if (((_a = this.patternMatch) === null || _a === void 0 ? void 0 : _a.astNode) == null) {
            this.error = {
                startIndex: 0,
                endIndex: this.text.length - 1,
                text: this.text,
            };
            return this;
        }
        if (this.patternMatch != null &&
            this.text.length > this.matchedText.length) {
            const difference = this.text.length - this.matchedText.length;
            const startIndex = this.patternMatch.astNode.endIndex + 1;
            const endIndex = startIndex + difference - 1;
            this.error = {
                startIndex: startIndex,
                endIndex: endIndex,
                text: this.text.substring(startIndex, endIndex + 1),
            };
            return;
        }
        else {
            this.error = null;
            return;
        }
    }
    saveNextToken() {
        var _a, _b, _c, _d;
        const isCompleteMatch = ((_a = this.patternMatch) === null || _a === void 0 ? void 0 : _a.pattern) === this.rootPattern &&
            ((_b = this.cursor) === null || _b === void 0 ? void 0 : _b.didSuccessfullyParse());
        const noMatch = ((_c = this.patternMatch) === null || _c === void 0 ? void 0 : _c.astNode) == null;
        if (isCompleteMatch) {
            this.tokens = null;
            return;
        }
        if (noMatch) {
            let options = (_d = this.rootPattern) === null || _d === void 0 ? void 0 : _d.getTokens();
            options = options === null || options === void 0 ? void 0 : options.filter((option) => {
                return option.indexOf(this.text) > -1;
            });
            if ((options === null || options === void 0 ? void 0 : options.length) === 0) {
                this.tokens = null;
                return;
            }
            const values = options === null || options === void 0 ? void 0 : options.map((option) => {
                const parts = option.split(this.text);
                return parts[1];
            });
            this.tokens = {
                startIndex: 0,
                values: values || [],
            };
            this.matchedText = this.text;
            this.match = {
                text: this.text,
                startIndex: 0,
                endIndex: this.text.length - 1,
            };
            this.error = null;
            return;
        }
        const options = this.options;
        let startIndex = this.matchedText.length;
        if (this.matchedText.length < this.text.length) {
            const leftOver = this.text.substring(this.matchedText.length);
            const partialMatchOptions = options
                .filter((option) => {
                return option.indexOf(leftOver) === 0;
            })
                .map((option) => {
                return option.substring(leftOver.length);
            });
            if (partialMatchOptions.length === 0) {
                this.tokens = null;
                return;
            }
            else {
                if (this.match == null) {
                    return;
                }
                this.match = {
                    text: this.match.text + leftOver,
                    startIndex: this.match.startIndex,
                    endIndex: this.match.endIndex + leftOver.length,
                };
                this.error = null;
                this.tokens = {
                    startIndex: this.match.endIndex + 1,
                    values: partialMatchOptions,
                };
                return;
            }
        }
        this.tokens = {
            startIndex,
            values: options,
        };
    }
    saveOptions() {
        const parents = new Map();
        const cursor = this.cursor;
        if (cursor == null) {
            this.options = [];
            return;
        }
        const furthestMatches = cursor.history.astNodes.reduce((acc, node, index) => {
            const pattern = cursor.history.patterns[index];
            const parent = pattern.parent;
            if (parent != null) {
                parents.set(parent, parent);
            }
            if (parents.has(pattern)) {
                return acc;
            }
            if (node.endIndex === acc.furthestTextIndex) {
                acc.nodeIndexes.push(index);
            }
            else if (node.endIndex > acc.furthestTextIndex) {
                acc.furthestTextIndex = node.endIndex;
                acc.nodeIndexes = [index];
            }
            return acc;
        }, { furthestTextIndex: -1, nodeIndexes: [] });
        const matches = furthestMatches.nodeIndexes.reduce((acc, index) => {
            var _a;
            const pattern = (_a = this.cursor) === null || _a === void 0 ? void 0 : _a.history.patterns[index];
            const tokens = pattern === null || pattern === void 0 ? void 0 : pattern.getNextTokens();
            tokens === null || tokens === void 0 ? void 0 : tokens.forEach((token) => {
                acc[token] = true;
            });
            return acc;
        }, {});
        this.options = Object.keys(matches);
    }
    static suggest(text, pattern) {
        return new TextSuggester().suggest(text, pattern);
    }
}
//# sourceMappingURL=TextSuggester.js.map