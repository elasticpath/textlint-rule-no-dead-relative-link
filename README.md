# textlint-rule-no-dead-relative-link

This is a [textlint rule](https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule) that validate links in markdown documents. It does the following
- It ignores external link. The `RegExp` used to filter out such links is `/^[a-z][a-z0-9+.-]*:/i`
- For all relative links, it checks that there is a file specified by the link. The relative links are resolved relative to the file containing the link.
- For all relative links with anchors or just anchor within the same file, it checks that the anchor exists. It treats anchor links to markdown documents the same way as github does i.e. the rule uses [github-slugger](https://github.com/Flet/github-slugger) to do validation.  

## Installation
- Since this is a textlint rule, first install textlint by following the [textlint getting started guide](https://textlint.github.io/docs/getting-started.html).  
- This rule is available as an npm package and can be installed using 
    - `npm install --save-dev textlint-rule-no-dead-relative-link`  
     or 
    - `yarn add --dev textlint-rule-no-dead-relative-link`  and then `yarn install`

## Usage

If you are unfamiliar with textlint then refer to [configuring textlint](https://textlint.github.io/docs/configuring.html) for textlint configuration details.  

Add one of the following to `.textlintrc` file
- without any options

```json
{
    "rules": {
        "no-dead-relative-link": true
    }
}
```
or 
- with options

```json
{
    "rules": {
        "no-dead-relative-link": {
            "resolve-as-markdown": "[.html]"
        }
    }
}
```

To use it via command line arguments

```
textlint --rule textlint-rule-no-dead-relative-link README.md
```

## Options

### resolve-as-markdown

This option takes an array of file extension values and treats files with those extension as if they are markdown files.  

For e.g. With the following configuration
```json
{
    "rules": {
        "no-dead-relative-link": {
            "resolve-as-markdown": [".html"]
        }
    }
}
```

and `[README](README.html)` as input, this rule will check for the existence of `README.md` file.

### route-map
This option takes an array of source and destination pairs. The source value is a Regex, and the destination value is a 
String. However, the destination value can include capture groups using a "\" but remember to add an extra "\" to ensure 
the JSON formatting is valid. If a link contains the source value, then the portion of the link that matches the source
value is replaced with the destination value.


For e.g. With the following configuration
```json
{
    "rules": {
        "no-dead-relative-link": {
            "route-map": [
                {
                  "source": "^(../)\\1javadocs/",
                  "destination": "../website/static/javadocs/"
                },
                {
                  "source": "^../javadocs/(\\d+\\.{1}\\d+\\.{1}\\w+)",
                  "destination": "../../static/javadocs/\\1"
                }
            ]
        }
    }
}

```

and `../../javadocs/overview-summary.html` as input, this rule with check for the existence of the `overview-summary.html`
file at `../website/static/javadocs/overview-summary.html`.

## License

MIT © parthopensource@gmail.com
