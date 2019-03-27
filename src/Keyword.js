export default class Keyword {
    constructor(value) {
        this.value = value;

        this.assertValidity();
    }

    assertValidity() {
        if (this.isNullOrEmpty(this.value)) {
            throw new Error("Illegal Argument: Keyword needs to have a value that has a length greater than 0.");
        }
    }

    isNullOrEmpty(value) {
        return value == null || (typeof value === "string" && value.length === 0);
    }

    parse(cursor) {
        const length = this.value.length;
        let match = "";

        for (let x = 0; x < length; x++) {
            const character = cursor.getChar();

            if (character !== this.value.charAt(x)) {
                return null;
            } else {
                match += character;
            }

            if (cursor.hasNext()) {
                cursor.next();
            } else {
                break;
            }
        }


        if (match === this.value) {
            return this.value;
        } else {
            return null;
        }

    }
}