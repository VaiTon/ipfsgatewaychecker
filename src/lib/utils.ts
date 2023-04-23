export function isLocalhost(url: URL): boolean {
	return url.hostname === 'localhost';
}

export function ellipse(str: string, len: number) {
	if (str.length <= len) {
		return str;
	}
	return str.slice(0, len) + '...';
}
