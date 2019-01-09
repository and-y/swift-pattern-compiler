# SWIFT Pattern Compiler

A compiler which transforms [SWIFT - Society for Worldwide Interbank Financial Telecommunications](https://www.swift.com/) patterns to an object representation with additional information's without any dependencies.

## Install

```bash
npm install --save swift-pattern-compiler
```

## Usage

```javascript
const swiftCompiler = require("./compiler").compiler;
const pattern = ":4!c/[8c]/24x"
const patternObj = swiftCompiler(pattern);
console.log(patternObj);

/*
{
    linesCount: 1,
    minChars: 7,
    maxChars: 39,
    regExp:
        ":[A-Z0-9]{4,4}/([A-Z0-9]{0,8})?/[A-Za-z0-9\\/\\-\\?\\:\\(\\)\\.\\,\\'\\+\n ]{0,24}",
    allowedCharsClass: "[:A-Z0-9/A-Za-z0-9\\/\\-\\?\\:\\(\\)\\.\\,\\'\\+\n ]",
    lines: [
        {
            minChars: 7,
            maxChars: 39,
            regExp:
                ":[A-Z0-9]{4,4}/([A-Z0-9]{0,8})?/[A-Za-z0-9\\/\\-\\?\\:\\(\\)\\.\\,\\'\\+\n ]{0,24}",
            allowedCharsClass: "[:A-Z0-9/A-Za-z0-9\\/\\-\\?\\:\\(\\)\\.\\,\\'\\+\n ]"
        }
    ]
}
*/
```

## Inspiration

The structure is highly inspired by the great talk of [James Kyles on EmberConf 2016 - How to Build a Compiler](https://www.youtube.com/watch?v=Tar4WgAfMr4&t=1s) and the code example, which can be found [here on github](https://git.io/compiler).