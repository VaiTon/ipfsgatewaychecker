import type { PageLoad } from './$types';
import { CID } from 'multiformats/cid';
import recommendedGateways from './recommended.json';
import { redirect } from '@sveltejs/kit';

export const ssr = false;
const GATEWAYS_URL =
	'https://raw.githubusercontent.com/ipfs/public-gateway-checker/master/src/gateways.json';

const LOCAL_GATEWAY_URL = 'http://localhost:8080/ipfs/:hash';

const cidToUrl = (cid: CID, gateway: string) => gateway.replace(':hash', cid.toString());

export const load = (async ({ fetch, params }) => {
	const cid = CID.parse(params.cid);
	if (cid.version === 0) {
		throw redirect(308, `/ipfs/${cid.toV1().toString()}`);
	}

	const templates = [
		...((await (await fetch(GATEWAYS_URL)).json()) as string[]),
		LOCAL_GATEWAY_URL
	];

	const gateways = templates.map((template) => cidToUrl(cid, template));
	return {
		gateways,
		cid,
		recommendedGateways
	};
}) satisfies PageLoad;
