import Database from 'better-sqlite3';

const db = new Database('portfolio.db');

const tables = ['projects', 'experiences', 'education', 'certifications', 'content'];
const localhost = 'http://localhost:3001/';

console.log('Cleaning up hardcoded localhost URLs in database...');

tables.forEach(table => {
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    rows.forEach((row: any) => {
        let updated = false;
        const newRow = { ...row };

        // Clean image field
        if (newRow.image && newRow.image.startsWith(localhost)) {
            newRow.image = newRow.image.replace(localhost, '/');
            updated = true;
        }

        // Clean value field (for content table)
        if (newRow.value && newRow.value.startsWith(localhost)) {
            newRow.value = newRow.value.replace(localhost, '/');
            updated = true;
        }

        // Clean media field (JSON array in projects)
        if (table === 'projects' && newRow.media) {
            try {
                const media = JSON.parse(newRow.media);
                const newMedia = media.map((m: any) => {
                    if (m.url && m.url.startsWith(localhost)) {
                        return { ...m, url: m.url.replace(localhost, '/') };
                    }
                    return m;
                });
                const newMediaStr = JSON.stringify(newMedia);
                if (newMediaStr !== newRow.media) {
                    newRow.media = newMediaStr;
                    updated = true;
                }
            } catch (e) { }
        }

        if (updated) {
            if (table === 'content') {
                db.prepare(`UPDATE content SET value = ? WHERE key = ?`).run(newRow.value, row.key);
                console.log(`Updated content key: ${row.key}`);
            } else {
                const keys = Object.keys(newRow).filter(k => k !== 'id');
                const setClause = keys.map(k => `${k} = ?`).join(', ');
                const values = keys.map(k => newRow[k]);
                db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).run(...values, row.id);
                console.log(`Updated ${table} ID: ${row.id}`);
            }
        }
    });
});

console.log('Database cleanup complete.');
db.close();
