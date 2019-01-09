import * as test from "tape";
import { ETokenType } from "../src/interfaces";
import { tokenizer } from "../src/tokenizer";
import { ITest } from "./testInterfaces";

test("tokenizer module", t => {
    t.plan(1);
    t.ok(typeof tokenizer === "function", "expect tokenizer to be a function");
});

test("tokenizer call", t => {
    const tests: ITest[] = [
        {
            msg: "should handle 35a",
            actual: tokenizer("35a"),
            expected: [
                {
                    type: ETokenType.num,
                    value: "35",
                },
                {
                    type: ETokenType.char,
                    value: "a",
                },
            ],
        },
        {
            msg: "should handle 4a",
            actual: tokenizer("4a"),
            expected: [
                {
                    type: ETokenType.num,
                    value: "4",
                },
                {
                    type: ETokenType.char,
                    value: "a",
                },
            ],
        },
        {
            msg: "should handle 4!c",
            actual: tokenizer("4!c"),
            expected: [
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
            ],
        },
        {
            msg: "tokenize pattern /4!c",
            actual: tokenizer("/4!c"),
            expected: [
                {
                    type: ETokenType.sign,
                    value: "/",
                },
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
            ],
        },
        {
            msg: "tokenize pattern :4!c",
            actual: tokenizer(":4!c"),
            expected: [
                {
                    type: ETokenType.sign,
                    value: ":",
                },
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
            ],
        },
        {
            msg: "tokenize pattern [3c]",
            actual: tokenizer("[3c]"),
            expected: [
                {
                    type: ETokenType.bracket,
                    value: "[",
                },
                {
                    type: ETokenType.num,
                    value: "3",
                },
                {
                    type: ETokenType.char,
                    value: "c",
                },
                {
                    type: ETokenType.bracket,
                    value: "]",
                },
            ],
        },
        {
            msg: "tokenize pattern 1d\n5a",
            actual: tokenizer("1d\n5a"),
            expected: [
                {
                    type: ETokenType.num,
                    value: "1",
                },
                {
                    type: ETokenType.char,
                    value: "d",
                },
                {
                    type: ETokenType.newline,
                    value: "\n",
                },
                {
                    type: ETokenType.num,
                    value: "5",
                },
                {
                    type: ETokenType.char,
                    value: "a",
                },
            ],
        },
        {
            msg: "tokenize pattern 1-5d",
            actual: tokenizer("1-5d"),
            expected: [
                {
                    type: ETokenType.num,
                    value: "1",
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
                    value: "d",
                },
            ],
        },
        {
            msg: "tokenize pattern 5*35x",
            actual: tokenizer("5*35x"),
            expected: [
                {
                    type: ETokenType.num,
                    value: "5",
                },
                {
                    type: ETokenType.multilineQuant,
                    value: "*",
                },
                {
                    type: ETokenType.num,
                    value: "35",
                },
                {
                    type: ETokenType.char,
                    value: "x",
                },
            ],
        },
        {
            msg: "tokenize pattern ISIN1!e",
            actual: tokenizer("ISIN1!e"),
            expected: [
                {
                    type: ETokenType.const,
                    value: "ISIN",
                },
                {
                    type: ETokenType.num,
                    value: "1",
                },
                {
                    type: ETokenType.quant,
                    value: "!",
                },
                {
                    type: ETokenType.char,
                    value: "e",
                },
            ],
        },
        {
            msg: "tokenize pattern 4*(1!n)",
            actual: tokenizer("4*(1!n)"),
            expected: [
                {
                    type: ETokenType.num,
                    value: "4",
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
                    type: ETokenType.quant,
                    value: "!",
                },
                {
                    type: ETokenType.char,
                    value: "n",
                },
                {
                    type: ETokenType.paren,
                    value: ")",
                },
            ],
        },
        {
            msg: "should throw when # is supplied",
            method: "throws",
            actual: () => tokenizer("#"),
            expected: /Unmatched character "#"/,
        },
        {
            msg: "should return empty array for empty string",
            actual: tokenizer(""),
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
