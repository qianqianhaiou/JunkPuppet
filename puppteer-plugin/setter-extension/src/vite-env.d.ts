/// <reference types="vite/client" />
interface HTMLElement {
  hasChild: (child: HTMLElement) => Boolean
}
interface Window {
  onmousewheel: Function;
}
declare module '*.vue'