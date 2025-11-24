import sqlite3 from 'sqlite3';
const Database = sqlite3.Database;
import * as z from 'zod';

const db = new Database('./data/books.db');

db.exec(`
CREATE TABLE IF NOT EXISTS Books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    isbn TEXT,
    total_pages INTEGER NOT NULL,
    current_page INTEGER DEFAULT 0,
    started_at TEXT,
    finished_at TEXT,
    cover_url TEXT
);
`);

export const BookSchema = z.object({
	id: z.number().int(), // autoincrement
	title: z.string().min(1),
	author: z.string(),
	isbn: z.string(),
	total_pages: z.number().int().min(1),
	current_page: z.number().int().min(0).default(0),
	started_at: z.string().nullable(),
	finished_at: z.string().nullable(),
	cover_url: z.string()
});

export type Book = z.infer<typeof BookSchema>;

export function addBook(b: Book): Promise<{ error: boolean; reason?: string }> {
	return new Promise((resolve) => {
		const stmt = db.prepare(
			`INSERT INTO Books (isbn, title, author, total_pages, cover_url)
       VALUES (?, ?, ?, ?, ?)`
		);

		stmt.run(b.isbn, b.title, b.author, b.total_pages, b.cover_url, (err: any) => {
			if (err) {
				if (err.code === 'SQLITE_CONSTRAINT') {
					return resolve({ error: true, reason: 'duplicate_isbn' });
				}
				return resolve({ error: true, reason: 'db_error' });
			}

			stmt.finalize();
			resolve({ error: false });
		});
	});
}

export function updateProgress(b: Book): Promise<{ error: boolean }> {
	return new Promise(async (resolve, _) => {
		try {
			const res = await getBookById(b.id);
			const foundBook = res.book;

			if (res.error || foundBook == null) return resolve({ error: true });

			if (b.current_page == 0) foundBook.started_at = Date.now().toString();

			foundBook.current_page = b.current_page;

			if (b.current_page == foundBook.total_pages) foundBook.finished_at = Date.now().toString();

			const stmt = db.prepare(
				`UPDATE Books
				 SET current_page = ?, finished_at = ?, started_at = ?
				 WHERE id = ?`
			);

			stmt.run(
				foundBook.current_page,
				foundBook.finished_at,
				foundBook.started_at,
				foundBook.id,
				(err: Error | null) => {
					if (err) return resolve({ error: true });
					resolve({ error: false });
				}
			);
		} catch (_) {
			resolve({ error: true });
		}
	});
}

export function getBookById(id: number): Promise<{ error: boolean; book: Book | null }> {
	return new Promise((resolve, _) => {
		db.get('SELECT * FROM Books WHERE id = ?', [id], (err, row) => {
			if (err || !row) {
				return resolve({
					error: true,
					book: null
				});
			}

			try {
				const book = BookSchema.parse(row);
				resolve({
					error: false,
					book
				});
			} catch (_) {
				resolve({
					error: true,
					book: null
				});
			}
		});
	});
}

export async function getBooks(): Promise<{ error: boolean; books: Book[] | null }> {
	return new Promise((resolve, _) => {
		db.all('SELECT * FROM Books', [], (err, rows) => {
			if (err) return resolve({ error: true, books: null });

			try {
				const books = rows.map((row) => BookSchema.parse(row));
				resolve({ error: false, books });
			} catch (e) {
				console.log(e);
				resolve({ error: true, books: null });
			}
		});
	});
}
