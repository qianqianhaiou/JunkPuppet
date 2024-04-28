import { Card, message, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';

function App() {
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleToDetail = (id: number) => {
    navigate(`/manualjs/detail?id=${id}`);
  };
  const handleAdd = () => {
    setLoading(true);
    const jsListString = localStorage.getItem('jsbox-list');
    const jsList = jsListString ? JSON.parse(jsListString) : [];
    const dateNow = Date.now();
    jsList.push({
      title: '脚本' + (jsList.length + 1),
      createdAt: dateNow,
    });
    localStorage.setItem('jsbox-list', JSON.stringify(jsList));
    setTimeout(() => {
      handleToDetail(dateNow);
      setLoading(false);
    }, 1000);
  };
  useEffect(() => {
    const jsListString = localStorage.getItem('jsbox-list');
    const jsList = jsListString ? JSON.parse(jsListString) : [];
    setBoxes(jsList);
  }, []);
  return (
    <div className='h-full bg-[#1e1e1e]'>
      <Spin spinning={loading} tip='创建成功，正在跳转' fullscreen />
      <div className='flex flex-wrap justify-start pb-[1px]'>
        {boxes.map((item: any) => {
          return (
            <Card
              key={item.createdAt}
              className='cursor-pointer h-[92px] flex justify-center items-center hover:bg-[#252525]'
              style={{ width: '20%' }}
              onClick={() => handleToDetail(item.createdAt)}>
              <div className='line-clamp-2'>{item.title}</div>
            </Card>
          );
        })}
        <Card
          className='cursor-pointer h-[92px] flex justify-center items-center hover:bg-[#252525]'
          style={{ width: '20%', borderWidth: '2px', borderStyle: 'dashed' }}
          onClick={() => handleAdd()}>
          <div className='flex items-center'>
            <PlusOutlined className='mr-[4px]' style={{ fontSize: '18px' }} />
            <div className='text-[14px]'>创建脚本</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
