<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	enum GatewayStatus {
		OK,
		UNKNOWN,
		FAIL
	}

	const statusText = {
		[GatewayStatus.OK]: 'OK',
		[GatewayStatus.UNKNOWN]: 'Unknown',
		[GatewayStatus.FAIL]: 'Fail'
	};

	let gwStatus: { url: string; status: GatewayStatus }[] = [];
	let gateways: string[] = [];
	let cid: string;
	let loading = true;

	async function cacheOnGateway(gateway: string) {
		const url = gateway.replace(':hash', cid);
		try {
			const res = await fetch(url);
			if (res.ok) {
				gwStatus.push({ url: gateway, status: GatewayStatus.OK });
			} else {
				gwStatus.push({ url: gateway, status: GatewayStatus.FAIL });
			}
		} catch (e) {
			gwStatus.push({ url: gateway, status: GatewayStatus.FAIL });
		}
		// Update status
		gwStatus = gwStatus.sort((a, b) => a.status - b.status);
	}

	async function cacheCID() {
		const promises = gateways.map((gw) => cacheOnGateway(gw));

		await Promise.all(promises);
		loading = false;
	}

	onMount(async () => {
		const res = await fetch(
			'https://raw.githubusercontent.com/ipfs/public-gateway-checker/master/src/gateways.json'
		);
		gateways = await res.json();
		cid = $page.params.cid;

		//await cacheCID();

		loading = false;
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
				</tr>
			</thead>
			<tbody>
				{#each gwStatus as { url, status }}
					<tr>
						<td>
							{#if status === GatewayStatus.OK}
								<a class:success={status == GatewayStatus.OK} href={url.replace(':hash', cid)}>
									{new URL(url.replace(':hash', cid)).host}
								</a>
							{:else if status === GatewayStatus.FAIL}
								<p>
									{new URL(url.replace(':hash', cid)).host}
								</p>
							{/if}
						</td>
						<td>{statusText[status]}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style lang="scss">
	.success {
		color: green;
	}
</style>
