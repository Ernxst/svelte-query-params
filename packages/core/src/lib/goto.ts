import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { type NumericRange, redirect as svelteRedirect } from "@sveltejs/kit";

export function redirect(path: string, code?: NumericRange<300, 308>) {
	if (browser) return goto(path);

	if (!code) throw Error("redirect: You need to pass a redirect code");
	return svelteRedirect(code, path);
}
