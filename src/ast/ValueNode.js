import Node from './Node.js';

export default class ValueNode extends Node {
    constructor(type, value){
        super(type);
        this.value = value;
    }

    clone(){
        return new ValueNode(this.type, this.value);
    }
}