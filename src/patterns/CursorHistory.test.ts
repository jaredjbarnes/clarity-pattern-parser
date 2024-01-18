import { Node } from "../ast/Node";
import { CursorHistory } from "./CursorHistory"
import { Literal } from "./Literal";

describe("CursorHistory", () => {
    test("Add Match", () => {
        const history = new CursorHistory();
        const pattern = new Literal("a", "A");
        const node = new Node("literal", "a", 0, 0, [], "A");

        history.startRecording();
        history.recordMatch(pattern, node);

        expect(history.isRecording).toBeTruthy();

        expect(history.leafMatch.node).toBe(node);
        expect(history.leafMatch.pattern).toBe(pattern);

        expect(history.rootMatch.node).toBe(node);
        expect(history.rootMatch.pattern).toBe(pattern);

        expect(history.nodes[0]).toBe(node);
        expect(history.patterns[0]).toBe(pattern);

        history.stopRecording();

        expect(history.isRecording).toBeFalsy();
    });

    test("Add Error At", () => {
        const history = new CursorHistory();
        const pattern = new Literal("a", "A");
        
        history.startRecording();
        history.recordErrorAt(0, pattern);

        expect(history.error?.index).toBe(0);
        expect(history.error?.pattern).toBe(pattern);
        expect(history.errors[0]?.index).toBe(0);
        expect(history.errors[0]?.pattern).toBe(pattern);

        history.stopRecording()
        history.resolveError();

        expect(history.isRecording).toBeFalsy();
        expect(history.error).toBeNull();
        
        expect(history.errors[0]?.index).toBe(0);
        expect(history.errors[0]?.pattern).toBe(pattern);

        expect(history.furthestError?.index).toBe(0);
        expect(history.furthestError?.pattern).toBe(pattern);
    });
});