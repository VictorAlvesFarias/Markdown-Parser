import { MarkdownElement } from '../parser/markdown-element.js';

export class CodeBuilder {
    static parse(content, tag) { 
        let lang = '';
        
        if (tag.trim().startsWith('```')) {
            const match = tag.trim().match(/^```\s*([^\s].*)/);
            lang = match && match[1] ? match[1] : '';
        }
        
        return new MarkdownElement('code', content, {
            lang: lang
        });
    }

    static build(element) { 
        if (element.lang) {
            return `\`\`\`${element.lang}\n${element.content}\n\`\`\``;
        }
        return `\`\`\`\n${element.content}\n\`\`\``;
    }
} 