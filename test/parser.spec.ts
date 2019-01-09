import * as test from "tape";
import { ENodeType, ETokenType, IAst, INodeLine } from "../src/interfaces";
import {
    getLengthObj,
    getToken,
    parse,
    parser,
    splitLines,
} from "../src/parser";
import { ITest } from "./testInterfaces";

test("parser module", t => {
    t.plan(1);
    t.ok(typeof parser === "function", "expect parser to be a function");
});

test("getToken call", t => {
    const tests: ITest[] = [
        {
            msg: "retrieves the provided num token",
            actual: getToken({ type: ETokenType.num, value: "42" }),
            expected: { type: ETokenType.num, value: "42" },
        },
        {
            msg: "returns undefined token for undefined value",
            actual: getToken(undefined),
            expected: { type: ETokenType.undefined, value: "" },
        },
    ];

    t.plan(tests.length);
    tests.forEach(({
        actual,
        expected,
        msg = "",
        method = "deepEqual",
    }) => {
        t[method](actual, expected, msg);
    });
});

test("getLengthObj call", t => {
    const tests: ITest[] = [
        {
            msg: "returns the length for input \"5\"",
            actual: getLengthObj("5"),
            expected: { min: 0, max: 5 },
        },
        {
            msg: "returns the length for input \"5\", \"!\"",
            actual: getLengthObj("5", "!"),
            expected: { min: 5, max: 5 },
        },
        {
            msg: "returns the length for input \"5\", \"-\", \"6\"",
            actual: getLengthObj("5", "-", "6"),
            expected: { min: 5, max: 6 },
        },
        {
            // tslint:disable-next-line:max-line-length
            msg: "throws when secound number is undefined for min/max quantifier",
            method: "throws",
            actual: () => getLengthObj("5", "-", undefined),
            expected: /Missing secound number for min\/max quantifier!/,
        },
    ];

    t.plan(tests.length);
    tests.forEach(({
        actual,
        expected,
        msg = "",
        method = "deepEqual",
    }) => {
        t[method](actual, expected, msg);
    });
});

