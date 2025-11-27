<script lang="ts">
	import * as Card from '$lib/components/ui/card/index';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import type { Book } from '$lib/db';
	import { Minus, Plus } from '@lucide/svelte';
	import { Button } from './ui/button';
	import * as Dialog from './ui/dialog/index';
	import { Label } from './ui/label';
	import { Input } from './ui/input';

	let { book }: { book: Book } = $props();

	let current_page = $state(book.current_page || 0);

	let progress = $derived(Math.round((current_page / book.total_pages) * 100));
	let progressColor = $derived(
		progress < 30
			? 'text-red-400 bg-red-500/20'
			: progress < 70
				? 'text-yellow-400 bg-yellow-500/20'
				: 'text-green-400 bg-green-500/20'
	);

	let open = $state(false);
</script>

<Card.Root
	class="relative z-0 h-48 cursor-pointer justify-center hover:scale-[1.02] hover:bg-background/80 lg:w-full"
	onclick={() => (open = true)}
>
	<Card.Content class="p-5">
		<div class="flex gap-4">
			<div class="h-32 overflow-hidden rounded-md">
				<img src={book.cover_url} alt="Cover" class="h-full w-full object-cover" />
			</div>
			<div class="min-w-0 flex-1">
				<div class="mb-3 flex items-start justify-between">
					<div class="min-w-0">
						<h3 class="truncate text-xl font-bold">{book.title}</h3>
						<p class="truncate text-sm text-muted-foreground">{book.author}</p>
					</div>
					<span class={`ml-2 rounded-lg px-2 py-1 text-sm font-bold ${progressColor}`}
						>{progress}%
					</span>
				</div>
				<Progress value={book.current_page} class="mb-2 h-2" max={book.total_pages} />
				<p class="text-sm text-muted-foreground">
					{book.current_page || 0} of {book.total_pages} pages
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>

<Dialog.Root bind:open>
	<Dialog.Trigger></Dialog.Trigger>

	<Dialog.Content class="bg-background/95 backdrop-blur-xl sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Update Current Page</Dialog.Title>
		</Dialog.Header>

		<form action="?/updateProgress" method="POST" class="h-full w-full">
			<div class="space-y-6 py-4">
				<!-- Book Info -->
				<div class="flex gap-3 border-b pb-4">
					<div class="h-16 w-12 overflow-hidden rounded-lg shadow-md ring-2 ring-border">
						<img src={book.cover_url} alt={book.title} class="h-full w-full object-cover" />
					</div>
					<div class="min-w-0 flex-1">
						<h4 class="truncate text-sm font-semibold">{book?.title}</h4>
						<p class="truncate text-xs text-muted-foreground">{book?.author}</p>
					</div>
				</div>

				<div class="space-y-3">
					<Label for="current-page">Current Page</Label>
					<div class="flex items-center gap-3">
						<Button
							variant="outline"
							size="icon"
							onclick={() => (current_page = Math.max(0, current_page - 10))}
							disabled={current_page <= 0 || book.current_page == book.total_pages}
						>
							<Minus class="h-4 w-4" />
						</Button>

						<div class="flex-1">
							<Input
								id="current_page"
								name="current_page"
								type="number"
								bind:value={current_page}
								min="0"
								max={book.total_pages}
								class="h-14 text-center text-2xl font-bold"
								disabled={book.current_page == book.total_pages}
							/>
							<Input id="id" name="id" type="number" bind:value={book.id} class="hidden" />
						</div>

						<Button
							variant="outline"
							size="icon"
							onclick={() => (current_page = Math.min(book.total_pages, current_page + 10))}
							disabled={current_page >= book.total_pages || book.current_page == book.total_pages}
						>
							<Plus class="h-4 w-4" />
						</Button>
					</div>
					<p class="text-center text-sm text-muted-foreground">
						of {book.total_pages} total pages
					</p>
					{#if book.finished_at}
						<div
							class="my-3 flex h-14 w-full flex-col items-center justify-center rounded-md border-2 border-green-700/20 bg-green-500/20 text-green-400"
						>
							<p class="font-medium">
								🎉 Finished on {new Date(parseInt(book.finished_at)).toDateString()}
							</p>
						</div>
					{/if}
				</div>
			</div>

			<Dialog.Footer class="flex gap-2">
				{#if book.finished_at == null}
					<Button variant="outline" onclick={() => (open = false)} class="flex-1">Dismiss</Button>
					<Button
						class="flex-1 from-purple-500 via-pink-500 to-orange-500 hover:opacity-90"
						type="submit"
					>
						Save
					</Button>
				{:else}
					<Button onclick={() => (open = false)} class="flex-1">Close</Button>
				{/if}
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
