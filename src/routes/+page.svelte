<script lang="ts">
	import { goto } from '$app/navigation';
	import { CID } from 'multiformats';

	let value: string;

	function cacheCID() {
		let cid: CID | null = null;
		let filename: string | null = null;

		if (value.startsWith('ipfs://')) {
			cid = CID.parse(value.slice(7));
		}
		if (cid == null && value.startsWith('ipfs/')) {
			cid = CID.parse(value.slice(5));
		}

		if (cid == null) {
			// HTTP URL
			try {
				const url = new URL(value);
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
				cid = CID.parse(value);
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
