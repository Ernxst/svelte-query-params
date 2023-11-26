import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";

const app = mount(App, {
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	target: document.getElementById("app")!,
});

export default app;
