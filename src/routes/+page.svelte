<script lang="ts">
	import { goto } from '$app/navigation';

	let value: string;

	function cacheCID() {
		goto(`/ipfs/${value}`);
	}
</script>

<main>
	<div class="columns is-centered">
		<div class="column is-half">
			<div class="field">
				<label class="label" for="hash">IPFS CID</label>
				<div class="field has-addons">
					<div class="control is-expanded">
						<input class="input" id="hash" type="text" bind:value />
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
