import TextLintTester from 'textlint-tester';
import validateRelativeLinks from '../src/no-dead-relative-link';
import path from 'path';
const tester = new TextLintTester();

tester.run("no-dead-relative-links", validateRelativeLinks, {
    valid: [
        {
            inputPath: path.resolve("./test/fixtures/testFiles/validLinkTest.md"),
            options: {
                "resolve-as-markdown": ".html"
            }
        }
    ],
    invalid: [
        {
            inputPath: path.resolve("./test/fixtures/testFiles/invalidLinkTest.md"),
            errors: [
                {
                    message: "invalidLink.md does not exist",
                    line: 1,
                    column: 59
                },
                {
                    message: "invalidLink.txt does not exist",
                    line: 2,
                    column: 72
                },
                {
                    message: "invalidHtmlLink.md does not exist",
                    line: 3,
                    column: 86
                },
                {
                    message: "Anchor #valid-links does not exist in invalidLinkTest.md",
                    line: 4,
                    column: 85 
                },
                {
                    message: "Anchor #header-7 does not exist in linkTestFile.md",
                    line: 5,
                    column: 65 
                },
                {
                    message: "Anchor #header-7 does not exist in linkTestFile.md",
                    line: 6,
                    column: 108 
                },
                {
                    message: "invalidLink.md does not exist",
                    line: 7,
                    column: 74
                },
                {
                    message:"setup-introduction.md does not exist",
                    line: 8,
                    column: 134
                }
            ],
            options: {
                "resolve-as-markdown": ".html"
            }
        }
    ]
});