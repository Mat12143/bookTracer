import { addBook, getBookById, getBooks, updateProgress, type Book } from '$lib/db';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const resp = await getBooks();
	return {
		error: resp.error,
		books: resp.books
	};
};

export const actions: Actions = {
	updateProgress: async ({ request }) => {
		const form = await request.formData();

		const current_pageString = form.get('current_page');
		const idString = form.get('id');

		if (current_pageString == null || idString == null) {
			return {
				error: true,
				reason: 'Missing fields'
			};
		}

		const current_page = parseInt(current_pageString.toString());
		const id = parseInt(idString.toString());

		const res = await getBookById(id);

		if (res.error || res.book == null) {
			return {
				error: true,
				reason: 'Database error'
			};
		}

		if (current_page < 0 || current_page > res.book.total_pages) {
			return {
				error: true,
				reason: 'Invalid current_page'
			};
		}

		res.book.current_page = current_page;
		if (res.book.current_page == res.book.total_pages) res.book.finished_at = Date.now().toString();

		const err = await updateProgress(res.book);

		if (err.error) {
			return {
				error: true,
				reason: 'Error while updating book'
			};
		}

		return {
			error: false
		};
	},
	addBook: async ({ request }) => {
		const data = await request.formData();

		// Get required fields
		const isbn = data.get('isbn')?.toString();
		const title = data.get('title')?.toString();
		const author = data.get('author')?.toString();
		const total_pages = data.get('total_pages')?.toString();
		const cover_url = data.get('cover_url')?.toString();

		// Validate required fields
		if (!isbn?.trim()) {
			return fail(400, { error: true, message: 'ISBN is required' });
		}

		if (!title?.trim()) {
			return fail(400, { error: true, message: 'Title is required' });
		}

		if (!author?.trim()) {
			return fail(400, { error: true, message: 'Author is required' });
		}

		if (!total_pages || isNaN(parseInt(total_pages)) || parseInt(total_pages) <= 0) {
			return fail(400, { error: true, message: 'Valid total pages is required' });
		}

		// Create book object
		const book: Book = {
			isbn: isbn.trim(),
			title: title.trim(),
			author: author.trim(),
			total_pages: parseInt(total_pages),
			cover_url: cover_url?.trim() || '',
			id: 0,
			current_page: 0,
			started_at: '',
			finished_at: ''
		};

		// Add to database
		const res = await addBook(book);

		if (res.error) {
			const message =
				res.reason === 'duplicate_isbn'
					? 'Book with this ISBN already exists'
					: 'Database error occurred';
			return fail(res.reason === 'duplicate_isbn' ? 409 : 500, { error: true, message });
		}

		return { success: true };
	}
};
