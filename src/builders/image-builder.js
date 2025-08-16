import { MarkdownElement } from '../parser/markdown-element.js';

export class ImageBuilder {
    static parse(line) {
        const match = line.trim().match(/!\[([^\]]*)\]\(([^)\s]+)(?:\s"([^"]+)")?\)/);
        if (!match) return null;
        
        return new MarkdownElement('image', match[1], {
            url: match[2],
            title: match[3] || null
        });
    }
    
    static build(element) {
        const title = element.title ? ` "${element.title}"` : '';
        return `![${element.content}](${element.url}${title})`;
    }
} 