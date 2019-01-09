import { ETokenType, IToken } from "./interfaces";

const regExpFactory = (regExp: RegExp) => (n: string) => regExp.test(n);
const isNumber = regExpFactory(/[0-9]/);
const isChar = regExpFactory(/[a-z]/);
const isQuant = regExpFactory(/[!\-]/);
const isMultilineQuant = regExpFactory(/[*]/);
const isSign = regExpFactory(/[/:]/);
const isBracket = regExpFactory(/[\[\]]/);
const isParen = regExpFactory(/[()]/);
const isNewline = regExpFactory(/\n/);
const isConst = regExpFactory(/[A-Z]/);

/**
 * The tokenizer accepts a SWIFT field pattern and returns an array of tokens.
 *
 * ```
 * const tokens = tokenizer("35a");
 * // => [{ type: "num", value: "35" },  { type: "char", value: "a" }]
 * ```
 *
 * @param input the SWIFT field pattern string
 * @returns the tokens array
 */
export const tokenizer = (input: string): IToken[] => {
    const tokens: IToken[] = [];
    let current = 0;
    input = input || "";

    while (current < input.length) {
        let char: string = input[current];
        current++;

        if (isNumber(char)) {
            let value = char;
            char = input[current];

            while (isNumber(char)) {
                value += char;
                char = input[++current];
            }

            tokens.push({ type: ETokenType.num, value });
            continue;
        }

        if (isChar(char)) {
            tokens.push({ type: ETokenType.char, value: char });
            continue;
        }

        if (isQuant(char)) {
            tokens.push({ type: ETokenType.quant, value: char });
            continue;
        }

        if (isMultilineQuant(char)) {
            tokens.push({ type: ETokenType.multilineQuant, value: char });
            continue;
        }

        if (isSign(char)) {
            tokens.push({ type: ETokenType.sign, value: char });
            continue;
        }

        if (isBracket(char)) {
            tokens.push({ type: ETokenType.bracket, value: char });
            continue;
        }

        if (isParen(char)) {
            tokens.push({ type: ETokenType.paren, value: char });
            continue;
        }

        if (isNewline(char)) {
            tokens.push({ type: ETokenType.newline, value: char });
            continue;
        }

        if (isConst(char)) {
            let value = char;
            char = input[current];

            while (isConst(char)) {
                value += char;
                char = input[++current];
            }

            tokens.push({ type: ETokenType.const, value });
            continue;
        }

        throw new Error(`Unmatched character "${char}"`);
    }

    return tokens;
};
