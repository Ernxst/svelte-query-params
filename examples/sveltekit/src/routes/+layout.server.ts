import { useQueryParams } from "$lib/params";

export function load({ url }) {
	const [params] = useQueryParams(url);
	params.count = 10;
}
