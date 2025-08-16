/**
 * README formatter for consistent formatting
 */

import { MarkdownElementType } from '../parser/markdown-element-type.js';
import { MarkdownElement } from '../parser/markdown-element.js';
import { MarkdownUtils } from './markdown-utils.js';

export class MarkdownFormatter {
  constructor(options = {}) {
    this.options = {
      maxLineLength: 80,
      consistentListMarkers: true,
      consistentSpacing: true,
      sortSections: false,
      addTableOfContents: false,
      ...options,
    };
  }

  /**
   * Format a list of README elements
   * @param {MarkdownElement[]} elements
   * @returns {MarkdownElement[]}
   */
  format(elements) {
    let formatted = [...elements];

    if (this.options.consistentSpacing) {
      formatted = this._normalizeSpacing(formatted);
    }

    if (this.options.consistentListMarkers) {
      formatted = this._normalizeListMarkers(formatted);
    }

    if (this.options.maxLineLength > 0) {
      formatted = this._wrapLongLines(formatted);
    }

    if (this.options.sortSections) {
      formatted = this._sortSections(formatted);
    }

    if (this.options.addTableOfContents && !this._hasTableOfContents(formatted)) {
      formatted = this._addTableOfContents(formatted);
    }

    return formatted;
  }

  // Spacing
  _normalizeSpacing(elements) {
    const formatted = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const nextElement = elements[i + 1];

      formatted.push(element);

      if (nextElement && !this._shouldNotAddSpacing(element, nextElement)) {
        formatted.push(new MarkdownElement(MarkdownElementType.BREAK, ''));
      }
    }

