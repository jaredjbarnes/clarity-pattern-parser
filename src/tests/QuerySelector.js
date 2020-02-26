import ValueNode from "../QuerySelector.js";
import assert from "assert";

exports["QuerySelector: Select by attribute."] = ()=>{
    const selector = "[type]='type-name'";
};

exports["QuerySelector: Select descendant."] = ()=>{
    const selector = "[type]='type' [name]='name'";
};

exports["QuerySelector: Select children."] = ()=>{
    const selector = "[type]='type' > [name]='name'";
};

exports["QuerySelector: Select grand-children."] = ()=>{
    const selector = "[type]='type' > [name]='name' > [type]='type'";
};