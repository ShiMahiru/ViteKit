<script lang="ts">
	import { siteConfig } from '../../config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>标签 - {siteConfig.title}</title>
	<meta name="description" content="文章标签" />
</svelte:head>

<main class="pm-main">
	<header class="pm-page-header">
		<h1>标签</h1>
	</header>

	{#if data.tags.length === 0}
		<div class="pm-empty">暂无标签</div>
	{:else}
		<ul class="pm-terms-tags">
			{#each data.tags as tag}
				<li>
					<a href={`/tags/${encodeURIComponent(tag.name)}/`}>
						{tag.name} <sup>{tag.count}</sup>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</main>
