import { message } from 'antd';

async function FetchData(path: string, params: any) {
  try {
    console.log('API: ' + path);
    const result = await window.SSAPI[path](params);
    return result;
  } catch (e: any) {
    message.error(e.message);
  }
}

export const getGlobalSetting = async (params: any) => {
  return FetchData('getGlobalSetting', params);
};
export const setGlobalSetting = async (params: any) => {
  return FetchData('setGlobalSetting', params);
};
export const getTaskList = async (params: any) => {
  return FetchData('getTaskList', params);
};
export const getTaskTypes = async (params: any) => {
  return FetchData('getTaskTypes', params);
};

// 获取browser实例当前的Tab运行情况
export const getBrowserInstanceInfo = async (params: any) => {
  return FetchData('getBrowserInstanceInfo', params);
};

export const getTaskDataDetail = async (params: any) => {
  return FetchData('getTaskDataDetail', params);
};
export const addTask = async (params: any) => {
  return FetchData('addTask', params);
};
export const updateTask = async (params: any) => {
  return FetchData('updateTask', params);
};
export const deleteTask = async (params: any) => {
  return FetchData('deleteTask', params);
};
export const getTaskConfigDetail = async (params: any) => {
  return FetchData('getTaskConfigDetail', params);
};
export const updateTaskMockData = async (params: any) => {
  return FetchData('updateTaskMockData', params);
};
export const openTargetPage = async (params: any) => {
  return FetchData('openTargetPage', params);
};
export const activeTargetPage = async (params: any) => {
  return FetchData('activeTargetPage', params);
};
export const closeTargetPage = async (params: any) => {
  return FetchData('closeTargetPage', params);
};
export const getRecentLogs = async () => {
  return FetchData('getRecentLogs', {});
};
export const clearAllLogs = async () => {
  return FetchData('clearAllLogs', {});
};
export const startManualJs = async (params: any) => {
  return FetchData('startManualJs', params);
};
export const startSetting = async (params: any) => {
  return FetchData('startSetting', params);
};
export const startPlay = async (params: any) => {
  return FetchData('startplay', params);
};
export const killSetterProcess = async (params: any) => {
  return FetchData('killSetterProcess', params);
};
export const debugPlay = async (params: any) => {
  return FetchData('debugPlay', params);
};
export const selectDir = async (params: any) => {
  return FetchData('selectDir', params);
};
export const selectFile = async (params: any) => {
  return FetchData('selectFile', params);
};
export const searchChromePath = async (params: any) => {
  return FetchData('searchChromePath', params);
};
export const closeApp = async (params: any) => {
  return FetchData('closeApp', params);
};
export const minimizeWindow = async (params: any) => {
  return FetchData('minimizeWindow', params);
};
export const maxWindow = async (params: any) => {
  return FetchData('maxWindow', params);
};
export const getDataDistInfo = async (params: any) => {
  return FetchData('getDataDistInfo', params);
};
export const unMaxWindow = async (params: any) => {
  return FetchData('unMaxWindow', params);
};
export const deleteTaskDataDb = async (params: any) => {
  return FetchData('deleteTaskDataDb', params);
};
export const openChrome = async (params: any) => {
  return FetchData('openChrome', params);
};
export const uploadJSONSetting = async (params: any) => {
  return FetchData('uploadJSONSetting', params);
};
