export class MarkdownElement {
    constructor(type, content, metadata = {}) {
        this.type = type;
        this.content = content;
        this.level = metadata.level || null;
        this.marker = metadata.marker || null;
        this.checked = metadata.checked || null;
        this.lang = metadata.lang || null;
        this.url = metadata.url || null;
        this.title = metadata.title || null;
        this.id = metadata.id || null;
    }
} 