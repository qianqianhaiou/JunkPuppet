import { clearAllLogs, getRecentLogs } from '@/service';
import VirtualList from 'rc-virtual-list';
import { useEffect, useRef, useState } from 'react';
import style from './style.module.scss';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Modal, message } from 'antd';

function App() {
  const [list, setList] = useState<any[]>([]);
  const [height, setHeight] = useState(400);
  const [modal, contextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();
  const vListRef = useRef<any>(null);
  const autoScrollKey = useRef<boolean>(true);
  const ColorMap: any = {
    '[INFO]': '#919191',
    '[WARN]': '#faad14',
    '[ERROR]': '#ff7875',
  };
  const itemHeight = 40;
  const onScroll = (e: any) => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === height) {
      autoScrollKey.current = true;
    } else {
      autoScrollKey.current = false;
    }
  };
  const computedContainerHeight = () => {
    const innerHeight = window.innerHeight - 42 - 38 - 36 - 36 - 40;
    setHeight(innerHeight);
  };
  const handleGetRecentLogs = async () => {
    const result = await getRecentLogs();
    setList(result);
  };
  const handleGetOneLog = (value: any) => {
    setList((c: any) => {
      if (c.length > 1000) {
        c.unshift();
      }
      return c.concat({
        time: value.time,
        type: value.type,
        message: value.message,
        index: value.index,
      });
    });
  };
  const handleClearLogs = () => {
    modal.confirm({
      title: '警告',
      icon: <ExclamationCircleFilled></ExclamationCircleFilled>,
      content: '该操作将删除清除日志，是否继续？',
      async onOk() {
        const result = await clearAllLogs();
        if (result === 'success') {
          messageApi.success('清除成功');
          setList([]);
        }
      },
      onCancel() {},
    });
  };
  useEffect(() => {
    if (autoScrollKey.current && list && list.length) {
      vListRef.current.scrollTo({
        index: list.length,
        align: 'bottom',
      });
    }
  }, [list]);
  useEffect(() => {
    handleGetRecentLogs().then(() => {
      window.onLog((_e: any, value: any) => {
        handleGetOneLog(value);
      });
    });
    computedContainerHeight();
    window.onresize = computedContainerHeight;
    return () => {
      window.onresize = null;
    };
  }, []);
  return (
    <div className='bg-[#212121]'>
      {contextHolder}
      {messageContextHolder}
      <div className='h-[36px]'></div>
      <div className='h-[36px] bg-[#000] flex items-center justify-between py-[10px] px-[20px] mx-[20px]'>
        <div className='font-bold'>服务日志</div>
        {list.length ? (
          <Button danger type='text' onClick={handleClearLogs}>
            清空日志
          </Button>
        ) : (
          <div></div>
        )}
      </div>
      <VirtualList
        className={style.VList + ' px-[20px] pb-[20px] mx-[20px] bg-[#000]'}
        ref={vListRef}
        data={list}
        height={height}
        itemHeight={itemHeight}
        itemKey={(item) => item.index}
        onScroll={onScroll}>
        {(item: any) => (
          <div
            className='flex items-center'
            style={{
              height: `${itemHeight}px`,
              borderBottom: '1px dashed #4c4c4c',
            }}>
            <div
              className='leading-[18px] flex text-[14px]'
              style={{
                color: ColorMap[item.type],
              }}>
              <div className='flex-shrink-0 mr-[10px] text-[#52c41a]'>{item.time}</div>
              <div className='flex-shrink-0 mr-[10px]'>{item.type}</div>
              <div className='line-clamp-2'>{item.message}</div>
            </div>
          </div>
        )}
      </VirtualList>
      <div className='h-[36px]'></div>
    </div>
  );
}

export default App;
