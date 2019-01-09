import * as test from "tape";
import { generator, getCharClass, getQuantifier } from "../src/generator";
import { ENodeType } from "../src/interfaces";
import { ITest } from "./testInterfaces";

test("objectGenerator module", t => {
    t.plan(1);
    t.ok(
        typeof generator === "function",
        "expect swiftObjectGenerator to be a function",
    );
});

test("objectGenerator call", t => {
    const tests: ITest[] = [
        {
            msg: "should parse 35a AST",
            actual: generator({
                type: "SwiftPattern",
                body: [
                    {
                        type: ENodeType.line,
                        nodes: [
                            {
                                type: ENodeType.field,
                                length: { min: 0, max: 35 },
                                char: "a",
                            },
                        ],
                    },
                ],
            }),
            expected: {
                linesCount: 1,
                lines: [
                    {
                        minChars: 0,
                        maxChars: 35,
                        regExp: "[A-Z]{0,35}",
                        allowedCharsClass: "[A-Z]",
                    },
                ],
                minChars: 0,
                maxChars: 35,
                regExp: "[A-Z]{0,35}",
                allowedCharsClass: "[A-Z]",
            },
        },
        {
            msg: "should parse 4a AST",
            actual: generator({
                type: "SwiftPattern",
                body: [
                    {
                        type: ENodeType.line,
                        nodes: [
                            {
                                type: ENodeType.field,
                                length: { min: 0, max: 4 },
                                char: "a",
                            },
                        ],
                    },
                ],
            }),
            expected: {
                linesCount: 1,
                lines: [
                    {
                        minChars: 0,
                        maxChars: 4,
                        regExp: "[A-Z]{0,4}",
                        allowedCharsClass: "[A-Z]",
                    },
                ],
                minChars: 0,
                maxChars: 4,
                regExp: "[A-Z]{0,4}",
                allowedCharsClass: "[A-Z]",
            },
        },
        {
            msg: "should parse 4a3c AST",
            actual: generator({
                type: "SwiftPattern",
                body: [
                    {
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
                    },
                ],
            }),
            expected: {
                linesCount: 1,
                lines: [
                    {
                        minChars: 0,
                        maxChars: 7,
                        regExp: "[A-Z]{0,4}[A-Z0-9]{0,3}",
                        allowedCharsClass: "[A-Z0-9]",
                    },
                ],
                minChars: 0,
                maxChars: 7,
                regExp: "[A-Z]{0,4}[A-Z0-9]{0,3}",
                allowedCharsClass: "[A-Z0-9]",
            },
        },
        {
            msg: "generate :4!c object",
            actual: generator({
                type: "SwiftPattern",
                body: [
                    {
                        type: ENodeType.line,
                        nodes: [
                            {
                                type: ENodeType.sign,
                                char: ":",
                            },
                            {
                                type: ENodeType.field,
                                length: { min: 4, max: 4 },
                                char: "c",
                            },
                        ],
                    },
                ],
            }),
            expected: {
                linesCount: 1,
                lines: [
                    {
                        minChars: 5,
                        maxChars: 5,
                        regExp: ":[A-Z0-9]{4,4}",
                        allowedCharsClass: "[:A-Z0-9]",
                    },
                ],
                minChars: 5,
                maxChars: 5,
                regExp: ":[A-Z0-9]{4,4}",
                allowedCharsClass: "[:A-Z0-9]",
            },
        },
        {
            // tslint:disable-next-line:max-line-length
            msg: "generate :: object, filter out duplicates in allowedCharsClass",
            actual: generator({
                type: "SwiftPattern",
                body: [
                    {
                        type: ENodeType.line,
                        nodes: [
                            {
                                type: ENodeType.sign,
                                char: ":",
                            },
                            {
                                type: ENodeType.sign,
                                char: ":",
                            },
                        ],
                    },
                ],
            }),
            expected: {
                linesCount: 1,
                lines: [
                    {
                        minChars: 2,
                        maxChars: 2,
                        regExp: "::",
                        allowedCharsClass: "[:]",
                    },
                ],
                minChars: 2,
                maxChars: 2,
                regExp: "::",
                allowedCharsClass: "[:]",
            },
        },
        {
            msg: "generate multiline 3a\\n4c\\n4c object",
            actual: generator({
                type: "SwiftPattern",
                body: [
                    {
                        type: ENodeType.line,
                        nodes: [
                            {
                                type: ENodeType.field,
                                length: { min: 0, max: 30 },
                                char: "a",
                            },
                        ],
                    },
                    {
                        type: ENodeType.line,
                        nodes: [
                            {
                                type: ENodeType.field,
                                length: { min: 0, max: 4 },
                                char: "c",
                            },
                        ],
                    },
                    {
                        type: ENodeType.line,
                        nodes: [
                            {
                                type: ENodeType.field,
                                length: { min: 0, max: 4 },
                                char: "c",
                            },
                        ],
                    },
                ],
            }),
            expected: {
                linesCount: 3,
                lines: [
                    {
                        minChars: 0,
                        maxChars: 30,
                        regExp: "[A-Z]{0,30}",
                        allowedCharsClass: "[A-Z]",
                    },
                    {
                        minChars: 0,
                        maxChars: 4,
                        regExp: "[A-Z0-9]{0,4}",
                        allowedCharsClass: "[A-Z0-9]",
                    },
                    {
                        minChars: 0,
                        maxChars: 4,
                        regExp: "[A-Z0-9]{0,4}",
                        allowedCharsClass: "[A-Z0-9]",
                    },
                ],
                minChars: 0,
                maxChars: 38,
                regExp: "[A-Z]{0,30}\n[A-Z0-9]{0,4}\n[A-Z0-9]{0,4}",
                allowedCharsClass: "[A-Z\nA-Z0-9]",
            },
        },
        {
            msg: "generate multiline 30a\\n4c object",
            actual: generator({
                type: "SwiftPattern",
                body: [
                    {
                        type: ENodeType.line,
                        nodes: [
                            {
                                type: ENodeType.field,
                                length: { min: 0, max: 30 },
                                char: "a",
                            },
                        ],
                    },
                    {
                        type: ENodeType.line,
                        nodes: [
                            {
                                type: ENodeType.field,
                                length: { min: 0, max: 4 },
                                char: "c",
                            },
                        ],
                    },
                ],
            }),
            expected: {
                linesCount: 2,
                lines: [
                    {
                        minChars: 0,
                        maxChars: 30,
                        regExp: "[A-Z]{0,30}",
                        allowedCharsClass: "[A-Z]",
                    },
                    {
                        minChars: 0,
                        maxChars: 4,
                        regExp: "[A-Z0-9]{0,4}",
                        allowedCharsClass: "[A-Z0-9]",
                    },
                ],
                minChars: 0,
                maxChars: 34,
                regExp: "[A-Z]{0,30}\n[A-Z0-9]{0,4}",
                allowedCharsClass: "[A-Z\nA-Z0-9]",
            },
        },
        {
            msg: "generate multiline 2*35a object",
            actual: generator({
                type: "SwiftPattern",
                body: [
                    {
                        type: ENodeType.line,
                        optional: true,
                        nodes: [
                            {
                                type: ENodeType.field,
                                length: { min: 0, max: 35 },
                                char: "a",
                            },
                        ],
                    },
                    {
                        type: ENodeType.line,
                        optional: true,
                        nodes: [
                            {
                                type: ENodeType.field,
                                length: { min: 0, max: 35 },
                                char: "a",
                            },
                        ],
                    },
                ],
            }),
            expected: {
                linesCount: 2,
                lines: [
                    {
                        minChars: 0,
                        maxChars: 35,
                        regExp: "[A-Z]{0,35}",
                        allowedCharsClass: "[A-Z]",
                    },
                    {
                        minChars: 0,
                        maxChars: 35,
                        regExp: "[A-Z]{0,35}",
                        allowedCharsClass: "[A-Z]",
                    },
                ],
                minChars: 0,
                maxChars: 70,
                regExp: "([A-Z]{0,35})?\n?([A-Z]{0,35})?",
                allowedCharsClass: "[A-Z\n]",
            },
        },
        {
            msg: "generate [3c] object",
            actual: generator({
                type: "SwiftPattern",
                body: [
                    {
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
                    },
                ],
            }),
            expected: {
                linesCount: 1,
                lines: [
                    {
                        minChars: 0,
                        maxChars: 3,
                        regExp: "([A-Z0-9]{0,3})?",
                        allowedCharsClass: "[A-Z0-9]",
                    },
                ],
                minChars: 0,
                maxChars: 3,
                regExp: "([A-Z0-9]{0,3})?",
                allowedCharsClass: "[A-Z0-9]",
            },
        },
        {
            msg: "generate [3c] object",
            actual: generator({
                type: "SwiftPattern",
                body: [
                    {
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
                    },
                ],
            }),
            expected: {
                linesCount: 1,
                lines: [
                    {
                        minChars: 0,
                        maxChars: 3,
                        regExp: "([A-Z0-9]{0,3})?",
                        allowedCharsClass: "[A-Z0-9]",
                    },
                ],
                minChars: 0,
                maxChars: 3,
                regExp: "([A-Z0-9]{0,3})?",
                allowedCharsClass: "[A-Z0-9]",
            },
        },
        {
            msg: "generate required with trailing optional 2!a[3c] object",
            actual: generator({
                type: "SwiftPattern",
                body: [
                    {
                        type: ENodeType.line,
                        nodes: [
                            {
                                type: ENodeType.field,
                                length: { min: 2, max: 2 },
                                char: "a",
                            },
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
                    },
                ],
            }),
            expected: {
                linesCount: 1,
                lines: [
                    {
                        minChars: 2,
                        maxChars: 5,
                        regExp: "[A-Z]{2,2}([A-Z0-9]{0,3})?",
                        allowedCharsClass: "[A-Z0-9]",
                    },
                ],
                minChars: 2,
                maxChars: 5,
                regExp: "[A-Z]{2,2}([A-Z0-9]{0,3})?",
                allowedCharsClass: "[A-Z0-9]",
            },
        },
        {
            msg: "generate optional with trailing required [3c]2!a object",
            actual: generator({
                type: "SwiftPattern",
                body: [
                    {
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
                            {
                                type: ENodeType.field,
                                length: { min: 2, max: 2 },
                                char: "a",
                            },
                        ],
                    },
                ],
            }),
            expected: {
                linesCount: 1,
                lines: [
                    {
                        minChars: 2,
                        maxChars: 5,
                        regExp: "([A-Z0-9]{0,3})?[A-Z]{2,2}",
                        allowedCharsClass: "[A-Z0-9]",
                    },
                ],
                minChars: 2,
                maxChars: 5,
                regExp: "([A-Z0-9]{0,3})?[A-Z]{2,2}",
                allowedCharsClass: "[A-Z0-9]",
            },
        },
        {
            msg: "generate nested optional [3c[3!c]] object",
            actual: generator({
                type: "SwiftPattern",
                body: [
                    {
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
                                    {
                                        type: ENodeType.optional,
                                        nodes: [
                                            {
                                                type: ENodeType.field,
                                                length: { min: 3, max: 3 },
                                                char: "c",
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }),
            expected: {
                linesCount: 1,
                lines: [
                    {
                        minChars: 0,
                        maxChars: 6,
                        regExp: "([A-Z0-9]{0,3}([A-Z0-9]{3,3})?)?",
                        allowedCharsClass: "[A-Z0-9]",
                    },
                ],
                minChars: 0,
                maxChars: 6,
                regExp: "([A-Z0-9]{0,3}([A-Z0-9]{3,3})?)?",
                allowedCharsClass: "[A-Z0-9]",
            },
        },
        {
            msg: "generate block (1a1n) object",
            actual: generator({
                type: "SwiftPattern",
                body: [
                    {
                        type: ENodeType.line,
                        nodes: [
                            {
                                type: ENodeType.block,
                                nodes: [
                                    {
                                        type: ENodeType.field,
                                        length: { min: 0, max: 1 },
                                        char: "a",
                                    },
                                    {
                                        type: ENodeType.field,
                                        length: { min: 0, max: 1 },
                                        char: "n",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }),
            expected: {
                linesCount: 1,
                lines: [
                    {
                        minChars: 0,
                        maxChars: 2,
                        regExp: "([A-Z]?[0-9]?)",
                        allowedCharsClass: "[A-Z0-9]",
                    },
                ],
                minChars: 0,
                maxChars: 2,
                regExp: "([A-Z]?[0-9]?)",
                allowedCharsClass: "[A-Z0-9]",
            },
        },
        {
            msg: "throws when wrong AST type is supplied",
            method: "throws",
            actual: () => generator({
                type: "Programm",
                body: [],
            }),
            expected: /Unsupported AST type "Programm"/,
        },
        {
            msg: "throws when unsupported char is supplied",
            method: "throws",
            actual: () => generator({
                type: "SwiftPattern",
                body: [
                    {
                        type: ENodeType.line,
                        nodes: [
                            {
                                type: ENodeType.field,
                                length: { min: 0, max: 35 },
                                char: "ö",
                            },
                        ],
                    },
                ],
            }),
            expected: /Unsupported character "ö" in field/,
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

test("getCharClass call", t => {
    const tests: ITest[] = [
        {
            msg: "returns the char class for a",
            actual: getCharClass("a"),
            expected: "[A-Z]",
        },
        {
            msg: "returns the char class for n",
            actual: getCharClass("n"),
            expected: "[0-9]",
        },
        {
            msg: "returns the char class for x",
            actual: getCharClass("x"),
            expected: "[A-Za-z0-9\\/\\-\\?\\:\\(\\)\\.\\,\\'\\+\n ]",
        },
        {
            msg: "returns the char class for y",
            actual: getCharClass("y"),
            // tslint:disable-next-line:max-line-length
            expected: `[A-Z0-9\\.\\,\\-\\(\\)\\/\\=\\'\\+\\:\\?\\!\\"\\%\\&\\*\\<\\>\\; ]`,
        },
        {
            msg: "returns the char class for z",
            actual: getCharClass("z"),
            // tslint:disable-next-line:max-line-length
            expected: `[A-Za-z0-9\\.\\,\\-\\(\\)\\/\\=\\'\\+\\:\\?\\!\\"\\%\\&\\*\\<\\>\\;\\{\\@\\#\\_\n ]`,
        },
        {
            msg: "returns the char class for c",
            actual: getCharClass("c"),
            expected: `[A-Z0-9]`,
        },
        {
            msg: "returns the char class for h",
            actual: getCharClass("h"),
            expected: `[A-F0-9]`,
        },
        {
            msg: "returns the char class for e",
            actual: getCharClass("e"),
            expected: `[ ]`,
        },
        {
            msg: "returns the char class for d",
            actual: getCharClass("d"),
            expected: `[0-9,]`,
        },
        {
            msg: "returns empty string for undefined char class ö",
            actual: getCharClass("ö"),
            expected: "",
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

test("getQuantifier call", t => {
    const tests: ITest[] = [
        {
            msg: "returns the quantifier for 1,2",
            actual: getQuantifier(1, 2),
            expected: "{1,2}",
        },
        {
            msg: "returns the quantifier for 1,1",
            actual: getQuantifier(1, 1),
            expected: "",
        },
        {
            msg: "returns the quantifier for 0,1",
            actual: getQuantifier(0, 1),
            expected: "?",
        },
        {
            msg: "throws when min > max",
            method: "throws",
            actual: () => getQuantifier(1, 0),
            expected: /Invalid quantifier, max "0" has to be equal or greater than min "1"/,
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
