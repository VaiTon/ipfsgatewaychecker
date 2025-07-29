import type { PageLoad } from './$types';
import { CID } from 'multiformats/cid';

import gatewaysTemplates from '$lib/gateways.json';

export const ssr = false;

const LOCAL_GATEWAY_URL = 'http://localhost:8080/ipfs/:hash';

const templatesToURLs = (cid: CID, gateway: string, filename: string | null) => {
	const urls: string[] = [];

	if (gateway.includes(':hash')) {
		// Handle placeholder format (like localhost)
		let newUrl = gateway.replace(':hash', cid.toString());
		if (filename != null) {
			newUrl += `?filename=${filename}`;
		}
		urls.push(newUrl);
	} else {
		// Handle base URL format - test both subdomain and path formats
		const url = new URL(gateway);

		// Format 1: Path format - domain/ipfs/cid
		let pathUrl = gateway + '/ipfs/' + cid.toString();
		if (filename != null) {
			pathUrl += `?filename=${filename}`;
		}
		urls.push(pathUrl);

		// Format 2: Subdomain format - cid.ipfs.domain
		let subdomainUrl = `${url.protocol}//${cid.toString()}.ipfs.${url.host}`;
		if (filename != null) {
			subdomainUrl += `?filename=${filename}`;
		}
		urls.push(subdomainUrl);
	}

	return urls;
};

export const load: PageLoad = ({ params, url }) => {
	const cid = CID.parse(params.cid);
	const filename = url.searchParams.get('filename');

	const templates = [...gatewaysTemplates, LOCAL_GATEWAY_URL];

	const urls = templates.map((it) => templatesToURLs(cid, it, filename)).flat();

	return {
		gateways: urls,
		cid,
		filename
	};
};
