import * as assert from "assert";
import Keyword from "../Keyword";
import Cursor from "../Cursor";

exports["Keyword: Bad constructor."] = function () {
    assert.throws(
        () => {
            new Keyword();
        }, {
            message: "Illegal Argument: Keyword needs to have a value that has a length greater than 0."
        }
    );
};

exports["Keyword: Constructor."] = function () {
    new Keyword("Keyword");
};

exports["Keyword: full match parse()."] = function () {
    const cursor = new Cursor("Keyword");
    const keyword = new Keyword("Keyword");

    const value = keyword.parse(cursor);

    assert.equal(value, "Keyword");
};

exports["Keyword: beginning match parse()."] = function () {
    const cursor = new Cursor("Keyword is in the beginning");
    const keyword = new Keyword("Keyword");

    const value = keyword.parse(cursor);

    assert.equal(value, "Keyword");
    assert.equal(cursor.getChar(), " ");
};

exports["Keyword: end match parse()."] = function () {
    const cursor = new Cursor(" keyword");
    const keyword = new Keyword("keyword");
    
    cursor.next();
    const value = keyword.parse(cursor);

    assert.equal(value, "keyword");
    assert.equal(cursor.getChar(), "d");
};

exports["Keyword: no match parse()."] = function () {
    const cursor = new Cursor("keyw");
    const keyword = new Keyword("keyword");
    
    const value = keyword.parse(cursor);

    assert.equal(value, null);
    assert.equal(cursor.getChar(), "w");
};

exports["Keyword: no match with more characters parse()."] = function () {
    const cursor = new Cursor("key wo");
    const keyword = new Keyword("keyword");
    
    const value = keyword.parse(cursor);

    assert.equal(value, null);
    assert.equal(cursor.getChar(), " ");
};