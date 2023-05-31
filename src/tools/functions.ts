import { resolve } from 'path';

/**
 * プロジェクトルートからの相対パスから絶対パスを得る。
 * @param {string} relative プロジェクトルート（コマンドの実行ディレクトリ）からの相対パス
 * @returns ファイルやディレクトリまでの絶対パス
 */
export const getPath = (relative:string = '.') => resolve(process.cwd(), relative);
