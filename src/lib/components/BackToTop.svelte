<script lang="ts">
	let scrollY = $state(0);
	let showButton = $derived(scrollY > 100);

	function scrollToTop(event: MouseEvent) {
		event.preventDefault();
		window.scrollTo({ top: 0, behavior: 'smooth' });
		history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
	}
</script>

<svelte:window bind:scrollY />

<a
	href="#top"
	id="top-link"
	class:hidden={!showButton}
	class="pm-top-link"
	aria-label="回到顶部"
	title="回到顶部"
	onclick={scrollToTop}
>
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<polyline points="17 11 12 6 7 11" />
		<polyline points="17 18 12 13 7 18" />
	</svg>
</a>
