export default class Node {
    constructor(type){
        this.type = type;
    }

    clone(){
        throw new Error("Not Implemented Exception: expected subclass to override this method.");
    }

}