import { getDataDistInfo } from '@/service/index';
import { useEffect, useState } from 'react';
import { SwapOutlined } from '@ant-design/icons';
import BrowserInfo from './components/BrowserInfo';
import SummaryInfo from './components/SummaryInfo';
import { Button } from 'antd';

function App() {
  const [viewType, setViewType] = useState('browser');

  const toggleViewType = () => {
    setViewType(viewType === 'summary' ? 'browser' : 'summary');
  };
  return (
    <div className='w-full h-full items-center break-all justify-center'>
      <div className='bg-[#272727] h-[48px]'>
        <div className='flex h-full justify-between items-center px-[16px]'>
          <div></div>
          <div>
            <Button type='text' icon={<SwapOutlined />} onClick={toggleViewType}>
              切换
            </Button>
          </div>
        </div>
      </div>
      <div className='overflow-y-hidden mx-[5px] mt-[10px]' style={{ height: 'calc(100% - 58px)' }}>
        {viewType === 'summary' ? <SummaryInfo></SummaryInfo> : <BrowserInfo></BrowserInfo>}
      </div>
    </div>
  );
}
export default App;
