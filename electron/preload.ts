import { contextBridge, ipcRenderer } from "electron";
import { routes, Route } from "./routes";

const initSSAPI = () => {
  const target: {
    [propName: string]: (params: any) => Promise<any>;
  } = {};
  routes.map((route) => {
    target[route.path] = async (params) => {
      return ipcRenderer.invoke(route.path, params);
    };
  });
  contextBridge.exposeInMainWorld("SSAPI", target);
};

initSSAPI();
