import {
    ENodeType,
    IAst,
    ILineNode,
    INodeBlock,
    INodeField,
    INodeLine,
    INodeOptional,
    INodeSign,
    ISwiftLineObject,
    ISwiftObject,
} from "./interfaces";

/**
 * The object generator takes an ast object and returns a swift object.
 *
 * ```
 * const ast {
 *     type: "SwiftPattern",
 *     body: [
 *          {
 *              type: "line",
 *              nodes: [
 *                  {
 *                      type: "field",
 *                      length: { min: 0, max: 35 },
 *                      char: "a"
 *                  },
 *              ]
 *          }
 *      ]
 * };
 * objectGenerator(ast);
 *      {
 *          linesCount: 1,
 *          lines: [
 *              {
 *                  minChars: 0,
 *                  maxChars: 35,
 *                  regExp: "[A-Z]{0,35}",
 *                  allowedCharsClass: "[A-Z]",
 *              },
 *          ],
 *          maxChars: 35,
 *          regExp: "[A-Z]{0,35}",
 *          allowedCharsClass: "[A-Z]",
 *      }
 * ```
 */
export const generator = (ast: IAst): ISwiftObject => {
    const swiftObj: ISwiftObject = {
        linesCount: 0,
        lines: [],
        minChars: 0,
        maxChars: 0,
        regExp: "",
        allowedCharsClass: "",
    };
    ast = ast || { type: "null", body: null };

    if (ast.type === "SwiftPattern") {
        return ast.body.reduce(generate, swiftObj);
    }

    throw new Error(`Unsupported AST type "${ast.type}"`);
};

/**
 * Generates a swiftObject by processing the nodeLine.
 * @param swiftObject
 * @param nodeLine
 */
const generate = (
    swiftObject: ISwiftObject,
    nodeLine: INodeLine,
): ISwiftObject => {
    // tslint:disable-next-line:max-line-length
    const line: ISwiftLineObject = nodeLine.nodes.reduce(generateLine, getEmptySwiftLineObject());
    swiftObject.lines.push(line);

    let newline = "\n";
    let rAllowedCharsClass = swiftObject.allowedCharsClass;
    if (rAllowedCharsClass) {
        rAllowedCharsClass = combineCharClasses(rAllowedCharsClass, newline);
    }

    let lRegExp = line.regExp;
    if (nodeLine.optional) {
        lRegExp = `(${lRegExp})?`;
        newline += "?";
    }

    const rRegExp = swiftObject.regExp;
    return {
        linesCount: swiftObject.linesCount + 1,
        minChars: swiftObject.minChars + line.minChars,
        maxChars: swiftObject.maxChars + line.maxChars,
        regExp: rRegExp ? rRegExp + newline + lRegExp : lRegExp,
        allowedCharsClass: combineCharClasses(
            rAllowedCharsClass,
            line.allowedCharsClass,
        ),
        lines: swiftObject.lines,
    };
};

/**
 * Generates a line swiftLineObject with the passed lineNode.
 * @param result
 * @param node
 */
const generateLine = (
    result: ISwiftLineObject,
    node: ILineNode,
): ISwiftLineObject => {
    switch (node.type) {
        case ENodeType.field:
            return addField(result, node);
        case ENodeType.sign:
            return addSign(result, node);
        case ENodeType.optional:
            return addOptional(result, node);
        case ENodeType.block:
            return addBlock(result, node);
        default:
            throw new Error(`Unsupported node type "${node.type}"`);
    }
};

/**
 * Returns a new swiftLineObject with the added field values.
 * @param swiftLineObject
 * @param field
 */
const addField = (
    { minChars, maxChars, regExp, allowedCharsClass }: ISwiftLineObject,
    field: INodeField,
): ISwiftLineObject => {
    const { char, length: { min, max } } = field;
    const quantifier = getQuantifier(min, max);
    const charClass = getCharClass(char);

    if (charClass === "") {
        throw new Error(`Unsupported character "${char}" in field`);
    }

    return {
        minChars: minChars + min,
        maxChars: maxChars + max,
        regExp: regExp + charClass + quantifier,
        allowedCharsClass: combineCharClasses(
            allowedCharsClass, charClass,
        ),
    };
};

/**
 * Returns a new swiftLineObject with the added sign values.
 * @param swiftLineObject
 * @param field
 */
const addSign = (
    { minChars, maxChars, regExp, allowedCharsClass }: ISwiftLineObject,
    { char }: INodeSign,
): ISwiftLineObject => {
    return {
        minChars: minChars + 1,
        maxChars: maxChars + 1,
        regExp: regExp + char,
        allowedCharsClass: combineCharClasses(allowedCharsClass, char),
    };
};

