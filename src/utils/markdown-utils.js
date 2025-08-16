export class MarkdownUtils {
    static parse(text) {
        return text
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
            .replace(/~~([^~]+)~~/g, '<del>$1</del>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    }
    
    static build(text) {
        return text
            .replace(/<code>([^<]+)<\/code>/g, '`$1`')
            .replace(/<strong>([^<]+)<\/strong>/g, '**$1**')
            .replace(/<em>([^<]+)<\/em>/g, '*$1*')
            .replace(/<del>([^<]+)<\/del>/g, '~~$1~~')
            .replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[$2]($1)');
    }

    // Métodos legados para compatibilidade
    static parseInline(text) {
        return this.parse(text);
    }
    
    static buildInline(text) {
        return this.build(text);
    }
} 