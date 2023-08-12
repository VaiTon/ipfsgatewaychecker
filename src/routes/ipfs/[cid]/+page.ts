import type { PageLoad } from './$types';
import { CID } from 'multiformats/cid';
import recommendedGateways from './recommended.json';

import templates from '@ipfs/public-gateway-checker/src/gateways';

export const ssr = false;

const LOCAL_GATEWAY_URL = 'http://localhost:8080/ipfs/:hash';

const cidToUrl = (cid: CID, gateway: string, filename: string | null) => {
	let url = gateway.replace(':hash', cid.toString());
	if (filename != null) {
		url += `?filename=${filename}`;
	}

	return url;
};

export const load = (async ({ params, url }) => {
	const cid = CID.parse(params.cid);
	const filename = url.searchParams.get('filename');

	const allTemplates = [...templates, LOCAL_GATEWAY_URL];

	const gateways = allTemplates.map((template) => cidToUrl(cid, template, filename));
	return {
		gateways,
		cid,
		filename,
		recommendedGateways
	};
}) satisfies PageLoad;
