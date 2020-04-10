(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["clarityPatternParser"] = factory();
	else
		root["clarityPatternParser"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ast_Node_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Node", function() { return _ast_Node_js__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _ast_CompositeNode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CompositeNode", function() { return _ast_CompositeNode_js__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ValueNode", function() { return _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _Cursor_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Cursor", function() { return _Cursor_js__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _patterns_value_RegexValue_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RegexValue", function() { return _patterns_value_RegexValue_js__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _patterns_value_AndValue_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(11);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AndValue", function() { return _patterns_value_AndValue_js__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _patterns_value_AnyOfThese_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(14);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AnyOfThese", function() { return _patterns_value_AnyOfThese_js__WEBPACK_IMPORTED_MODULE_6__["default"]; });

/* harmony import */ var _patterns_value_Literal_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(15);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Literal", function() { return _patterns_value_Literal_js__WEBPACK_IMPORTED_MODULE_7__["default"]; });

/* harmony import */ var _patterns_value_NotValue_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(16);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "NotValue", function() { return _patterns_value_NotValue_js__WEBPACK_IMPORTED_MODULE_8__["default"]; });

/* harmony import */ var _patterns_value_OptionalValue_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(12);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "OptionalValue", function() { return _patterns_value_OptionalValue_js__WEBPACK_IMPORTED_MODULE_9__["default"]; });

/* harmony import */ var _patterns_value_OrValue_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(17);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "OrValue", function() { return _patterns_value_OrValue_js__WEBPACK_IMPORTED_MODULE_10__["default"]; });

/* harmony import */ var _patterns_value_RepeatValue_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(18);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RepeatValue", function() { return _patterns_value_RepeatValue_js__WEBPACK_IMPORTED_MODULE_11__["default"]; });

/* harmony import */ var _patterns_value_ValuePattern_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(9);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ValuePattern", function() { return _patterns_value_ValuePattern_js__WEBPACK_IMPORTED_MODULE_12__["default"]; });

/* harmony import */ var _patterns_composite_AndComposite_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(19);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AndComposite", function() { return _patterns_composite_AndComposite_js__WEBPACK_IMPORTED_MODULE_13__["default"]; });

/* harmony import */ var _patterns_composite_CompositePattern_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(20);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CompositePattern", function() { return _patterns_composite_CompositePattern_js__WEBPACK_IMPORTED_MODULE_14__["default"]; });

/* harmony import */ var _patterns_composite_OptionalComposite_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(21);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "OptionalComposite", function() { return _patterns_composite_OptionalComposite_js__WEBPACK_IMPORTED_MODULE_15__["default"]; });

/* harmony import */ var _patterns_composite_OrComposite_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(22);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "OrComposite", function() { return _patterns_composite_OrComposite_js__WEBPACK_IMPORTED_MODULE_16__["default"]; });

/* harmony import */ var _patterns_composite_RepeatComposite_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(23);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RepeatComposite", function() { return _patterns_composite_RepeatComposite_js__WEBPACK_IMPORTED_MODULE_17__["default"]; });

/* harmony import */ var _patterns_ParseError_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(8);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ParseError", function() { return _patterns_ParseError_js__WEBPACK_IMPORTED_MODULE_18__["default"]; });

/* harmony import */ var _patterns_Pattern_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(10);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Pattern", function() { return _patterns_Pattern_js__WEBPACK_IMPORTED_MODULE_19__["default"]; });

/* harmony import */ var _patterns_RecursivePattern_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(24);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RecursivePattern", function() { return _patterns_RecursivePattern_js__WEBPACK_IMPORTED_MODULE_20__["default"]; });

/* harmony import */ var _ParseInspector_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(25);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ParseInspector", function() { return _ParseInspector_js__WEBPACK_IMPORTED_MODULE_21__["default"]; });



























/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Node; });
class Node {
  constructor(type, name, startIndex, endIndex) {
    this.type = type;
    this.name = name;
    this.startIndex = startIndex;
    this.endIndex = endIndex;

    if (
      typeof this.startIndex !== "number" ||
      typeof this.endIndex !== "number"
    ) {
      throw new Error(
        "Invalid Arguments: startIndex and endIndex need to be number."
      );
    }
  }

  filter(){
    throw new Error("Not Implemented Exception: expected subclass to override this method.");
  }

  clone() {
    throw new Error(
      "Not Implemented Exception: expected subclass to override this method."
    );
  }

  toString() {
    throw new Error(
      "Not Implemented Exception: expected subclass to override this method."
    );
  }
}


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return CompositeNode; });
/* harmony import */ var _Node_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);


class CompositeNode extends _Node_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(type, name, startIndex = 0, endIndex = 0) {
    super(type, name, startIndex, endIndex);
    this.children = [];
  }

  clone() {
    const node = new CompositeNode(
      this.type,
      this.name,
      this.startIndex,
      this.endIndex
    );
    node.children = this.children.map(child => {
      return child.clone();
    });

    return node;
  }

  filter(shouldKeep, context = []) {
    const childrenContext = context.slice();
    childrenContext.push(this);

    Object.freeze(childrenContext);

    const matches = this.children.reduce((acc, child) => {
      return acc.concat(child.filter(shouldKeep, childrenContext));
    }, []);

    const match = shouldKeep(this, context);

    if (match) {
      matches.push(this);
    }

    return matches;
  }

  toString() {
    return this.children.map(child => child.toString()).join("");
  }
}


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ValueNode; });
/* harmony import */ var _Node_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);


