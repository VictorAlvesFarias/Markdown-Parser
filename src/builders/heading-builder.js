import { MarkdownElement } from '../parser/markdown-element.js';

export class HeadingBuilder {
    static parse(line) {
        // Suporte para diferentes formatos de heading
        const hashMatch = line.match(/^(#{1,6})\s(.*)/);
        if (hashMatch) {
            return new MarkdownElement('heading', hashMatch[2].trim(), {
                level: hashMatch[1].length
            });
        }

        // Suporte para headings com === ou ---
        const underlineMatch = line.match(/^(.*?)\s*([=]+|-+)$/);
        if (underlineMatch) {
            const level = underlineMatch[2].startsWith('=') ? 1 : 2;
            return new MarkdownElement('heading', underlineMatch[1].trim(), {
                level: level
            });
        }

        return null;
    }

    static build(element) { 
        if (element.level <= 6) {
            return `${'#'.repeat(element.level)} ${element.content}`;
        }
        return `# ${element.content}`;
    }
} 