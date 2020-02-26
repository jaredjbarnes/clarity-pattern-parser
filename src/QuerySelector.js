export default class Query {
    constructor(node){
        this.node = node;
        this.context = [];
        this.selector = null;
    }

    setRootNode(node){
        this.node = node;
    }

    walkDown(){

    }

    walkUp(){

    }

    select(selector){
        this.selector
    }

    selectAll(selector){

    }
}