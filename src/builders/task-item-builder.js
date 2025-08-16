import { MarkdownElement } from '../parser/markdown-element.js';

export class TaskItemBuilder {
    static parse(line) {
        const match = line.match(/^(\s*)([-*+])\s\[(x| )\]\s(.*)/i);
        if (!match) return null;
        
        const indent = match[1].length;
        const checked = match[3].toLowerCase() === 'x';
        const text = match[4].trim();
        
        return new MarkdownElement('task-item', text, {
            level: Math.floor(indent / 2),
            checked: checked
        });
    }

    static build(element) { 
        const indent = ' '.repeat(element.level * 2);
        const checkbox = element.checked ? 'x' : ' ';
        return `${indent}- [${checkbox}] ${element.content}`;
    }
} 