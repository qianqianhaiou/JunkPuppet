import { getTaskList } from '@/service';
import Filter from './components/Filter';
import List from './components/List';
import { createContext, useEffect, useState } from 'react';

export const TaskListContext = createContext<{
  fetchList: (text: string) => Promise<void>;
  refresh: () => Promise<void>;
}>({
  fetchList: () => new Promise(() => {}),
  refresh: () => new Promise(() => {}),
});

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
  const refresh = async () => {
    await fetchList();
  };
  useEffect(() => {
    fetchList();
  }, []);
  return (
    <TaskListContext.Provider value={{ refresh, fetchList }}>
      <div>
        <div className='px-[20px] py-[20px] mt-[10px]'>
          <Filter></Filter>
        </div>
        <div className='px-[20px] mt-[10px]'>
          <List list={list}></List>
        </div>
      </div>
    </TaskListContext.Provider>
  );
}

export default App;
