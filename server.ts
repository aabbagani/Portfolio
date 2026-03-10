import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;
const db = new Database('portfolio.db');

app.use(cors());
app.use(bodyParser.json());

// --- File Upload Setup ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- Database Migrations / Initialization ---
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    category TEXT,
    description TEXT,
    image TEXT,
    tags TEXT,
    link TEXT,
    media TEXT,
    sortOrder INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT,
    company TEXT,
    period TEXT,
    location TEXT,
    summary TEXT,
    tags TEXT,
    wins TEXT,
    behindTheResume TEXT,
    showImage INTEGER,
    image TEXT,
    imageCaption TEXT,
    presentationLink TEXT,
    attachmentLink TEXT,
    attachmentText TEXT,
    sortOrder INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT
  );

  CREATE TABLE IF NOT EXISTS content (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school TEXT,
    degree TEXT,
    field TEXT,
    location TEXT,
    period TEXT,
    gpa TEXT,
    details TEXT,
    image TEXT,
    showImage INTEGER DEFAULT 0,
    sortOrder INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    issuer TEXT,
    date TEXT,
    link TEXT,
    image TEXT,
    showImage INTEGER DEFAULT 0,
    sortOrder INTEGER DEFAULT 0
  );
`);

// Migration for existing databases
try {
    db.prepare("ALTER TABLE projects ADD COLUMN sortOrder INTEGER DEFAULT 0").run();
} catch (e) { }
try {
    db.prepare("ALTER TABLE experiences ADD COLUMN image TEXT").run();
} catch (e) { }
try {
    db.prepare("ALTER TABLE education ADD COLUMN image TEXT").run();
} catch (e) { }
try {
    db.prepare("ALTER TABLE education ADD COLUMN showImage INTEGER DEFAULT 0").run();
} catch (e) { }
try {
    db.prepare("ALTER TABLE education ADD COLUMN showImage INTEGER DEFAULT 0").run();
} catch (e) { }
try {
    db.prepare("ALTER TABLE certifications ADD COLUMN image TEXT").run();
} catch (e) { }
try {
    db.prepare("ALTER TABLE certifications ADD COLUMN showImage INTEGER DEFAULT 0").run();
} catch (e) { }

// --- Helper for parsing JSON columns ---
const parseJson = (row: any) => {
    if (!row) return row;
    const newRow = { ...row };
    if (newRow.tags) try { newRow.tags = JSON.parse(newRow.tags); } catch (e) { newRow.tags = []; }
    if (newRow.wins) try { newRow.wins = JSON.parse(newRow.wins); } catch (e) { newRow.wins = []; }
    if (newRow.media) try { newRow.media = JSON.parse(newRow.media); } catch (e) { newRow.media = []; }
    return newRow;
};

// --- API Routes ---

// File Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `http://localhost:3001/uploads/${req.file.filename}`;
    res.json({ url });
});

// Projects
app.get('/api/projects', (req, res) => {
    const rows = db.prepare('SELECT * FROM projects ORDER BY sortOrder ASC, id DESC').all();
    res.json(rows.map(parseJson));
});

