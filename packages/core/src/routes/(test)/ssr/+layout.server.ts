import { useQueryParams } from "./params";

export function load({ url }) {
	const [params] = useQueryParams(url);
	params.count = 10;
}
