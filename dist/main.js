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
/* harmony import */ var _Mark_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Mark", function() { return _Mark_js__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _ast_Node_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Node", function() { return _ast_Node_js__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _ast_CompositeNode_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CompositeNode", function() { return _ast_CompositeNode_js__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ValueNode", function() { return _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _Cursor_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Cursor", function() { return _Cursor_js__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _patterns_value_AndValue_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(7);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AndValue", function() { return _patterns_value_AndValue_js__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _patterns_value_AnyOfThese_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(12);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AnyOfThese", function() { return _patterns_value_AnyOfThese_js__WEBPACK_IMPORTED_MODULE_6__["default"]; });

/* harmony import */ var _patterns_value_Literal_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(13);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Literal", function() { return _patterns_value_Literal_js__WEBPACK_IMPORTED_MODULE_7__["default"]; });

/* harmony import */ var _patterns_value_NotValue_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(14);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "NotValue", function() { return _patterns_value_NotValue_js__WEBPACK_IMPORTED_MODULE_8__["default"]; });

/* harmony import */ var _patterns_value_OptionalValue_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(11);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "OptionalValue", function() { return _patterns_value_OptionalValue_js__WEBPACK_IMPORTED_MODULE_9__["default"]; });

/* harmony import */ var _patterns_value_OrValue_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(15);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "OrValue", function() { return _patterns_value_OrValue_js__WEBPACK_IMPORTED_MODULE_10__["default"]; });

/* harmony import */ var _patterns_value_RepeatValue_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(16);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RepeatValue", function() { return _patterns_value_RepeatValue_js__WEBPACK_IMPORTED_MODULE_11__["default"]; });

/* harmony import */ var _patterns_value_ValuePattern_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(8);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ValuePattern", function() { return _patterns_value_ValuePattern_js__WEBPACK_IMPORTED_MODULE_12__["default"]; });

/* harmony import */ var _patterns_composite_AndComposite_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(17);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AndComposite", function() { return _patterns_composite_AndComposite_js__WEBPACK_IMPORTED_MODULE_13__["default"]; });

/* harmony import */ var _patterns_composite_CompositePattern_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(18);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CompositePattern", function() { return _patterns_composite_CompositePattern_js__WEBPACK_IMPORTED_MODULE_14__["default"]; });

/* harmony import */ var _patterns_composite_OptionalComposite_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(20);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "OptionalComposite", function() { return _patterns_composite_OptionalComposite_js__WEBPACK_IMPORTED_MODULE_15__["default"]; });

/* harmony import */ var _patterns_composite_OrComposite_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(21);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "OrComposite", function() { return _patterns_composite_OrComposite_js__WEBPACK_IMPORTED_MODULE_16__["default"]; });

/* harmony import */ var _patterns_composite_RepeatComposite_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(22);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RepeatComposite", function() { return _patterns_composite_RepeatComposite_js__WEBPACK_IMPORTED_MODULE_17__["default"]; });

/* harmony import */ var _patterns_ParseError_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(10);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ParseError", function() { return _patterns_ParseError_js__WEBPACK_IMPORTED_MODULE_18__["default"]; });

/* harmony import */ var _patterns_Pattern_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(9);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Pattern", function() { return _patterns_Pattern_js__WEBPACK_IMPORTED_MODULE_19__["default"]; });

/* harmony import */ var _patterns_StackInformation_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(19);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "StackInformation", function() { return _patterns_StackInformation_js__WEBPACK_IMPORTED_MODULE_20__["default"]; });

/* harmony import */ var _patterns_RecursivePattern_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(23);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RecursivePattern", function() { return _patterns_RecursivePattern_js__WEBPACK_IMPORTED_MODULE_21__["default"]; });



























/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Mark; });
class Mark {
    constructor(cursor, index){
        this.cursor = cursor;
        this.index = index;
    }
}

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Node; });
class Node {
  constructor(name, startIndex, endIndex) {
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

  clone() {
    throw new Error(
      "Not Implemented Exception: expected subclass to override this method."
    );
  }
}


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return CompositeNode; });
/* harmony import */ var _Node_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);