////////////////////////////////////////////////////////////////////////////////
// SPLITLINES
////////////////////////////////////////////////////////////////////////////////
test("splitLines call", t => {
    const tests: ITest[] = [
        {
            msg: "splits the lines for 35a tokens",
            actual: splitLines([
                { type: ETokenType.num, value: "35" },
                { type: ETokenType.char, value: "a" },
            ]),
            expected: [
                {
                    type: "line",
                    tokens: [
                        { type: "num", value: "35" },
                        { type: "char", value: "a" },
                    ],
                },
            ],
        },
        {
            msg: "splits the lines for 35a\\n4c tokens",
            actual: splitLines([
                { type: ETokenType.num, value: "35" },
                { type: ETokenType.char, value: "a" },
                { type: ETokenType.newline, value: "\n" },
                { type: ETokenType.num, value: "4" },
                { type: ETokenType.char, value: "c" },
            ]),
            expected: [
                {
                    type: "line",
                    tokens: [
                        { type: "num", value: "35" },
                        { type: "char", value: "a" },
                    ],
                },
                {
                    type: "line",
                    tokens: [
                        { type: "num", value: "4" },
                        { type: "char", value: "c" },
                    ],
                },
            ],
        },
        {
            msg: "splits the lines for 2*3c tokens",
            actual: splitLines([
                { type: ETokenType.num, value: "2" },
                { type: ETokenType.multilineQuant, value: "*" },
                { type: ETokenType.num, value: "3" },
                { type: ETokenType.char, value: "c" },
            ]),
            expected: [
                {
                    type: "line",
                    optional: true,
                    tokens: [
                        { type: "num", value: "3" },
                        { type: "char", value: "c" },
                    ],
                },
                {
                    type: "line",
                    optional: true,
                    tokens: [
                        { type: "num", value: "3" },
                        { type: "char", value: "c" },
                    ],
                },
            ],
        },
        {
            msg: "splits the lines for 2*(1a1n) tokens",
            actual: splitLines([
                { type: ETokenType.num, value: "2" },
                { type: ETokenType.multilineQuant, value: "*" },
                { type: ETokenType.paren, value: "(" },
                { type: ETokenType.num, value: "1" },
                { type: ETokenType.char, value: "a" },
                { type: ETokenType.num, value: "1" },
                { type: ETokenType.char, value: "n" },
                { type: ETokenType.paren, value: ")" },
            ]),
            expected: [
                {
                    type: "line",
                    optional: true,
                    tokens: [
                        { type: ETokenType.paren, value: "(" },
                        { type: "num", value: "1" },
                        { type: "char", value: "a" },
                        { type: "num", value: "1" },
                        { type: "char", value: "n" },
                        { type: ETokenType.paren, value: ")" },
                    ],
                },
                {
                    type: "line",
                    optional: true,
                    tokens: [
                        { type: ETokenType.paren, value: "(" },
                        { type: "num", value: "1" },
                        { type: "char", value: "a" },
                        { type: "num", value: "1" },
                        { type: "char", value: "n" },
                        { type: ETokenType.paren, value: ")" },
                    ],
                },
            ],
        },
        {
            msg: "splits the lines for 35a[3-20c]2*35a tokens",
            actual: splitLines([
                { type: ETokenType.num, value: "35" },
                { type: ETokenType.char, value: "a" },
                { type: ETokenType.bracket, value: "[" },
                { type: ETokenType.num, value: "3" },
                { type: ETokenType.quant, value: "-" },
                { type: ETokenType.num, value: "20" },
                { type: ETokenType.char, value: "c" },
                { type: ETokenType.bracket, value: "]" },
                { type: ETokenType.num, value: "2" },
                { type: ETokenType.multilineQuant, value: "*" },
                { type: ETokenType.num, value: "35" },
                { type: ETokenType.char, value: "a" },
            ]),
            expected: [
                {
                    type: "line",
                    tokens: [
                        { type: "num", value: "35" },
                        { type: "char", value: "a" },
                        { type: "bracket", value: "[" },
                        { type: "num", value: "3" },
                        { type: "quant", value: "-" },
                        { type: "num", value: "20" },
                        { type: "char", value: "c" },
                        { type: "bracket", value: "]" },
                    ],
                },
                {
                    type: "line",
                    optional: true,
                    tokens: [
                        { type: "num", value: "35" },
                        { type: "char", value: "a" },
                    ],
                },
                {
                    type: "line",
                    optional: true,
                    tokens: [
                        { type: "num", value: "35" },
                        { type: "char", value: "a" },
                    ],
                },
            ],
        },
        {
            msg: "splits the lines for empty array",
            actual: splitLines([]),
            expected: [],
        },
    ];

    t.plan(tests.length);
    tests.forEach(({
        actual,
        expected,
        msg = "",
        method = "deepEqual",
    }) => {
        t[method](actual, expected, msg);
    });
});

