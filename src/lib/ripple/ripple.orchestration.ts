import {
  ElementRef,
  Renderer2,
  Injectable,
} from '@angular/core';
import { toBoolean, isBrowser, EventRegistry } from '@angular-mdc/web/common';

import { MDCRippleAdapter } from '@material/ripple/adapter';
import { MDCRippleFoundation, util } from '@material/ripple';

export abstract class MdcRippleOrchestration {
  private _mdcAdapter: MDCRippleAdapter = {
    browserSupportsCssVars: () => (typeof window !== 'undefined') ? util.supportsCssVariables(window) : false,
    isUnbounded: () => this.isUnbounded(),
    isSurfaceActive: () => this.isSurfaceActive(),
    isSurfaceDisabled: () => this.isSurfaceDisabled(),
    addClass: (className: string) => this._renderer.addClass(this._getHostElement(), className),
    removeClass: (className: string) => this._renderer.removeClass(this._getHostElement(), className),
    containsEventTarget: (target: EventTarget) => this._getHostElement().contains(target),
    registerInteractionHandler: (evtType: string, handler: EventListener) => {
      const target = (evtType === 'mouseup' || evtType === 'pointerup') ? window : this._getHostElement();
      this._registry.listen(evtType, handler, target, util.applyPassive());
    },
    deregisterInteractionHandler: (evtType: string, handler: EventListener) => {
      this._registry.unlisten(evtType, handler);
    },
    registerDocumentInteractionHandler: (evtType: string, handler: EventListener) => {
      this._registry.listen(evtType, handler, document, util.applyPassive());
    },
    deregisterDocumentInteractionHandler: (evtType: string, handler: EventListener) => {
      this._registry.unlisten(evtType, handler);
    },
    registerResizeHandler: (handler: EventListener) => {
      if (isBrowser()) {
        this._registry.listen('resize', handler, window);
      }
    },
    deregisterResizeHandler: (handler: EventListener) => {
      this._registry.unlisten('resize', handler);
    },
    updateCssVariable: (varName: string, value: string) => {
      this._renderer.setStyle(this._getHostElement(), varName, value, 2);
    },
    computeBoundingRect: () => this.getBoundingClientRect(),
    getWindowPageOffset: () => {
      return {
        x: (typeof window !== 'undefined') ? window.pageXOffset : 0,
        y: (typeof window !== 'undefined') ? window.pageYOffset : 0
      };
    }
  };

  private _foundation: {
    init(): void,
    destroy(): void,
    activate(event: any): void,
    deactivate(event: any): void,
    layout(): void,
    setUnbounded(unbounded: boolean): void
  };

  private _unbounded: boolean = false;
  public activeSurface: boolean = true;

  constructor(
    protected _renderer: Renderer2,
    protected _registry: EventRegistry,
    protected elementRef: ElementRef) { }

  destroy(): void {
    if (this._foundation) {
      this._foundation.destroy();
    }
  }

  init(unbounded: boolean = false): void {
    this._foundation = new MDCRippleFoundation(this._mdcAdapter);
    this._foundation.init();
    this._unbounded = unbounded;
  }

  activate(event?: any): void {
    if (this._foundation) {
      this._foundation.activate(event);
      this.activeSurface = true;
    }
  }

  deactivate(event?: any): void {
    if (this._foundation) {
      this._foundation.deactivate(event);
      this.activeSurface = false;
    }
  }

  setUnbounded(value: boolean): void {
    if (this._foundation) {
      this._foundation.setUnbounded(value);
    }
  }

  layout(): void {
    this._foundation.layout();
  }

  isSurfaceDisabled(): boolean {
    return this._getHostElement().attributes.getNamedItem('disabled') ? true : false;
  }

  isSurfaceActive(): boolean {
    return this._getHostElement()[util.getMatchesProperty(HTMLElement.prototype)](':active');
  }

  isUnbounded(): boolean {
    return this._unbounded;
  }

  getBoundingClientRect(): ClientRect {
    return this._getHostElement().getBoundingClientRect();
  }

  /** Retrieves the DOM element of the component host. */
  private _getHostElement() {
    return this.elementRef.nativeElement;
  }
}
