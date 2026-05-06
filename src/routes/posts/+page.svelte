<script lang="ts">
	import PaperPostList from '$lib/components/PaperPostList.svelte';
	import { siteConfig } from '../../config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const posts = $derived(data.posts);
</script>

<svelte:head>
	<title>文章列表 - {siteConfig.title}</title>
	<meta name="description" content="浏览所有文章" />
</svelte:head>

<main class="pm-main pm-list-main">
	<PaperPostList posts={posts} />
</main>
