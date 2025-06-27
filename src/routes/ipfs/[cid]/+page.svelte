<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { isLocalhost } from '$lib/utils';
	import GatewayBadge from '$lib/components/GatewayBadge.svelte';

	let { data }: { data: PageData } = $props();

	let { gateways, recommendedGateways: recommended, cid } = $derived(data);

	let statusList = $state<{ url: URL; ok: boolean; delay: number }[]>([]);

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

			// Sort recommended gateways first
			const hostB = new URL(b.url).host;
			const hostA = new URL(a.url).host;
			const includesA = recommended.includes(hostA);
			const includesB = recommended.includes(hostB);

			if (includesA && !includesB) {
				return -1;
			} else if (!includesA && includesB) {
				return 1;
			}

			// Then by delay
			return a.delay - b.delay;
		})
	);

	let displayedResponse = $state<Response | undefined>(undefined);

	function stripCID(url: string): string {
		// Remove the CID prefix if it exists
		return url.replace(/^(https?:\/\/)?([a-z0-9]+\.)?ipfs\./, '');
	}

	async function cacheOnGateway(url: URL) {
		const startTime = new Date().getTime();

		try {
			const res = await fetch(url, {
				signal: AbortSignal.timeout(30_000),
				credentials: 'omit',
				mode: 'no-cors'
			});

			const endTime = new Date().getTime();
			if (res.ok) {
				statusList = [...statusList, { url, ok: true, delay: endTime - startTime }];
				if (displayedResponse == null) {
					displayedResponse = res;
				}
			} else if (!url.hostname.includes('.ipfs.')) {
				// try with the CID.ipfs.gateway form
				url.hostname = `${cid}.ipfs.${url.hostname}`;
				url.pathname = '/';

				cacheOnGateway(url);
			} else {
				statusList = [...statusList, { url, ok: false, delay: endTime - startTime }];
			}
		} catch (e) {
			statusList = [...statusList, { url, ok: false, delay: 0 }];
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

<div class="gap-4 justify-stretch mx-10 mb-10">
	<p class="text-2xl font-bold">Gateways</p>

	<p class="text-md sm:text-sm text-ellipsis overflow-hidden">
		{#if cid.version === 0}
			<strong>CIDv0: </strong>
		{:else if cid.version === 1}
			<strong>CIDv1: </strong>
		{/if}<code>{cid}</code>
	</p>

	<div class="my-3">
		{#if sortedStatusList.length !== gateways.length}
			<progress
				class="progress progress-success"
				max={gateways.length}
				value={sortedStatusList.length}
			></progress>
			<span class="ml-2">{sortedStatusList.length} / {gateways.length}</span>
		{:else}
			<div class="alert">
				<div>
					<div>
						<p class="font-bold">Tested all {gateways.length} gateways!</p>
						<p class="text-sm">Refresh if every gateway failed.</p>
					</div>
				</div>
				<div class="flex-none">
					<button class="btn btn-primary btn-sm" onclick={() => cacheCID()}> Refresh </button>
				</div>
			</div>
		{/if}
	</div>

	<div class="overflow-x-hidden">
		<table class="table table-zebra w-full">
			<thead>
				<tr>
					<th>Gateway</th>
					<th>Status</th>
					<th>Delay</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each sortedStatusList as { url: resUrl, ok, delay }}
					{@const url = new URL(resUrl)}

					<tr class:success={ok}>
						<td title={url.host} class="text-ellipsis overflow-hidden max-w-60">
							{stripCID(url.hostname)}
						</td>
						<td>
							<GatewayBadge {ok} {url} recommendedHosts={recommended} />
						</td>
						<td>
							{#if ok}
								{delay} ms
							{/if}
						</td>
						<td>
							<a
								class="btn btn-outline"
								href={resUrl.toString()}
								target="_blank"
								rel="noopener noreferrer"
								title="Link to {url.host}"
							>
								🔗
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style lang="scss">
</style>
