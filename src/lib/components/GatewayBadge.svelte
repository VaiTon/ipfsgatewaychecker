<script lang="ts">
	import { isLocalhost } from '$lib/utils';

	export let ok: boolean;

	export let url: URL;

	export let recommendedHosts: string[] = [];
</script>

{#if !ok}
	<span class="badge badge-error">Fail</span>
{:else if isLocalhost(url)}
	<span class="badge badge-warning">Localhost</span>
{:else if recommendedHosts.includes(url.hostname)}
	<span class="badge badge-success">Recommended</span>
{:else}
	<span class="badge badge-info">OK</span>
{/if}
