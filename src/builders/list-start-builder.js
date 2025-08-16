import { MarkdownElement } from '../parser/markdown-element.js';

export class ListStartBuilder {
    static parse() {
        return new MarkdownElement('list-start', 'LIST_START');
    }

    static build(element) {
        return ''; // Não gera markdown, apenas marcador interno
    }
} 