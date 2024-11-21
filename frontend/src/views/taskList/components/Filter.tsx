import { Button, Input } from 'antd';
import Edit from './Edit';
import { useContext, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { TaskListContext } from '..';
function App() {
  const { fetchList } = useContext(TaskListContext);
  const [text, setText] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const handleKeyPressEnter = (value: string) => {
    fetchList(value);
  };
  return (
    <div className='flex justify-between'>
      <div>
        <div className='flex items-center'>
          <Input.Search
            value={text}
            className='w-[200px]'
            placeholder='请输入任务名称'
            allowClear
            enterButton={false}
            onChange={(e: any) => setText(e.target.value)}
            onSearch={handleKeyPressEnter}></Input.Search>
        </div>
      </div>
      <Button
        type='primary'
        icon={<PlusOutlined />}
        onClick={() => {
          setEditVisible(true);
        }}>
        新建任务
      </Button>
      {editVisible ? <Edit setEditVisible={setEditVisible} type='create'></Edit> : null}
    </div>
  );
}
export default App;
