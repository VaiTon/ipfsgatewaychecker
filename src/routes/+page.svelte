<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let input: HTMLInputElement;

	function cacheCID() {
		goto(`/ipfs/${input.value}`);
	}
</script>

<main>
	<div class="container">
		<div class="block">
			<div class="field">
				<label class="label" for="hash">IPFS CID</label>
				<div class="field has-addons">
					<div class="control is-expanded">
						<input class="input" id="hash" type="text" bind:this={input} />
					</div>
					<div class="control">
						<button class="button is-primary" on:click={cacheCID}>Cache</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	input {
		font-family: monospace;
	}
</style>