class ValueNode extends _Node_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(type, name, value, startIndex = 0, endIndex = 0) {
    super(type, name, startIndex, endIndex);
    this.value = value;
  }

  clone() {
    return new ValueNode(this.type, this.name, this.value, this.startIndex, this.endIndex);
  }

  filter(shouldKeep, context){
    const match = shouldKeep(this, context);

    if (match){
      return [this];
    }

    return [];
  }

  toString(){
    return this.value;
  }
}


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Cursor; });
/* harmony import */ var _CursorHistory_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);


class Cursor {
  constructor(string) {
    this.string = string;
    this.assertValidity();


    this.index = 0;
    this.length = string.length;
    this.history = new _CursorHistory_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
    this.isInErrorState = false;
  }

  assertValidity() {
    if (this.isNullOrEmpty(this.string)) {
      throw new Error(
        "Illegal Argument: Cursor needs to have a string that has a length greater than 0."
      );
    }
  }

  startRecording(){
    this.history.startRecording();
  }

  stopRecording(){
    this.history.stopRecording();
  }

  get parseError (){
    return this.history.getFurthestError();
  }

  get lastMatch(){
    return this.history.getFurthestMatch();
  }

  throwError(parseError) {
    this.isInErrorState = true;
    this.history.addError(parseError);
  }

  addMatch(pattern, astNode){
    this.history.addMatch(pattern, astNode);
  }

  resolveError() {
    this.isInErrorState = false;
  }

  hasUnresolvedError() {
    return this.isInErrorState;
  }

  isNullOrEmpty(value) {
    return value == null || (typeof value === "string" && value.length === 0);
  }

  hasNext() {
    return this.index + 1 < this.string.length;
  }

  hasPrevious() {
    return this.index - 1 >= 0;
  }

  next() {
    if (this.hasNext()) {
      this.index++;
    } else {
      throw new Error("Cursor: Out of Bounds Exception.");
    }
  }

  previous() {
    if (this.hasPrevious()) {
      this.index--;
    } else {
      throw new Error("Cursor: Out of Bounds Exception.");
    }
  }

  mark() {
    return this.index;
  }

  moveToMark(mark) {
    this.index = mark;
  }

  moveToBeginning() {
    this.index = 0;
  }

  moveToEnd() {
    this.index = this.string.length - 1;
  }

  getChar() {
    return this.string.charAt(this.index);
  }

  getIndex() {
    return this.index;
  }

  setIndex(index) {
    if (typeof index === "number") {
      if (index < 0 || index > this.lastIndex()) {
        throw new Error("Cursor: Out of Bounds Exception.");
      }

      this.index = index;
    }
  }

  isAtBeginning() {
    return this.index === 0;
  }

  isAtEnd() {
    return this.index === this.string.length - 1;
  }

  lastIndex() {
    return this.length - 1;
  }

  didSuccessfullyParse(){
    return !this.hasUnresolvedError() && this.isAtEnd();
  }
}


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return CursorHistory; });
class CursorHistory {
  constructor() {
    this.isRecording = false;

    this.furthestMatch = {
      pattern: null,
      astNode: null,
    };

    this.furthestError = null;

    this.patterns = [];
    this.astNodes = [];
    this.errors = [];
  }

  addMatch(pattern, astNode) {
    if (this.isRecording) {
      this.patterns.push(pattern);
      this.astNodes.push(astNode);
    }

    if (
      this.furthestMatch.astNode == null ||
      astNode.endIndex >= this.furthestMatch.astNode.endIndex
    ) {
      this.furthestMatch.pattern = pattern;
      this.furthestMatch.astNode = astNode;
    }
  }

  addError(error) {
    if (this.isRecording) {
      this.errors.push(error);
    }

    if (this.furthestError == null || error.index >= this.furthestError.index) {
      this.furthestError = error;
    }
  }

  startRecording() {
    this.isRecording = true;
  }

  stopRecording() {
    this.isRecording = false;
    this.clear();
  }

  clear() {
    this.patterns.length = 0;
    this.astNodes.length = 0;
    this.errors.length = 0;
  }

  getFurthestError() {
    return this.furthestError;
  }

  getFurthestMatch() {
    return this.furthestMatch;
  }

  getLastMatch() {
    if (this.isRecording) {
      return {
        pattern: this.patterns[this.patterns.length - 1] || null,
        astNode: this.astNodes[this.astNodes.length - 1] || null,
      };
    } else {
      return this.furthestMatch;
    }
  }

  getLastError() {
    return this.errors[this.errors.length - 1] || null;
  }
}


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return RegexValue; });
/* harmony import */ var _ParseError_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _Cursor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9);





class RegexValue extends _ValuePattern_js__WEBPACK_IMPORTED_MODULE_3__["default"] {
  constructor(name, regex) {
    super("regex-value", name);
    this.regexString = regex;
    this.regex = new RegExp(`^${regex}`, "g");
    this._assertArguments();
  }

  _assertArguments() {
    if (typeof this.regexString !== "string") {
      throw new Error(
        "Invalid Arguments: The regex argument needs to be a string of regex."
      );
    }

    if (this.regexString.length < 1) {
      throw new Error(
        "Invalid Arguments: The regex string argument needs to be at least one character long."
      );
    }

    if (this.regexString.charAt(0) === "^") {
      throw new Error(
        "Invalid Arguments: The regex string cannot start with a '^' because it is expected to be in the middle of a string."
      );
    }

    if (this.regexString.charAt(this.regexString.length - 1) === "$") {
      throw new Error(
        "Invalid Arguments: The regex string cannot end with a '$' because it is expected to be in the middle of a string."
      );
    }
  }

  parse(cursor) {
    this._reset(cursor);
    this._tryPattern();

    return this.node;
  }

  _reset(cursor) {
    this.cursor = cursor;
    this.regex.lastIndex = 0;
    this.substring = this.cursor.string.substr(this.cursor.getIndex());
    this.node = null;
  }

