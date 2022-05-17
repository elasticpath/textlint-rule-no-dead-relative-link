import TextLintTester from 'textlint-tester';
import validateRelativeLinks from '../src/no-dead-relative-link';
import path from 'path';
const tester = new TextLintTester();

tester.run(
    "no-dead-relative-links: with resolve-as-markdown option",
    {
        rules: [
            {
                ruleId: "no-dead-relative-link",
                rule: validateRelativeLinks,
                options: {
                    "resolve-as-markdown": ".html"
                }
            }
        ]
    },
    {
    valid: [
        {
            inputPath: path.resolve("./test/fixtures/testFiles/validLinkTest.md"),
        }
    ],
    invalid: [
        {
            inputPath: path.resolve("./test/fixtures/testFiles/invalidLinkTest.md"),
            errors: [
                {
                    message: "invalidLink.md does not exist",
                    line: 1,
                    column: 58
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
                    column: 133
                }
            ]
        }
    ]
});
tester.run(
    "no-dead-relative-links: with route-map and resolve-as-markdown options",
    {
        rules: [
            {
                ruleId: "no-dead-relative-link",
                rule: validateRelativeLinks,
                options: {
                    "resolve-as-markdown": ".html",
                    "route-map": [
                        {
                            "source": "^../dir/subdir",
                            "destination": "/dir/subdir"
                        },
                        {
                            "source": "^../dir/",
                            "destination": "../"
                        },
                        {
                            "source": "^../../(subdir)/",
                            "destination": "$1/"
                        },
                        {
                            "source": "^../../linkTestFile.md",
                            "destination": "../linkTestFile.md"
                        },
                        {
                            "source": "^../../linkTestFile.html",
                            "destination": "../linkTestFile.md"
                        }
                    ]
                }
            }
        ]
    },
    {
    valid: [
        {
            inputPath: path.resolve("./test/fixtures/testFiles/validLinkRoutingTest.md"),
        }
    ],
    invalid: [
        {
            inputPath: path.resolve("./test/fixtures/testFiles/invalidLinkRoutingTest.md"),
            errors: [
                {
                    message: "The routed destination for invalidLink.md does not exist",
                    line: 1,
                    column: 120
                },
                {
                    message: "The routed destination for invalidLink.md does not exist",
                    line: 2,
                    column: 99
                },
                {
                    message: "The routed destination for invalidLink.md does not exist",
                    line: 3,
                    column: 163
                },
                {
                    message: "The routed destination for invalidLink.md does not exist",
                    line: 4,
                    column: 140
                },
                {
                    message: "Anchor #header-7 does not exist in linkTestFile.md",
                    line: 5,
                    column: 129
                },
                {
                    message: "linkTestFile.md has no mapped routing",
                    line: 6,
                    column: 72
                },
                {
                    message: "linkTestFile.md has no mapped routing",
                    line: 7,
                    column: 87
                },
                {
                    message: "The routed destination for linkTestFile.md does not exist",
                    line: 8,
                    column: 85
                },
                {
                    message: "The routed destination for linkTestFile.md does not exist",
                    line: 9,
                    column: 100
                }
            ]
        }
    ]
});
tester.run(
    "no-dead-relative-links: with route-map only",
    {
        rules: [
            {
                ruleId: "no-dead-relative-link",
                rule: validateRelativeLinks,
                options: {
                    "route-map": [
                        {
                            "source": "^../dir/subdir",
                            "destination": "/dir/subdir"
                        },
                        {
                            "source": "^../dir/",
                            "destination": "../"
                        },
                        {
                            "source": "^../../(subdir)/",
                            "destination": "$1/"
                        },
                        {
                            "source": "^../../linkTestFile.md",
                            "destination": "../linkTestFile.md"
                        },
                        {
                            "source": "^../../linkTestFile.html",
                            "destination": "../linkTestFile.md"
                        }
                    ]
                }
            }
        ]
    },
    {
        valid: [
            {
                inputPath: path.resolve("./test/fixtures/testFiles/validLinkRoutingTest.md"),
            }
        ],
        invalid: [
            {
                inputPath: path.resolve("./test/fixtures/testFiles/invalidLinkRoutingTest.md"),
                errors: [
                    {
                        message: "The routed destination for invalidLink.md does not exist",
                        line: 1,
                        column: 120
                    },
                    {
                        message: "The routed destination for invalidLink.md does not exist",
                        line: 2,
                        column: 99
                    },
                    {
                        message: "The routed destination for invalidLink.html does not exist",
                        line: 3,
                        column: 163
                    },
                    {
                        message: "The routed destination for invalidLink.html does not exist",
                        line: 4,
                        column: 140
                    },
                    {
                        message: "Anchor #header-7 does not exist in linkTestFile.md",
                        line: 5,
                        column: 129
                    },
                    {
                        message: "linkTestFile.md has no mapped routing",
                        line: 6,
                        column: 72
                    },
                    {
                        message: "linkTestFile.md has no mapped routing",
                        line: 7,
                        column: 87
                    },
                    {
                        message: "The routed destination for linkTestFile.md does not exist",
                        line: 8,
                        column: 85
                    },
                    {
                        message: "The routed destination for linkTestFile.md does not exist",
                        line: 9,
                        column: 100
                    }
                ]
            }
        ]
    });