import {
    ENodeType,
    ETokenType,
    IAst,
    ILine,
    ILineNode,
    INodeLength,
    INodeLine,
    IToken,
} from "./interfaces";

/**
 * The parser takes an array of tokens and compute into an AST.
 *
 * ```
 * const tokens = [
 *      { type: "num", value: "35" },
 *      { type: "char", value: "a" }
 * ];
 * const ast = parser(tokens);
 *      {
 *          type: "SwiftPattern",
 *          body: [
 *              {
 *                  type: "line",
 *                  nodes: [
 *                      {
 *                          type: "field",
 *                          length: { min: 0, max: 35 },
 *                          char: "a"
 *                      },
 *                  ]
 *              }
 *          ]
 *      }
 * ```
 *
 * @param tokens the SWIFT field pattern string
 * @returns the tokens array
 */
export const parser = (tokens: IToken[]): IAst => {
    tokens = tokens || [];
    const lines: ILine[] = splitLines(tokens);
    // tslint:disable-next-line:max-line-length
    const body: INodeLine[] = lines.map(({ tokens: t, optional: o }) => parse(t, o));
    const ast: IAst = {
        type: "SwiftPattern",
        body,
    };

    return ast;
};

/**
 * The parse function takes an array of tokens and compute them into an
 * array of nodes.
 *
 * ```
 * const tokens = [
 *     { type: ETokenType.num, value: "35" },
 *     { type: ETokenType.char, value: "a" },
 *     { type: ETokenType.bracket, value: "[" },
 *     { type: ETokenType.num, value: "3" },
 *     { type: ETokenType.quant, value: "-" },
 *     { type: ETokenType.num, value: "20" },
 *     { type: ETokenType.char, value: "c" },
 *     { type: ETokenType.bracket, value: "]" },
 * ];
 * const ast = parser(tokens);
 *  {
 *      type: "line",
 *      nodes: [
 *          {
 *              type: "field",
 *              length: { min: 0, max: 35 },
 *              char: "a",
 *          },
 *          {
 *              type: "optionalField",
 *              nodes: [
 *                  {
 *                      type: "field",
 *                      length: { min: 3, max: 20 },
 *                      char: "c",
 *                  },
 *              ],
 *          },
 *      ],
 *  },
 * ```
 *
 * @param tokens
 */
export const parse = (tokens: IToken[], optional?: boolean): INodeLine => {
    let current = 0;

    const walk = (): ILineNode => {
        let token = getToken(tokens[current]);

        if (token.type === ETokenType.char) {
            throw new Error(`Missing number token for character token "${token.value}"`);
        }

        if (token.type === ETokenType.num) {
            const num = token.value;
            const nextToken = getToken(tokens[++current]);

            switch (nextToken.type) {
                case ETokenType.quant:
                    // min/max quantifier e.g. "3-5x" consists of
                    // min (3), quant (-), max (5) and char (x)
                    // so we need to increment to get max and then the char
                    if (nextToken.value === "-") {
                        return {
                            type: ENodeType.field,
                            length: getLengthObj(
                                num,
                                nextToken.value,
                                getToken(tokens[++current]).value,
                            ),
                            char: getToken(tokens[++current]).value,
                        };
                    }
                    // quantifer e.g. "3!x" wich consits just of
                    // max (3), quant (!) and char (x)
                    // so we need to just increment once to get the char
                    else {
                        return {
                            type: ENodeType.field,
                            length: getLengthObj(num, nextToken.value),
                            char: getToken(tokens[++current]).value,
                        };
                    }
                case ETokenType.char:
                    return {
                        type: ENodeType.field,
                        length: getLengthObj(num),
                        char: nextToken.value,
                    };
                default:
                    throw new Error(`Missing character or quantifier token after number token "${num}"`);
            }
        }

        // optional Field e.g."[35a3c]" which consists of optional field 35a
        // and field 3c
        if (token.type === ETokenType.bracket && token.value === "[") {
            const optionalNodes: ILineNode[] = [];
            token = getToken(tokens[++current]);

            while (
                token.type !== ETokenType.bracket ||
                token.type === ETokenType.bracket && token.value !== "]"
            ) {
                optionalNodes.push(walk());
                token = getToken(tokens[++current]);
            }

            return { type: ENodeType.optional, nodes: optionalNodes };
        }

        // block Field e.g."(35a3c)" which consists of field 35a
        // and field 3c
        if (token.type === ETokenType.paren && token.value === "(") {
            const blockNodes: ILineNode[] = [];
            token = getToken(tokens[++current]);

            while (
                token.type !== ETokenType.paren ||
                token.type === ETokenType.paren && token.value !== ")"
            ) {
                blockNodes.push(walk());
                token = getToken(tokens[++current]);
            }

            return { type: ENodeType.block, nodes: blockNodes };
        }

        if (token.type === ETokenType.const) {
            const char = token.value;
            const length = char.length;
            return {
                type: ENodeType.field,
                length: { min: length, max: length },
                char,
            };
        }

        if (token.type === ETokenType.sign) {
            return {
                type: ENodeType.sign,
                char: token.value,
            };
        }

        throw new Error(`Unknown token type "${token.type}" with value "${token.value}"`);
    };

    const nodes: ILineNode[] = [];

    while (current < tokens.length) {
        nodes.push(walk());
        current++;
    }

    const line: INodeLine = { type: ENodeType.line, nodes };

    if (optional) {
        line.optional = optional;
    }

    return line;
};

