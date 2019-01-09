import { generator } from "./generator";
import { ISwiftObject } from "./interfaces";
import { parser } from "./parser";
import { tokenizer } from "./tokenizer";

/**
 * The compiler takes a swift pattern string and returns a swift object.
 *
 * ```
 * compiler("35a");
 *      {
 *          linesCount: 1,
 *          lines: [
 *              {
 *                  minChars: 0,
 *                  maxChars: 35,
 *                  regExp: /[A-Z]{0,35}/,
 *                  allowedCharsClass: /[A-Z]/,
 *              },
 *          ],
 *          maxChars: 35,
 *          regExp: /[A-Z]{0,35}/,
 *          allowedCharsClass: /[A-Z]/,
 *      }
 * ```
 * @param input the swift pattern for compilation
 */
export const compiler = (input: string): ISwiftObject => {
    const tokens = tokenizer(input);
    const ast = parser(tokens);
    const output = generator(ast);

    return output;
};

export default compiler;
