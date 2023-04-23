<script lang="ts">
	import { goto } from '$app/navigation';

	let value: string;

	function cacheCID() {
		goto(`/ipfs/${value}`);
	}
</script>

<main>
	<div class="mx-auto max-w-xl">
		<div class="form-control">
			<label class="label" for="hash"> <span class="label-text">IPFS CID</span></label>

			<div class="input-group">
				<input
					class="input w-full input-bordered font-mono"
					id="hash"
					type="text"
					bind:value
					on:keydown={(e) => {
						if (e.key === 'Enter') {
							cacheCID();
						}
					}}
				/>
				<button class="btn btn-primary" on:click={cacheCID} disabled={value == null || value == ''}>
					Cache
				</button>
			</div>
		</div>
	</div>
</main>

<style>
</style>
