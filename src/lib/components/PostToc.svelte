<script lang="ts">
	import { tick } from 'svelte';

	let {
		container,
		trigger
	}: {
		/** 文章正文容器（需在挂载后绑定） */
		container?: HTMLElement;
		/** 任意值变化时（如 slug / 文章组件）重建目录 */
		trigger?: unknown;
	} = $props();

	type Heading = { id: string; text: string; level: number };

	let headings = $state<Heading[]>([]);
	let activeId = $state<string>('');
	let observer: IntersectionObserver | undefined;
	let retryTimer: ReturnType<typeof setTimeout> | undefined;

	// 把实际标题层级压缩到从 1 起算的视觉缩进，避免文章只用 h2/h3 时第一项就被缩进
	let minLevel = $derived(headings.length ? Math.min(...headings.map((h) => h.level)) : 1);

	function slugify(text: string): string {
		return (
			text
				.trim()
				.toLowerCase()
				.replace(/[\s　]+/g, '-')
				// 保留中英文数字与连字符
				.replace(/[^\p{L}\p{N}\-]/gu, '')
				.replace(/-+/g, '-')
				.replace(/^-|-$/g, '') || 'section'
		);
	}

	async function rebuild(remainingRetries = 4) {
		await tick();
		if (!container) return;

		observer?.disconnect();
		const els = Array.from(
			container.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6')
		);

		if (els.length === 0 && remainingRetries > 0) {
			retryTimer = setTimeout(() => rebuild(remainingRetries - 1), 120);
			return;
		}

		const seen = new Map<string, number>();
		const list: Heading[] = [];
		for (const el of els) {
			const text = (el.textContent || '').trim();
			if (!text) continue;
			let id = el.id || slugify(text);
			if (seen.has(id)) {
				const n = (seen.get(id) || 1) + 1;
				seen.set(id, n);
				id = `${id}-${n}`;
			} else {
				seen.set(id, 1);
			}
			el.id = id;
			list.push({ id, text, level: Number(el.tagName.slice(1)) });
		}
		headings = list;

		if (list.length === 0) return;

		observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible.length > 0) {
					activeId = (visible[0].target as HTMLElement).id;
				}
			},
			// 顶部 80px 偏移、底部留 60% 视窗，避免一次高亮多个
			{ rootMargin: '-80px 0px -60% 0px', threshold: 0 }
		);
		for (const el of els) observer.observe(el);

		// 初始化 activeId 为视窗内最靠上的标题
		const firstVisible = els.find((el) => {
			const r = el.getBoundingClientRect();
			return r.bottom > 80;
		});
		activeId = (firstVisible || els[0]).id;
	}

	$effect(() => {
		void trigger;
		void container;
		rebuild();
		return () => {
			if (retryTimer) clearTimeout(retryTimer);
			observer?.disconnect();
		};
	});

	function handleClick(e: MouseEvent, id: string) {
		const el = document.getElementById(id);
		if (!el) return;
		e.preventDefault();
		const top = el.getBoundingClientRect().top + window.scrollY - 72;
		window.scrollTo({ top, behavior: 'smooth' });
		history.replaceState(null, '', `#${id}`);
	}
</script>

{#if headings.length > 0}
	<details class="pm-toc">
		<summary title="目录">
			<span class="title">目录</span>
		</summary>
		<div class="inner">
			<ul>
				{#each headings as h (h.id)}
					<li class="pm-toc-level-{Math.max(1, h.level - minLevel + 1)}">
						<a
							href={`#${h.id}`}
							aria-label={h.text}
							class:active={activeId === h.id}
							onclick={(e) => handleClick(e, h.id)}
						>
							{h.text}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</details>
{/if}
