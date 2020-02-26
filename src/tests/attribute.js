import attribute from "../queryPatterns/attribute.js";
import Cursor from "../Cursor.js";
import assert from "assert";

exports["attribute: valid"] = () => {
    const cursor = new Cursor("[name]='value'");
    const result = attribute.parse(cursor);
    
    assert.equal(result.name, "attribute");
    assert.equal(result.children[0].name, "name");
    assert.equal(result.children[0].children[1].value, "name");
    assert.equal(result.children[1].name, "equal");
    assert.equal(result.children[2].name, "value");
    assert.equal(result.children[2].children[1].value, "value");
    assert.equal(cursor.didSuccessfullyParse(), true);

};

exports["attribute: invalid"] = () => {
    const cursor = new Cursor("[name]]='value'");
    const result = attribute.parse(cursor);
    
    assert.equal(result, null);
    assert.equal(cursor.didSuccessfullyParse(), false);
};

exports["attribute: escaped single quotes."] = () => {
    const cursor = new Cursor("[name]='value''s'");
    const result = attribute.parse(cursor);

    assert.equal(result.name, "attribute");
    assert.equal(result.children[0].name, "name");
    assert.equal(result.children[0].children[1].value, "name");
    assert.equal(result.children[1].name, "equal");
    assert.equal(result.children[2].name, "value");
    assert.equal(result.children[2].children[1].value, "value''s");
    assert.equal(cursor.didSuccessfullyParse(), true);
};
