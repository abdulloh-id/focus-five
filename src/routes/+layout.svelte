<script>
		import './layout.css';
		import { onMount } from 'svelte';

		/** @type {{children: import('svelte').Snippet}} */
		let { children } = $props();

		onMount(async () => {
			if ('serviceWorker' in navigator) {
				try {
					const registration = await navigator.serviceWorker.register('/sw.js');
					console.log('ServiceWorker registration successful with scope: ', registration.scope);
				} catch (error) {
					console.log('ServiceWorker registration failed: ', error);
				}
			}
		});
</script>

<svelte:head>
		<link rel="icon" href="/favicon.ico" />
		<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>

{@render children()}
