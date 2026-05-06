<script lang="ts">
	import PaperPostList from '$lib/components/PaperPostList.svelte';
	import { siteConfig } from '../config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{siteConfig.title}</title>
</svelte:head>

<main id="top" class="pm-main pm-list-main">
	<PaperPostList posts={data.posts} />
</main>
