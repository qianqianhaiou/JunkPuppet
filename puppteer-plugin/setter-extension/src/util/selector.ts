interface Selector {
  iframeIndex: number;
  selector: string;
}

function parentUtilBody(el: HTMLElement, parents: HTMLElement[] = []): HTMLElement[] {
  if (el.tagName === 'BODY') {
    return [];
  } else if (el.parentElement?.tagName === 'BODY') {
    parents.push(el);
    return parents;
  } else {
    parents.push(el);
    return parentUtilBody(el.parentElement as HTMLElement, parents);
  }
}
HTMLElement.prototype.hasChild = function (children: HTMLElement) {
  const childParents = parentUtilBody(children);
  for (const item of childParents) {
    if (item.isSameNode(this)) {
      return true;
    }
  }
  return false;
};

export class DomService {
  static getSelectorWithClass(el: HTMLElement) {
    return this.getSelector(el, true);
  }
  static getSelectorSimple(el: HTMLElement) {
    return this.getSelector(el, false);
  }
  static getSelectorWithNthUniq(
    _selector: any,
    selectedElement: any,
  ): { iframeIndex: number; selector: string } {
    let _document = document;
    if (_document.querySelectorAll(_selector.selector).length <= 1) {
      return _selector;
    }
    let selector = this.getGlobalUniqSelector(_document, _selector, selectedElement, 1);
    if (_document.querySelectorAll(selector.selector).length > 1) {
      return this.getSelectorWithNthUniq(selector, selectedElement);
    }
    return selector;
  }

  static getGlobalUniqSelectors(
    _selector: any,
    selectedElement: any,
    realLen: number,
  ): { iframeIndex: number; selector: string } {
    let _document = document;
    if (_document.querySelectorAll(_selector.selector).length <= 1) {
      return _selector;
    }
    let selector = this.getGlobalUniqSelector(_document, _selector, selectedElement, realLen);
    if (_document.querySelectorAll(selector.selector).length > realLen) {
      return this.getGlobalUniqSelectors(selector, selectedElement, realLen);
    }
    return selector;
  }
  static getGlobalUniqSelector(
    _document: any,
    selectorData: any,
    $selectedElement: any,
    realLen: number,
  ) {
    let { selector: _selector, iframeIndex } = selectorData;
    let findDiffLenNodeLevel = (_selector: string): string => {
      if (_document.querySelectorAll(_selector).length == realLen) return _selector;
      let parent = _selector.slice(0, _selector.lastIndexOf('>'));
      let parentLen = _document.querySelectorAll(parent).length;
      if (parentLen <= realLen) {
        return _selector;
      } else {
        return findDiffLenNodeLevel(parent);
      }
    };
    let diffNode = findDiffLenNodeLevel(_selector);
    const nodes = [..._document.querySelectorAll(diffNode)];
    let parentNodeIndex = -1;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].hasChild($selectedElement)) {
        parentNodeIndex = i;
      }
    }
    let selectedElementIndex = 0;
    let selectedElementParents = $selectedElement.parentElement.children;
    for (let i = 0; i < selectedElementParents.length; i++) {
      if (selectedElementParents[i].isSameNode($selectedElement)) {
        selectedElementIndex = i;
      }
    }
    let indexSelector =
      diffNode +
      `:nth-of-type(${parentNodeIndex > -1 ? parentNodeIndex + 1 : selectedElementIndex + 1})`;
    indexSelector += _selector.slice(diffNode.length);
    return {
      iframeIndex: iframeIndex,
      selector: indexSelector,
    };
  }
  static getSelector(ele: HTMLElement, widthClass: Boolean = false) {
    const getClassorNodeName = (ele: HTMLElement) => {
      let className = '';
      let nodeName = ele.tagName.toLowerCase();
      if (!widthClass) {
        return nodeName;
      }
      if (ele.className) {
        let classNames: any = [];
        ele.classList.forEach((_class, index) => {
          _class = String(_class);
          if (
            _class.indexOf('ng-') != 0 &&
            _class.indexOf('sunsilent-') != 0 &&
            /^[a-z|A-Z|0-9|+|~|-]*$/.test(_class)
          ) {
            if (isNaN(parseInt(_class))) classNames.push(_class);
          }
        });
        className = classNames.join('.');
        if (className) className = '.' + className;
      }
      let _selector = className ? nodeName + className : nodeName;
      return _selector;
    };
    const parentsEl = parentUtilBody(ele);
    let selector = '';
    parentsEl.forEach((el: HTMLElement, index: number) => {
      if (!selector) {
        selector = getClassorNodeName(el);
      } else {
        selector = getClassorNodeName(el) + '>' + selector;
      }
    });
    const bodySelector = selector ? 'body>' + selector : 'body';
    let iframeIndex: number = -1;
    const getIframeIndex = (selector: string) => {
      if (self === top) {
        // top层
        if ((window.top as Window).document.querySelector(selector)) {
          return selector;
        }
      } else {
        // iframe层
        const iframes: any = (window.top as Window).document.querySelectorAll('iframe');
        Array.prototype.map.call(iframes, (el: HTMLIFrameElement, index) => {
          const iframeVisible = () => {
            const iframeRect = el.getBoundingClientRect();
            const iframeStyle = getComputedStyle(el);
            if (iframeStyle.display === 'none') {
              return false;
            } else if (iframeStyle.opacity === '0') {
              return false;
            } else if (iframeRect.width * iframeRect.height === 0) {
              return false;
            } else {
              return true;
            }
          };
          const reSelectEl = el.contentDocument?.querySelectorAll(selector);
          if (
            iframeVisible() &&
            reSelectEl?.length &&
            [...Array.from(reSelectEl)].filter((item) => {
              return item.isSameNode(ele);
            }).length
          ) {
            iframeIndex = index;
          }
        });
      }
    };
    getIframeIndex(bodySelector);
    return {
      iframeIndex: iframeIndex,
      selector: bodySelector,
    };
  }
  static getElementBySelector(selector: Selector): Element | null {
    let element = null;
    if (selector.iframeIndex >= 0) {
      const iframes = document.querySelectorAll('iframe');
      const frameMainElement = iframes[selector.iframeIndex]?.contentDocument?.documentElement;
      if (frameMainElement) {
        element = frameMainElement.querySelector(selector.selector);
      }
    } else {
      element = document.querySelector(selector.selector);
    }
    return element;
  }
  static getElementsBySelector(selector: Selector): HTMLElement[] {
    let elements: any = [];
    if (selector.iframeIndex >= 0) {
      const iframes = document.querySelectorAll('iframe');
      const frameMainElement: any = iframes[selector.iframeIndex]?.contentDocument?.documentElement;
      if (frameMainElement) {
        elements = elements.concat(...frameMainElement.querySelectorAll(selector.selector));
      }
    } else {
      elements = elements.concat(...(document as any).querySelectorAll(selector.selector));
    }
    return elements;
  }
  static addClass(selector: Selector, className: string) {
    const $els = document.querySelectorAll(selector.selector);
    if ($els.length) {
      Array.prototype.forEach.call($els, (item) => {
        item.className = item.className + ` ${className}`;
      });
    }
  }
  static removeClass(selector: Selector, className: string) {
    const $els = document.querySelectorAll(selector.selector);
    if ($els.length) {
      Array.prototype.forEach.call($els, (item) => {
        item.className = item.className.replace(className, '');
      });
    }
  }
}