    return formatted;
  }

  _shouldNotAddSpacing(current, next) {
    // Keep lists compact
    if (
      (current.type === MarkdownElementType.LIST_ITEM || current.type === MarkdownElementType.TASK_ITEM) &&
      (next.type === MarkdownElementType.LIST_ITEM || next.type === MarkdownElementType.TASK_ITEM)
    ) {
      return true;
    }

    // Keep tables compact (rows are emitted as a single TABLE element normally)
    if (current.type === MarkdownElementType.TABLE && next.type === MarkdownElementType.TABLE) {
      return true;
    }

    // Do not add extra spacing right after a heading
    if (current.type === MarkdownElementType.HEADING) {
      return true;
    }

    // LIST_START/LIST_END are control markers: do not inject spacing around
    if (
      current.type === MarkdownElementType.LIST_START ||
      current.type === MarkdownElementType.LIST_END ||
      next.type === MarkdownElementType.LIST_START ||
      next.type === MarkdownElementType.LIST_END
    ) {
      return true;
    }

    return false;
  }

  // List markers
  _normalizeListMarkers(elements) {
    return elements.map((el) => {
      if (el.type === MarkdownElementType.LIST_ITEM) {
        const marker = el.marker;
        let normalized = marker;
        if (marker === '*' || marker === '+') {
          normalized = '-';
        }
        // Preserve numeric ordered markers like "1."
        if (/^\d+\.$/.test(marker)) {
          normalized = marker;
        }
        return new MarkdownElement(MarkdownElementType.LIST_ITEM, el.content, {
          level: el.level,
          marker: normalized,
        });
      }
      return el;
    });
  }

  // Wrap long lines
  _wrapLongLines(elements) {
    return elements.map((el) => {
      if (el.type === MarkdownElementType.PARAGRAPH && typeof el.content === 'string') {
        const wrapped = this._wrapText(el.content, this.options.maxLineLength);
        return new MarkdownElement(MarkdownElementType.PARAGRAPH, wrapped);
      }
      return el;
    });
  }

  _wrapText(text, maxLength) {
    // text can contain inline HTML-like tags; wrapping by spaces is fine
    if (!text || text.length <= maxLength) return text;

    const words = text.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
      if ((current + (current ? ' ' : '') + word).length <= maxLength) {
        current += (current ? ' ' : '') + word;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines.join('\n');
  }

  // Section ordering
  _sortSections(elements) {
    const order = [
      'title',
      'description',
      'installation',
      'usage',
      'features',
      'api',
      'examples',
      'contributing',
      'license',
    ];

    const sections = this._groupSections(elements);
    const sorted = [];

    // add in preferred order
    for (const name of order) {
      if (sections[name]) sorted.push(...sections[name]);
    }
    // add the rest
    for (const [name, elems] of Object.entries(sections)) {
      if (!order.includes(name)) sorted.push(...elems);
    }

    return sorted;
  }

  _groupSections(elements) {
    const sections = {};
    let currentName = 'other';
    let current = [];

    const flush = () => {
      if (current.length > 0) sections[currentName] = (sections[currentName] || []).concat(current);
      current = [];
    };

    for (const el of elements) {
      if (el.type === MarkdownElementType.HEADING) {
        // new section starts
        flush();
        currentName = this._getSectionName(String(el.content || ''));
        current.push(el);
      } else {
        current.push(el);
      }
    }
    flush();

    return sections;
  }

  _getSectionName(headingText) {
    const text = headingText.toLowerCase();
    if (!text) return 'other';
    if (text.includes('description') || text.includes('about')) return 'description';
    if (text.includes('install')) return 'installation';
    if (text.includes('usage') || text.includes('how to use')) return 'usage';
    if (text.includes('feature')) return 'features';
    if (text.includes('api')) return 'api';
    if (text.includes('example')) return 'examples';
    if (text.includes('contribut')) return 'contributing';
    if (text.includes('license')) return 'license';
    return 'other';
  }

  // Table of contents
  _addTableOfContents(elements) {
    const tocItems = this._generateTableOfContents(elements);
    if (tocItems.length === 0) return elements;

    const result = [];
    // If first element is a title, keep it, then add TOC
    let index = 0;
    if (elements.length > 0 && elements[0].type === MarkdownElementType.HEADING && (elements[0].level === 1 || elements[0].level === 2)) {
      result.push(elements[0]);
      result.push(new MarkdownElement(MarkdownElementType.BREAK, ''));
      index = 1;
    }

    // TOC heading
    result.push(new MarkdownElement(MarkdownElementType.HEADING, 'Table of Contents', { level: 2 }));
    result.push(new MarkdownElement(MarkdownElementType.BREAK, ''));

    // TOC items as list items
    for (const item of tocItems) {
      const text = `[${item.text}](${`#${this._slugify(item.text)}`})`;
      result.push(
        new MarkdownElement(MarkdownElementType.LIST_ITEM, text, {
          level: 0,
          marker: '-',
        })
      );
    }

    result.push(new MarkdownElement(MarkdownElementType.BREAK, ''));

    // rest of content
    result.push(...elements.slice(index));
    return result;
  }

  _generateTableOfContents(elements) {
    const toc = [];
    for (const el of elements) {
      if (el.type === MarkdownElementType.HEADING && typeof el.content === 'string') {
        const level = el.level || 1;
        if (level > 1) {
          toc.push({ level, text: el.content });
        }
      }
    }
    return toc;
  }

  _slugify(text) {
    return String(text)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  _hasTableOfContents(elements) {
    return elements.some(
      (el) => el.type === MarkdownElementType.HEADING && typeof el.content === 'string' && el.content.toLowerCase().includes('table of contents')
    );
  }

  // Stats
  getFormattingStats(elements) {
    const stats = {
      totalLines: 0,
      longLines: 0,
      inconsistentMarkers: 0,
      missingSpacing: 0,
    };

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const next = elements[i + 1];

      if (el.type === MarkdownElementType.PARAGRAPH && typeof el.content === 'string') {
        const lines = String(el.content).split('\n');
        stats.totalLines += lines.length;
        for (const line of lines) {
          if (line.length > this.options.maxLineLength) stats.longLines++;
        }
      }

      if (el.type === MarkdownElementType.LIST_ITEM) {
        if (el.marker !== '-' && !/^\d+\.$/.test(String(el.marker))) {
          stats.inconsistentMarkers++;
        }
      }

      if (next && !this._shouldNotAddSpacing(el, next)) {
        if (next.type !== MarkdownElementType.BREAK) {
          stats.missingSpacing++;
        }
      }
    }

    return stats;
  }
}


