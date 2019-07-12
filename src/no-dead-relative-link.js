import "@babel/polyfill";
import fs from 'fs';
import path from 'path'
import {parse, Syntax} from '@textlint/markdown-to-ast';
import {traverse, VisitorOption} from '@textlint/ast-traverse';
import GithubSlugger from 'github-slugger';
import util from 'util';
import { wrapReportHandler} from 'textlint-rule-helper';

const fileExists = util.promisify(fs.exists);
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
    let linkAbsoutePath = path.resolve(path.dirname(context.getFilePath()), linkNode.url);
    let linkURL = new URL("file://" + linkAbsoutePath);
    let linkedFileExtension = path.extname(linkURL.pathname);
    if (linkedFileExtension !== ".md" && options["resolve-as-markdown"] && options["resolve-as-markdown"].includes(linkedFileExtension)) {
        linkURL.pathname = linkURL.pathname.replace(linkedFileExtension, ".md");
    }
    if (!await fileExists(linkURL.pathname)) {
        reportError(linkNode, context, `${path.basename(linkURL.pathname)} does not exist`);
        return;
    } 
    if(linkURL.hash && path.extname(linkURL.pathname) === ".md") {
        return validateAnchorLink(linkURL.pathname, linkURL.hash.slice(1), linkNode, context);
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