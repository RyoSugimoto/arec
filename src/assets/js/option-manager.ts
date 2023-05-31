/**
 * TODO: Web Storage関連の処理を加える。
 */
interface OptionManagerMap {
  [key:string]:string | null;
}
interface OptionManagerStates {
  map:OptionManagerMap;
}
export class OptionManager {
  /** オプションを属性に反映するHTML要素 */
  readonly targetElement:HTMLElement = document.documentElement;
  /** Web Storage のキー */
  private key:string = '';
  /** オプションの状態を記録するオブジェクト */
  private state:OptionManagerStates = { map: {}, };
  constructor(key:string) {
    if (!key) throw new Error();
    this.key = key;
    if (this.keyExists(this.key)) {
      this.load();
    } else {
      this.save();
    }
    this.render();
  }
  public get(optionName:string) {
    return this.targetElement.getAttribute(`data-${this.key}-${optionName}`);
  }
  public getState() {
    return this.state;
  }
  public set(optionName:string, value:string, save:boolean = true) {
    this.state.map[optionName] = value;
    this.render();
    if (save) this.save();
  }
  public remove(optionName:string, save:boolean = true) {
    this.state.map[optionName] = null;
    this.render();
    if (save) this.save();
  }
  private render() {
    Object.keys(this.state.map).forEach(key => {
      const value = this.state.map[key];
      if (value !== null) {
        this.targetElement.setAttribute(`data-${this.key}-${key}`, String(value));
      } else {
        this.targetElement.removeAttribute(`data-${this.key}-${key}`);
      }
    });
  }
  /**
   * Web Storage にキーが既に存在するか調べる。
   * @param {string} key
   * @returns {boolean}
   */
  private keyExists(key:string): boolean {
    return false;
  }
  /**
   * Web Storage に `this.states` を記録する。
   */
  public save() {

  }
  /**
   * Web Storage から `this.states` を読み込む。
   */
  public load() {

  }
  /**
   * Web Storage からキーに対応した記録を削除する。
   * @param {boolean} cleanState 現在の状態を削除するかどうか
   */
  public delete(cleanState:boolean = false) {
    if (cleanState) {
      this.clean();
    }
  }
  public clean() {
    Object.keys(this.state.map).forEach(key => {
      this.remove(key);
    });
    this.state.map = {};
  }
}
