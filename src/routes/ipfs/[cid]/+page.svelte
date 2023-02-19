<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const GATEWAYS_URL =
		'https://raw.githubusercontent.com/ipfs/public-gateway-checker/master/src/gateways.json';

	let gwStatus: { url: string; ok: boolean }[] = [];
	let gateways: string[] = [];
	let cid: string;

	async function cacheOnGateway(gateway: string) {
		const url = gateway.replace(':hash', cid);
		try {
			const res = await fetch(url);
			if (res.ok) {
				gwStatus.push({ url: gateway, ok: true });
			} else {
				gwStatus.push({ url: gateway, ok: false });
			}
		} catch (e) {
			gwStatus.push({ url: gateway, ok: false });
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
		const res = await fetch(GATEWAYS_URL);
		gateways = await res.json();
		cid = $page.params.cid;

		await cacheCID();
	});
</script>

{#if gateways}
	{#if gwStatus.length !== gateways.length}
		<p>Tested {gwStatus.length} of {gateways.length} gateways...</p>
		<progress class="progress is-small is-primary" max={gateways.length} value={gwStatus.length} />
	{:else}
		<p>Tested all {gateways.length} gateways!</p>
	{/if}

	<div class="block">
		<table class="table">
			<thead>
				<tr>
					<th>Gateway</th>
					<th>Status</th>
					<th>Link</th>
				</tr>
			</thead>
			<tbody>
				{#each gwStatus as { url, ok }}
					<tr class:success={ok}>
						<td>
							{new URL(url.replace(':hash', cid)).host}
						</td>
						<td><p class="status">{ok ? 'OK' : 'Fail'}</p></td>
						<td>
							{#if ok}
								<a href={url.replace(':hash', cid)} target="_blank" rel="noopener noreferrer">
									Download
								</a>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style lang="scss">
	.success .status {
		color: green;
	}
</style>
