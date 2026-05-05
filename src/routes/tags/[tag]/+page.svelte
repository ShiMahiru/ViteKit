<script lang="ts">
	import PaperPostList from '$lib/components/PaperPostList.svelte';
	import { siteConfig } from '../../../config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.tag} - {siteConfig.title}</title>
	<meta name="description" content={`标签：${data.tag}`} />
</svelte:head>

<main class="pm-main pm-list-main">
	<header class="pm-page-header">
		<h1>{data.tag}</h1>
	</header>

	<PaperPostList posts={data.posts} />
</main>