/**
 * Returns a new swiftLineObject with the added optional values.
 * @param swiftLineObject
 * @param optional
 */
const addOptional = (
    {
        minChars: sloMinChars,
        maxChars: sloMaxChars,
        regExp: sloRegExp,
        allowedCharsClass: sloAllowedCharsClass,
    }: ISwiftLineObject,
    { nodes: optionalNodes }: INodeOptional,
): ISwiftLineObject => {
    const {
        maxChars,
        regExp,
        allowedCharsClass,
    } = optionalNodes.reduce(generateLine, getEmptySwiftLineObject());

    return {
        minChars: sloMinChars,
        maxChars: sloMaxChars + maxChars,
        regExp: sloRegExp + `(${regExp})?`,
        allowedCharsClass: combineCharClasses(
            sloAllowedCharsClass, allowedCharsClass,
        ),
    };
};

/**
 * Returns a new swiftLineObject with the added block values.
 * @param swiftLineObject
 * @param block
 */
const addBlock = (
    {
        minChars: sloMinChars,
        maxChars: sloMaxChars,
        regExp: sloRegExp,
        allowedCharsClass: sloAllowedCharsClass,
    }: ISwiftLineObject,
    { nodes: blockNodes }: INodeBlock,
): ISwiftLineObject => {
    const {
        minChars,
        maxChars,
        regExp,
        allowedCharsClass,
    } = blockNodes.reduce(generateLine, getEmptySwiftLineObject());

    return {
        minChars: sloMinChars + minChars,
        maxChars: sloMaxChars + maxChars,
        regExp: sloRegExp + `(${regExp})`,
        allowedCharsClass: combineCharClasses(
            sloAllowedCharsClass, allowedCharsClass,
        ),
    };
};

/**
 * Returns an emtpy ISwiftLineObject.
 */
const getEmptySwiftLineObject = (): ISwiftLineObject => {
    return {
        minChars: 0,
        maxChars: 0,
        regExp: "",
        allowedCharsClass: "",
    };
};

/**
 * Contains all available char classes of a SWIFT pattern.
 */
const charClasses = {
    a: `[A-Z]`,         // alphabetic letters (A through Z), upper case only
    c: `[A-Z0-9]`,      // alphabetic letters (upper case) and digits only
    d: `[0-9,]`,        // decimals
    e: `[ ]`,           // blank space
    h: `[A-F0-9]`,      // hexadecimal letters A through F (upper case) and
    // digits only
    n: `[0-9]`,         // numbers
    // SWIFT Character Set (X Character Set)
    x: `[A-Za-z0-9\\/\\-\\?\\:\\(\\)\\.\\,\\'\\+\n ]`,
    // EDIFACT Level A Character Set(Y Character Set)
    y: `[A-Z0-9\\.\\,\\-\\(\\)\\/\\=\\'\\+\\:\\?\\!\\"\\%\\&\\*\\<\\>\\; ]`,
    // Information Service Character Set (Z Character Set)
    // tslint:disable-next-line:max-line-length
    z: `[A-Za-z0-9\\.\\,\\-\\(\\)\\/\\=\\'\\+\\:\\?\\!\\"\\%\\&\\*\\<\\>\\;\\{\\@\\#\\_\n ]`,
};

/**
 * Returns the char class for the passed char or an empty string
 * for an unsupported char.
 * @param char
 */
export const getCharClass = (char: string): string => {
    return charClasses[char] || "";
};

/**
 * Combines two char classes to one char class.
 * Duplicated values are not sorted out, but duplicate char classes are.
 * @param charClass1
 * @param charClass2
 */
const combineCharClasses = (charClass1: string, charClass2: string): string => {
    charClass1 = charClass1.replace(/\[|\]/g, "");
    charClass2 = charClass2.replace(/\[|\]/g, "");

    if (charClass1.includes(charClass2)) {
        return `[${charClass1}]`;
    }
    else if (charClass2.includes(charClass1)) {
        return `[${charClass2}]`;
    }

    return `[${charClass1}${charClass2}]`;
};

/**
 * Returns a quantifier string for the passed min, max values.
 * @param min
 * @param max
 */
export const getQuantifier = (min: number, max: number): string => {
    if (max < min) {
        throw new Error(`Invalid quantifier, max "${max}" has to be equal or greater than min "${min}"`);
    }

    if (min === 1 && max === 1) {
        return "";
    }

    if (min === 0 && max === 1) {
        return "?";
    }

    return `{${min},${max}}`;
};
