import { MarkdownElementType } from './markdown-element-type.js';
import { MarkdownElement } from './markdown-element.js';
import { MarkdownUtils } from '../utils/markdown-utils.js';
import { CodeBuilder } from '../builders/code-builder.js';
import { HeadingBuilder } from '../builders/heading-builder.js';
import { TableBuilder } from '../builders/table-builder.js';
import { ListItemBuilder } from '../builders/list-item-builder.js';
import { TaskItemBuilder } from '../builders/task-item-builder.js';
import { HrBuilder } from '../builders/hr-builder.js';
import { BlockquoteBuilder } from '../builders/blockquote-builder.js';
import { ImageBuilder } from '../builders/image-builder.js';
import { LinkRefBuilder } from '../builders/link-ref-builder.js';
import { FootnoteBuilder } from '../builders/footnote-builder.js';
import { ListStartBuilder } from '../builders/list-start-builder.js';
import { ListEndBuilder } from '../builders/list-end-builder.js';

export class MarkdownParser {
    toList(markdown) {
        const lines = markdown.split('\n');
        const elements = [];
        
        let insideCodeBlock = false;
        let codeBuffer = [];
        let codeTag = '';

        let inTable = false;
        let tableBuffer = [];
        
        let inList = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            // if(line.includes('- [Recommendations](#recommendations)')){
            //     debugger;
            // }

            // Bloco de código cercado
            if (line.trim().startsWith('```')) {
                if (insideCodeBlock) {
                    const element = CodeBuilder.parse(codeBuffer.join('\n'), codeTag);
                    elements.push(element);
                    codeBuffer = [];
                    insideCodeBlock = false;
                } else {
                    insideCodeBlock = true;
                    codeTag = line; 
                }
                continue;
            }

            if (insideCodeBlock) {
                codeBuffer.push(line);
                continue;
            }

            // Bloco de código indentado
            if (/^( {4}|\t)/.test(line) && insideCodeBlock) {
                const element = CodeBuilder.parse(line.replace(/^( {4}|\t)/, ''), '    ');
                elements.push(element);
                continue;
            }

            // HTML embutido
            if (/^<.*>.*<\/.*>$/.test(line)) {
                elements.push(new MarkdownElement(MarkdownElementType.HTML, line));
                continue;
            }

            // Horizontal Rule
            if (/^[-*_]{3,}$/.test(line)) {
                const element = HrBuilder.parse(line);
                elements.push(element);
                continue;
            }

            // Blockquote
            if (line.startsWith('>')) {
                const element = BlockquoteBuilder.parse(line);
                elements.push(element);
                continue;
            }

            // Image
            if (/^!\[([^\]]*)\]\(([^)\s]+)(?:\s"([^"]+)")?\)/.test(line)) {
                const element = ImageBuilder.parse(line);
                if (element) elements.push(element);
                continue;
            }

            // Link Reference
            if (/^\[[^\]]+\]:/.test(line)) {
                const element = LinkRefBuilder.parse(line);
                if (element) elements.push(element);
                continue;
            }

            // Footnote
            if (/^\[\^[^\]]+\]:/.test(line)) {
                const element = FootnoteBuilder.parse(line);
                if (element) elements.push(element);
                continue;
            }

            // Tabelas
            if (line.startsWith('|') && line.endsWith('|')) {
                inTable = true;
                tableBuffer.push(line);
                const nextLine = lines[i + 1]?.trim();
                if (!nextLine || !nextLine.startsWith('|')) {
                    const content = TableBuilder.parse(tableBuffer);
                    elements.push(new MarkdownElement(MarkdownElementType.TABLE, content));
                    tableBuffer = [];
                    inTable = false;
                }
                continue;
            }
            if (inTable) continue;

            // Headings
            const headingElement = HeadingBuilder.parse(line);
            if (headingElement) {
                elements.push(headingElement);
                continue;
            }

            // Task Items
            if (/^(\s*)([-*+])\s\[[x ]\]/i.test(line)) {
                // Se não estamos em uma lista, adicionar marcador de início
                if (!inList) {
                    const listStart = ListStartBuilder.parse();
                    elements.push(listStart);
                    inList = true;
                }
                const element = TaskItemBuilder.parse(line);
                if (element) elements.push(element);
                continue;
            }

            // List Items
            if (/^(\s*)([-*+]|\d+\.)\s/.test(line)) {
                // Se não estamos em uma lista, adicionar marcador de início
                if (!inList) {
                    const listStart = ListStartBuilder.parse();
                    elements.push(listStart);
                    inList = true;
                }
                const element = ListItemBuilder.parse(line);
                if (element) elements.push(element);
                continue;
            }

            // Se estamos em uma lista e encontramos uma linha vazia ou outro elemento, fechar a lista
            if (inList && (line === '' || !/^(\s*)([-*+]|\d+\.)\s/.test(line))) {
                const listEnd = ListEndBuilder.parse();
                elements.push(listEnd);
                inList = false;
            }

            // Linha vazia
            if (line === '') {
                elements.push(new MarkdownElement(MarkdownElementType.BREAK, ''));
                continue;
            }

            // Parágrafo (com inline parsing)
            const parsedText = MarkdownUtils.parse(line);
            elements.push(new MarkdownElement(MarkdownElementType.PARAGRAPH, parsedText));
        }

        // Fechar lista se ainda estiver aberta no final
        if (inList) {
            const listEnd = ListEndBuilder.parse();
            elements.push(listEnd);
        }

        return elements;
    }

    toMarkdown(list) {
        let markdown = '';
        let inList = false;

        for (let el of list) {
            switch (el.type) {
                case MarkdownElementType.CODE:
                    markdown += CodeBuilder.build(el) + '\n';
                    break;
                case MarkdownElementType.HR:
                    markdown += HrBuilder.build(el) + '\n';
                    break;
                case MarkdownElementType.BREAK:
                    markdown += '\n';
                    break;
                case MarkdownElementType.BLOCKQUOTE:
                    markdown += BlockquoteBuilder.build(el) + '\n';
                    break;
                case MarkdownElementType.IMAGE:
                    markdown += ImageBuilder.build(el) + '\n';
                    break;
                case MarkdownElementType.PARAGRAPH:
                    markdown += MarkdownUtils.build(el.content) + '\n';
                    break;
                case MarkdownElementType.HTML:
                    markdown += el.content + '\n';
                    break;
                case MarkdownElementType.FOOTNOTE_DEF:
                    markdown += FootnoteBuilder.build(el) + '\n';
                    break;
                case MarkdownElementType.LINK_REF:
                    markdown += LinkRefBuilder.build(el) + '\n';
                    break;
                case MarkdownElementType.TABLE:
                    markdown += TableBuilder.build(el.content) + '\n';
                    break;
                case MarkdownElementType.TASK_ITEM:
                    if (!inList) {
                        inList = true;
                    }
                    markdown += TaskItemBuilder.build(el) + '\n';
                    break;
                case MarkdownElementType.LIST_ITEM:
                    if (!inList) {
                        inList = true;
                    }
                    markdown += ListItemBuilder.build(el) + '\n';
                    break;
                case MarkdownElementType.LIST_START:
                    inList = true;
                    break;
                case MarkdownElementType.LIST_END:
                    inList = false;
                    markdown ;
                    break;
                case MarkdownElementType.HEADING:
                    markdown += HeadingBuilder.build(el) + '\n';
                    break;
            }
        }
        return markdown.trim() + '\n';
    }
} 