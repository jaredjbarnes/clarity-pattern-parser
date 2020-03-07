declare class Node {
  constructor(type: string, name: string, startIndex: number, endIndex: number);

  filter(): Node[] | null;
  clone(): Node;
  toString(): string;
}

declare class CompositeNode {
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

declare class ValueNode {
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

declare class Pattern {
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

declare class ValuePattern extends Pattern {
  constructor(type: string, name: string, children?: Pattern[]);

  clone(): ValuePattern;
}

declare class CompositePattern {
  constructor(type: string, name: string, children?: Pattern[]);

  clone(): CompositePattern;
}

declare class AndValue extends ValuePattern {
  constructor(name: string, patterns: Pattern[]);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): AndValue;
  clone(): AndValue;
}

declare class AnyOfThese extends ValuePattern {
  constructor(name: string, characters: string);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): AnyOfThese;
  clone(): AnyOfThese;
}

declare class Literal extends ValuePattern {
  constructor(name: string, text: string);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): Literal;
  clone(): Literal;
}

declare class NotValue extends ValuePattern {
  constructor(name: string, pattern: Pattern);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): NotValue;
  clone(): NotValue;
}

declare class OptionalValue extends ValuePattern {
  constructor(pattern: ValuePattern);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): OptionalValue;
  clone(): OptionalValue;
}

declare class OrValue extends ValuePattern {
  constructor(name: string, possibilities: ValuePattern[]);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): OrValue;
  clone(): OrValue;
}

declare class RegexValue extends ValuePattern {
  constructor(name: string, regex: string);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): RegexValue;
  clone(): RegexValue;
}

declare class RepeatValue extends ValuePattern {
  constructor(name: string, pattern: Pattern, divider?: Pattern);

  parse(cursor: Cursor): ValueNode | null;
  exec(text: string): ValueNode | null;
  clone(withName: string): RepeatValue;
  clone(): RepeatValue;
}

declare class AndComposite extends CompositePattern {
  constructor(name: string, patterns: Pattern[]);

  parse(cursor: Cursor): CompositeNode | null;
  exec(text: string): CompositeNode | null;
  clone(withName: string): AndComposite;
  clone(): AndComposite;
}

declare class OptionalComposite extends CompositePattern {
  constructor(pattern: Pattern);

  parse(cursor: Cursor): CompositeNode | null;
  exec(text: string): CompositeNode | null;
  clone(withName: string): OptionalComposite;
  clone(): OptionalComposite;
}

declare class OrComposite extends CompositePattern {
  constructor(name: string, patterns: Pattern[]);

  parse(cursor: Cursor): CompositeNode | null;
  exec(text: string): CompositeNode | null;
  clone(withName: string): OrComposite;
  clone(): OrComposite;
}

declare class RepeatComposite extends CompositePattern {
  constructor(name: string, pattern: Pattern, divider?: Pattern);

  parse(cursor: Cursor): CompositeNode;
  exec(text: string): CompositeNode | null;
  clone(withName: string): RepeatComposite;
  clone(): RepeatComposite;
}

declare class RecursivePattern extends Pattern {
  constructor(name: string);

  parse(cursor: Cursor): CompositeNode | ValueNode | null;
  exec(text: string): CompositeNode | ValueNode | null;
  clone(withName: string): RecursivePattern;
  clone(): RecursivePattern;
}

type ParseInspection = {
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

declare class ParseInspector {
  inspectParse(text: string, pattern: Pattern): ParseInspection;
  static inspectParse(text: string, pattern: Pattern): ParseInspection;
}

declare class ParseError {
  constructor(message: string, index: number, pattern: Pattern);

  message: string;
  name: string;
  index: number;
  pattern: Pattern;
}

declare class Cursor {
  constructor(text: string);

  parseError: ParseError;

  startRecording(): void;
  stopRecording(): void;
}
