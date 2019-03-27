import Mark from "./Mark";

export default class Cursor {
    constructor(string) {
        this.string = string;
        this.index = 0;

        this.assertValidity();
    }

    assertValidity() {
        if (this.isNullOrEmpty(this.string)) {
            throw new Error("Illegal Argument: Cursor needs to have a string that has a length greater than 0.");
        }
    }

    isNullOrEmpty(value) {
        return value == null || (typeof value === "string" && value.length === 0);
    }

    hasNext() {
        return this.index + 1 < this.string.length;
    }

    hasPrevious() {
        return this.index - 1 >= 0;
    }

    next() {
        if (this.hasNext()) {
            this.index++;
        } else {
            throw new Error("Out of Bounds Exception.");
        }
    }

    previous() {
        if (this.hasPrevious()) {
            this.index--;
        } else {
            throw new Error("Out of Bounds Exception.");
        }
    }

    mark(name) {
        return new Mark(name, this, this.index);
    }

    moveToMark(mark) {
        if (mark instanceof Mark && mark.cursor === this) {
            this.index = mark.index;
            return true;
        } else {
            throw new Error("Illegal Argument: The mark needs to be an instance of Mark and created by this cursor.");
        }
    }

    moveToBeginning() {
        this.index = 0;
    }

    moveToLast() {
        this.index = this.string.length - 1;
    }

    getChar() {
        return this.string.charAt(this.index);
    }

    getIndex() {
        return this.index;
    }
}