/**
 * TODO: トグラーを押す前にフォーカスしていた要素を記録しておき、閉じたときにその要素にフォーカスを戻せないか検討する。
 * `inert` が未対応のブラウザを動作対象に含むには、別途ポリフィルを入れる。
 * @see https://caniuse.com/mdn-api_htmlelement_inert
 * @see https://github.com/WICG/inert
 */
export interface DrawerOptions {
  toggler:string,
  drawer:string,
  inert?:string,
  begin?:string,
  end?:string;
}
export default class Drawer {
  private togglers:NodeListOf<HTMLElement>;
  private drawer:HTMLElement | null;
  private inert:NodeListOf<HTMLElement>;
  private drawerId:string = '';
  private beginElement:HTMLElement | null;
  private endElement:HTMLElement | null;
  private trapElement:HTMLElement;
  private scrollingElement:Element | null;
  private scrollTop:number = 0;
  private _isExpanded:boolean = false;
  /** ドロワーが開く前のフォーカスの位置を記録 */
  private activeElementBeforeOpen:Element | null = null;
  constructor(options:DrawerOptions) {
    this.togglers = document.querySelectorAll(options.toggler);
    this.drawer = document.querySelector(options.drawer);
    this.inert = document.querySelectorAll(options.inert || '');
    // ドロワー要素がない場合はエラーとする。
    if (this.drawer === null) {
      throw new Error('Drawer: `drawer` の要素が見つかりません。');
    }
    const drawerParent = this.drawer.parentNode;
    // ドロワーが開いたときにフォーカスする要素を設定する。
    const beginElement = options.begin ? document.querySelector(options.begin) : null;
    if (beginElement instanceof HTMLElement) {
      this.beginElement = beginElement;
    } else {
      this.beginElement = document.createElement('span');
      drawerParent?.insertBefore(this.beginElement, this.drawer);
      this.beginElement.setAttribute('tabindex', '-1');
    }
    // フォーカストラップにフォーカスしたときにフォーカスを移動する要素を設定する。
    const endElement = options.end ? document.querySelector(options.end) : null;
    if (endElement instanceof HTMLElement) {
      this.endElement = endElement;
    } else {
      this.endElement = null;
    }
    // ドロワーの末尾にフォーカストラップ要素を生成する。
    this.trapElement = document.createElement('span');
    this.trapElement.setAttribute('tabindex', '0');
    this.trapElement.addEventListener('focusin', event => {
      this.endElement?.focus();
      if (this.endElement === null) {
        // 指定がない場合はドロワー内の最初の要素にフォーカスを移動する。
        this.beginElement?.focus();
      }
    });
    // ドロワーのIDを取得・設定する。
    if (this.drawer.id) {
      this.drawerId = this.drawer.id;
    } else {
      this.drawerId = `drawer--${new Date().getTime()}`;
      this.drawer.id = this.drawerId;
    }
    this.togglers.forEach(toggler => {
      toggler.setAttribute('aria-controls', this.drawerId);
    });
    // トグル要素のイベントを設定する。
    this.attachEvent();
    // 初期状態にする。
    this.changeState(this._isExpanded);
    // スクロール位置を取得するための要素を取得する。
    const ua = window.navigator.userAgent.toLowerCase();
    this.scrollingElement = (ua.indexOf('webkit') > 0) ? document.scrollingElement : document.body;
  }
  private attachEvent() {
    this.togglers.forEach(toggler => {
      toggler.addEventListener('click', event => {
        event.preventDefault();
        this.toggle();
      })
    });
  }
  /**
   * フォーカストラップを配置もしくはツリーから削除する。
   * @param {boolean} set `true` だと配置 `false` だと削除
   */
  private setFocusTrap(set:boolean = true) {
    if (!this.drawer) {
      return;
    }
    const drawerParent = this.drawer.parentNode;
    if (set) {
      drawerParent?.insertBefore(this.trapElement, drawerParent?.lastChild);
    } else {
      this.trapElement.remove();
    }
  }
  /**
   * エスケープキーが押されたときにドロワーを閉じる。
   * @param {KeyboardEvent} event
   */
  private keydownHandler(event:KeyboardEvent) {
    if (['Escape', 'Esc'].indexOf(event.key) !== -1) {
      this.changeState(false);
    }
  }
  /**
   * ドロワーの開閉状態を取得する。
   * @returns {boolean} ドロワーが開いているか
   */
  public get isExpanded(): boolean {
    return this._isExpanded;
  }
  /**
   * 開閉状態を切り替える。
   */
  public toggle() {
    this.changeState(!this._isExpanded);
  }
  /**
   * 開く。
   */
  public open() {
    if (!this._isExpanded) {
      this.changeState(true);
    }
  }
  /**
   * 閉じる。
   */
  public close() {
    if (this._isExpanded) {
      this.changeState(false);
    }
  }
  /**
   * 開閉状態の変更に伴う処理をする。
   * @param {boolean} isExpanded `true` で開き `false` で閉じる。
   */
  private changeState(isExpanded:boolean) {
    this._isExpanded = isExpanded;
    this.togglers.forEach(toggler => {
      toggler.setAttribute('aria-expanded', String(isExpanded));
    });
    // ドロワー自体を開閉する。
    if (isExpanded) {
      this.drawer?.removeAttribute('hidden');
      this.drawer?.removeAttribute('aria-hidden');
      this.drawer?.removeAttribute('inert');
    } else {
      this.drawer?.setAttribute('hidden', '');
      this.drawer?.setAttribute('aria-hidden', '');
      this.drawer?.setAttribute('inert', '');
    }
    // 指定した（ドロワー外の）要素を不活性にする。
    this.inert.forEach(inert => {
      if (isExpanded) {
        inert.setAttribute('inert', '');
      } else {
        inert.removeAttribute('inert');
      }
    });
    // ページ全体のスクロールを無効化もしくは無効化を解除する。
    this.fixBackface(isExpanded);
    // フォーカストラップを配置もしくは削除する。
    this.setFocusTrap(isExpanded);
    /** ドロワーの開閉が終わってから実行する処理 */
    if (isExpanded) {
      // ドロワーを開いたとき
      this.drawer?.setAttribute('data-drawer-is-expanded', '');
      // キーアップイベントのハンドラを追加する。
      document.addEventListener('keydown', this.keydownHandler.bind(this));
      // ドロワーを開く前のフォーカス位置を記憶する。
      const activeElement = document.activeElement;
      this.activeElementBeforeOpen = activeElement;
      this.beginElement?.focus();
    } else {
      // ドロワーを閉じたとき
      this.drawer?.removeAttribute('data-drawer-is-expanded');
      // キーアップイベントのハンドラを削除する。
      document.removeEventListener('keydown', this.keydownHandler.bind(this));
      // フォーカスをドロワーが開く前の位置に戻す。
      if (this.activeElementBeforeOpen instanceof HTMLElement) {
        this.activeElementBeforeOpen?.focus();
      }
    }
  }
  /**
   * ページ全体のスクロールを抑制する。
   * @param {boolean} isFixed `false` を渡すと抑制を解除する。
   */
  private fixBackface(isFixed:boolean = true) {
    document.documentElement.style.setProperty('--drawer-scrollbar-width', `${isFixed ? (window.innerWidth - document.body.clientWidth) : 0}`);
    const scrollTop = this.scrollingElement?.scrollTop || 0;
    const style:{
      [key: string]: string
    } = {
      'bottom': '0',
      'left': '0',
      'overflow': 'hidden',
      'position': 'fixed',
      // スクロールしている分を上にずらす。
      'top': `${scrollTop * -1}px`,
      // 右端はスクロールバーの幅を算出して空ける。
      'right': 'calc(var(--drawer-scrollbar-width) * 1px)',
    };
    Object.keys(style).forEach(key => {
      if (isFixed) {
        document.body.style.setProperty(key, style[key]);
        this.scrollTop = scrollTop;
      } else {
        document.body.style.removeProperty(key);
        if (this.scrollingElement) {
          this.scrollingElement.scrollTop = this.scrollTop;
        }
      }
    });
  }
}