class CompositeNode extends _Node_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, startIndex = 0, endIndex = 0) {
    super(name, startIndex, endIndex);
    this.children = [];
  }

  clone() {
    const node = new CompositeNode(this.name, this.startIndex, this.endIndex);
    node.children = this.children.map(child => {
      return child.clone();
    });

    return node;
  }
}


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ValueNode; });
/* harmony import */ var _Node_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

// We might want reference to the pattern on the node.
class ValueNode extends _Node_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, value, startIndex = 0, endIndex = 0) {
    super(name, startIndex, endIndex);
    this.value = value;
  }

  clone() {
    return new ValueNode(this.name, this.value, this.startIndex, this.endIndex);
  }
}


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Cursor; });
/* harmony import */ var _Mark_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);


class Cursor {
  constructor(string, { verbose } = {}) {
    this.string = string;
    this.index = 0;
    this.length = string.length;
    this.parseError = null;
    this.verbose = typeof verbose === "boolean" ? verbose : false;
    this.isInErrorState = false;
    this.assertValidity();
  }

  throwError(parseError) {
    this.isInErrorState = true;

    if (this.parseError == null || parseError.index >= this.parseError.index){
      this.parseError = parseError;
    }
  }

  resolveError() {
    this.isInErrorState = false;
  }

  hasUnresolvedError() {
    return this.isInErrorState;
  }

  assertValidity() {
    if (this.isNullOrEmpty(this.string)) {
      throw new Error(
        "Illegal Argument: Cursor needs to have a string that has a length greater than 0."
      );
    }
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
    return new _Mark_js__WEBPACK_IMPORTED_MODULE_0__["default"](this, this.index);
  }

  moveToMark(mark) {
    if (mark instanceof _Mark_js__WEBPACK_IMPORTED_MODULE_0__["default"] && mark.cursor === this) {
      this.index = mark.index;
      return true;
    } else {
      throw new Error(
        "Illegal Argument: The mark needs to be an instance of Mark and created by this cursor."
      );
    }
  }

  moveToBeginning() {
    this.index = 0;
  }

  moveToLast() {
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
}


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return AndValue; });
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _Cursor_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
/* harmony import */ var _patterns_ParseError_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(10);
/* harmony import */ var _OptionalValue_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(11);






class AndValue extends _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, patterns) {
    super(name, patterns);
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
    this._assertCursor();
    this._tryPatterns();

    return this.node;
  }

  _assertCursor() {
    if (!(this.cursor instanceof _Cursor_js__WEBPACK_IMPORTED_MODULE_2__["default"])) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
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
      return index <= this.index || pattern instanceof _OptionalValue_js__WEBPACK_IMPORTED_MODULE_4__["default"];
    });

    if (!areTheRestOptional) {
      const parseError = new _patterns_ParseError_js__WEBPACK_IMPORTED_MODULE_3__["default"](
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
      this.nodes = this.nodes.filter(node => node != null);

      const lastNode = this.nodes[this.nodes.length - 1];
      const startIndex = this.mark.index;
      const endIndex = lastNode.endIndex;
      const value = this.nodes.map(node => node.value).join("");

      this.node = new _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.name, value, startIndex, endIndex);

      this.cursor.setIndex(this.node.endIndex);
    }
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new AndValue(name, this._children);
  }

  getCurrentMark() {
    return this.mark;
  }
}


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ValuePattern; });
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);


class ValuePattern extends _Pattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, children = []) {
    super(name);
    this._children = children;
    this._assertPatternArguments();
    this._cloneChildren();
    this._assignAsParent();
  }

  _assertPatternArguments() {
    if (!Array.isArray(this._children)) {
      throw new Error(
        "Invalid Arguments: The patterns argument need to be an array of ValuePattern."
      );
    }

    const areAllPatterns = this._children.every(
      pattern => pattern instanceof ValuePattern
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
  }

  _cloneChildren() {
    // We need to clone the patterns so nested patterns can be parsed.
    this._children = this._children.map(pattern => pattern.clone());

    // We need to freeze the childen so they aren't modified.
    Object.freeze(this._children);
  }

  _assignAsParent() {
    this._children.forEach(child => (child.parent = this));
  }

  clone() {
    throw new Error("Not Yet Implemented");
  }

  getCurrentMark(){
    throw new Error("Not Yet Implemented");
  }
}


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Pattern; });
class Pattern {
  constructor(name = null) {
    this._name = name;
    this._parent = null;
    this._children = [];

    this._assertName();
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

  get name() {
    return this._name;
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
    this._assertChildren();
    this._assignAsParent();

    this._children = value.map(pattern => pattern.clone());
    Object.freeze(this._children);
  }

  _assertChildren() {
    if (!Array.isArray(this._children)) {
      throw new Error(
        "Invalid Arguments: The patterns argument need to be an array of Patterns."
      );
    }

    const areAllPatterns = this._children.every(
      pattern => pattern instanceof Pattern
    );

    if (!areAllPatterns) {
      throw new Error(
        "Invalid Argument: All patterns need to be an instance of Pattern."
      );
    }

    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: Composite Patterns needs to have more than one value pattern."
      );
    }
  }

  _assignAsParent() {
    this._children.forEach(child => (child.parent = this));
  }

  clone() {
    throw new Error("Method Not Implemented");
  }
}