////////////////////////////////////////////////////////////////////////////////
// PARSE
////////////////////////////////////////////////////////////////////////////////
test("parse call", t => {
    const tests: ITest[] = [
        {
            msg: "should parse 35a tokens",
            actual: parse([
                { type: ETokenType.num, value: "35" },
                { type: ETokenType.char, value: "a" },
            ]),
            expected: {
                type: ENodeType.line,
                nodes: [
                    {
                        type: ENodeType.field,
                        length: { min: 0, max: 35 },
                        char: "a",
                    },
                ],
            } as INodeLine,
        },
        {
            msg: "should parse 4a tokens",
            actual: parse([
                { type: ETokenType.num, value: "4" },
                { type: ETokenType.char, value: "a" },
            ]),
            expected: {
                type: ENodeType.line,
                nodes: [
                    {
                        type: ENodeType.field,
                        length: { min: 0, max: 4 },
                        char: "a",
                    },
                ],
            } as INodeLine,
        },
        {
            msg: "parses 4!c tokens",
            actual: parse([
                {
                    type: ETokenType.num,
                    value: "4",
                },
                {
                    type: ETokenType.quant,
                    value: "!",
                },
                {
                    type: ETokenType.char,
                    value: "c",
                },
            ]),
            expected: {
                type: ENodeType.line,
                nodes: [
                    {
                        type: ENodeType.field,
                        length: { min: 4, max: 4 },
                        char: "c",
                    },
                ],
            } as INodeLine,
        },
        {
            msg: "parses 2-5x tokens",
            actual: parse([
                {
                    type: ETokenType.num,
                    value: "2",
                },
                {
                    type: ETokenType.quant,
                    value: "-",
                },
                {
                    type: ETokenType.num,
                    value: "5",
                },
                {
                    type: ETokenType.char,
                    value: "x",
                },
            ]),
            expected: {
                type: ENodeType.line,
                nodes: [
                    {
                        type: ENodeType.field,
                        length: { min: 2, max: 5 },
                        char: "x",
                    },
                ],
            } as INodeLine,
        },
        {
            msg: "should parse 4a3c tokens",
            actual: parse([
                { type: ETokenType.num, value: "4" },
                { type: ETokenType.char, value: "a" },
                { type: ETokenType.num, value: "3" },
                { type: ETokenType.char, value: "c" },
            ]),
            expected: {
                type: ENodeType.line,
                nodes: [
                    {
                        type: ENodeType.field,
                        length: { min: 0, max: 4 },
                        char: "a",
                    },
                    {
                        type: ENodeType.field,
                        length: { min: 0, max: 3 },
                        char: "c",
                    },
                ],
            } as INodeLine,
        },
        {
            msg: "parses optional field [3c]",
            actual: parse([
                { type: ETokenType.bracket, value: "[" },
                { type: ETokenType.num, value: "3" },
                { type: ETokenType.char, value: "c" },
                { type: ETokenType.bracket, value: "]" },
            ]),
            expected: {
                type: ENodeType.line,
                nodes: [
                    {
                        type: ENodeType.optional,
                        nodes: [
                            {
                                type: ENodeType.field,
                                length: { min: 0, max: 3 },
                                char: "c",
                            },
                        ],
                    },
                ],
            } as INodeLine,
        },
        {
            msg: "parses const field ACC",
            actual: parse([
                { type: ETokenType.const, value: "ACC" },
            ]),
            expected: {
                type: ENodeType.line,
                nodes: [
                    {
                        type: ENodeType.field,
                        length: { min: 3, max: 3 },
                        char: "ACC",
                    },
                ],
            } as INodeLine,
        },
        {
            msg: "parses signs :/ ",
            actual: parse([
                { type: ETokenType.sign, value: ":" },
                { type: ETokenType.sign, value: "/" },
            ]),
            expected: {
                type: ENodeType.line,
                nodes: [
                    {
                        type: ENodeType.sign,
                        char: ":",
                    },
                    {
                        type: ENodeType.sign,
                        char: "/",
                    },
                ],
            } as INodeLine,
        },
        {
            msg: "parses complex field 35a[3-20c]",
            actual: parse([
                { type: ETokenType.num, value: "35" },
                { type: ETokenType.char, value: "a" },
                { type: ETokenType.bracket, value: "[" },
                { type: ETokenType.num, value: "3" },
                { type: ETokenType.quant, value: "-" },
                { type: ETokenType.num, value: "20" },
                { type: ETokenType.char, value: "c" },
                { type: ETokenType.bracket, value: "]" },
            ]),
            expected: {
                type: ENodeType.line,
                nodes: [
                    {
                        type: ENodeType.field,
                        length: { min: 0, max: 35 },
                        char: "a",
                    },
                    {
                        type: ENodeType.optional,
                        nodes: [
                            {
                                type: "field",
                                length: { min: 3, max: 20 },
                                char: "c",
                            },
                        ],
                    },
                ],
            } as INodeLine,
        },
        {
            msg: "parses optional nested fields [[3c]20c]",
            actual: parse([
                { type: ETokenType.bracket, value: "[" },
                { type: ETokenType.bracket, value: "[" },
                { type: ETokenType.num, value: "3" },
                { type: ETokenType.char, value: "c" },
                { type: ETokenType.bracket, value: "]" },
                { type: ETokenType.num, value: "20" },
                { type: ETokenType.char, value: "c" },
                { type: ETokenType.bracket, value: "]" },
            ]),
            expected: {
                type: ENodeType.line,
                nodes: [
                    {
                        type: ENodeType.optional,
                        nodes: [
                            {
                                type: ENodeType.optional,
                                nodes: [
                                    {
                                        type: ENodeType.field,
                                        length: { min: 0, max: 3 },
                                        char: "c",
                                    },
                                ],
                            },
                            {
                                type: ENodeType.field,
                                length: { min: 0, max: 20 },
                                char: "c",
                            },
                        ],
                    },
                ],
            } as INodeLine,
        },
        {
            msg: "should return empty line for empty token array",
            actual: parse([]),
            expected: { type: "line", nodes: [] } as INodeLine,
        },
        {
            msg: "should throw when 42 is supplied",
            method: "throws",
            actual: () => parse([
                { type: ETokenType.num, value: "42" },
            ]),
            // tslint:disable-next-line:max-line-length
            expected: /Missing character or quantifier token after number token "42"/,
        },
        {
            msg: "should throw when 4aa is supplied",
            method: "throws",
            actual: () => parse([
                { type: ETokenType.num, value: "42" },
                { type: ETokenType.char, value: "a" },
                { type: ETokenType.char, value: "a" },
            ]),
            expected: /Missing number token for character token "a"/,
        },
    ];

    t.plan(tests.length);
    tests.forEach(({
        actual,
        expected,
        msg = "",
        method = "deepEqual",
    }) => {
        t[method](actual, expected, msg);
    });
});

