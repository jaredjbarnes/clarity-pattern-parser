export default class Node {
    constructor(type, startIndex = 0, endIndex = 0){
        this.type = type;
        this.startIndex = startIndex; 
        this.endIndex = endIndex;

        if (typeof this.startIndex !== "number" || typeof this.endIndex !== "number"){
            throw new Error("Invalid Arguments: startIndex and endIndex need to be number.");
        }
    }

    clone(){
        throw new Error("Not Implemented Exception: expected subclass to override this method.");
    }

}