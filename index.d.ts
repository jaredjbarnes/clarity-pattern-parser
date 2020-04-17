export declare class Node {
  constructor(type: string, name: string, startIndex: number, endIndex: number);

  filter(shouldKeep: (node: Node) => boolean): Node[];
  clone(): Node;
  toString(): string;
}

export declare class CompositeNode extends Node {
  constructor(
    type: string,
    name: string,
    startIndex?: number,
    endIndex?: number
  );

  children: Node[];

  clone(): CompositeNode;
  filter(shouldKeep: (node: Node) => boolean): Node[];
  toString(): string;
}

export declare class ValueNode extends Node {
  constructor(
    type: string,
    name: string,
    value: string,
    startIndex?: number,
    endIndex?: number
  );

  clone(): ValueNode;
  filter(shouldKeep: (node: Node) => boolean): Node[];
  toString(): string;
}

export declare class Pattern {
  constructor(type?: string, name?: string, children?: Node[]);

  name: string | null;
  type: string | null;
  parent: Pattern;
  children: Pattern[];

  parse(cursor: Cursor): Node | null;
  exec(text: string): Node | null;
  test(text: string): boolean;
  clone(): Pattern;
  getPossibilities(): string[];
}

export declare class ValuePattern extends Pattern {
  constructor(type: string, name: string, children?: Pattern[]);

  clone(): ValuePattern;
}

export declare class CompositePattern extends Pattern {
  constructor(type: string, name: string, children?: Pattern[]);

  clone(): CompositePattern;
}

export declare class AndValue extends ValuePattern {
  constructor(name: string, patterns: Pattern[]);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): AndValue;
  clone(): AndValue;
}

export declare class AnyOfThese extends ValuePattern {
  constructor(name: string, characters: string);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): AnyOfThese;
  clone(): AnyOfThese;
}

export declare class Literal extends ValuePattern {
  constructor(name: string, text: string);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): Literal;
  clone(): Literal;
}

export declare class NotValue extends ValuePattern {
  constructor(name: string, pattern: Pattern);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): NotValue;
  clone(): NotValue;
}

export declare class OptionalValue extends ValuePattern {
  constructor(pattern: ValuePattern);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): OptionalValue;
  clone(): OptionalValue;
}

export declare class OrValue extends ValuePattern {
  constructor(name: string, possibilities: ValuePattern[]);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): OrValue;
  clone(): OrValue;
}

export declare class RegexValue extends ValuePattern {
  constructor(name: string, regex: string);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): RegexValue;
  clone(): RegexValue;
}

export declare class RepeatValue extends ValuePattern {
  constructor(name: string, pattern: Pattern, divider?: Pattern);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): RepeatValue;
  clone(): RepeatValue;
}

export declare class AndComposite extends CompositePattern {
  constructor(name: string, patterns: Pattern[]);

  parse(cursor: Cursor): CompositeNode | null;
  exec(text: string): CompositeNode | null;
  clone(withName: string): AndComposite;
  clone(): AndComposite;
}

export declare class OptionalComposite extends CompositePattern {
  constructor(pattern: Pattern);

  parse(cursor: Cursor): CompositeNode | null;
  exec(text: string): CompositeNode | null;
  clone(withName: string): OptionalComposite;
  clone(): OptionalComposite;
}

export declare class OrComposite extends CompositePattern {
  constructor(name: string, patterns: Pattern[]);

  parse(cursor: Cursor): CompositeNode | null;
  exec(text: string): CompositeNode | null;
  clone(withName: string): OrComposite;
  clone(): OrComposite;
}

export declare class RepeatComposite extends CompositePattern {
  constructor(name: string, pattern: Pattern, divider?: Pattern);

  parse(cursor: Cursor): CompositeNode;
  exec(text: string): CompositeNode | null;
  clone(withName: string): RepeatComposite;
  clone(): RepeatComposite;
}

export declare class RecursivePattern extends Pattern {
  constructor(name: string);

  parse(cursor: Cursor): CompositeNode | ValueNode | null;
  exec(text: string): CompositeNode | ValueNode | null;
  clone(withName: string): RecursivePattern;
  clone(): RecursivePattern;
}

export type ParseInspection = {
  pattern: Pattern | null;
  astNode: Node | null;
  match: {
    text: string;
    startIndex: number;
    endIndex: number;
  } | null;
  error: {
    text: string;
    startIndex: number;
    endIndex: number;
  } | null;
  possibilities: {
    startIndex: number;
    options: string[] | null;
  } | null;
};

export declare class ParseInspector {
  inspectParse(text: string, pattern: Pattern): ParseInspection;
  static inspectParse(text: string, pattern: Pattern): ParseInspection;
}

export type TextInspection = {
  pattern: Pattern | null;
  astNode: Node | null;
  match: {
    text: string;
    startIndex: number;
    endIndex: number;
  } | null;
  error: {
    text: string;
    startIndex: number;
    endIndex: number;
  } | null;
  tokens: {
    startIndex: number;
    options: string[] | null;
  } | null;
  isComplete: boolean;
  parseStack: Node[] | null;
};

export declare class TextInspector {
  inspect(text: string, pattern: Pattern): TextInspection;
  static inspect(text: string, pattern: Pattern): TextInspection;
}

export declare class ParseError {
  constructor(message: string, index: number, pattern: Pattern);

  message: string;
  name: string;
  index: number;
  pattern: Pattern;
}

export declare class Cursor {
  constructor(text: string);

  parseError: ParseError;

  startRecording(): void;
  stopRecording(): void;
}
