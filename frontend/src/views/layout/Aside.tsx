import {
  SettingOutlined,
  UnorderedListOutlined,
  HomeOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Menu, Tooltip, Modal } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import Terminal from '@/assets/images/icons/terminal.svg';
import Robot from '@/assets/images/robot.png';
import { useState } from 'react';

function About() {
  const [visible, setVisible] = useState(false);
  const handleShowModal = () => {
    setVisible(true);
  };
  const handleClose = () => {
    setVisible(false);
  };
  return (
    <>
      <div className='cursor-pointer'>
        <Tooltip placement='right' title='关于'>
          <InfoCircleOutlined
            style={{ color: '#d1d1d1', fontSize: '20px' }}
            onClick={handleShowModal}
          />
        </Tooltip>
      </div>
      <Modal open={visible} footer={null} closable={false} onCancel={handleClose}>
        <div className='flex items-center flex-col pt-[30px] pb-[20px]'>
          <img src={Robot} className='block w-[64px] h-[64px]' alt='icon' />
          <div className='font-bold text-[18px] mt-[12px]'>拾荒木偶 - JunkPuppet</div>
          <div className='mt-[10px]'>一款基于 Electron + Puppeteer 的可视化爬虫工具</div>
          <div className='mt-[10px]'>Version: 0.0.6</div>
          <div className='mt-[10px]'>Author: qianqianhaiou</div>
        </div>
      </Modal>
    </>
  );
}

function App() {
  const navigator = useNavigate();
  const local = useLocation();
  const MenuItems: any = [
    {
      label: '首页',
      key: '/',
      icon: <HomeOutlined />,
    },
    {
      label: '任务列表',
      key: '/tasklist',
      icon: <UnorderedListOutlined />,
    },
    {
      label: '服务日志',
      key: '/logs',
      icon: <img src={Terminal} className='w-[16px] h-[16px]' alt='' />,
    },
    {
      label: '全局设置',
      key: '/setting',
      icon: <SettingOutlined />,
    },
  ];
  const MenuChange = (e: any) => {
    navigator(e.key);
  };
  return (
    <div className='h-full flex flex-col justify-between'>
      <Menu
        defaultSelectedKeys={[local.pathname]}
        mode='inline'
        style={{ width: '60px', backgroundColor: 'transparent' }}
        theme='dark'
        inlineCollapsed={true}
        onClick={MenuChange}
        items={MenuItems}
      />
      <div className='flex flex-col items-center justify-center pb-[20px]'>
        <About></About>
      </div>
    </div>
  );
}
export default App;
