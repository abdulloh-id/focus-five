import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: 'index.html',
				precompress: false,
				strict: true
			}),
			prerender: {
				handleHttpError: ({ path, message }) => {
					if (path === '/manifest.webmanifest') {
						return;
					}
					throw new Error(message);
				}
			}
		})
	]
});
