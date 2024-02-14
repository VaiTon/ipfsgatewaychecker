export function isLocalhost(url: URL): boolean {
	return url.hostname === 'localhost' || url.hostname.endsWith('ipfs.localhost');
}
