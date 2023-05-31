import { defineConfig } from 'astro/config';
import image from "@astrojs/image";
import svelte from "@astrojs/svelte";

/**
 * @see https://astro.build/config
 */

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  integrations: [image({
    serviceEntryPoint: '@astrojs/image/sharp'
  }), svelte()],
  markdown: {
    /** マークダウンのコードフェンス（```）で出力されるコードの設定 */
    shikiConfig: {
      /**
       * Shikiの組み込みテーマから選択（または独自のテーマを追加）
       * @see https://github.com/shikijs/shiki/blob/main/docs/themes.md
       */
      theme: 'slack-dark',
      /** 水平スクロールを防ぐために文字の折り返しを有効にする */
      wrap: true
    }
  }
});
