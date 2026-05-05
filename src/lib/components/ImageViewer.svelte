<script lang="ts">
	import { onMount } from 'svelte';
	import PhotoSwipeLightbox from 'photoswipe/lightbox';
	import 'photoswipe/style.css';

	onMount(() => {
		// 初始化 PhotoSwipe
		const lightbox = new PhotoSwipeLightbox({
			gallery: '.pm-post-content',
			children: 'img',
			pswpModule: () => import('photoswipe')
		});

		// 动态设置图片数据
		lightbox.addFilter('itemData', (itemData) => {
			const img = itemData.element as HTMLImageElement | undefined;
			return {
				src: img?.src || '',
				width: img?.naturalWidth || 800,
				height: img?.naturalHeight || 600,
				alt: img?.alt || ''
			};
		});

		// 为图片添加点击样式
		lightbox.on('uiRegister', () => {
			const images = document.querySelectorAll<HTMLImageElement>('.pm-post-content img');
			images.forEach((img) => {
				img.style.cursor = 'pointer';
			});
		});

		lightbox.init();

		return () => {
			lightbox.destroy();
		};
	});
</script>
