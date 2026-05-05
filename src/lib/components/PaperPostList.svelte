<script lang="ts">
	import type { Post } from '$lib/types/post';
	import { countPostWords, getPostReadTime } from '$lib/utils/posts';

	type ListedPost = Post & {
		metadata: Post['metadata'] & {
			image?: string;
		};
	};

	let { posts }: { posts: ListedPost[] } = $props();

	const postsPerPage = 10;
	let currentPage = $state(1);
	let totalPages = $derived(Math.ceil(posts.length / postsPerPage));
	let paginatedPosts = $derived(
		posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)
	);

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

</script>

{#if posts.length === 0}
	<div class="pm-empty">暂无文章</div>
{:else}
	{#each paginatedPosts as post}
		<article class="pm-post-entry">
			{#if post.metadata.image}
				<figure class="pm-entry-cover">
					<img loading="lazy" src={post.metadata.image} alt="" />
				</figure>
			{/if}

			<header class="pm-entry-header">
				<h2 class="pm-entry-hint-parent">{post.metadata.title}</h2>
			</header>

			<div class="pm-entry-content">
				<p>{post.metadata.description}</p>
			</div>

				<footer class="pm-entry-footer">
					<span title={post.metadata.published}>{formatDate(post.metadata.published)}</span>
					&nbsp;·&nbsp;
					<span>{getPostReadTime(post)} 分钟</span>
					&nbsp;·&nbsp;
					<span>{countPostWords(post)} 字</span>
				</footer>

			<a class="pm-entry-link" aria-label={`文章链接：${post.metadata.title}`} href={`/posts/${post.slug}/`}></a>
		</article>
	{/each}

	{#if totalPages > 1}
		<footer class="pm-page-footer">
			<nav class="pm-pagination" aria-label="分页">
				{#if currentPage > 1}
					<button class="pm-prev" type="button" onclick={() => (currentPage -= 1)}>
						«&nbsp;&nbsp;上一页
					</button>
				{/if}
				{#if currentPage < totalPages}
					<button class="pm-next" type="button" onclick={() => (currentPage += 1)}>
						下一页&nbsp;&nbsp;»
					</button>
				{/if}
			</nav>
		</footer>
	{/if}
{/if}
