<script lang="ts">
	import '../app.css';
	import { siteConfig } from '../config';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>{siteConfig.title}</title>
	<link rel="icon" href={siteConfig.icon} />
	<meta property="og:site_name" content={siteConfig.title} />
	<link rel="alternate" type="application/rss+xml" title="{siteConfig.title} RSS Feed" href="/rss.xml" />
</svelte:head>

<NavBar />

{@render children()}

<SiteFooter />

<BackToTop />
