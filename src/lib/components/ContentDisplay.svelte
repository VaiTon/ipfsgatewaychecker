<script lang="ts">
	export let response: Response;

	$: displayedContentType = response.headers.get('Content-Type');
</script>

<object
	title="Content"
	class="w-full mt-5 h-screen"
	data={response.url}
	type={displayedContentType || 'text/plain'}
/>
