<script lang="ts">
	import Quagga from '@ericblade/quagga2';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Button from './ui/button/button.svelte';

	let { status = $bindable(), book = $bindable() } = $props();

	let cameraEl = $state<HTMLDivElement>();

	function getBookInfo(foundIsbn: string) {
		return new Promise(async (resolve, reject) => {
			const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${foundIsbn}`);
			const data = await res.json();

			if (data?.totalItems == 0) {
				reject();
			}

			if (!data?.items) reject();

			const resData = await fetch(data['items'][0]['selfLink']);
			const realData = await resData.json();

			const result = realData['volumeInfo'];

			book.title = result['title'];
			book.author = result['authors'].join(', ');
			book.isbn = foundIsbn;
			book.total_pages = result['pageCount'];
			book.cover_url = result['imageLinks']['thumbnail'];

			resolve('OK');
		});
	}

	onMount(() => {
		Quagga.init(
			{
				inputStream: {
					type: 'LiveStream',
					target: cameraEl
				},
				decoder: {
					readers: ['ean_reader'],
					debug: {
						drawScanline: true,
						drawBoundingBox: true
					}
				},
				locate: true,
				numOfWorkers: navigator.hardwareConcurrency || 4
			},
			(err) => {
				if (err) {
					console.error(err);
					return;
				}
				Quagga.start();
			}
		);
	});
	const onDetected = async (res: any) => {
		const code = res.codeResult.code;
		if (/^\d{13}$/.test(code) == true) {
			Quagga.stop();
			Quagga.offDetected(onDetected);

			toast.promise(getBookInfo(code), {
				loading: 'Valid ISBN detected. Fetching book data',
				success: (_) => {
					status = 'add';
					return 'Book found in the Google Database';
				},
				error: (_) => {
					status = 'add';
					return `Book not found in the Google APIs (ISBN: ${code})`;
				}
			});
		} else {
			toast.warning('Invalid ISBN read. Retrying...');
		}
	};
	Quagga.onDetected(onDetected);

	onDestroy(() => {
		Quagga.stop();
	});
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center gap-4 p-5">
	<h1 class="text-2xl font-semibold">ISBN Scanner</h1>

	<div class="relative mx-auto w-full max-w-sm">
		<div
			bind:this={cameraEl}
			class="h-64 w-full overflow-hidden rounded-lg bg-gray-200 shadow-lg [&>video]:h-full [&>video]:w-full [&>video]:object-cover"
		></div>

		<div
			class="pointer-events-none absolute inset-0 rounded-lg border-2 border-dashed border-accent-foreground"
		></div>
	</div>

	<Button onclick={() => (status = 'add')} class="z-10">Cancel</Button>
</div>
