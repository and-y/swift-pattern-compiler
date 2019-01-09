import * as test from "tape";
import compiler from "../src/compiler";
import { ISwiftObject } from "../src/interfaces";
import { ITest } from "./testInterfaces";

test("compiler module", t => {
    t.plan(1);
    t.ok(
        typeof compiler === "function",
        "expect swiftcompiler to be a function",
    );
});

test("compiler call", t => {
    const tests: ITest[] = [
        {
            msg: "compile pattern 35a into swift object",
            actual: compiler("35a"),
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
            msg: "compile pattern 4a into swift object",
            actual: compiler("4a"),
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
            msg: "compile pattern 30a\\n4c into swift object",
            actual: compiler("30a\n4c"),
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
            msg: "compile pattern ':4!c/[8c]/24x' into swift object",
            actual: compiler(":4!c/[8c]/24x"),
            expected: {
                linesCount: 1,
                lines: [
                    {
                        minChars: 7,
                        maxChars: 39,
                        regExp: ":[A-Z0-9]{4,4}/([A-Z0-9]{0,8})?/[A-Za-z0-9\\/\\-\\?\\:\\(\\)\\.\\,\\'\\+\n ]{0,24}",
                        allowedCharsClass: "[:A-Z0-9/A-Za-z0-9\\/\\-\\?\\:\\(\\)\\.\\,\\'\\+\n ]",
                    },
                ],
                minChars: 7,
                maxChars: 39,
                regExp: ":[A-Z0-9]{4,4}/([A-Z0-9]{0,8})?/[A-Za-z0-9\\/\\-\\?\\:\\(\\)\\.\\,\\'\\+\n ]{0,24}",
                allowedCharsClass: "[:A-Z0-9/A-Za-z0-9\\/\\-\\?\\:\\(\\)\\.\\,\\'\\+\n ]",
            },
        },
        {
            msg: "compile pattern [/1!a][/34x]\\n4!a2!a2!c[3!c]into swift object",
            actual: compiler(`[/1!a][/34x]\n4!a2!a2!c[3!c]`),
            expected: {
                linesCount: 2,
                lines: [
                    {
                        minChars: 0,
                        maxChars: 37,
                        regExp: "(/[A-Z])?(/[A-Za-z0-9\\/\\-\\?\\:\\(\\)\\.\\,\\'\\+\n ]{0,34})?",
                        allowedCharsClass: "[/A-ZA-Za-z0-9\\/\\-\\?\\:\\(\\)\\.\\,\\'\\+\n ]",
                    },
                    {
                        minChars: 8,
                        maxChars: 11,
                        // tslint:disable-next-line:max-line-length
                        regExp: "[A-Z]{4,4}[A-Z]{2,2}[A-Z0-9]{2,2}([A-Z0-9]{3,3})?",
                        allowedCharsClass: "[A-Z0-9]",
                    },
                ],
                minChars: 8,
                maxChars: 48,
                regExp: "(/[A-Z])?(/[A-Za-z0-9\\/\\-\\?\\:\\(\\)\\.\\,\\'\\+\n ]{0,34})?\n[A-Z]{4,4}[A-Z]{2,2}[A-Z0-9]{2,2}([A-Z0-9]{3,3})?",
                allowedCharsClass: "[/A-ZA-Za-z0-9\\/\\-\\?\\:\\(\\)\\.\\,\\'\\+\n A-Z0-9]",
            } as ISwiftObject,
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
