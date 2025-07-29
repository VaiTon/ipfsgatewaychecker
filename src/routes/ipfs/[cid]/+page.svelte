<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { isLocalhost } from '$lib/utils';
	import GatewayBadge from '$lib/components/GatewayBadge.svelte';

	let { data }: { data: PageData } = $props();

	let { gateways, cid } = $derived(data);

	let statusList = $state<{ url: URL; ok: boolean; delay: number; format: 'path' | 'subdomain' }[]>(
		[]
	);

	let sortedStatusList = $derived(
		statusList.toSorted((a, b) => {
			// Sort by ok
			if (a.ok && !b.ok) {
				return -1;
			} else if (!a.ok && b.ok) {
				return 1;
			}

			if (isLocalhost(a.url) && !isLocalhost(b.url)) {
				return -1;
			} else if (!isLocalhost(a.url) && isLocalhost(b.url)) {
				return 1;
			}

			// Prioritize subdomain format over path format
			if (a.format === 'subdomain' && b.format === 'path') {
				return -1;
			} else if (a.format === 'path' && b.format === 'subdomain') {
				return 1;
			}

			// Then by delay
			return a.delay - b.delay;
		})
	);

	let displayedResponse = $state<Response | undefined>(undefined);

	let workingGateways = $derived(sortedStatusList.filter((s) => s.ok));
	let failedGateways = $derived(sortedStatusList.filter((s) => !s.ok));

	function stripCID(url: string): string {
		// Remove the CID prefix if it exists - CIDs start with Qm (v0) or b (v1 base32)
		// and are typically 46+ characters long
		return url.replace(/^(https?:\/\/)?([Qm][a-zA-Z0-9]{44,}|b[a-z2-7]{58,})\.ipfs\./, '');
	}

	async function cacheOnGateway(url: URL) {
		const startTime = new Date().getTime();

		// Try CORS first with HEAD request (faster and more reliable)
		try {
			const headRes = await fetch(url, {
				method: 'HEAD',
				signal: AbortSignal.timeout(15_000),
				credentials: 'omit',
				mode: 'cors'
			});

			const endTime = new Date().getTime();
			if (headRes.ok) {
				const format = url.hostname.includes('.ipfs.') ? 'subdomain' : 'path';
				statusList = [...statusList, { url, ok: true, delay: endTime - startTime, format }];
				return;
			}
		} catch {
			// CORS failed, continue to fallback methods
		}

		// Fallback: Try GET with CORS
		try {
			const getRes = await fetch(url, {
				signal: AbortSignal.timeout(15_000),
				credentials: 'omit',
				mode: 'cors'
			});

			const endTime = new Date().getTime();
			if (getRes.ok) {
				const format = url.hostname.includes('.ipfs.') ? 'subdomain' : 'path';
				statusList = [...statusList, { url, ok: true, delay: endTime - startTime, format }];
				if (displayedResponse == null) {
					displayedResponse = getRes;
				}
				return;
			}
		} catch {
			// CORS GET also failed
		}

		// Final fallback: no-cors mode (assume success if no network error)
		try {
			await fetch(url, {
				signal: AbortSignal.timeout(15_000),
				credentials: 'omit',
				mode: 'no-cors'
			});

			const endTime = new Date().getTime();
			// If no-cors doesn't throw, assume the gateway is working
			const format = url.hostname.includes('.ipfs.') ? 'subdomain' : 'path';
			statusList = [...statusList, { url, ok: true, delay: endTime - startTime, format }];
		} catch {
			const endTime = new Date().getTime();
			const format = url.hostname.includes('.ipfs.') ? 'subdomain' : 'path';
			statusList = [...statusList, { url, ok: false, delay: endTime - startTime, format }];
		}
	}

	async function cacheCID() {
		displayedResponse = undefined;
		statusList = [];
		await Promise.all(gateways.map((gw) => cacheOnGateway(new URL(gw))));
	}

	onMount(async () => {
		cacheCID();
	});
</script>

<svelte:head>
	<title>IPFS GC | {data.filename ?? cid}</title>
</svelte:head>