  _tryPattern() {
    const result = this.regex.exec(this.substring);

    if (result != null && result.index === 0) {
      const currentIndex = this.cursor.getIndex();
      const newIndex = currentIndex + result[0].length - 1;

      this.node = new _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_2__["default"](
        "regex-value",
        this.name,
        result[0],
        currentIndex,
        newIndex
      );

      this.cursor.index = newIndex;
      this.cursor.addMatch(this, this.node);
    } else {
      this._processError();
    }
  }

  _processError() {
    const message = `ParseError: Expected regex pattern of '${this.regexString}' but found '${this.substring}'.`;
    const parseError = new _ParseError_js__WEBPACK_IMPORTED_MODULE_0__["default"](message, this.cursor.getIndex(), this);

    this.cursor.throwError(parseError);
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new RegexValue(name, this.regexString);
  }

  getPossibilities() {
    return [this.getTokenValue()];
  }

  getTokenValue() {
    return this.name;
  }

  getTokens() {
    return [this.name];
  }
}


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ParseError; });
class ParseError {
    constructor(message, index, pattern){
        this.message = message;
        this.name = 'ParseError';
        this.index = index;
        this.pattern = pattern;
    }
}

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ValuePattern; });
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);


class ValuePattern extends _Pattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(type, name, children = []) {
    super(type, name, children);
  }

  _assertChildren() {
    if (!Array.isArray(this._children)) {
      throw new Error(
        "Invalid Arguments: The patterns argument need to be an array of ValuePattern."
      );
    }

    const areAllPatterns = this._children.every(
      pattern => pattern instanceof ValuePattern || pattern instanceof _Pattern_js__WEBPACK_IMPORTED_MODULE_0__["default"]
    );

    if (!areAllPatterns) {
      throw new Error(
        "Invalid Argument: All patterns need to be an instance of ValuePattern."
      );
    }

    if (typeof this.name !== "string") {
      throw new Error(
        "Invalid Argument: ValuePatterns needs to have a name that's a string."
      );
    }

    if (typeof this.type !== "string") {
      throw new Error(
        "Invalid Argument: ValuePatterns needs to have a type that's a string."
      );
    }
  }

  clone() {
    throw new Error("Not Yet Implemented");
  }

}


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Pattern; });
/* harmony import */ var _Cursor_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);


class Pattern {
  constructor(type = null, name, children = []) {
    this._type = type;
    this._name = name;
    this._children = [];
    this._parent = null;
    this.isSequence = false;

    this._assertName();
    this.children = children;
  }

  _assertName() {
    if (typeof this.name !== "string") {
      throw new Error(
        "Invalid Argument: Patterns needs to have a name that's a string."
      );
    }
  }

  parse() {
    throw new Error("Method Not Implemented");
  }

  exec(string) {
    const cursor = new _Cursor_js__WEBPACK_IMPORTED_MODULE_0__["default"](string);
    const node = this.parse(cursor);

    if (cursor.didSuccessfullyParse()) {
      return node;
    } else {
      return null;
    }
  }

  test(string) {
    return this.exec(string) != null;
  }

  get name() {
    return this._name;
  }

  get type() {
    return this._type;
  }

  get parent() {
    return this._parent;
  }

  set parent(value) {
    if (value instanceof Pattern) {
      this._parent = value;
    }
  }

  get children() {
    return this._children;
  }

  set children(value) {
    this._children = value;
    this._cloneChildren();
    this._assertChildren();
    this._assignAsParent();
  }

  _assertChildren() {
    // Empty, meant to be overridden by subclasses.
  }

  _cloneChildren() {
    // We need to clone the patterns so nested patterns can be parsed.
    this._children = this._children.map((pattern) => {
      if (!(pattern instanceof Pattern)) {
        throw new Error(
          `The ${this.name} pattern has an invalid child pattern.`
        );
      }
      return pattern.clone();
    });

    // We need to freeze the childen so they aren't modified.
    Object.freeze(this._children);
  }

  _assignAsParent() {
    this._children.forEach((child) => (child.parent = this));
  }

  clone() {
    throw new Error("Method Not Implemented");
  }

  getPossibilities() {
    throw new Error("Method Not Implemented");
  }

  getTokens() {
    throw new Error("Method Not Implemented");
  }

  getNextTokens() {
    if (this._parent != null) {
      const siblings = this._parent.children;
      const index = siblings.findIndex((c) => c === this);
      const nextSibling = siblings[index + 1];

      // I don't like this, so I think we need to rethink this.
      if (this._parent.type.indexOf("repeat") === 0) {
        const tokens = this._parent.getNextTokens();
        if (index === 0 && siblings.length > 1) {
          return nextSibling.getTokens().concat(tokens);
        } else if (index === 1) {
          return siblings[0].getTokens().concat(tokens);
        } else {
          return this.getTokens().concat(tokens);
        }
      }

      // Another thing I don't like.
      if (
        this._parent.type.indexOf("and") === 0 &&
        nextSibling != null &&
        nextSibling.type.indexOf("optional") === 0
      ) {
        let tokens = [];

        for (let x = index + 1; x < siblings.length; x++) {
          const child = siblings[x];

          if (child.type.indexOf("optional") === 0) {
            tokens = tokens.concat(child.getTokens());
          } else {
            tokens = tokens.concat(child.getTokens());
            break;
          }

          if (x === siblings.length - 1) {
            tokens = tokens.concat(this._parent.getNextTokens());
          }
        }

        return tokens;
      }

      // If you are an or you have already qualified.
      if (this._parent.type.indexOf("or") === 0) {
        return this._parent.getNextTokens();
      }

      if (nextSibling != null) {
        return nextSibling.getTokens();
      } else {
        return this._parent.getNextTokens();
      }
    }

    return [];
  }

