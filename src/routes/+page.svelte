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
			} catch {
				// Ignore
			}
		}

		if (cid == null) {
			// CID
			try {
				cid = CID.parse(inputVal);
			} catch {
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

<div class="min-h-screen bg-base-300 relative overflow-hidden">
	<!-- Tech Background Pattern -->
	<div class="absolute inset-0 opacity-5">
		<div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0); background-size: 20px 20px;"></div>
	</div>
	
	<div class="relative z-10 container mx-auto px-4 py-16">
		<div class="max-w-4xl mx-auto">
			<!-- Terminal Header -->
			<div class="mockup-code bg-base-100 shadow-2xl mb-8">
				<pre data-prefix="$"><code class="text-success">ipfs gateway-checker --version</code></pre>
				<pre data-prefix=">" class="text-warning"><code>IPFS Gateway Performance Analyzer v2.1.0</code></pre>
				<pre data-prefix=">" class="text-info"><code>Testing framework for distributed storage gateways</code></pre>
			</div>

			<div class="text-center mb-12">
				<h1 class="text-4xl lg:text-6xl font-bold mb-6 text-base-content">
					<span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
						IPFS Gateway Checker
					</span>
				</h1>
				<p class="text-lg text-base-content/80 leading-relaxed max-w-3xl mx-auto">
					Test and compare the performance of different IPFS gateways.<br>
					See which gateways serve your content fastest.
				</p>
			</div>

			<!-- CLI-Style Input -->
			<div class="mockup-code bg-base-100 shadow-2xl border border-base-300">
				<div class="px-6 py-4">
					<div class="flex items-center gap-2 mb-4">
						<span class="w-3 h-3 bg-error rounded-full"></span>
						<span class="w-3 h-3 bg-warning rounded-full"></span>
						<span class="w-3 h-3 bg-success rounded-full"></span>
						<span class="font-mono text-sm text-base-content/60 ml-2">gateway-checker.sh</span>
					</div>
					
					<div class="form-control">
						<div class="flex items-center gap-2 mb-2">
							<span class="text-sm text-base-content/70">Enter IPFS Content Identifier or URL</span>
						</div>
						<div class="join w-full">
							<span class="bg-base-200 px-4 py-3 font-mono text-success border border-r-0 border-base-300 rounded-l-lg">
								&gt;_
							</span>
							<input
								class="input input-lg w-full font-mono bg-base-200 border border-base-300 focus:border-primary join-item"
								id="hash"
								type="text"
								placeholder="QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG..."
								bind:value={inputVal}
								on:keydown={(e) => {
									if (e.key === 'Enter') {
										cacheCID();
									}
								}}
							/>
							<button
								class="btn btn-primary btn-lg join-item"
								on:click={cacheCID}
								disabled={inputVal == null || inputVal == ''}
							>
								<span class="icon-[heroicons--rocket-launch] w-5 h-5 mr-2"></span>
								Test Gateways
							</button>
						</div>
						<div class="mt-2">
							<span class="text-xs text-base-content/60">
								Supports CIDv0, CIDv1, and gateway URLs
							</span>
						</div>
					</div>
				</div>
			</div>



		</div>
	</div>
</div>

<style>
</style>
