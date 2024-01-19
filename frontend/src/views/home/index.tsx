import { getDataDistInfo } from '@/service/index';
import { useEffect, useState } from 'react';
import DistInfo from './components/DistInfo';
import TaskInfo from './components/TaskInfo';

function App() {
  return (
    <div className='w-full h-full flex items-center justify-center'>
      <DistInfo></DistInfo>
      <TaskInfo></TaskInfo>
    </div>
  );
}
export default App;
