<script lang="ts">
	import '../app.css';
</script>

<nav class="navbar max-w-xl mx-auto">
	<div class="navbar-center mx-auto">
		<a class="text-xl font-bold" href="/">IPFS Gateway Checker</a>
	</div>
</nav>

<main class="container">
	<slot />
</main>

<style>
	body {
		background-color: #f5f5f5;
	}
</style>
