<script lang="ts">
	import '../global.scss';
</script>

<nav class="navbar is-spaced">
	<div class="navbar-brand">
		<div class="navbar-item">
			<a class="title" href="/">IPFS Gateway Cacher</a>
		</div>
	</div>
</nav>
<main class="container">
	<div class="columns is-centered">
		<div class="column is-half">
			<slot />
		</div>
	</div>
</main>

<style>
	nav {
		justify-content: center;
	}
</style>