/***/ }),
/* 10 */
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
        this.stack = [];
    }
}

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return OptionalValue; });
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);


class OptionalValue extends _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(pattern) {
    super("optional-value", [pattern]);
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
      return node;
    }
  }

  clone() {
    return new OptionalValue(this.children[0]);
  }

  getCurrentMark() {
    return this.mark;
  }
}


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return AnyOfThese; });
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _ParseError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);
/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
/* harmony import */ var _Cursor_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6);





class AnyOfThese extends _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, characters) {
    super(name);
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
    this._assertCursor();
    this._tryPattern();
    return this.node;
  }

  _assertCursor() {
    if (!(this.cursor instanceof _Cursor_js__WEBPACK_IMPORTED_MODULE_3__["default"])) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
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

      this.node = new _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_2__["default"](this.name, value, index, index);
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

  getCurrentMark() {
    return this.mark;
  }
}


/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Literal; });
/* harmony import */ var _ParseError_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/* harmony import */ var _Cursor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8);





class Literal extends _ValuePattern_js__WEBPACK_IMPORTED_MODULE_3__["default"] {
  constructor(name, literal) {
    super(name);
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
    this._assertCursor();
    this._tryPattern();

    return this.node;
  }

  _reset(cursor) {
    this.cursor = cursor;
    this.mark = this.cursor.mark();
    this.substring = this.cursor.string.substring(
      this.mark.index,
      this.mark.index + this.literal.length
    );
    this.node = null;
  }

  _assertCursor() {
    if (!(this.cursor instanceof _Cursor_js__WEBPACK_IMPORTED_MODULE_1__["default"])) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
  }

  _tryPattern() {
    if (this.substring === this.literal) {
      this._processMatch();
    } else {
      this._processError();
    }
  }

  _processError() {
    const message = `ParseError: Expected '${
      this.literal
    }' but found '${this.substring}'.`;

    const parseError = new _ParseError_js__WEBPACK_IMPORTED_MODULE_0__["default"](message, this.cursor.getIndex(), this);
    this.cursor.throwError(parseError);
  }

  _processMatch() {
    this.node = new _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_2__["default"](
      this.name,
      this.substring,
      this.mark.index,
      this.mark.index + this.literal.length - 1
    );

    this.cursor.setIndex(this.node.endIndex);
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new Literal(name, this.literal);
  }

  getCurrentMark() {
    return this.mark;
  }
}


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return NotValue; });
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _ParseError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(10);




class NotValue extends _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, pattern) {
    super(name, [pattern]);
    this._assertArguments();
  }

  _assertArguments() {
    if (!(this.children[0] instanceof _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"])) {
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
        this.mark.index,
        this
      );
      this.cursor.throwError(parseError);
    } else {
      this.node = new _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__["default"](
        this.name,
        this.match,
        this.mark.index,
        this.mark.index
      );

      this.cursor.setIndex(this.node.endIndex);
    }
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new NotValue(name, this.children[0]);
  }

  getCurrentMark() {
    return this.mark;
  }
}


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return OrValue; });
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _Cursor_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
/* harmony import */ var _OptionalValue_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(11);





