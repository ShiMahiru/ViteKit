<script lang="ts">
	import { siteConfig } from '../../config';
	import { createPostSearchText } from '$lib/utils/posts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let query = $state('');

	function normalize(value: string) {
		return value.trim().toLowerCase();
	}

	let results = $derived.by(() => {
		const term = normalize(query);
		if (!term) return [];

		return data.posts.filter((post) => {
			const haystack = createPostSearchText(post);
			return haystack.includes(term);
		});
	});
</script>

<svelte:head>
	<title>搜索 - {siteConfig.title}</title>
	<meta name="description" content="搜索文章" />
</svelte:head>

<main class="pm-main">
	<header class="pm-page-header">
		<h1>搜索</h1>
	</header>

	<div class="pm-searchbox">
		<input bind:value={query} type="search" placeholder="搜索文章" aria-label="搜索文章" />
	</div>

	<ul class="pm-search-results" aria-live="polite">
		{#if query.trim() && results.length === 0}
			<li class="pm-search-empty">未找到匹配的文章</li>
		{:else}
			{#each results as post}
				<li>
					<a class="pm-entry-link" href={`/posts/${post.slug}/`} aria-label={`文章链接：${post.metadata.title}`}></a>
					<div>
						<h2>{post.metadata.title}</h2>
						<p>{post.metadata.description}</p>
					</div>
					<span>»</span>
				</li>
			{/each}
		{/if}
	</ul>
</main>
