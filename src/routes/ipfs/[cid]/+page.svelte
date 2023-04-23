<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { ellipse, isLocalhost } from '$lib/utils';
	import GatewayBadge from '$lib/components/GatewayBadge.svelte';
	import ContentDisplay from '$lib/components/ContentDisplay.svelte';

	export let data: PageData;

	let gateways = data.gateways;
	let recommended = data.recommendedGateways;
	let cid = data.cid;

	let statusList: { url: URL; ok: boolean; delay: number }[] = [];
	$: sortedStatusList = statusList.sort((a, b) => {
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
	});

	let displayedResponse: Response | undefined = undefined;

	async function cacheOnGateway(url: URL) {
		const startTime = new Date().getTime();

		try {
			const res = await fetch(url, {
				signal: AbortSignal.timeout(10000) // 10s
			});
			const endTime = new Date().getTime();
			if (res.ok) {
				statusList = [...statusList, { url, ok: true, delay: endTime - startTime }];
				if (!displayedResponse) {
					displayedResponse = res;
				}
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

<div class="flex gap-4 justify-stretch mx-10 mb-10">
	{#if gateways}
		<div class="max-w-5xl w-full mx-auto">
			<p class="text-xl font-bold">Gateways</p>

			<p class="text-md">
				{#if cid.version === 0}
					<strong>CIDv0: </strong>
				{:else if cid.version === 1}
					<strong>CIDv1: </strong>
				{/if}<code>{cid}</code>
			</p>
			<div class="my-3">
				{#if sortedStatusList.length !== gateways.length}
					<progress
						class="progress progress-primary max-w-xl"
						max={gateways.length}
						value={sortedStatusList.length}
					/>
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
							<button class="btn btn-primary btn-sm" on:click={() => cacheCID()}> Refresh </button>
						</div>
					</div>
				{/if}
			</div>

			<table class="table table-zebra w-full">
				<thead>
					<tr>
						<th>Gateway</th>
						<th>Status</th>
						<th>Delay</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{#each sortedStatusList as { url: resUrl, ok, delay }}
						{@const url = new URL(resUrl)}

						<tr class:success={ok}>
							<td title={url.host}>
								{ellipse(url.hostname, 30)}
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
								{#if ok}
									<a
										class="btn btn-secondary btn-sm btn-ghost"
										href={resUrl.toString()}
										target="_blank"
										rel="noopener noreferrer"
									>
										🔗 Link
									</a>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
	{#if displayedResponse}
		<div class="w-full">
			<p class="text-xl font-bold">Content</p>
			<code class="badge badge-secondary">
				{displayedResponse.headers.get('Content-Type') || 'unknown'}
			</code>
			<ContentDisplay response={displayedResponse} />
		</div>
	{/if}
</div>

<style lang="scss">
</style>