<div class="min-h-screen bg-base-300 relative overflow-hidden">
	<!-- Tech Background Pattern -->
	<div class="absolute inset-0 opacity-5">
		<div
			class="absolute inset-0"
			style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0); background-size: 20px 20px;"
		></div>
	</div>

	<div class="relative z-10 container mx-auto px-4 py-8">
		<!-- Header Card -->
		<div class="card bg-base-100 shadow-xl mb-8">
			<div class="card-body">
				<h1 class="card-title text-2xl">Gateway Performance Test</h1>
				<p class="text-base-content/70">Testing {gateways.length} IPFS gateways for your content</p>
			</div>
		</div>

		<!-- Header Section -->
		<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
			<div>
				<div class="flex items-center gap-2 mb-2">
					{#if cid.version === 0}
						<div class="badge badge-outline">CIDv0</div>
					{:else if cid.version === 1}
						<div class="badge badge-outline">CIDv1</div>
					{/if}
					{#if data.filename}
						<div class="badge badge-secondary">{data.filename}</div>
					{/if}
				</div>
				<code class="text-sm bg-base-200 px-3 py-2 rounded font-mono break-all"
					>{cid.toString()}</code
				>
			</div>
			<button class="btn btn-outline" onclick={() => cacheCID()}>
				<span class="icon-[heroicons--arrow-path] w-4 h-4"></span>
				Refresh Test
			</button>
		</div>

		<!-- CID Information Section -->
		<div class="card bg-base-100 shadow-xl border border-base-300 mb-8">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4">
					<span class="icon-[heroicons--information-circle] w-6 h-6 text-info"></span>
					CID Details
				</h2>
				<div class="flex flex-wrap gap-4 text-sm mb-4">
					<div class="flex items-center gap-2">
						<span class="text-base-content/60">Version:</span>
						{#if cid.version === 0}
							<span class="badge badge-warning badge-sm">CIDv0</span>
						{:else if cid.version === 1}
							<span class="badge badge-success badge-sm">CIDv1</span>
						{:else}
							<span class="badge badge-info badge-sm">v{cid.version}</span>
						{/if}
					</div>
					<div class="flex items-center gap-2">
						<span class="text-base-content/60">Codec:</span>
						<span class="font-mono text-primary">{cid.code}</span>
						<span class="text-xs text-base-content/50">
							({#if cid.code === 0x55}Raw{:else if cid.code === 0x70}DAG-PB{:else if cid.code === 0x71}DAG-CBOR{:else if cid.code === 0x129}DAG-JSON{:else}Other{/if})
						</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-base-content/60">Hash:</span>
						<span class="font-mono text-secondary">{cid.multihash.code}</span>
						<span class="text-xs text-base-content/50">
							({#if cid.multihash.code === 0x12}SHA-256{:else if cid.multihash.code === 0x13}SHA-512{:else if cid.multihash.code === 0x1b}BLAKE2b-256{:else}Hash-{cid
									.multihash.code}{/if})
						</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-base-content/60">Size:</span>
						<span class="font-mono text-accent">{cid.multihash.size}</span>
						<span class="text-xs text-base-content/50">bytes</span>
					</div>
				</div>
				<div class="space-y-4">
					<div>
						<div class="text-sm opacity-70 mb-2">Alternative Formats:</div>
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<div>
								<div class="text-xs opacity-60 mb-1">CIDv0 (Base58):</div>
								<div class="bg-base-300 p-3 rounded-lg font-mono text-sm break-all select-all">
									{#if cid.version === 0}
										{cid.toString()}
									{:else}
										{cid.toV0().toString()}
									{/if}
								</div>
							</div>
							<div>
								<div class="text-xs opacity-60 mb-1">CIDv1 (Base32):</div>
								<div class="bg-base-300 p-3 rounded-lg font-mono text-sm break-all select-all">
									{#if cid.version === 1}
										{cid.toString()}
									{:else}
										{cid.toV1().toString()}
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Progress and Stats -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
			<div class="lg:col-span-2">
				<div class="card bg-base-100 shadow-xl border border-base-300">
					<div class="card-body">
						<h2 class="card-title text-xl mb-4">
							<span class="icon-[heroicons--chart-bar] w-6 h-6 text-primary"></span>
							Test Progress
						</h2>
						{#if sortedStatusList.length !== gateways.length}
							<div class="space-y-4">
								<progress
									class="progress progress-primary w-full h-3"
									max={gateways.length}
									value={sortedStatusList.length}
								></progress>
								<div class="flex justify-between text-sm opacity-70">
									<span class="flex items-center gap-2">
										<span class="loading loading-spinner loading-sm"></span>
										Testing gateways...
									</span>
									<span>{sortedStatusList.length} / {gateways.length}</span>
								</div>
							</div>
						{:else}
							<div class="alert alert-success">
								<span class="icon-[heroicons--check-circle] w-6 h-6"></span>
								<div>
									<h3 class="font-bold text-lg">Testing Complete!</h3>
									<div class="text-sm">Successfully tested all {gateways.length} gateways</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<div class="stats stats-vertical shadow-xl bg-base-100 border border-base-300">
				<div class="stat">
					<div class="stat-figure text-success">
						<span class="icon-[heroicons--check-circle] w-8 h-8"></span>
					</div>
					<div class="stat-title">Working</div>
					<div class="stat-value text-success">{workingGateways.length}</div>
					<div class="stat-desc">Ready to serve</div>
				</div>
				<div class="stat">
					<div class="stat-figure text-error">
						<span class="icon-[heroicons--x-circle] w-8 h-8"></span>
					</div>
					<div class="stat-title">Failed</div>
					<div class="stat-value text-error">{failedGateways.length}</div>
					<div class="stat-desc">Not responding</div>
				</div>
			</div>
		</div>

		<!-- Results Table -->
		<div class="card bg-base-100 shadow-xl border border-base-300">
			<div class="card-body p-0">
				<div class="bg-base-200/50 px-6 py-4 border-b border-base-300">
					<h2 class="text-xl font-bold flex items-center gap-2">
						<span class="icon-[heroicons--server] w-6 h-6 text-primary"></span>
						Gateway Results
					</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr class="bg-base-200/80">
								<th class="font-bold">Gateway</th>
								<th class="font-bold">Status</th>
								<th class="font-bold">Response Time</th>
								<th class="font-bold">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each sortedStatusList as { url: resUrl, ok, delay, format } (resUrl.href)}
								{@const url = new URL(resUrl)}
								<tr class="hover:bg-base-200/30">
									<td class="py-4">
										<div class="flex items-center gap-3">
											<div class="indicator">
												<div
													class="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center border-2 border-base-400"
												>
													{#if ok}
														<span class="icon-[heroicons--globe-alt] w-5 h-5 text-success"></span>
													{:else}
														<span class="icon-[heroicons--exclamation-triangle] w-5 h-5 text-error"
														></span>
													{/if}
												</div>
												{#if ok && delay < 1000}
													<span class="indicator-item indicator-top indicator-end">
														<div
															class="w-3 h-3 bg-success rounded-full border-2 border-base-100"
														></div>
													</span>
												{/if}
											</div>
											<div>
												<div class="font-bold text-base flex items-center gap-2" title={url.host}>
													{stripCID(url.hostname)}
													<div
														class="badge badge-xs {format === 'subdomain'
															? 'badge-success'
															: 'badge-warning'}"
													>
														{format === 'subdomain' ? '✓ SUB' : 'PATH'}
													</div>
												</div>
												<div class="text-sm opacity-60">
													{#if format === 'path'}
														{url.protocol}//{url.host}{url.pathname}
													{:else}
														{url.protocol}//{url.host}
													{/if}
												</div>
											</div>
										</div>
									</td>
									<td class="py-4">
										<GatewayBadge {ok} {url} />
									</td>
									<td class="py-4">
										{#if ok}
											<div class="flex items-center gap-3">
												<span class="font-mono text-lg font-bold">{delay}ms</span>
												{#if delay < 1000}
													<div class="badge badge-success gap-1">
														<span class="icon-[heroicons--bolt] w-3 h-3"></span>
														Fast
													</div>
												{:else if delay < 3000}
													<div class="badge badge-warning gap-1">
														<span class="icon-[heroicons--clock] w-3 h-3"></span>
														Slow
													</div>
												{:else}
													<div class="badge badge-error gap-1">
														<span class="icon-[heroicons--exclamation-triangle] w-3 h-3"></span>
														Very Slow
													</div>
												{/if}
											</div>
										{:else}
											<span class="text-lg opacity-50 font-mono">—</span>
										{/if}
									</td>
									<td class="py-4">
										<a
											class="btn btn-primary btn-sm gap-2"
											href={resUrl.toString()}
											target="_blank"
											rel="noopener noreferrer"
											title="Open contentin {url.host}"
											aria-label="Open gateway {url.host} in new tab"
										>
											<span class="icon-[heroicons--arrow-top-right-on-square] w-4 h-4"></span>
											<span class="hidden sm:inline">Open</span>
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
</style>
