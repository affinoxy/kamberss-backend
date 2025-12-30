const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'backup_utf8.sql');
const outputFile = path.join(__dirname, 'vercel_schema.sql');

const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split('\n');

let outputLines = [];
let inCopyMode = false;
let currentTable = '';
let currentColumns = '';

// Helper to escape single quotes
const esc = (str) => {
    if (str === '\\N' || str === null || str === undefined) return 'NULL';
    // Remove wrapping whitespace if any
    str = str.trim();
    if (str === '') return "''"; // specific case for empty strings if needed, or maybe NULL? 
    // Usually pg_dump puts empty strings as empty, and NULL as \N.
    // Let's treat standard text as text.
    return `'${str.replace(/'/g, "''")}'`;
};

// Types mapping for simple casting (optional, but good for numbers)
// We'll just quote everything and let PG handle casting for now, except NULL.
// Actually, integers shouldn't be quoted technically but PG is lenient. 
// Let's try to be smart: if it looks like a number, don't quote? 
// No, safer to quote mostly everything except NULL for text fields.
// For simplicity: quote everything not NULL.

lines.forEach(line => {
    const trimmed = line.trim();

    // Skip \restrict lines
    if (trimmed.startsWith('\\restrict') || trimmed.startsWith('\\unrestrict')) {
        return;
    }

    if (trimmed.startsWith('COPY')) {
        inCopyMode = true;
        // COPY public.products (id, ...) FROM stdin;
        const match = trimmed.match(/COPY public\.(\w+) \((.*)\) FROM stdin;/);
        if (match) {
            currentTable = match[1];
            currentColumns = match[2]; // id, category, name...
        }
        outputLines.push(`-- Converted COPY ${currentTable} to INSERT`);
        return;
    }

    if (inCopyMode) {
        if (trimmed === '\\.') {
            inCopyMode = false;
            return;
        }
        if (!trimmed) return;

        // Parse tab separated values
        const values = line.split('\t').map(val => {
            // Remove trailing \r or newline chars from the last element if present
            val = val.replace(/[\r\n]+$/, '');
            return esc(val);
        });

        const insertStmt = `INSERT INTO public.${currentTable} (${currentColumns}) VALUES (${values.join(', ')});`;
        outputLines.push(insertStmt);
    } else {
        outputLines.push(line);
    }
});

fs.writeFileSync(outputFile, outputLines.join('\n'));
console.log('Converted SQL file created:', outputFile);
