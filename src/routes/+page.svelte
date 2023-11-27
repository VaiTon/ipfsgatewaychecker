<script lang="ts">
	import { goto } from '$app/navigation';
	import { CID } from 'multiformats';

	let inputVal: string;

	function cacheCID() {
		let cid: CID | null = null;
		let filename: string | null = null;

		if (inputVal.startsWith('ipfs://')) {
			cid = CID.parse(inputVal.slice(7));
		}
		if (cid == null && inputVal.startsWith('ipfs/')) {
			cid = CID.parse(inputVal.slice(5));
		}

		if (cid == null) {
			// HTTP URL
			try {
				const url = new URL(inputVal);
				const path = url.pathname;
				if (path.startsWith('/ipfs/')) {
					cid = CID.parse(path.slice(6));
					filename = url.searchParams.get('filename');
				}
			} catch (_) {
				// Ignore
			}
		}

		if (cid == null) {
			// CID
			try {
				cid = CID.parse(inputVal);
			} catch (_) {
				// Ignore
			}
		}

		if (cid == null) {
			alert('Invalid CID or URL');
			return;
		}

		let path = `/ipfs/${cid}`;
		if (filename != null) {
			path += `?filename=${filename}`;
		}

		goto(path);
	}
</script>

<main>
	<div class="mx-auto max-w-xl">
		<div class="form-control">
			<label class="label" for="hash"> <span class="label-text">IPFS CID or URL</span></label>

			<div class="input-group join">
				<input
					class="input w-full input-bordered font-mono join-item"
					id="hash"
					type="text"
					bind:value={inputVal}
					on:keydown={(e) => {
						if (e.key === 'Enter') {
							cacheCID();
						}
					}}
				/>
				<button
					class="btn btn-primary join-item"
					on:click={cacheCID}
					disabled={inputVal == null || inputVal == ''}
				>
					Cache
				</button>
			</div>
		</div>
	</div>
</main>

<style>
</style>
