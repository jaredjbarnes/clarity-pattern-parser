export default class QueryMatcher {
  constructor() {
    this.selectorNode = null;
    this.rootNode = null;
    this.matchingNodes = [];
  }

  getMatches(selectorNode, rootNode) {
      this.selectorNode = selectorNode;
      this.rootNode = rootNode;


  }

  getAttributeMatches(){
    if (this.selectorNode.name === "attribute"){
        const name = this.selectorNode.children[0];
    }
  }

  getDescendantMatches(){

  }

  getDirectDescendantMatches(){

  }
}