  getTokenValue() {
    return null;
  }
}


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return AndValue; });
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _patterns_ParseError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);
/* harmony import */ var _OptionalValue_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(12);
/* harmony import */ var _Permutor_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(13);
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(10);







const permutor = new _Permutor_js__WEBPACK_IMPORTED_MODULE_4__["default"]();

class AndValue extends _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, patterns) {
    super("and-value", name, patterns);
    this._assertArguments();
  }

  _assertArguments() {
    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: AndValue needs to have more than one value pattern."
      );
    }
  }

  _reset(cursor) {
    this.index = 0;
    this.nodes = [];
    this.node = null;
    this.cursor = cursor;
    this.mark = this.cursor.mark();
  }

  parse(cursor) {
    this._reset(cursor);
    this._tryPatterns();

    return this.node;
  }

  _tryPatterns() {
    while (true) {
      const pattern = this._children[this.index];
      const node = pattern.parse(this.cursor);

      if (this.cursor.hasUnresolvedError()) {
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

  _next() {
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

  _hasMorePatterns() {
    return this.index + 1 < this._children.length;
  }

  _assertRestOfPatternsAreOptional() {
    const areTheRestOptional = this.children.every((pattern, index) => {
      return index <= this.index || pattern instanceof _OptionalValue_js__WEBPACK_IMPORTED_MODULE_3__["default"];
    });

    if (!areTheRestOptional) {
      const parseError = new _patterns_ParseError_js__WEBPACK_IMPORTED_MODULE_2__["default"](
        `Could not match ${this.name} before string ran out.`,
        this.index,
        this
      );

      this.cursor.throwError(parseError);
    }
  }

  _processValue() {
    if (this.cursor.hasUnresolvedError()) {
      this.node = null;
    } else {
      this.nodes = this.nodes.filter((node) => node != null);

      const lastNode = this.nodes[this.nodes.length - 1];
      const startIndex = this.mark;
      const endIndex = lastNode.endIndex;
      const value = this.nodes.map((node) => node.value).join("");

      this.node = new _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__["default"](
        "and-value",
        this.name,
        value,
        startIndex,
        endIndex
      );

      this.cursor.index = this.node.endIndex;
      this.cursor.addMatch(this, this.node);
    }
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new AndValue(name, this._children);
  }

  getPossibilities(rootPattern) {
    if (rootPattern == null || !(rootPattern instanceof _Pattern_js__WEBPACK_IMPORTED_MODULE_5__["default"])) {
      rootPattern = this;
    }

    const possibilities = this.children.map((child) =>
      child.getPossibilities(rootPattern)
    );
    return permutor.permute(possibilities);
  }

  getTokens() {
    let tokens = [];

    for (let x = 0; x < this._children.length; x++) {
      const child = this._children[x];

      if (child instanceof _OptionalValue_js__WEBPACK_IMPORTED_MODULE_3__["default"]) {
        tokens = tokens.concat(child.getTokens());
      } else {
        tokens = tokens.concat(child.getTokens());
        break;
      }
    }

    return tokens;
  }
}


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return OptionalValue; });
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);



class OptionalValue extends _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(pattern) {
    super("optional-value", "optional-value", [pattern]);
    this._assertArguments();
  }

  _assertArguments() {
    if (!(this.children[0] instanceof _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"])) {
      throw new Error("Invalid Arguments: Expected a ValuePattern.");
    }
  }

  parse(cursor) {
    const mark = cursor.mark();

    const node = this.children[0].parse(cursor);

    if (cursor.hasUnresolvedError()) {
      cursor.resolveError();
      cursor.moveToMark(mark);
      return null;
    } else {
      cursor.addMatch(this, node);
      return node;
    }
  }

  clone() {
    return new OptionalValue(this.children[0]);
  }

  getPossibilities(rootPattern) {
    if (rootPattern == null || !(rootPattern instanceof _Pattern_js__WEBPACK_IMPORTED_MODULE_1__["default"])) {
      rootPattern = this;
    }

    // This is to prevent possibilities explosion.
    if (this.parent === rootPattern) {
      const possibilities = this.children[0].getPossibilities(rootPattern);
      possibilities.unshift("");

      return possibilities;
    } else {
      return this.children[0].getPossibilities(rootPattern);
    }
  }

  getTokens() {
    return this._children[0].getTokens();
  }
  
}


/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Permutor; });
class Permutor {
  constructor() {
    this.array = [];
    this.positionToOptions = null;
  }

  permute(array) {
    this.array = array;
    this.createPositionMap();
    return this.getPermutations();
  }

  getPermutations() {
    return this.array[0].reduce((acc, value, index) => {
      return acc.concat(this.getOptions(0, index));
    }, []);
  }

  getKey(x, y) {
    return `${x}|${y}`;
  }

  createPositionMap() {
    this.positionToOptions = {};

    for (let x = this.array.length - 1; x >= 0; x--) {
      for (let y = 0; y < this.array[x].length; y++) {
        const yValue = this.array[x][y];
        const nextX = x + 1;

        if (this.array[nextX] != null) {
          const options = this.array[nextX];

          const value = options
            .map((option, index) => {
              let permutations = this.getOptions(nextX, index);

              return permutations.map(option => {
                return `${yValue}${option}`;
              });
            })
            .reduce((acc, value) => {
              return acc.concat(value);
            }, []);

          this.setOptions(x, y, value);
        } else {
          this.setOptions(x, y, [yValue]);
        }
      }
    }
  }

  getOptions(x, y) {
    return this.positionToOptions[this.getKey(x, y)];
  }

  setOptions(x, y, value) {
    this.positionToOptions[this.getKey(x, y)] = value;
  }
}


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return AnyOfThese; });
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _ParseError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8);
/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(10);





