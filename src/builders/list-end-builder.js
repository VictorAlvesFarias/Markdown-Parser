import { MarkdownElement } from '../parser/markdown-element.js';

export class ListEndBuilder {
    static parse() {
        return new MarkdownElement('list-end', 'LIST_END');
    }

    static build(element) {
        return ''; // Não gera markdown, apenas marcador interno
    }
} 