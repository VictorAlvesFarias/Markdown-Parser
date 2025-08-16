import { MarkdownElement } from '../parser/markdown-element.js';

export class ListItemBuilder {
    static parse(line) {
        const match = line.match(/^(\s*)([-*+]|\d+\.)\s(.*)/);
        if (!match) return null;
        
        const indent = match[1].length;
        const marker = match[2];
        const text = match[3].trim();
        
        return new MarkdownElement('list-item', text, {
            level: indent , // Nível baseado na indentação
            marker: marker
        });
    }

    static build(element) { 
        const indent = ' '.repeat(element.level );
        return `${indent}${element.marker} ${element.content}`;
    }
} 