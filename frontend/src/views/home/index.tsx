import { getDataDistInfo } from '@/service/index';
import { useEffect, useState } from 'react';
import DistInfo from './components/DistInfo';
import TaskInfo from './components/TaskInfo';
import BrowserInfo from './components/BrowserInfo';

function App() {
  return (
    <div className='w-full h-full items-center break-all justify-center'>
      <div className='bg-[#313131] h-[40px]'></div>
      <div className='flex'>
        <div>正在运行数：3</div>
      </div>
      <DistInfo></DistInfo>
      <TaskInfo></TaskInfo>
      <BrowserInfo></BrowserInfo>
    </div>
  );
}
export default App;
