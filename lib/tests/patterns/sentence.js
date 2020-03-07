"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../../index.js");

var pat = new _index.Literal("pat", "Pat");
var dan = new _index.Literal("dan", "Dan");
var store = new _index.Literal("store", "store");
var bank = new _index.Literal("bank", "bank");
var big = new _index.Literal("big", "big");
var small = new _index.Literal("small", "small");
var space = new _index.Literal("space", " ");
var wentTo = new _index.Literal("went-to", "went to");
var visited = new _index.Literal("visited", "visited");
var a = new _index.Literal("a", "a");
var the = new _index.Literal("the", "the");
var noun = new _index.OrComposite("noun", [pat, dan]);
var location = new _index.OrComposite("location", [store, bank]);
var verb = new _index.OrComposite("verb", [wentTo, visited]);
var adjective = new _index.OrComposite("adjective", [big, small]);
var article = new _index.OrComposite("article", [a, the]);
var sentence = new _index.AndComposite("sentence", [noun, space, verb, space, article, space, adjective, space, location]);
var _default = sentence;
exports.default = _default;
//# sourceMappingURL=sentence.js.map