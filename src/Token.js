const SPACE = /\s/;

export default class Token {
    parse(cursor) {
        let match = "";
        let character = cursor.getChar();

        if (SPACE.test(character)) {
            return null;
        } else {
            match = character;
        }

        while (cursor.hasNext()) {
            cursor.next();
            character = cursor.getChar();

            if (SPACE.test(character)) {
                break;
            }

            match += character;
        }

        if (match.length > 0) {
            return match;
        } else {
            return null;
        }
    }
}