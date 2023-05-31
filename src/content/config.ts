/**
 * このファイルは必須ではないが、
 * コンテンツコレクションの機能（フロントマタースキーマ（データ構造）の検証やTypeScriptの自動型付け）を
 * 活用するためには作成したほうがよい。
 * @see https://docs.astro.build/ja/guides/content-collections/
 */

/**
 * `z` （Zod）は、フロントマターの検証とTypeScriptの型チェックを行なえるようにするオブジェクト。
 * @see https://docs.astro.build/ja/guides/content-collections/#defining-datatypes-with-zod
 * @see https://github.com/colinhacks/zod
 */
import { defineCollection, z, reference } from 'astro:content';

/** コレクション `notebook` を定義する。 */
const notebookCollection = defineCollection({
  type: 'content',
  /**
   * スキーマ（データ構造）を定義する。
   * @see https://docs.astro.build/ja/guides/content-collections/#defining-datatypes-with-zod
   */
  schema: z.object({
    /** 記事のタイトル */
    title: z.string(),
    /**
     * `category` コレクションのアイテムの参照の配列
     * v2.5から `reference()` で他のコレクションを紐付けられるようになった。
     * @see https://astro.build/blog/astro-250/#data-collections-and-references
     */
    categories: z.array(reference('category')).optional(),
    /** タグの配列 */
    tags: z.array(z.string()).optional(),
    /** サムネイルのURL */
    thumbnail: z.string().optional(),
    /**
     * フロントマターでは、日付は `2022-07-08` のようなフォーマットで書く。
     * クオーテーションで囲まずに書くと `Date` オブジェクトとして扱われる。
     *
     * `z.string().transform((str) => new Date(str))` とすると、
     * フロントマターでは日付を文字列として書くが、Date型に変換されるようになる。
     */
    /** 公開日（yyyy-mm-dd）
     * TODO: ここで自動でタイムゾーンを東京に強制できないか検討する。
     */
    publishDate: z.date(),
    /** 更新日（yyyy-mm-dd） */
    modifyDate: z.date().optional(),
    /** 著者 */
    author: z.string().optional(),
    /** 下書きにする */
    isDraft: z.boolean().optional(),
  }),
});

/** コレクション `category` を定義する。 */
const categoryCollection = defineCollection({
  type: 'data',
  schema: z.object({
    /** 表示ラベル */
    label: z.string(),
    /** 説明文 */
    description: z.string().optional(),
  }),
});

/** コレクションをエクスポートする。 */
export const collections = {
  'category': categoryCollection,
  'notebook': notebookCollection,
};
