<script lang="ts">
	export let response: Response;

	$: displayedContentType = response.headers.get('content-type');

	const isType = (contentType: string | null, ...types: string[]) =>
		contentType != null && types.includes(contentType);

	$: isPdf = isType(displayedContentType, 'application/pdf');
	$: isHtml = isType(displayedContentType, 'text/html');
</script>

<object
	title="Content"
	class="w-full mt-5"
	class:h-full={isPdf || isHtml}
	data={response.url}
	type={displayedContentType || 'text/plain'}
/>
