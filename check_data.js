const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'kamberss_kamera',
    port: 5432
});

async function check() {
    try {
        const res = await pool.query('SELECT DISTINCT category FROM products');
        const resCount = await pool.query('SELECT COUNT(*) FROM products');
        const items = await pool.query('SELECT id, name, category FROM products LIMIT 5');

        const output = `
Categories: ${JSON.stringify(res.rows)}
Total Count: ${resCount.rows[0].count}
Sample Items: ${JSON.stringify(items.rows, null, 2)}
    `;

        fs.writeFileSync('db_output.txt', output);
        console.log('Done writing to db_output.txt');

    } catch (err) {
        console.error('Error querying DB:', err);
        fs.writeFileSync('db_output.txt', 'Error: ' + err.message);
    } finally {
        await pool.end();
    }
}

check();
