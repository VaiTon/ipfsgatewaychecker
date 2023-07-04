import type { PageLoad } from './$types';
import { CID } from 'multiformats/cid';
import recommendedGateways from './recommended.json';

export const ssr = false;
const GATEWAYS_URL =
	'https://raw.githubusercontent.com/ipfs/public-gateway-checker/master/src/gateways.json';

const LOCAL_GATEWAY_URL = 'http://localhost:8080/ipfs/:hash';

const cidToUrl = (cid: CID, gateway: string, filename: string | null) => {
	let url = gateway.replace(':hash', cid.toString());
	if (filename != null) {
		url += `?filename=${filename}`;
	}

	return url;
};

export const load = (async ({ fetch, params, url }) => {
	const cid = CID.parse(params.cid);
	const filename = url.searchParams.get('filename');

	const templates = [
		...((await (await fetch(GATEWAYS_URL)).json()) as string[]),
		LOCAL_GATEWAY_URL
	];

	const gateways = templates.map((template) => cidToUrl(cid, template, filename));
	return {
		gateways,
		cid,
		filename,
		recommendedGateways
	};
}) satisfies PageLoad;
