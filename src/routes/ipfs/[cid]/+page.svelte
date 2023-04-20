<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { CID } from 'multiformats/cid';
	import recommended from './recommended.json';

	const GATEWAYS_URL =
		'https://raw.githubusercontent.com/ipfs/public-gateway-checker/master/src/gateways.json';

	let cidStr = $page.params.cid;
	$: cid = CID.parse(cidStr);
	let gwStatus: { url: string; ok: boolean; delay: number }[] = [];
	let gateways: string[] = [];

	let firstOkUrl: Response | null = null;

	$: firstOkUrlContentType = firstOkUrl?.headers.get('content-type');

	function getCidUrl(gateway: string) {
		return gateway.replace(':hash', cidStr);
	}

	function ellipse(str: string, len: number) {
		if (str.length <= len) {
			return str;
		}
		return str.slice(0, len) + '...';
	}

	async function cacheOnGateway(gateway: string) {
		const startTime = new Date().getTime();

		const url = getCidUrl(gateway);
		try {
			const res = await fetch(url, {
				signal: AbortSignal.timeout(10000) // 10s
			});
			const endTime = new Date().getTime();
			if (res.ok) {
				gwStatus.push({ url: gateway, ok: true, delay: endTime - startTime });
				if (!firstOkUrl) {
					firstOkUrl = res;
				}
			} else {
				gwStatus.push({ url: gateway, ok: false, delay: endTime - startTime });
			}
		} catch (e) {
			gwStatus.push({ url: gateway, ok: false, delay: 0 });
		}
		// Update status
		gwStatus = gwStatus.sort((a, b) => {
			const hostA = new URL(a.url).host;
			const hostB = new URL(b.url).host;

			// Sort recommended gateways first
			const includesA = recommended.includes(hostA);
			const includesB = recommended.includes(hostB);

			if (includesA && !includesB) {
				return -1;
			} else if (!includesA && includesB) {
				return 1;
			}

			// Then by ok
			if (a.ok && !b.ok) {
				return -1;
			} else if (!a.ok && b.ok) {
				return 1;
			}

			// Then by delay
			return a.delay - b.delay;
		});
	}

	async function cacheCID() {
		const promises = gateways.map((gw) => cacheOnGateway(gw));

		await Promise.all(promises);
	}

	onMount(async () => {
		if (cid.version === 0) {
			window.location.replace(`/ipfs/${cid.toV1().toString()}`);
		}

		const res = await fetch(GATEWAYS_URL);
		gateways = await res.json();

		await cacheCID();
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
				{#if gwStatus.length !== gateways.length}
					<p>Tested {gwStatus.length} of {gateways.length} gateways...</p>
					<progress
						class="progress progress-primary max-w-xl"
						max={gateways.length}
						value={gwStatus.length}
					/>
				{:else}
					<p>Tested all {gateways.length} gateways!</p>
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
					{#each gwStatus as { url: gwUrl, ok, delay }}
						{@const downloadUrl = getCidUrl(gwUrl)}
						{@const host = new URL(downloadUrl).host}

						<tr class:success={ok}>
							<td title={host}>
								{ellipse(host, 30)}
							</td>
							<td>
								{#if ok && recommended.includes(host)}
									<span class="badge badge-success">Recommended</span>
								{:else if ok}
									<span class="badge badge-info">OK</span>
								{:else}
									<span class="badge badge-error">Fail</span>
								{/if}
							</td>
							<td>
								{#if ok}
									{delay} ms
								{/if}
							</td>
							<td>
								{#if ok}
									<a
										class="btn btn-secondary"
										href={downloadUrl}
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
	{#if firstOkUrl}
		<div class="w-full">
			<p class="text-xl font-bold">Content</p>
			<code class="badge badge-secondary">{firstOkUrlContentType}</code>
			<object
				title="Content"
				class="w-full h-full mt-5"
				class:is-pdf={firstOkUrlContentType === 'application/pdf'}
				data={firstOkUrl.url}
				type={firstOkUrlContentType}
			/>
		</div>
	{/if}
</div>

<style lang="scss">
</style>
