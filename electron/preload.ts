import { contextBridge, ipcRenderer } from 'electron';
import { routes, Route } from './routers';

const initSSAPI = () => {
  const target: {
    [propName: string]: (params: any) => Promise<any>;
  } = {};
  routes.map((route) => {
    target[route.path] = async (params) => {
      return ipcRenderer.invoke(route.path, params);
    };
  });
  contextBridge.exposeInMainWorld('SSAPI', target);
  contextBridge.exposeInMainWorld('onLog', (callBack: any) => {
    ipcRenderer.on('onLog', callBack);
  });
  contextBridge.exposeInMainWorld('openUrlInIframe', (callBack: any) => {
    ipcRenderer.on('openUrlInIframe', callBack);
  });
};

initSSAPI();
