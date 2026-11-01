import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
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
			})
		}),
		VitePWA({
			registerType: 'autoUpdate',
			outDir: 'build',
			devOptions: {
				enabled: true
			},
			manifest: {
				name: 'Focus Five',
				short_name: 'Focus5',
				description: 'Minimalist 5-Item Goal Board with Pomodoro Timer',
				theme_color: '#0f172a',
				background_color: '#0f172a',
				display: 'standalone',
				icons: [
					{
						src: '/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			}
		})
	]
});
