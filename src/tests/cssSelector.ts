import attribute from "../queryPatterns/attribute";
import cssSelector from "../queryPatterns/cssSelector";
import Cursor from "../Cursor";
import assert from "assert";

exports["attribute: valid"] = () => {
    const cursor = new Cursor("[name='value']");
    const result = attribute.parse(cursor);
    
    assert.equal(result.name, "attribute");
    assert.equal(result.children[1].name, "name");
    assert.equal(result.children[1].value, "name");
    assert.equal(result.children[2].name, "equal");
    assert.equal(result.children[3].name, "value");
    assert.equal(result.children[3].children[1].value, "value");
    assert.equal(cursor.didSuccessfullyParse(), true);

};

exports["attribute: invalid"] = () => {
    const cursor = new Cursor("[name]='value']");
    const result = attribute.parse(cursor);
    
    assert.equal(result, null);
    assert.equal(cursor.didSuccessfullyParse(), false);
};

exports["attribute: escaped single quotes."] = () => {
    const cursor = new Cursor("[name='value''s']");
    const result = attribute.parse(cursor);

    assert.equal(result.name, "attribute");
    assert.equal(result.children[1].name, "name");
    assert.equal(result.children[1].value, "name");
    assert.equal(result.children[2].name, "equal");
    assert.equal(result.children[3].name, "value");
    assert.equal(result.children[3].children[1].value, "value''s");
    assert.equal(cursor.didSuccessfullyParse(), true);
};

exports["cssSelector: any element type"] = ()=>{
    const cursor = new Cursor("*");
    const result = cssSelector.parse(cursor);

    assert.equal(result.value, "*");
    assert.equal(result.name, "element-name");
    assert.equal(result.type, "regex-value");
    assert.equal(result.startIndex, 0);
    assert.equal(result.endIndex, 0);
};

exports["cssSelector: element with attribute"] = ()=>{
    const cursor = new Cursor("*[name='value']");
    const result = cssSelector.parse(cursor);

    assert.equal(result.type, "and-composite");
    assert.equal(result.name, "attribute-selector");
    assert.equal(result.children[0].name, "element-name");
    assert.equal(result.children[0].value, "*");
    assert.equal(result.children[1].name, "attribute");
    assert.equal(result.startIndex, 0);
    assert.equal(result.endIndex, 14);
};

exports["cssSelector: element with attribute and a child selector"] = ()=>{
    const cursor = new Cursor("element-name > *[name='value']");
    const result = cssSelector.parse(cursor);
};

exports["cssSelector: element with attribute and two deep child selector"] = ()=>{
    const cursor = new Cursor("element-name > * > *[name='value']");
    const result = cssSelector.parse(cursor);
};