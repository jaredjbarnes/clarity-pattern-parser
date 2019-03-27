import * as assert from "assert";
import Token from "../Token";
import Cursor from "../Cursor";

exports["Token: Constructor."] = function () {
    const token = new Token();
};

exports["Token: Single character."] = function () {
    const cursor = new Cursor("k");
    const token = new Token();

    const value = token.parse(cursor);

    assert.equal(value, "k");
};

exports["Token: Single space character."] = function () {
    const cursor = new Cursor(" ");
    const token = new Token();

    const value = token.parse(cursor);

    assert.equal(value, null);
};

exports["Token: Tab character."] = function () {
    const cursor = new Cursor("\t");
    const token = new Token();

    const value = token.parse(cursor);

    assert.equal(value, null);
};

exports["Token: Return character."] = function () {
    const cursor = new Cursor("\r");
    const token = new Token();

    const value = token.parse(cursor);

    assert.equal(value, null);
};

exports["Token: Newline character."] = function () {
    const cursor = new Cursor("\n");
    const token = new Token();

    const value = token.parse(cursor);

    assert.equal(value, null);
};

exports["Token: Single space character after token."] = function () {
    const cursor = new Cursor("token ");
    const token = new Token();

    const value = token.parse(cursor);

    assert.equal(value, "token");
    assert.equal(cursor.getChar(), " ");
};

exports["Token: Tab character after token."] = function () {
    const cursor = new Cursor("token\t");
    const token = new Token();

    const value = token.parse(cursor);

    assert.equal(value, "token");
    assert.equal(cursor.getChar(), "\t");
};

exports["Token: Return character after token."] = function () {
    const cursor = new Cursor("token\r");
    const token = new Token();

    const value = token.parse(cursor);

    assert.equal(value, "token");
    assert.equal(cursor.getChar(), "\r");
};

exports["Token: Newline character after token."] = function () {
    const cursor = new Cursor("token\n");
    const token = new Token();

    const value = token.parse(cursor);

    assert.equal(value, "token");
    assert.equal(cursor.getChar(), "\n");
};

exports["Token: Strange Token."] = function () {
    const cursor = new Cursor("*`!@#%$\n");
    const token = new Token();

    const value = token.parse(cursor);

    assert.equal(value, "*`!@#%$");
    assert.equal(cursor.getChar(), "\n");
};
