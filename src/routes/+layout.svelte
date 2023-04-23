<script lang="ts">
	import '../app.css';

	const GITHUB_URL = 'https://github.com/VaiTon/ipfsgatewaychecker';
</script>

<div class="flex flex-col min-h-screen">
	<nav class="navbar max-w-xl mx-auto">
		<div class="navbar-start" />
		<div class="navbar-center mx-auto">
			<a class="btn btn-ghost normal-case text-xl font-bold" href="/">IPFS Gateway Checker</a>
		</div>
		<div class="navbar-end">
			<a class="btn btn-ghost" href={GITHUB_URL}>
				<span class="icon-[fa6-brands--github] w-6 h-6" />
			</a>
		</div>
	</nav>

	<main class="grow w-full mx-auto">
		<slot />
	</main>

	<footer class="footer bg-neutral text-neutral-content p-6 mt-10 justify-center">
		<div>
			<p class="text-md font-light tracking-wide">
				<span>Built with</span>
				<a href="https://svelte.dev">
					<span class="icon-[skill-icons--svelte] align-sub text-lg" />
				</a>
				<span>and</span>
				<a href="https://ipfs.io">
					<span class="icon-[skill-icons--ipfs-dark] align-sub text-lg" />
				</a>
			</p>
		</div>
	</footer>
</div>

<style>
</style>
