import type { PageLoad } from './$types';
import { CID } from 'multiformats/cid';
import recommendedGateways from './recommended.json';

import gatewaysTemplates from '@ipfs/public-gateway-checker/src/gateways';

export const ssr = false;

const LOCAL_GATEWAY_URL = 'http://localhost:8080/ipfs/:hash';

const templatesToURLs = (cid: CID, gateway: string, filename: string | null) => {
	let newUrl = gateway.replace(':hash', cid.toString());
	if (filename != null) {
		newUrl += `?filename=${filename}`;
	}

	const prefixUrl = new URL(gateway);

	prefixUrl.host = cid.toV1().toString() + '.ipfs.' + prefixUrl.host;
	prefixUrl.pathname = '';

	return [newUrl, prefixUrl.href];
};

export const load = (({ params, url }) => {
	const cid = CID.parse(params.cid);
	const filename = url.searchParams.get('filename');

	const templates = [...gatewaysTemplates, LOCAL_GATEWAY_URL];

	const urls = templates.map((it) => templatesToURLs(cid, it, filename)).flat();

	return {
		gateways: urls,
		cid,
		filename,
		recommendedGateways
	};
}) satisfies PageLoad;