/**
 * The splitLines function takes an array of tokens and compute into an
 * array of lines with the corresponding tokens.
 *
 * ```
 * const tokens = [
 *     { type: ETokenType.num, value: "35" },
 *     { type: ETokenType.char, value: "a" },
 *     { type: ETokenType.bracket, value: "[" },
 *     { type: ETokenType.num, value: "3" },
 *     { type: ETokenType.quant, value: "-" },
 *     { type: ETokenType.num, value: "20" },
 *     { type: ETokenType.char, value: "c" },
 *     { type: ETokenType.bracket, value: "]" },
 *     { type: ETokenType.num, value: "2" },
 *     { type: ETokenType.multilineQuant, value: "*" },
 *     { type: ETokenType.num, value: "35" },
 *     { type: ETokenType.char, value: "a" },
 * ];
 * const ast = parser(tokens);
 *      [
 *          {
 *              type: "line",
 *              tokens: [
 *                  { type: "num", value: "35" },
 *                  { type: "char", value: "a" },
 *                  { type: "bracket", value: "[" },
 *                  { type: "num", value: "3" },
 *                  { type: "quant", value: "-" },
 *                  { type: "num", value: "20" },
 *                  { type: "char", value: "c" },
 *                  { type: "bracket", value: "]" },
 *              ]
 *          },
 *          {
 *              type: "line",
 *              tokens: [
 *                  { type: "num", value: "35" },
 *                  { type: "char", value: "a" },
 *              ]
 *          },
 *          {
 *              type: "line",
 *              tokens: [
 *                  { type: "num", value: "35" },
 *                  { type: "char", value: "a" },
 *              ]
 *          }
 *      ]
 * ```
 *
 * @param tokens
 */
export const splitLines = (tokens: IToken[]): ILine[] => {
    const lines: ILine[] = [];
    let current = 0;

    while (current < tokens.length) {
        const token = tokens[current];
        const nextToken = getToken(tokens[++current]);

        if (nextToken.type === ETokenType.multilineQuant) {
            current++;
            const num = +token.value;
            for (let i = 0; i < num; i++) {
                const multilineTokens = tokens.slice(current);
                lines.push({
                    type: "line",
                    optional: true,
                    tokens: multilineTokens,
                });
            }
            break;
        }

        if (token.type === ETokenType.newline) {
            lines.push({
                type: "line",
                tokens: [],
            });
            continue;
        }

        let line = lines[lines.length - 1];

        if (!line) {
            lines.push({
                type: "line",
                tokens: [],
            });
        }

        line = lines[lines.length - 1];
        line.tokens.push(token);
    }

    return lines;
};

/**
 * Returns the token when it is defined or an undefined token.
 * @param token
 */
export const getToken = (token?: IToken): IToken => {
    return token || { type: ETokenType.undefined, value: "" };
};

/**
 * Returns an length object based on the provided quantifier.
 * @param num1
 * @param quant
 */
export const getLengthObj = (
    num1: string,
    quant?: string,
    num2?: string,
): INodeLength => {
    switch (quant) {
        case "!":
            return { min: +num1, max: +num1 };
        case "-":
            if (!num2) {
                throw new Error("Missing secound number for min/max quantifier!");
            }
            return { min: +num1, max: +num2 };
        default:
            return { min: 0, max: +num1 };
    }
};