app.post('/api/projects', (req, res) => {
    const { title, category, description, image, tags, link, media, sortOrder } = req.body;
    const info = db.prepare('INSERT INTO projects (title, category, description, image, tags, link, media, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(title, category, description, image, JSON.stringify(tags || []), link, JSON.stringify(media || []), sortOrder || 0);
    res.json({ id: info.lastInsertRowid });
});

app.put('/api/projects/:id', (req, res) => {
    const { title, category, description, image, tags, link, media, sortOrder } = req.body;
    db.prepare('UPDATE projects SET title = ?, category = ?, description = ?, image = ?, tags = ?, link = ?, media = ?, sortOrder = ? WHERE id = ?')
        .run(title, category, description, image, JSON.stringify(tags || []), link, JSON.stringify(media || []), sortOrder || 0, req.params.id);
    res.json({ success: true });
});

app.delete('/api/projects/:id', (req, res) => {
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Reorder Projects
app.post('/api/projects/reorder', (req, res) => {
    const { orders } = req.body;
    const update = db.prepare('UPDATE projects SET sortOrder = ? WHERE id = ?');
    const transaction = db.transaction((items) => {
        for (const item of items) update.run(item.sortOrder, item.id);
    });
    transaction(orders);
    res.json({ success: true });
});

// Experiences
app.get('/api/experiences', (req, res) => {
    const rows = db.prepare('SELECT * FROM experiences ORDER BY sortOrder ASC, id DESC').all();
    res.json(rows.map(parseJson));
});

app.post('/api/experiences', (req, res) => {
    const { role, company, period, location, summary, tags, wins, behindTheResume, showImage, image, imageCaption, presentationLink, attachmentLink, attachmentText, sortOrder } = req.body;
    const info = db.prepare(`
    INSERT INTO experiences (role, company, period, location, summary, tags, wins, behindTheResume, showImage, image, imageCaption, presentationLink, attachmentLink, attachmentText, sortOrder)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(role, company, period, location, summary, JSON.stringify(tags || []), JSON.stringify(wins || []), behindTheResume, showImage ? 1 : 0, image, imageCaption, presentationLink, attachmentLink, attachmentText, sortOrder || 0);
    res.json({ id: info.lastInsertRowid });
});

app.put('/api/experiences/:id', (req, res) => {
    const { role, company, period, location, summary, tags, wins, behindTheResume, showImage, image, imageCaption, presentationLink, attachmentLink, attachmentText, sortOrder } = req.body;
    db.prepare(`
    UPDATE experiences SET role = ?, company = ?, period = ?, location = ?, summary = ?, tags = ?, wins = ?, behindTheResume = ?, showImage = ?, image = ?, imageCaption = ?, presentationLink = ?, attachmentLink = ?, attachmentText = ?, sortOrder = ?
    WHERE id = ?
  `).run(role, company, period, location, summary, JSON.stringify(tags || []), JSON.stringify(wins || []), behindTheResume, showImage ? 1 : 0, image, imageCaption, presentationLink, attachmentLink, attachmentText, sortOrder || 0, req.params.id);
    res.json({ success: true });
});

app.delete('/api/experiences/:id', (req, res) => {
    db.prepare('DELETE FROM experiences WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Reorder Experiences
app.post('/api/experiences/reorder', (req, res) => {
    const { orders } = req.body;
    const update = db.prepare('UPDATE experiences SET sortOrder = ? WHERE id = ?');
    const transaction = db.transaction((items) => {
        for (const item of items) update.run(item.sortOrder, item.id);
    });
    transaction(orders);
    res.json({ success: true });
});

// Skills
app.get('/api/skills', (req, res) => {
    const rows = db.prepare('SELECT * FROM skills').all();
    res.json(rows);
});

app.post('/api/skills', (req, res) => {
    const { name, type } = req.body;
    const info = db.prepare('INSERT INTO skills (name, type) VALUES (?, ?)').run(name, type);
    res.json({ id: info.lastInsertRowid });
});

app.delete('/api/skills/:id', (req, res) => {
    db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Education
app.get('/api/education', (req, res) => {
    const rows = db.prepare('SELECT * FROM education ORDER BY sortOrder ASC, id DESC').all();
    res.json(rows);
});

app.post('/api/education', (req, res) => {
    const { school, degree, field, location, period, gpa, details, image, showImage, sortOrder } = req.body;
    const info = db.prepare('INSERT INTO education (school, degree, field, location, period, gpa, details, image, showImage, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(school, degree, field, location, period, gpa, details, image, showImage ? 1 : 0, sortOrder || 0);
    res.json({ id: info.lastInsertRowid });
});

app.put('/api/education/:id', (req, res) => {
    const { school, degree, field, location, period, gpa, details, image, showImage, sortOrder } = req.body;
    db.prepare('UPDATE education SET school = ?, degree = ?, field = ?, location = ?, period = ?, gpa = ?, details = ?, image = ?, showImage = ?, sortOrder = ? WHERE id = ?')
        .run(school, degree, field, location, period, gpa, details, image, showImage ? 1 : 0, sortOrder || 0, req.params.id);
    res.json({ success: true });
});

app.delete('/api/education/:id', (req, res) => {
    db.prepare('DELETE FROM education WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Certifications
app.get('/api/certifications', (req, res) => {
    const rows = db.prepare('SELECT * FROM certifications ORDER BY sortOrder ASC, id DESC').all();
    res.json(rows);
});

app.post('/api/certifications', (req, res) => {
    const { name, issuer, date, link, image, showImage, sortOrder } = req.body;
    const info = db.prepare('INSERT INTO certifications (name, issuer, date, link, image, showImage, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(name, issuer, date, link, image, showImage ? 1 : 0, sortOrder || 0);
    res.json({ id: info.lastInsertRowid });
});

app.put('/api/certifications/:id', (req, res) => {
    const { name, issuer, date, link, image, showImage, sortOrder } = req.body;
    db.prepare('UPDATE certifications SET name = ?, issuer = ?, date = ?, link = ?, image = ?, showImage = ?, sortOrder = ? WHERE id = ?')
        .run(name, issuer, date, link, image, showImage ? 1 : 0, sortOrder || 0, req.params.id);
    res.json({ success: true });
});

app.delete('/api/certifications/:id', (req, res) => {
    db.prepare('DELETE FROM certifications WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Content
app.get('/api/content', (req, res) => {
    const rows = db.prepare('SELECT * FROM content').all();
    const contentMap: any = {};
    rows.forEach((row: any) => {
        contentMap[row.key] = row.value;
    });
    res.json(contentMap);
});

app.post('/api/content', (req, res) => {
    const { key, value } = req.body;
    db.prepare('INSERT OR REPLACE INTO content (key, value) VALUES (?, ?)').run(key, value);
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
