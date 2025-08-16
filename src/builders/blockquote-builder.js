import { MarkdownElement } from '../parser/markdown-element.js';

export class BlockquoteBuilder {
    static parse(line) {
        return new MarkdownElement('blockquote', line.substring(1).trim());
    }
    
    static build(element) {
        return `> ${element.content}`;
    }
} 