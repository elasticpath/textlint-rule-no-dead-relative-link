import "@babel/polyfill";
import fs from 'fs';
import path from 'path';
import url from 'url';
import {parse, Syntax} from '@textlint/markdown-to-ast';
import {traverse, VisitorOption} from '@textlint/ast-traverse';
import GithubSlugger from 'github-slugger';
import util from 'util';
import {wrapReportHandler} from 'textlint-rule-helper';

const fileRead = util.promisify(fs.readFile);

//https://stackoverflow.com/a/31991870
const externalLinkRegex = new RegExp(/^[a-z][a-z0-9+.-]*:/, 'i');

export default function(context, options) {
    return wrapReportHandler(context, {
        ignoreNodeTypes: [Syntax.code]
    }, () => handler(context, options));
}

function handler(context, options) {
    return {
        [context.Syntax.Link] (linkNode) {
            return validateLinkNode(linkNode, context, options);
        }
    }
}

async function validateLinkNode(linkNode, context, options) {
    if (!linkNode.url || externalLinkRegex.test(linkNode.url)) {
        return;
    } else if (linkNode.url[0] === '#') {
        return validateAnchorLink(context.getFilePath(), linkNode.url.slice(1), linkNode, context);
    } else {
        return validateRelativeLink(linkNode, context, options);
    }
}

async function validateRelativeLink(linkNode, context, options) {
    let linkURL = getLinkURL(linkNode.url, context, options);
    let routedLinkURL;
    if (!await fileExists(url.fileURLToPath(linkURL))) {
        if (options["route-map"]) {
            routedLinkURL = await getRoutedLink(linkNode, context, options);
            if (routedLinkURL && !await fileExists(url.fileURLToPath(routedLinkURL))) {
                reportError(linkNode, context, `The routed destination for ${path.basename(linkURL.pathname)} does not exist`);
                return;
            }
            if (!routedLinkURL) {
                reportError(linkNode, context, `${path.basename(linkURL.pathname)} has no mapped routing`);
                return;
            }
        } else {
            reportError(linkNode, context, `${path.basename(linkURL.pathname)} does not exist`);
            return;
        }
    }

    // use the routedLinkURL to check for the anchor
    if (routedLinkURL) {
        linkURL = routedLinkURL;
    }
    if (linkURL && linkURL.hash && path.extname(linkURL.pathname) === ".md") {
        return validateAnchorLink(url.fileURLToPath(linkURL), linkURL.hash.slice(1), linkNode, context);
    }
}

async function getRoutedLink(linkNode, context, options) {
    let linkRouteMaps = options["route-map"];
    let nodeUrl = linkNode.url;
    for (const mapping of linkRouteMaps) {
        let sourceRegex = new RegExp(mapping["source"], "g");
        let mappedDestination = mapping["destination"]
        if (sourceRegex.test(nodeUrl)) {
            let routedUrl = nodeUrl.replace(sourceRegex, mappedDestination);
            let linkURL = getLinkURL(routedUrl, context, options);
            return linkURL;
        }
    }
}

function getLinkURL(nodeURL, context, options) {
    let linkAbsolutePath = path.resolve(path.dirname(context.getFilePath()), nodeURL);
    let linkURL = new URL("file://" + linkAbsolutePath);
    let linkedFileExtension = path.extname(linkURL.pathname);
    if (linkedFileExtension !== ".md" && options["resolve-as-markdown"] && options["resolve-as-markdown"].includes(linkedFileExtension)) {
        linkURL.pathname = linkURL.pathname.replace(linkedFileExtension, ".md");
    }

    return linkURL;
}

async function fileExists(url) {
    let access = util.promisify(fs.access);
    try {
        await access(url);
        return true;
    } catch (e) {
        return false;
    }
}

async function validateAnchorLink(filePath, anchor, linkNode, context) {
    let fileContent = await fileRead(filePath, 'utf8');
    let ast = parse(fileContent);
    let slugger = new GithubSlugger();
    let found = false;
    traverse(ast, {
        enter(node) {
            if (node.type === Syntax.Header) {
                let headerStr = node.raw.substring(node.depth).trim();
                let id = slugger.slug(headerStr);
                if (id === anchor) {
                    found = true;
                    return VisitorOption.Break;
                }
            }
        }
    });
    if (!found) {
        reportError(linkNode, context, `Anchor #${anchor} does not exist in ${path.basename(filePath)}`);
    }
}

function reportError(linkNode, context, errorMessage) {
    context.report(linkNode, new context.RuleError(errorMessage, {
        index: linkNode.raw.indexOf(linkNode.url) || 0
    }));
}