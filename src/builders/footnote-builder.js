import { MarkdownElement } from '../parser/markdown-element.js';

export class FootnoteBuilder {
    static parse(line) {
        const match = line.trim().match(/^\[\^([^\]]+)\]:\s*(.*)/);
        if (!match) return null;
        
        return new MarkdownElement('footnote', match[2], {
            id: match[1]
        });
    }
    
    static build(element) {
        return `[^${element.id}]: ${element.content}`;
    }
} 