class AnyOfThese extends _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, characters) {
    super("any-of-these", name);
    this.characters = characters;
    this._assertArguments();
  }

  _assertArguments() {
    if (typeof this.characters !== "string") {
      throw new Error(
        "Invalid Arguments: The characters argument needs to be a string of characters."
      );
    }

    if (this.characters.length < 1) {
      throw new Error(
        "Invalid Arguments: The characters argument needs to be at least one character long."
      );
    }
  }

  parse(cursor) {
    this._reset(cursor);
    this._tryPattern();
    return this.node;
  }

  _reset(cursor) {
    this.cursor = cursor;
    this.mark = this.cursor.mark();
    this.node = null;
  }

  _tryPattern() {
    if (this._isMatch()) {
      const value = this.cursor.getChar();
      const index = this.cursor.getIndex();

      this.node = new _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_2__["default"]("any-of-these", this.name, value, index, index);

      this.cursor.addMatch(this, this.node);
    } else {
      this._processError();
    }
  }

  _isMatch() {
    return this.characters.indexOf(this.cursor.getChar()) > -1;
  }

  _processError() {
    const message = `ParseError: Expected one of these characters, '${
      this.characters
    }' but found '${this.cursor.getChar()}' while parsing for '${this.name}'.`;

    const parseError = new _ParseError_js__WEBPACK_IMPORTED_MODULE_1__["default"](message, this.cursor.getIndex(), this);
    this.cursor.throwError(parseError);
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new AnyOfThese(name, this.characters);
  }

  getPossibilities(rootPattern) {
    if (rootPattern == null || !(rootPattern instanceof _Pattern_js__WEBPACK_IMPORTED_MODULE_3__["default"])) {
      rootPattern = this;
    }

    return this.getTokens();
  }

  getTokens() {
    return this.characters.split("");
  }

}


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Literal; });
/* harmony import */ var _ParseError_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9);




class Literal extends _ValuePattern_js__WEBPACK_IMPORTED_MODULE_2__["default"] {
  constructor(name, literal) {
    super("literal", name);
    this.literal = literal;
    this._assertArguments();
  }

  _assertArguments() {
    if (typeof this.literal !== "string") {
      throw new Error(
        "Invalid Arguments: The literal argument needs to be a string of characters."
      );
    }

    if (this.literal.length < 1) {
      throw new Error(
        "Invalid Arguments: The literalString argument needs to be at least one character long."
      );
    }
  }

  parse(cursor) {
    this._reset(cursor);
    this._tryPattern();

    return this.node;
  }

  _reset(cursor) {
    this.cursor = cursor;
    this.mark = this.cursor.mark();
    this.substring = this.cursor.string.substring(
      this.mark,
      this.mark + this.literal.length
    );
    this.node = null;
  }

  _tryPattern() {
    if (this.substring === this.literal) {
      this._processMatch();
    } else {
      this._processError();
    }
  }

  _processError() {
    const message = `ParseError: Expected '${this.literal}' but found '${this.substring}'.`;

    const parseError = new _ParseError_js__WEBPACK_IMPORTED_MODULE_0__["default"](message, this.cursor.getIndex(), this);
    this.cursor.throwError(parseError);
  }

  _processMatch() {
    this.node = new _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__["default"](
      "literal",
      this.name,
      this.substring,
      this.mark,
      this.mark + this.literal.length - 1
    );

    this.cursor.index = this.node.endIndex;
    this.cursor.addMatch(this, this.node);
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new Literal(name, this.literal);
  }

  getPossibilities() {
    return [this.getTokenValue()];
  }

  getTokenValue() {
    return this.literal;
  }

  getTokens() {
    return [this.getTokenValue()];
  }
}


/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return NotValue; });
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _ParseError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(10);





class NotValue extends _Pattern_js__WEBPACK_IMPORTED_MODULE_3__["default"] {
  constructor(name, pattern) {
    super("not-value", name, [pattern]);
  }

  _assertChildren() {
    if (!(this.children[0] instanceof _Pattern_js__WEBPACK_IMPORTED_MODULE_3__["default"])) {
      throw new Error(
        "Invalid Arguments: Expected the pattern to be a ValuePattern."
      );
    }

    if (typeof this.name !== "string") {
      throw new Error("Invalid Arguments: Expected name to be a string.");
    }
  }

  _reset(cursor) {
    this.match = "";
    this.node = null;
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
      const mark = this.cursor.mark();
      this.children[0].parse(this.cursor);

      if (this.cursor.hasUnresolvedError()) {
        this.cursor.resolveError();
        this.cursor.moveToMark(mark);
        this.match += this.cursor.getChar();
        break;
      } else {
        this.cursor.moveToMark(mark);
        break;
      }
    }

    this._processMatch();
  }

  _processMatch() {
    if (this.match.length === 0) {
      const parseError = new _ParseError_js__WEBPACK_IMPORTED_MODULE_2__["default"](
        `Didn't find any characters that didn't match the ${this.children[0].name} pattern.`,
        this.mark,
        this
      );
      this.cursor.throwError(parseError);
    } else {
      this.node = new _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__["default"](
        "not-value",
        this.name,
        this.match,
        this.mark,
        this.mark
      );

      this.cursor.index = this.node.endIndex;
      this.cursor.addMatch(this, this.node);
    }
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new NotValue(name, this.children[0]);
  }

  getPossibilities() {
    return [];
  }

  getTokens() {
    return [];
  }
}


/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return OrValue; });
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _OptionalValue_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(12);
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(10);





