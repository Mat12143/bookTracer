<script>
	import { Button } from './ui/button';

	let { Icon, url, path } = $props();
</script>

<a href={path}>
	<Button variant={url == path ? 'default' : 'outline'}>
		<Icon class={url == path ? `text-background` : `text-muted-foreground`} />
	</Button>
</a>
