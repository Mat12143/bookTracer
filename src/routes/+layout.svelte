<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import favicon from '$lib/assets/favicon.png';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>BookTracer - Simple book tracking</title>
</svelte:head>

<ModeWatcher />
<Toaster position="top-center" richColors />

<div class="flex h-screen w-full flex-col">
	<div class="flex h-full w-full items-start justify-center p-3">
		{@render children()}
	</div>
</div>
