import { getTaskList } from '@/service';
import Filter from './components/Filter';
import List from './components/List';
import { useEffect, useState } from 'react';

function App() {
  const [list, setList] = useState<any[]>([]);
  const fetchList = async (text?: string) => {
    let params: any = {
      text: text || '',
    };
    const result = await getTaskList(params);
    if (Array.isArray(result)) {
      setList(result);
    }
  };
  const reflash = async () => {
    await fetchList();
  };
  useEffect(() => {
    fetchList();
  }, []);
  return (
    <div className=''>
      <div className='px-[20px] py-[20px] mt-[10px]'>
        <Filter fetchList={fetchList}></Filter>
      </div>
      <div className='px-[20px] mt-[10px]'>
        <List reflash={reflash} list={list}></List>
      </div>
    </div>
  );
}

export default App;
