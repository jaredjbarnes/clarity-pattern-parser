import * as assert from "assert";
import Cursor from "../Cursor";

exports["Cursor: Bad constructor."] = function () {
    assert.throws(
        () => {
            new Cursor();
        }, {
            message: "Illegal Argument: Cursor needs to have a string that has a length greater than 0."
        }
    );
};

exports["Cursor: Constructor."] = function () {
    new Cursor("String of Text!");
};

exports["Cursor: moveToLast()"] = function () {
    const cursor = new Cursor("abc");
    cursor.moveToLast();
    assert.equal(cursor.getChar(), "c");
}

exports["Cursor: moveToBeginning()"] = function () {
    const cursor = new Cursor("abc");
    cursor.moveToBeginning();
    assert.equal(cursor.getChar(), "a");
}

exports["Cursor: next()."] = function () {
    const cursor = new Cursor("abc");

    assert.equal(cursor.getChar(), "a");
    cursor.next();
    assert.equal(cursor.getChar(), "b");
    cursor.next();
    assert.equal(cursor.getChar(), "c");
};

exports["Cursor: Unchecked next()."] = function () {
    const cursor = new Cursor("a");

    assert.throws(()=>{
        cursor.next();
    },{
        message: "Out of Bounds Exception."
    });
   
};

exports["Cursor: previous()."] = function () {
    const cursor = new Cursor("abc");
    cursor.moveToLast();

    assert.equal(cursor.getChar(), "c");
    cursor.previous();
    assert.equal(cursor.getChar(), "b");
    cursor.previous();
    assert.equal(cursor.getChar(), "a");
};

exports["Cursor: Unchecked previous()."] = function () {
    const cursor = new Cursor("a");

    assert.throws(()=>{
        cursor.previous();
    },{
        message: "Out of Bounds Exception."
    });
   
};

exports["Cursor: hasNext()."] = function () {
    const cursor = new Cursor("a");

    assert.equal(cursor.hasNext(), false);
};

exports["Cursor: hasPrevious()."] = function () {
    const cursor = new Cursor("a");

    assert.equal(cursor.hasPrevious(), false);
};

exports["Cursor: getIndex()."] = function () {
    const cursor = new Cursor("ab");

    assert.equal(cursor.getIndex(), 0);
    cursor.next();
    assert.equal(cursor.getIndex(), 1);
};

exports["Cursor: mark() and moveToMark()."] = function () {
    const cursor = new Cursor("abc");
    const mark = cursor.mark();

    cursor.next();
    cursor.next();
    assert.equal(cursor.getIndex(), 2);

    cursor.moveToMark(mark);
    assert.equal(cursor.getIndex(), 0);
};

exports["Cursor: mark() on 1 and moveToMark()."] = function () {
    const cursor = new Cursor("abc");
    cursor.next();

    const mark = cursor.mark();

    cursor.next();
    assert.equal(cursor.getIndex(), 2);

    cursor.moveToMark(mark);
    assert.equal(cursor.getIndex(), 1);
};

exports["Cursor: Bad mark, moveToMark()."] = function () {
    const cursor = new Cursor("abc");

    assert.throws(
        () => {
            cursor.moveToMark({ index: 0 });
        }, {
            message: "Illegal Argument: The mark needs to be an instance of Mark and created by this cursor."
        }
    );
};