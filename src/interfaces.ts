/**
 * Enum of all token types.
 */
export enum ETokenType {
    num = "num",
    char = "char",
    sign = "sign",
    bracket = "bracket",
    newline = "newline",
    const = "const",
    paren = "paren",
    quant = "quant",
    multilineQuant = "multilineQuant",
    undefined = "undefined",
}

export enum ENodeType {
    field = "field",
    sign = "sign",
    optional = "optional",
    block = "block",
    line = "line",
}

/**
 * Token the tokenizer creates.
 */
export interface IToken {
    type: ETokenType;
    value: string;
}

export interface ILine {
    type: string;
    tokens: IToken[];
    optional?: boolean;
}

export interface INodeLength {
    min: number;
    max: number;
}

/**
 * Ast object part of the ast returned by the parser.
 */
export interface INodeField {
    type: ENodeType.field;
    length: INodeLength;
    char: string;
}

export interface INodeOptional {
    type: ENodeType.optional;
    nodes: ILineNode[];
}

export interface INodeBlock {
    type: ENodeType.block;
    nodes: ILineNode[];
}

// tslint:disable-next-line:max-line-length
export type ILineNode = INodeField | INodeLine | INodeSign | INodeOptional | INodeBlock;

/**
 * Ast line object describing a line of the Ast.
 */
export interface INodeLine {
    type: ENodeType.line;
    nodes: ILineNode[];
    optional?: boolean;
}

export interface INodeSign {
    type: ENodeType.sign;
    char: string;
}

/**
 * Ast returned by the parser.
 */
export interface IAst {
    type: string;
    body: INodeLine[];
}

/**
 * Swift Object returned by the generator.
 */
export interface ISwiftObject {
    linesCount: number;
    lines: ISwiftLineObject[];
    minChars: number;
    maxChars: number;
    regExp: string;
    allowedCharsClass: string;
}

/**
 * Swift Line Object describing a line in an ISwiftObject.
 */
export interface ISwiftLineObject {
    minChars: number;
    maxChars: number;
    regExp: string;
    allowedCharsClass: string;
}
