export default class CursorHistory {
  constructor() {
    this.isRecording = false;

    this.furthestMatch = {
      pattern: null,
      astNode: null,
    };

    this.furthestError = null;

    this.patterns = [];
    this.astNodes = [];
    this.errors = [];
  }

  addMatch(pattern, astNode) {
    if (this.isRecording) {
      this.patterns.push(pattern);
      this.astNodes.push(astNode);
    }

    if (
      this.furthestMatch.astNode == null ||
      astNode.endIndex >= this.furthestMatch.astNode.endIndex
    ) {
      this.furthestMatch.pattern = pattern;
      this.furthestMatch.astNode = astNode;
    }
  }

  addError(error) {
    if (this.isRecording) {
      this.errors.push(error);
    }

    if (this.furthestError == null || error.index >= this.furthestError.index) {
      this.furthestError = error;
    }
  }

  startRecording() {
    this.isRecording = true;
  }

  stopRecording() {
    this.isRecording = false;
    this.clear();
  }

  clear() {
    this.patterns.length = 0;
    this.astNodes.length = 0;
    this.errors.length = 0;
  }

  getFurthestError() {
    return this.furthestError;
  }

  getFurthestMatch() {
    return this.furthestMatch;
  }

  getLastMatch() {
    if (this.isRecording) {
      return {
        pattern: this.patterns[this.patterns.length - 1] || null,
        astNode: this.astNodes[this.astNodes.length - 1] || null,
      };
    } else {
      return this.furthestMatch;
    }
  }

  getLastError() {
    return this.errors[this.errors.length - 1] || null;
  }
}