class OrValue extends _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, patterns) {
    super(name, patterns);
    this._assertArguments();
  }

  _assertArguments() {
    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: OrValue needs to have more than one value pattern."
      );
    }

    const hasOptionalChildren = this._children.some(
      pattern => pattern instanceof _OptionalValue_js__WEBPACK_IMPORTED_MODULE_3__["default"]
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
    this._assertCursor();
    this._tryPattern();

    return this.node;
  }

  _assertCursor() {
    if (!(this.cursor instanceof _Cursor_js__WEBPACK_IMPORTED_MODULE_2__["default"])) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
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
          this.name,
          node.value,
          node.startIndex,
          node.endIndex
        );

        this.cursor.setIndex(this.node.endIndex);
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

  getCurrentMark() {
    return this.mark;
  }
}


/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return RepeatValue; });
/* harmony import */ var _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _ParseError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(10);
/* harmony import */ var _OptionalValue_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(11);





class RepeatValue extends _ValuePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, pattern, divider) {
    super(name, divider != null ? [pattern, divider] : [pattern]);

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
      let mark = this.cursor.mark();

      const node = this._pattern.parse(this.cursor, this.parseError);

      if (this.cursor.hasUnresolvedError()) {
        this._processMatch();
        break;
      } else {
        this.nodes.push(node);

        if (node.endIndex === this.cursor.lastIndex()) {
          this._processMatch();
          break;
        }

        mark = this.cursor.mark();
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
        this.mark.index,
        this
      );
      this.cursor.throwError(parseError);
      this.node = null;
    } else {
      const value = this.nodes.map(node => node.value).join("");

      this.node = new _ast_ValueNode_js__WEBPACK_IMPORTED_MODULE_1__["default"](
        this.name,
        value,
        this.nodes[0].startIndex,
        this.nodes[this.nodes.length - 1].endIndex
      );

      this.cursor.setIndex(this.node.endIndex);
    }
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new RepeatValue(name, this._pattern, this._divider);
  }

  getCurrentMark() {
    return this.mark;
  }
}


/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return AndComposite; });
/* harmony import */ var _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(18);
/* harmony import */ var _ast_CompositeNode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _Cursor_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
/* harmony import */ var _patterns_ParseError_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(10);
/* harmony import */ var _StackInformation_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(19);
/* harmony import */ var _value_OptionalValue_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(11);
/* harmony import */ var _OptionalComposite_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(20);








class AndComposite extends _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, patterns) {
    super(name, patterns);
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
    this._assertCursor();
    this._tryPatterns();

    return this.node;
  }

  _assertCursor() {
    if (!(this.cursor instanceof _Cursor_js__WEBPACK_IMPORTED_MODULE_2__["default"])) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
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
        pattern instanceof _value_OptionalValue_js__WEBPACK_IMPORTED_MODULE_5__["default"] ||
        pattern instanceof _OptionalComposite_js__WEBPACK_IMPORTED_MODULE_6__["default"]
      );
    });

    if (!areTheRestOptional) {
      const parseError = new _patterns_ParseError_js__WEBPACK_IMPORTED_MODULE_3__["default"](
        `Could not match ${this.name} before string ran out.`,
        this.index,
        this
      );
      this.cursor.throwError(parseError);
    }
  }

  _processValue() {
    if (!this.cursor.hasUnresolvedError()) {
      this.nodes = this.nodes.filter(node => node != null);

      const lastNode = this.nodes[this.nodes.length - 1];
      const startIndex = this.mark.index;
      const endIndex = lastNode.endIndex;

      this.node = new _ast_CompositeNode_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.name, startIndex, endIndex);
      this.node.children = this.nodes;

      this.cursor.setIndex(this.node.endIndex);
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

  getCurrentMark() {
    return this.mark;
  }
}


/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return CompositePattern; });
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);


class CompositePattern extends _Pattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, children = []) {
    super(name);

    this._children = children;
    this._assertArguments();
    this._cloneChildren();
    this._assignAsParent();
  }

  _assertArguments() {
    if (!Array.isArray(this._children)) {
      throw new Error(
        "Invalid Arguments: The patterns argument need to be an array of Patterns."
      );
    }

    const areAllPatterns = this._children.every(
      pattern => pattern instanceof _Pattern_js__WEBPACK_IMPORTED_MODULE_0__["default"]
    );

    if (!areAllPatterns) {
      throw new Error(
        "Invalid Argument: All patterns need to be an instance of Pattern."
      );
    }

    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: Composite Patterns needs to have more than one value pattern."
      );
    }

    if (typeof this.name !== "string") {
      throw new Error(
        "Invalid Argument: Composite Patterns needs to have a name that's a string."
      );
    }
  }

  _cloneChildren() {
    // We need to clone the patterns so nested patterns can be parsed.
    this._children = this._children.map(pattern => pattern.clone());

    // We need to freeze the childen so they aren't modified.
    Object.freeze(this._children);
  }

  _assignAsParent(){
    this._children.forEach(child => (child.parent = this));
  }

  clone() {
    throw new Error("Not Yet Implemented");
  }
}


