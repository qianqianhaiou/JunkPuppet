/// <reference types="vite/client" />
// Used in Renderer process, expose in `preload.ts`
interface Window {
  SSAPI: any;
  onLog: any;
  openUrlInIframe: any;
}
