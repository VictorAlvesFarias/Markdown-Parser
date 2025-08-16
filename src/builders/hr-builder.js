import { MarkdownElement } from '../parser/markdown-element.js';

export class HrBuilder {
    static parse(line) {
        return new MarkdownElement('hr', line.trim());
    }

    static build(element) {
        return element.content;
    }
} 