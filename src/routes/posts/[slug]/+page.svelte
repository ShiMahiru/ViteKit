<script lang="ts">
	import { tick } from 'svelte';
	import { page } from '$app/stores';
	import { siteConfig } from '../../../config';
	import ImageViewer from '$lib/components/ImageViewer.svelte';
	import Giscus from '$lib/components/Giscus.svelte';
	import PostToc from '$lib/components/PostToc.svelte';
	import { highlightCodeBlocksIn } from '$lib/utils/highlight';
	import { renderMermaidIn } from '$lib/utils/mermaid';
	import { countPostWords, getPostReadTime } from '$lib/utils/posts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let proseEl: HTMLDivElement | undefined = $state();
	const showToc = $derived(data.post.metadata.toc === true);

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function parseQueryTerms(query: string): string[] {
		const terms: string[] = [];
		const re = /"([^"]+)"|(\S+)/g;
		let m: RegExpExecArray | null;
		while ((m = re.exec(query)) !== null) {
			const t = (m[1] ?? m[2] ?? '').trim().toLowerCase();
			if (t) terms.push(t);
		}
		return terms;
	}

	function highlightSearchTerms(container: HTMLElement, query: string) {
		const terms = parseQueryTerms(query);
		if (terms.length === 0) return;

		const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
			acceptNode: (node) => {
				const parent = node.parentElement;
				if (!parent) return NodeFilter.FILTER_REJECT;
				// 跳过已高亮、代码块、script/style
				if (
					parent.tagName === 'MARK' ||
					parent.tagName === 'SCRIPT' ||
					parent.tagName === 'STYLE' ||
					parent.closest('pre, code')
				) {
					return NodeFilter.FILTER_REJECT;
				}
				return NodeFilter.FILTER_ACCEPT;
			}
		});

		const textNodes: Text[] = [];
		let node: Node | null;
		while ((node = walker.nextNode())) textNodes.push(node as Text);

		const escaped = terms
			.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
			.sort((a, b) => b.length - a.length);
		const regex = new RegExp(`(${escaped.join('|')})`, 'gi');

		for (const textNode of textNodes) {
			const text = textNode.textContent || '';
			if (!regex.test(text)) continue;
			regex.lastIndex = 0;

			const frag = document.createDocumentFragment();
			let lastIdx = 0;
			let match: RegExpExecArray | null;
			while ((match = regex.exec(text)) !== null) {
				if (match.index > lastIdx) {
					frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
				}
				const mark = document.createElement('mark');
				mark.className = 'search-highlight';
				mark.textContent = match[0];
				frag.appendChild(mark);
				lastIdx = regex.lastIndex;
			}
			if (lastIdx < text.length) {
				frag.appendChild(document.createTextNode(text.slice(lastIdx)));
			}
			textNode.replaceWith(frag);
		}
	}

	function scrollToFirstMatch() {
		const firstMark = proseEl?.querySelector('mark.search-highlight');
		if (firstMark) {
			const top = (firstMark as HTMLElement).getBoundingClientRect().top + window.scrollY - 100;
			window.scrollTo({ top, behavior: 'smooth' });
		}
	}

	// 文章组件变化（首次挂载 + 同路由切换 slug）后重新渲染代码高亮与 mermaid
	$effect(() => {
		void data.component;
		void $page.url;
		(async () => {
			await tick();
			if (!proseEl) return;
			await renderMermaidIn(proseEl);
			highlightCodeBlocksIn(proseEl);

			// 处理搜索高亮
			const highlight = $page.url.searchParams.get('highlight');
			if (highlight) {
				highlightSearchTerms(proseEl, highlight);
				// 延迟滚动，等高亮 DOM 更新
				setTimeout(scrollToFirstMatch, 100);
			}
		})();
	});
</script>

<svelte:head>
	<title>{data.post.metadata.title} - {siteConfig.title}</title>
	<meta name="description" content={data.post.metadata.description} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.post.metadata.title} />
	<meta property="og:description" content={data.post.metadata.description} />
	<meta property="og:url" content={data.postUrl} />
	{#if data.postImageUrl}
		<meta property="og:image" content={data.postImageUrl} />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:image" content={data.postImageUrl} />
	{/if}
	<meta name="twitter:title" content={data.post.metadata.title} />
	<meta name="twitter:description" content={data.post.metadata.description} />
</svelte:head>

<main class="pm-main">
	<article class="pm-post-single">
		<header class="pm-post-header">
			<nav class="pm-breadcrumbs" aria-label="Breadcrumb">
				<a href="/">主页</a>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<polyline points="9 18 15 12 9 6" />
				</svg>
				<a href="/posts/">文章</a>
			</nav>

			<h1 class="pm-post-title pm-entry-hint-parent">{data.post.metadata.title}</h1>
			<div class="pm-post-description">{data.post.metadata.description}</div>
			<div class="pm-post-meta">
				<span title={data.post.metadata.published}>{formatDate(data.post.metadata.published)}</span>
				&nbsp;·&nbsp;
				<span>{getPostReadTime(data.post)} 分钟</span>
				&nbsp;·&nbsp;
				<span>{countPostWords(data.post)} 字</span>
			</div>
		</header>

		{#if data.post.metadata.image}
			<figure class="pm-entry-cover">
				<img loading="eager" src={data.post.metadata.image} alt="" />
			</figure>
		{/if}

		{#if showToc}
			<PostToc container={proseEl} trigger={data.component} />
		{/if}

		<div bind:this={proseEl} class="pm-post-content">
			<data.component />
		</div>

		<footer class="pm-post-footer">
			<nav class="pm-paginav">
				<a class="pm-prev" href="/posts/">
					<span class="title">« 返回</span>
					<span>文章列表</span>
				</a>
			</nav>
		</footer>

		<div id="comments">
			{#key $page.url.pathname}
				<Giscus />
			{/key}
		</div>
	</article>
</main>

<!-- 图片查看器 -->
<ImageViewer />