////////////////////////////////////////////////////////////////////////////////
// PARSER
////////////////////////////////////////////////////////////////////////////////

test("parser call", t => {
    const tests: ITest[] = [
        {
            msg: "should parse 35a tokens",
            actual: parser([
                { type: ETokenType.num, value: "35" },
                { type: ETokenType.char, value: "a" },
            ]),
            expected: {
                type: "SwiftPattern",
                body: [
                    {
                        type: "line",
                        nodes: [
                            {
                                type: "field",
                                length: { min: 0, max: 35 },
                                char: "a",
                            },
                        ],
                    },
                ],
            },
        },
        {
            msg: "parse multiline 30a\\n4c tokens",
            actual: parser([
                { type: ETokenType.num, value: "30" },
                { type: ETokenType.char, value: "a" },
                { type: ETokenType.newline, value: "\n" },
                { type: ETokenType.num, value: "4" },
                { type: ETokenType.char, value: "c" },
            ]),
            expected: {
                type: "SwiftPattern",
                body: [
                    {
                        type: "line",
                        nodes: [
                            {
                                type: "field",
                                length: { min: 0, max: 30 },
                                char: "a",
                            },
                        ],
                    },
                    {
                        type: "line",
                        nodes: [
                            {
                                type: "field",
                                length: { min: 0, max: 4 },
                                char: "c",
                            },
                        ],
                    },
                ],
            },
        },
        {
            msg: "parse block (1n1a)",
            actual: parser([
                {
                    type: ETokenType.paren,
                    value: "(",
                },
                {
                    type: ETokenType.num,
                    value: "1",
                },
                {
                    type: ETokenType.char,
                    value: "n",
                },
                {
                    type: ETokenType.num,
                    value: "1",
                },
                {
                    type: ETokenType.char,
                    value: "a",
                },
                {
                    type: ETokenType.paren,
                    value: ")",
                },
            ]),
            expected: {
                type: "SwiftPattern",
                body: [
                    {
                        type: "line",
                        nodes: [
                            {
                                type: "block",
                                nodes: [
                                    {
                                        type: "field",
                                        length: { min: 0, max: 1 },
                                        char: "n",
                                    },
                                    {
                                        type: "field",
                                        length: { min: 0, max: 1 },
                                        char: "a",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            } as IAst,
        },
        {
            msg: "parse multiline block 2*(1n1a)",
            actual: parser([
                {
                    type: ETokenType.num,
                    value: "2",
                },
                {
                    type: ETokenType.multilineQuant,
                    value: "*",
                },
                {
                    type: ETokenType.paren,
                    value: "(",
                },
                {
                    type: ETokenType.num,
                    value: "1",
                },
                {
                    type: ETokenType.char,
                    value: "n",
                },
                {
                    type: ETokenType.num,
                    value: "1",
                },
                {
                    type: ETokenType.char,
                    value: "a",
                },
                {
                    type: ETokenType.paren,
                    value: ")",
                },
            ]),
            expected: {
                type: "SwiftPattern",
                body: [
                    {
                        type: "line",
                        optional: true,
                        nodes: [
                            {
                                type: "block",
                                nodes: [
                                    {
                                        type: "field",
                                        length: { min: 0, max: 1 },
                                        char: "n",
                                    },
                                    {
                                        type: "field",
                                        length: { min: 0, max: 1 },
                                        char: "a",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: "line",
                        optional: true,
                        nodes: [
                            {
                                type: "block",
                                nodes: [
                                    {
                                        type: "field",
                                        length: { min: 0, max: 1 },
                                        char: "n",
                                    },
                                    {
                                        type: "field",
                                        length: { min: 0, max: 1 },
                                        char: "a",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            } as IAst,
        },
        {
            msg: "should return empty body array for empty token array",
            actual: parser([]),
            expected: {
                type: "SwiftPattern",
                body: [],
            },
        },
    ];

    t.plan(tests.length);
    tests.forEach(({
        actual,
        expected,
        msg = "",
        method = "deepEqual",
    }) => {
        t[method](actual, expected, msg);
    });
});
