<script lang="ts">
	import '../app.css';

	const GITHUB_URL = 'https://github.com/VaiTon/ipfsgatewaychecker';
</script>

<div class="min-h-screen bg-base-300">
	<!-- Navigation -->
	<div class="navbar bg-base-100 border-b border-base-300 shadow-sm">
		<div class="navbar-start">
		</div>
		<div class="navbar-center">
			<a class="btn btn-ghost text-xl font-bold" href="/">
				<span class="icon-[heroicons--cube] w-6 h-6 mr-2 text-primary"></span>
				IPFS Gateway Checker
			</a>
		</div>
		<div class="navbar-end">
			<a class="btn btn-ghost" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
				<span class="icon-[fa6-brands--github] w-5 h-5"></span>
				<span class="hidden sm:inline ml-2">GitHub</span>
			</a>
		</div>
	</div>

	<!-- Main Content -->
	<main class="min-h-screen">
		<slot />
	</main>

	<!-- Footer -->
	<footer class="footer footer-center bg-base-200 border-t border-base-300 text-base-content p-8">
		<aside>
			<div class="flex items-center gap-4 text-sm">
				<span>Built with</span>
				<a href="https://svelte.dev" class="link link-hover">
					<span class="icon-[skill-icons--svelte] text-lg"></span>
					<span class="hidden sm:inline ml-1">Svelte</span>
				</a>
				<span>and</span>
				<a href="https://ipfs.io" class="link link-hover">
					<span class="icon-[skill-icons--ipfs-dark] text-lg"></span>
					<span class="hidden sm:inline ml-1">IPFS</span>
				</a>
			</div>
			<p class="text-xs opacity-50 mt-2">Open source tool for testing IPFS gateway performance</p>
		</aside>
	</footer>
</div>

<style>
</style>