class OrValue extends _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, patterns) {
    super("or-value", name, patterns);
    this._assertArguments();
  }

  _assertArguments() {
    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: OrValue needs to have more than one value pattern."
      );
    }

    const hasOptionalChildren = this._children.some(
      (pattern) => pattern instanceof _OptionalValue_js__WEBPACK_IMPORTED_MODULE_2__["default"]
    );

    if (hasOptionalChildren) {
      throw new Error("OrValues cannot have optional values.");
    }
  }

  _reset(cursor) {
    this.index = 0;
    this.errors = [];
    this.node = null;
    this.cursor = cursor;
    this.mark = cursor.mark();
  }

  parse(cursor) {
    this._reset(cursor);
    this._tryPattern();

    return this.node;
  }

  _tryPattern() {
    while (true) {
      const pattern = this._children[this.index];
      const node = pattern.parse(this.cursor, this.parseError);

      if (this.cursor.hasUnresolvedError()) {
        if (this.index + 1 < this._children.length) {
          this.cursor.resolveError();
          this.index++;
          this.cursor.moveToMark(this.mark);
        } else {
          this.node = null;
          break;
        }
      } else {
        this.node = new _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__["default"](
          "or-value",
          this.name,
          node.value,
          node.startIndex,
          node.endIndex
        );

        this.cursor.index = this.node.endIndex;
        this.cursor.addMatch(this, this.node);

        break;
      }
    }
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new OrValue(name, this._children);
  }

  getPossibilities(rootPattern) {
    if (rootPattern == null || !(rootPattern instanceof _Pattern_js__WEBPACK_IMPORTED_MODULE_3__["default"])) {
      rootPattern = this;
    }

    return this.children
      .map((child) => {
        return child.getPossibilities(rootPattern);
      })
      .reduce((acc, value) => {
        return acc.concat(value);
      }, []);
  }

  getTokens() {
    const tokens = this._children.map((c) => c.getTokens());

    const hasPrimitiveTokens = tokens.every((t) =>
      t.every((value) => typeof value === "string")
    );

    if (hasPrimitiveTokens && tokens.length > 0) {
      return tokens.reduce((acc, t) => acc.concat(t), []);
    }

    return this._children[0].getTokens();
  }

}


/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return RepeatValue; });
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _ParseError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);
/* harmony import */ var _OptionalValue_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(12);
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(10);






class RepeatValue extends _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, pattern, divider) {
    super(
      "repeat-value",
      name,
      divider != null ? [pattern, divider] : [pattern]
    );

    this._pattern = this.children[0];
    this._divider = this.children[1];

    this._assertArguments();
  }

  _assertArguments() {
    if (this._pattern instanceof _OptionalValue_js__WEBPACK_IMPORTED_MODULE_3__["default"]) {
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
      const parseError = new _ParseError_js__WEBPACK_IMPORTED_MODULE_2__["default"](
        `Did not find a repeating match of ${this.name}.`,
        this.mark,
        this
      );
      this.cursor.throwError(parseError);
      this.node = null;
    } else {
      const value = this.nodes.map((node) => node.value).join("");

      this.node = new _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__["default"](
        "repeat-value",
        this.name,
        value,
        this.nodes[0].startIndex,
        this.nodes[this.nodes.length - 1].endIndex
      );

      this.cursor.index = this.node.endIndex;
      this.cursor.addMatch(this, this.node);
    }
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new RepeatValue(name, this._pattern, this._divider);
  }

  getPossibilities(rootPattern) {
    if (rootPattern == null || !(rootPattern instanceof _Pattern_js__WEBPACK_IMPORTED_MODULE_4__["default"])) {
      rootPattern = this;
    }

    if (this._divider != null) {
      const dividerPossibilities = this._divider.getPossibilities(rootPattern);

      return this._pattern
        .getPossibilities(rootPattern)
        .map((possibility) => {
          return dividerPossibilities.map((divider) => {
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

  getTokens() {
    return this._pattern.getTokens();
  }

}


/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return AndComposite; });
/* harmony import */ var _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(20);
/* harmony import */ var _ast_CompositeNode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _patterns_ParseError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);
/* harmony import */ var _value_OptionalValue_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(12);
/* harmony import */ var _OptionalComposite_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(21);
/* harmony import */ var _Permutor_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(13);
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(10);








const permutor = new _Permutor_js__WEBPACK_IMPORTED_MODULE_5__["default"]();

class AndComposite extends _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, patterns = []) {
    super("and-composite", name, patterns);
    this._assertArguments();
  }

  _assertArguments() {
    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: AndValue needs to have more than one value pattern."
      );
    }
  }

  _reset(cursor) {
    this.index = 0;
    this.nodes = [];
    this.node = null;
    this.cursor = cursor;
    this.mark = this.cursor.mark();
  }

  parse(cursor) {
    this._reset(cursor);
    this._tryPatterns();

    return this.node;
  }

  _tryPatterns() {
    while (true) {
      const pattern = this._children[this.index];
      const node = pattern.parse(this.cursor);

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

  _next() {
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

  _hasMorePatterns() {
    return this.index + 1 < this._children.length;
  }

  _assertRestOfPatternsAreOptional() {
    const areTheRestOptional = this.children.every((pattern, index) => {
      return (
        index <= this.index ||
        pattern instanceof _value_OptionalValue_js__WEBPACK_IMPORTED_MODULE_3__["default"] ||
        pattern instanceof _OptionalComposite_js__WEBPACK_IMPORTED_MODULE_4__["default"]
      );
    });

    if (!areTheRestOptional) {
      const parseError = new _patterns_ParseError_js__WEBPACK_IMPORTED_MODULE_2__["default"](
        `Could not match ${this.name} before string ran out.`,
        this.index,
        this
      );
      this.cursor.throwError(parseError);
    }
  }

  _processValue() {
    if (!this.cursor.hasUnresolvedError()) {
      this.nodes = this.nodes.filter((node) => node != null);

      const lastNode = this.nodes[this.nodes.length - 1];
      const startIndex = this.mark;
      const endIndex = lastNode.endIndex;

      this.node = new _ast_CompositeNode_js__WEBPACK_IMPORTED_MODULE_1__["default"](
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

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new AndComposite(name, this._children);
  }

  getPossibilities(rootPattern) {
    if (rootPattern == null || !(rootPattern instanceof _Pattern_js__WEBPACK_IMPORTED_MODULE_6__["default"])) {
      rootPattern = this;
    }

    const possibilities = this.children.map((child) =>
      child.getPossibilities(rootPattern)
    );
    return permutor.permute(possibilities);
  }

  getTokens() {
    let tokens = [];

    for (let x = 0; x < this._children.length; x++) {
      const child = this._children[x];

      if (
        child instanceof _value_OptionalValue_js__WEBPACK_IMPORTED_MODULE_3__["default"] ||
        child instanceof _OptionalComposite_js__WEBPACK_IMPORTED_MODULE_4__["default"]
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


/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return CompositePattern; });
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);


class CompositePattern extends _Pattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(type, name, children = []) {
    super(type, name, children);
  }

  clone() {
    throw new Error("Not Yet Implemented");
  }
}


/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return OptionalComposite; });
/* harmony import */ var _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(20);
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);



class OptionalComposite extends _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(pattern) {
    super("optional-composite", "optional-composite", [pattern]);
  }

  parse(cursor) {
    const mark = cursor.mark();
    this.mark = mark;

    const node = this.children[0].parse(cursor);

    if (cursor.hasUnresolvedError()) {
      cursor.resolveError();
      cursor.moveToMark(mark);
      return null;
    } else {
      cursor.addMatch(this, node);
      return node;
    }
  }

  clone() {
    return new OptionalComposite(this.children[0]);
  }

  getPossibilities(rootPattern) {
    if (rootPattern == null || !(rootPattern instanceof _Pattern_js__WEBPACK_IMPORTED_MODULE_1__["default"])) {
      rootPattern = this;
    }

    // This is to prevent possibilities explosion.
    if (this.parent === rootPattern){
      const possibilities = this.children[0].getPossibilities(rootPattern);
      possibilities.unshift("");

      return possibilities;
    } else {
      return this.children[0].getPossibilities(rootPattern);
    }
  }

  getTokens() {
    return this._children[0].getTokens();
  }
}


