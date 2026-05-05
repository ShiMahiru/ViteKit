<script lang="ts">
	import { siteConfig } from '../../config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function yearOf(dateString: string) {
		return new Date(dateString).getFullYear();
	}

	function monthOf(dateString: string) {
		return new Date(dateString).toLocaleDateString('zh-CN', { month: 'long' });
	}

	function dayOf(dateString: string) {
		return new Date(dateString).toLocaleDateString('zh-CN', {
			month: '2-digit',
			day: '2-digit'
		});
	}

	const groups = $derived.by(() => {
		const years = new Map<number, Map<string, typeof data.posts>>();

		for (const post of data.posts) {
			const year = yearOf(post.metadata.published);
			const month = monthOf(post.metadata.published);
			if (!years.has(year)) years.set(year, new Map());
			const months = years.get(year)!;
			if (!months.has(month)) months.set(month, []);
			months.get(month)!.push(post);
		}

		return Array.from(years.entries()).map(([year, months]) => ({
			year,
			count: Array.from(months.values()).reduce((sum, posts) => sum + posts.length, 0),
			months: Array.from(months.entries()).map(([month, posts]) => ({ month, posts }))
		}));
	});
</script>

<svelte:head>
	<title>归档 - {siteConfig.title}</title>
	<meta name="description" content="文章归档" />
</svelte:head>

<main class="pm-main">
	<header class="pm-page-header">
		<h1>归档</h1>
	</header>

	{#if data.posts.length === 0}
		<div class="pm-empty">暂无文章</div>
	{:else}
		<div class="pm-archive-posts">
			{#each groups as group}
				<section class="pm-archive-year">
					<h2>
						{group.year}
						<sup class="pm-archive-count">{group.count}</sup>
					</h2>

					{#each group.months as month}
						<div class="pm-archive-month">
							<h3 class="pm-archive-month-header">{month.month}</h3>
							<div class="pm-archive-entries">
								{#each month.posts as post}
									<article class="pm-archive-entry">
										<div class="pm-archive-meta">{dayOf(post.metadata.published)}</div>
										<h4 class="pm-archive-entry-title">
											<a href={`/posts/${post.slug}/`}>{post.metadata.title}</a>
										</h4>
									</article>
								{/each}
							</div>
						</div>
					{/each}
				</section>
			{/each}
		</div>
	{/if}
</main>
