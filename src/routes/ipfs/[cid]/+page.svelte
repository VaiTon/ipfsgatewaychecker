<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { CID } from 'multiformats/cid';

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
			const res = await fetch(url);
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
			if (a.ok === b.ok) {
				return 0;
			}
			return a.ok ? -1 : 1;
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

<div class="columns centered">
	{#if gateways}
		<div class="column is-half">
			<p class="title is-4">Gateways</p>
			<p class="subtitle is-6">
				{#if cid.version === 0}
					<strong>CIDv0: </strong>
				{:else if cid.version === 1}
					<strong>CIDv1: </strong>
				{/if}<code>{cid}</code>
			</p>
			{#if gwStatus.length !== gateways.length}
				<p>Tested {gwStatus.length} of {gateways.length} gateways...</p>
				<progress
					class="progress is-small is-primary"
					max={gateways.length}
					value={gwStatus.length}
				/>
			{:else}
				<p>Tested all {gateways.length} gateways!</p>
			{/if}

			<div class="block">
				<table class="table">
					<thead>
						<tr>
							<th>Gateway</th>
							<th>Status</th>
							<th />
							<th />
						</tr>
					</thead>
					<tbody>
						{#each gwStatus as { url: gwUrl, ok, delay }}
							{@const downloadUrl = getCidUrl(gwUrl)}
							{@const host = new URL(downloadUrl).host}
							<tr class:success={ok}>
								<td title={host}> {ellipse(host, 30)} </td>
								<td><p class="status">{ok ? 'OK' : 'Fail'}</p></td>
								<td>
									{#if ok}
										{delay} ms
									{/if}
								</td>
								<td>
									{#if ok}
										<a href={downloadUrl} target="_blank" rel="noopener noreferrer"> Download </a>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
	{#if firstOkUrl}
		<div class="column">
			<p class="title is-4">Content</p>
			<p class="subtitle is-6">
				Type: <code>{firstOkUrlContentType}</code>
			</p>
			{#if firstOkUrlContentType === 'application/pdf' || firstOkUrlContentType === 'image/jpeg' || firstOkUrlContentType === 'image/png'}
				<!-- svelte-ignore a11y-missing-attribute -->
				<object
					class:is-pdf={firstOkUrlContentType === 'application/pdf'}
					data={firstOkUrl.url}
					type={firstOkUrlContentType}
				/>
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	.success .status {
		color: green;
	}

	table {
		width: 100%;
	}

	object {
		width: 100%;

		&.is-pdf {
			height: 100%;
		}
	}
</style>