/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return OrComposite; });
/* harmony import */ var _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(20);
/* harmony import */ var _value_OptionalValue_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
/* harmony import */ var _OptionalComposite_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(21);
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(10);





class OrComposite extends _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, patterns) {
    super("or-composite", name, patterns);
    this._assertArguments();
  }

  _assertArguments() {
    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: OrValue needs to have more than one value pattern."
      );
    }

    const hasOptionalChildren = this._children.some(
      (pattern) =>
        pattern instanceof _value_OptionalValue_js__WEBPACK_IMPORTED_MODULE_1__["default"] || pattern instanceof _OptionalComposite_js__WEBPACK_IMPORTED_MODULE_2__["default"]
    );

    if (hasOptionalChildren) {
      throw new Error("OrComposite cannot have optional values.");
    }
  }

  _reset(cursor) {
    this.cursor = cursor;
    this.mark = null;
    this.index = 0;
    this.node = null;
    this.mark = cursor.mark();
  }

  parse(cursor) {
    this._reset(cursor);
    this._tryPattern();

    if (this.node != null) {
      this.cursor.addMatch(this, this.node);
    }

    return this.node;
  }

  _tryPattern() {
    while (true) {
      const pattern = this._children[this.index];

      this.node = pattern.parse(this.cursor);

      if (this.cursor.hasUnresolvedError()) {
        if (this.index + 1 < this._children.length) {
          this.cursor.resolveError();
          this.index++;
          this.cursor.moveToMark(this.mark);
        } else {
          this.node = null;
          break;
        }
      } else {
        this.cursor.index = this.node.endIndex;
        break;
      }
    }
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new OrComposite(name, this._children);
  }

  getPossibilities(rootPattern) {
    if (rootPattern == null || !(rootPattern instanceof _Pattern_js__WEBPACK_IMPORTED_MODULE_3__["default"])) {
      rootPattern = this;
    }

    return this.children
      .map((child) => {
        return child.getPossibilities(rootPattern);
      })
      .reduce((acc, value) => {
        return acc.concat(value);
      }, []);
  }

  getTokens() {
    const tokens = this._children.map((c) => c.getTokens());

    const hasPrimitiveTokens = tokens.every((t) =>
      t.every((value) => typeof value === "string")
    );

    if (hasPrimitiveTokens && tokens.length > 0) {
      return tokens.reduce((acc, t) => acc.concat(t), []);
    }

    return this._children[0].getTokens();
  }
}


/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return RepeatComposite; });
/* harmony import */ var _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(20);
/* harmony import */ var _ast_CompositeNode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _ParseError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);
/* harmony import */ var _OptionalComposite_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(21);
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(10);






class RepeatComposite extends _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
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
    if (this._pattern instanceof _OptionalComposite_js__WEBPACK_IMPORTED_MODULE_3__["default"]) {
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
        new _ParseError_js__WEBPACK_IMPORTED_MODULE_2__["default"](
          `Did not find a repeating match of ${this.name}.`,
          this.mark,
          this
        )
      );
      this.node = null;
    } else {
      this.node = new _ast_CompositeNode_js__WEBPACK_IMPORTED_MODULE_1__["default"](
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

  getPossibilities(rootPattern) {
    if (rootPattern == null || !(rootPattern instanceof _Pattern_js__WEBPACK_IMPORTED_MODULE_4__["default"])) {
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

  getTokens() {
    return this._pattern.getTokens();
  }
}


/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return RecursivePattern; });
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/* harmony import */ var _ParseError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8);



