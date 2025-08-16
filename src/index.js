// Main entry point for the Markdown Parser library
export { MarkdownParser } from './parser/markdown-parser.js';
export { MarkdownElementType } from './parser/markdown-element-type.js';
export { MarkdownElement } from './parser/markdown-element.js';

// Export builders for advanced usage
export { CodeBuilder } from './builders/code-builder.js';
export { HeadingBuilder } from './builders/heading-builder.js';
export { TableBuilder } from './builders/table-builder.js';
export { ListItemBuilder } from './builders/list-item-builder.js';
export { TaskItemBuilder } from './builders/task-item-builder.js';
export { HrBuilder } from './builders/hr-builder.js';
export { BlockquoteBuilder } from './builders/blockquote-builder.js';
export { ImageBuilder } from './builders/image-builder.js';
export { LinkRefBuilder } from './builders/link-ref-builder.js';
export { FootnoteBuilder } from './builders/footnote-builder.js';
export { ListStartBuilder } from './builders/list-start-builder.js';
export { ListEndBuilder } from './builders/list-end-builder.js';

// Export utilities
export { MarkdownUtils } from './utils/markdown-utils.js'; 

// Formatter
export { MarkdownFormatter } from './formatter.js';

// Convenience API
export function parseMarkdown(markdown, options = {}) {
  const parser = new MarkdownParser(options);
  return parser.toList(markdown);
}

export function toMarkdown(elements, options = {}) {
  const parser = new MarkdownParser(options);
  return parser.toMarkdown(elements);
}