import { useEffect, useState } from 'react';
import { closeApp, maxWindow, minimizeWindow, openChrome, unMaxWindow } from '@/service';
import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  CloseOutlined,
  MinusOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import Aside from './Aside';
import { useSettingStore } from '../stores';

function App(props: any) {
  const DATA_PATH = useSettingStore((state) => state.DATA_PATH);
  const [fullScreen, setFullScreen] = useState<boolean>(window.innerWidth === window.screen.width);
  const handleMinimizeWindow = async () => {
    await minimizeWindow({});
  };
  const handleMaxOrUnMaxWindow = async () => {
    if (!fullScreen) {
      await maxWindow({});
    } else {
      await unMaxWindow({});
    }
    judgeFullScreen();
  };
  const handleCloseApp = async () => {
    await closeApp({});
  };
  const handleOpenChrome = async () => {
    await openChrome({});
  };
  const judgeFullScreen = () => {
    setFullScreen(window.innerWidth === window.screen.width);
  };
  useEffect(() => {
    judgeFullScreen();
    window.onresize = judgeFullScreen;
    return () => {
      window.onresize = null;
    };
  }, []);
  return (
    <div className='w-full h-full flex flex-col'>
      <div className='title-bar flex-shrink-0 w-full h-[42px] bg-[#202124] text-[#f1f1f2] flex justify-between items-center pl-[20px] box-border'>
        <div className='title text-[12px] flex items-center'>
          <div className='w-[20px] h-[20px] mr-[10px]'>
            <div className='iconfac'></div>
          </div>
          <div className='leading-[20px]'>拾荒木偶 - JunkPuppet</div>
        </div>
        <div className='operator h-full flex items-center cursor-default'>
          <div
            className='h-full hover:bg-[#3a3a3d] leading-[42px] px-[14px]'
            onClick={handleOpenChrome}>
            <GlobalOutlined />
          </div>
          <div
            className='h-full hover:bg-[#3a3a3d] leading-[42px] px-[14px]'
            onClick={handleMinimizeWindow}>
            <MinusOutlined />
          </div>
          <div
            className='h-full hover:bg-[#3a3a3d] leading-[42px] px-[14px]'
            onClick={handleMaxOrUnMaxWindow}>
            {fullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          </div>
          <div
            className='h-full hover:bg-[#3a3a3d] leading-[42px] px-[14px]'
            onClick={handleCloseApp}>
            <CloseOutlined />
          </div>
        </div>
      </div>
      <div className='flex flex-1' style={{ height: 'calc(100% - 42px)' }}>
        {DATA_PATH && (
          <div className='w-[60px] flex-shrink-0 bg-[#272727]'>
            <Aside></Aside>
          </div>
        )}
        <div className='flex-1 bg-[#181818] overflow-y-auto f-beautify-scrollbar'>
          {props.children}
        </div>
      </div>
    </div>
  );
}
export default App;
