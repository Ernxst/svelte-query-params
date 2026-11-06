import { useQueryParams } from "./params";

export function load({ url }) {
	const [params] = useQueryParams(url);
	return { n: params.n };
}
