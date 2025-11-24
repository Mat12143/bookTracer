<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Book, Plus, X } from '@lucide/svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import BookView from '$lib/components/BookView.svelte';
	import { toast } from 'svelte-sonner';
	import type { SubmitFunction } from '@sveltejs/kit';
	import * as Card from '$lib/components/ui/card/index';
	import { enhance } from '$app/forms';
	import BarcodeScanner from '$lib/components/BarcodeScanner.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let { data } = $props();

	type View = 'books' | 'add' | 'edit' | 'scan';

	let status = $state<View>('books');

	const handleResponse: SubmitFunction = (_) => {
		return async ({ result, update }) => {
			if (result.type == 'failure') {
				// @ts-ignore
				toast.error(result.data);
			} else {
				await update();
				toast.success('Book added');
				status = 'books';
			}
		};
	};

	let book = $state({
		title: '',
		author: '',
		total_pages: 0,
		cover_url: '',
		isbn: ''
	});
</script>

<div class="flex w-full flex-col md:w-md">
	<div class="sticky top-0 z-20 w-full bg-background/90 py-6">
		<div class="mx-auto flex max-w-2xl items-center justify-between">
			<!-- svelte-ignore a11y_interactive_supports_focus -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				role="button"
				class="flex cursor-pointer items-center gap-3"
				onclick={() => {
					status = 'books';
				}}
			>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl from-purple-500 via-pink-500 to-orange-500 shadow-lg"
				>
					<Book class="h-8 w-8 rounded-md" />
				</div>
				<div>
					<h1 class="text-2xl font-bold">{status == 'books' ? 'My Books' : 'Add New Book'}</h1>
				</div>
			</div>
			<Button
				class="hover:scale-[1.02]"
				onclick={() => {
					if (status == 'books') status = 'add';
					else status = 'books';
				}}
			>
				{#if status == 'books'}
					<Plus class="h-4 w-4" /> Add
				{:else}
					<X class="h-4 w-4" /> Close
				{/if}
			</Button>
		</div>
	</div>

	<Separator class="mb-5" />
	{#if status == 'books'}
		<div class="flex flex-col gap-5">
			{#if data.books}
				{#each data.books as b}
					<BookView book={b} />
				{/each}
			{:else}
				<p>Error while loading books</p>
			{/if}
		</div>
	{:else if status == 'add'}
		<div class="flex w-full flex-col gap-6 lg:w-md">
			<Card.Root class="">
				<Card.Header>
					<Card.Title>Book Information</Card.Title>
				</Card.Header>
				<form
					method="POST"
					action="?/addBook"
					use:enhance={handleResponse}
					class="h-full w-full gap-4"
				>
					<Card.Content class="flex flex-col gap-6">
						<div class="flex flex-col gap-2">
							<Label for="title">Title</Label>
							<Input type="text" name="title" bind:value={book.title} />
						</div>

						<div class="flex flex-col gap-2">
							<Label for="author">Author</Label>
							<Input type="text" name="author" bind:value={book.author} />
						</div>

						<div class="flex flex-col gap-2">
							<Label for="isbn">ISBN</Label>
							<Input type="text" name="isbn" bind:value={book.isbn} />
						</div>

						<div class="flex flex-col gap-2">
							<Label for="total_pages">Total Pages</Label>
							<Input type="number" name="total_pages" bind:value={book.total_pages} min="1" />
						</div>

						<div class="flex flex-col gap-2">
							<Label for="cover_url">Cover URL</Label>
							<Input type="url" name="cover_url" bind:value={book.cover_url} />
						</div>
					</Card.Content>
					<Card.Footer class="mt-6 flex flex-row gap-4">
						<Button type="submit">Add Book</Button>
						<Button type="button" variant="outline" onclick={() => (status = 'scan')}
							>Scan Book</Button
						>
					</Card.Footer>
				</form>
			</Card.Root>
		</div>
	{:else if status == 'scan'}
		<BarcodeScanner bind:status bind:book />
	{/if}
</div>
