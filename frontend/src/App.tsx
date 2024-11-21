import { ConfigProvider, message, Modal, theme } from 'antd';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
import { defaultRouter, optionalRouter } from '@/routers/index';
import { getGlobalSetting } from './service';
import { createContext, useEffect, useState } from 'react';
import { useSettingStore } from './views/stores';
import { MessageInstance } from 'antd/es/message/interface';
import { HookAPI } from 'antd/es/modal/useModal';

export const GlobalContext = createContext<{
  messageApi: MessageInstance;
  modal: HookAPI;
  drwerHeight: number;
}>({
  messageApi: {} as MessageInstance,
  modal: {} as HookAPI,
  drwerHeight: 758,
});

function pickOptionalRouters() {
  // pick some routes
  return optionalRouter;
}
function App() {
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  const [visible, setVisible] = useState(false);
  const [routes, setRoutes] = useState<any>(null);
  const { setSettingInfo } = useSettingStore();
  const handleGetGlobalSetting = async () => {
    const result = await getGlobalSetting({});
    const target = JSON.parse(result);
    if (target) {
      setSettingInfo(target);
      setRoutes(createBrowserRouter(pickOptionalRouters()));
    } else {
      setRoutes(createBrowserRouter(defaultRouter));
    }
    setVisible(true);
  };
  useEffect(() => {
    handleGetGlobalSetting();
  }, []);

  const [drwerHeight, setDrawerHeight] = useState(window.innerHeight - 42);
  const computedDrawerHeight = () => {
    setDrawerHeight(window.innerHeight - 42);
  };
  useEffect(() => {
    window.addEventListener('resize', computedDrawerHeight);
    return () => {
      window.removeEventListener('resize', computedDrawerHeight);
    };
  }, []);
  return visible ? (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          fontFamily: 'PuHui55Regular',
          colorPrimary: '#3160F8',
        },
        components: {
          Menu: {
            darkItemSelectedBg: '#3a3a3a',
          },
        },
      }}
      locale={zhCN}>
      {contextHolder}
      {modalContextHolder}
      <GlobalContext.Provider value={{ messageApi, modal, drwerHeight }}>
        <RouterProvider router={routes} />
      </GlobalContext.Provider>
    </ConfigProvider>
  ) : null;
}

export default App;