class RecursivePattern extends _Pattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name) {
    super("recursive", name);
    this.isRecursing = false;
  }

  getPattern() {
    return this._climb(this.parent, (pattern) => {
      if (pattern == null) {
        return false;
      }
      return pattern.name === this.name;
    });
  }

  _climb(pattern, isMatch) {
    if (isMatch(pattern)) {
      return pattern;
    } else {
      if (pattern && pattern.parent != null) {
        return this._climb(pattern.parent, isMatch);
      }
      return null;
    }
  }

  parse(cursor) {
    if (this.pattern == null) {
      const pattern = this.getPattern();

      if (pattern == null) {
        cursor.throwError(
          new _ParseError_js__WEBPACK_IMPORTED_MODULE_1__["default"](
            `Couldn't find parent pattern to recursively parse, with the name ${this.name}.`
          ),
          cursor.index,
          this
        );
        return null;
      }

      this.pattern = pattern.clone();
      this.pattern.parent = this;
    }

    const node = this.pattern.parse(cursor);

    if (!cursor.hasUnresolvedError()) {
      cursor.addMatch(this, node);
    }

    return node;
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new RecursivePattern(name);
  }

  getPossibilities() {
    if (!this.isRecursing) {
      this.isRecursing = true;
      const possibilities = this.getPattern().getPossibilities();
      this.isRecursing = false;

      return possibilities;
    } else {
      return [`[${this.name}]`];
    }
  }

  getTokenValue() {
    return this.getPattern().getTokenValue();
  }

  getTokens() {
    if (!this.isRecursing) {
      this.isRecursing = true;
      const tokens = this.getPattern().getTokens();
      this.isRecursing = false;

      return tokens;
    }
  }
}


/***/ }),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ParseInspector; });
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);


class ParseInspector {
  constructor() {
    this.cursor = null;
    this.result = null;
    this.text = null;
    this.match = null;
    this.error = null;
    this.patternMatch = null;
    this.matchedText = "";
    this.rootPattern = null;
    this.possibilities = null;
  }

  inspectParse(text, pattern) {
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
        possibilities: {
          startIndex: 0,
          options: pattern.getPossibilities(),
        },
        isComplete: false,
      };
    }

    this.parse();
    this.saveMatchedText();
    this.saveMatch();
    this.saveError();
    this.savePossibilities();

    return {
      pattern: this.patternMatch.pattern,
      astNode: this.patternMatch.astNode,
      match: this.match,
      error: this.error,
      possibilities: this.possibilities,
      isComplete: this.cursor.didSuccessfullyParse(),
    };
  }

  reset() {
    this.cursor = null;
    this.result = null;
    this.text = null;
    this.match = null;
    this.error = null;
    this.patternMatch = null;
    this.matchedText = "";
    this.rootPattern = null;
    this.possibilities = null;
  }

  parse() {
    this.rootPattern = this.rootPattern;
    this.cursor = new _index_js__WEBPACK_IMPORTED_MODULE_0__["Cursor"](this.text);
    this.result = this.rootPattern.parse(this.cursor);
    this.patternMatch = this.cursor.lastMatch;
  }

  saveMatchedText() {
    if (this.patternMatch.astNode != null) {
      this.matchedText = this.text.substring(
        0,
        this.patternMatch.astNode.endIndex + 1
      );
    }
  }

  saveMatch() {
    const node = this.patternMatch.astNode;

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
    if (this.patternMatch.astNode == null) {
      this.error = {
        startIndex: 0,
        endIndex: this.text.length - 1,
        text: this.text,
      };
      return this;
    }

    if (this.text.length > this.matchedText.length) {
      const difference = this.text.length - this.matchedText.length;
      const startIndex = this.patternMatch.astNode.endIndex + 1;
      const endIndex = startIndex + difference - 1;

      this.error = {
        startIndex: startIndex,
        endIndex: endIndex,
        text: this.text.substring(startIndex, endIndex + 1),
      };

      return;
    } else {
      this.error = null;
      return;
    }
  }

  savePossibilities() {
    if (
      this.patternMatch.pattern === this.rootPattern &&
      this.cursor.didSuccessfullyParse()
    ) {
      this.possibilities = null;
      return;
    }

    if (this.patternMatch.astNode == null) {
      let options = this.rootPattern.getPossibilities();
      const parts = this.text.split(" ").filter((part) => {
        return part.length > 0;
      });

      options = options.filter((option) => {
        return parts.some((part) => {
          return option.indexOf(part) > -1;
        });
      });

      if (options.length === 0) {
        this.possibilities = null;
        return;
      }

      this.possibilities = {
        startIndex: 0,
        options,
      };

      return;
    }

    const pattern = this.patternMatch.pattern;
    const parentPattern = pattern.parent;
    const index = parentPattern.children.indexOf(pattern);
    const parentClone = parentPattern.clone();

    parentClone.children = parentClone.children.slice(index + 1);

    const options = parentClone.getPossibilities();
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
        this.possibilities = null;
        return;
      } else {
        this.match = {
          ...this.match,
          text: this.match.text + leftOver,
          endIndex: this.match.endIndex + leftOver.length,
        };

        this.error = null;

        this.possibilities = {
          startIndex: this.match.endIndex + 1,
          options: partialMatchOptions,
        };

        return;
      }
    }

    this.possibilities = {
      startIndex,
      options,
    };
  }

  static inspectParse(text, pattern) {
    return new ParseInspector().inspectParse(text, pattern);
  }
}


/***/ })
/******/ ]);
});