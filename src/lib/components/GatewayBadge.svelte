<script lang="ts">
	import { isLocalhost } from '$lib/utils';

	let {
		ok,
		url,
		recommendedHosts = []
	}: { ok: boolean; url: URL; recommendedHosts?: string[] } = $props();
</script>

{#if !ok}
	<span class="badge badge-error gap-1">
		<span class="icon-[heroicons--x-circle] w-3 h-3"></span>
		Failed
	</span>
{:else if isLocalhost(url)}
	<span class="badge badge-warning gap-1">
		<span class="icon-[heroicons--home] w-3 h-3"></span>
		Localhost
	</span>
{:else if recommendedHosts.includes(url.hostname)}
	<span class="badge badge-success gap-1">
		<span class="icon-[heroicons--star] w-3 h-3"></span>
		Recommended
	</span>
{:else}
	<span class="badge badge-primary gap-1">
		<span class="icon-[heroicons--check-circle] w-3 h-3"></span>
		Working
	</span>
{/if}
