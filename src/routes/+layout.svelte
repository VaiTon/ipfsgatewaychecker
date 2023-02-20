<script lang="ts">
	import '../global.scss';
</script>

<nav class="navbar is-spaced">
	<div class="navbar-brand">
		<div class="navbar-item">
			<a class="title" href="/">IPFS Gateway Checker</a>
		</div>
	</div>
</nav>
<main class="container ">
	<slot />
</main>

<style>
	nav {
		justify-content: center;
	}
</style>
