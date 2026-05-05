<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { siteConfig } from '../../config';

	const giscus = siteConfig.giscus;
	const maxAttempts = 5;

	let container: HTMLDivElement | undefined = $state();
	let retryTimer: ReturnType<typeof setTimeout> | undefined;
	let watchdogTimer: ReturnType<typeof setTimeout> | undefined;
	let observer: MutationObserver | undefined;
	let mediaQuery: MediaQueryList | undefined;
	let attempts = 0;

	function resolvedTheme() {
		const theme = document.documentElement.dataset.theme;
		if (theme === 'dark' || theme === 'light') return theme;
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	onMount(() => {
		observer = new MutationObserver(() => {
			updateTheme();
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme', 'class']
		});

		mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', updateTheme);

		requestAnimationFrame(() => loadGiscus());

		return () => {
			cleanup();
		};
	});

	onDestroy(() => {
		cleanup();
	});

	function cleanup() {
		if (retryTimer) clearTimeout(retryTimer);
		if (watchdogTimer) clearTimeout(watchdogTimer);
		observer?.disconnect();
		mediaQuery?.removeEventListener('change', updateTheme);
	}

	function clearGiscus() {
		if (!container) return;
		container.replaceChildren();
	}

	function scheduleRetry() {
		if (!container || attempts >= maxAttempts) return;
		if (retryTimer) clearTimeout(retryTimer);
		retryTimer = setTimeout(() => {
			if (container?.querySelector('iframe.giscus-frame')) return;
			loadGiscus(true);
		}, 2200);
	}

	function startWatchdog() {
		if (watchdogTimer) clearTimeout(watchdogTimer);
		watchdogTimer = setTimeout(() => {
			const iframe = container?.querySelector('iframe.giscus-frame');
			if (iframe) {
				updateTheme();
				return;
			}
			scheduleRetry();
		}, 3000);
	}

	function updateTheme() {
		const iframe = container?.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
		if (!iframe?.contentWindow) return;
		iframe.contentWindow.postMessage(
			{
				giscus: {
					setConfig: {
						theme: resolvedTheme()
					}
				}
			},
			'https://giscus.app'
		);
	}

	function loadGiscus(force = false) {
		if (!container) return;
		if (!force && container.querySelector('iframe.giscus-frame')) {
			updateTheme();
			return;
		}
		if (!force && container.querySelector('script')) return;
		attempts += 1;
		clearGiscus();

		const script = document.createElement('script');
		script.src = giscus.src;
		script.setAttribute('data-repo', giscus.repo);
		script.setAttribute('data-repo-id', giscus.repoId);
		script.setAttribute('data-category', giscus.category);
		script.setAttribute('data-category-id', giscus.categoryId);
		script.setAttribute('data-mapping', giscus.mapping);
		script.setAttribute('data-strict', giscus.strict);
		script.setAttribute('data-reactions-enabled', giscus.reactionsEnabled);
		script.setAttribute('data-emit-metadata', giscus.emitMetadata);
		script.setAttribute('data-input-position', giscus.inputPosition);
		script.setAttribute('data-theme', resolvedTheme());
		script.setAttribute('data-lang', giscus.lang);
		script.setAttribute('data-loading', giscus.loading);
		script.setAttribute('crossorigin', 'anonymous');
		script.async = true;
		script.onload = startWatchdog;
		script.onerror = scheduleRetry;

		container.appendChild(script);
		startWatchdog();
	}
</script>

<div id="giscus-container" bind:this={container} class="pm-comments"></div>