/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return StackInformation; });
class StackInformation {
    constructor(mark, pattern){
        this.mark = mark;
        this.pattern = pattern;
        this.expectations = [];
    }
}

/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return OptionalComposite; });
/* harmony import */ var _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(18);


class OptionalComposite extends _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(pattern) {
    super("optional-composite", [pattern]);
    this._assertArguments();
  }

  _assertArguments() {
    if (!(this.children[0] instanceof _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"])) {
      throw new Error("Invalid Arguments: Expected a CompositePattern.");
    }
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
      return node;
    }
  }

  clone() {
    return new OptionalComposite(this.children[0]);
  }

  getCurrentMark() {
    return this.mark;
  }
}


/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return OrComposite; });
/* harmony import */ var _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(18);
/* harmony import */ var _Cursor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
/* harmony import */ var _StackInformation_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(19);
/* harmony import */ var _value_OptionalValue_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(11);
/* harmony import */ var _OptionalComposite_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(20);
/* harmony import */ var _ParseError_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(10);







class OrComposite extends _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, patterns) {
    super(name, patterns);
    this._assertArguments();
  }

  _assertArguments() {
    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: OrValue needs to have more than one value pattern."
      );
    }

    const hasOptionalChildren = this._children.some(
      pattern =>
        pattern instanceof _value_OptionalValue_js__WEBPACK_IMPORTED_MODULE_3__["default"] || pattern instanceof _OptionalComposite_js__WEBPACK_IMPORTED_MODULE_4__["default"]
    );

    if (hasOptionalChildren) {
      throw new Error("OrComposite cannot have optional values.");
    }
  }

  _reset(cursor) {
    this.cursor = null;
    this.mark = null;
    this.index = 0;
    this.node = null;

    if (cursor != null) {
      this.cursor = cursor;
      this.mark = cursor.mark();
    }
  }

  parse(cursor) {
    this._reset(cursor);
    this._assertCursor();
    this._tryPattern();

    return this.node;
  }

  _assertCursor() {
    if (!(this.cursor instanceof _Cursor_js__WEBPACK_IMPORTED_MODULE_1__["default"])) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
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
        this.cursor.setIndex(this.node.endIndex);
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

  getCurrentMark() {
    return this.mark;
  }
}


/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return RepeatComposite; });
/* harmony import */ var _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(18);
/* harmony import */ var _ast_CompositeNode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _ParseError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(10);
/* harmony import */ var _OptionalComposite_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(20);





class RepeatComposite extends _CompositePattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name, pattern, divider) {
    super(name, divider != null ? [pattern, divider] : [pattern]);
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
          this.mark.index,
          this
        )
      );
      this.node = null;
    } else {
      this.node = new _ast_CompositeNode_js__WEBPACK_IMPORTED_MODULE_1__["default"](
        this.name,
        this.nodes[0].startIndex,
        this.nodes[this.nodes.length - 1].endIndex
      );

      this.node.children = this.nodes;
      this.cursor.setIndex(this.node.endIndex);
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
}


/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return RecursivePattern; });
/* harmony import */ var _Pattern_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _ParseError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);



class RecursivePattern extends _Pattern_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(name) {
    super(name);
  }

  getPattern() {
    return this._climb(this.parent, pattern => {
      return pattern.name === this.name;
    });
  }

  _climb(pattern, isMatch) {
    if (isMatch(pattern)) {
      return pattern;
    } else {
      if (pattern.parent != null) {
        return this._climb(pattern.parent, isMatch);
      }
      return null;
    }
  }

  parse(cursor) {
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

    return this.pattern.parse(cursor);
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new RecursivePattern(name);
  }

  getCurrentMark() {
    return this.pattern.getCurrentMark();
  }
}


/***/ })
/******/ ]);
});