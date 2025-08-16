export class TableBuilder {
    static parse(lines) {
        const [headerLine, alignLine, ...rows] = lines;
        const headers = headerLine.split('|').slice(1, -1).map(h => h.trim());
        const aligns = alignLine.split('|').slice(1, -1).map(a => a.trim());
        const body = rows.map(r => r.split('|').slice(1, -1).map(c => c.trim()));
        return { 
            type: 'table',
            headers, 
            aligns, 
            rows: body 
        };
    }
    
    static build(content) {
        const header = `| ${content.headers.join(' | ')} |`;
        const aligns = `| ${content.aligns.join(' | ')} |`;
        const rows = content.rows.map(r => `| ${r.join(' | ')} |`).join('\n');
        return `${header}\n${aligns}\n${rows}`;
    }
} 