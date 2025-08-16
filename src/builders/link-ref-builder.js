import { MarkdownElement } from '../parser/markdown-element.js';

export class LinkRefBuilder {
    static parse(line) {
        const match = line.trim().match(/^\[([^\]]+)\]:\s*(.*)/);
        if (!match) return null;
        
        return new MarkdownElement('link-ref', match[1], {
            url: match[2]
        });
    }
    
    static build(element) {
        return `[${element.content}]: ${element.url}`;
    }
} 