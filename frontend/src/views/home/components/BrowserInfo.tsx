import { activeTargetPage, getBrowserInstanceInfo, closeTargetPage } from '@/service';
import { Modal, Tabs, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CloseOutlined, ExclamationCircleFilled } from '@ant-design/icons';

function App() {
  const [info, setInfo] = useState<any>([]);
  const [activeTab, setActiveTab] = useState('');
  const activeTabRef = useRef('');
  const [activeUrl, setActiveUrl] = useState('');
  const [modal, modalContextHolder] = Modal.useModal();
  const timer = useRef<any>(null);
  const fetchData = async () => {
    const result = await getBrowserInstanceInfo({});
    const hasActive = result.find((item: any) => {
      return item.id === activeTabRef.current;
    });
    if (!hasActive) {
      setActiveTab('');
      activeTabRef.current = '';
      setActiveUrl('');
    }
    setInfo(result);
  };
  const handleClosePage = (e: Event, item: any) => {
    e.stopPropagation();
    modal.confirm({
      title: '是否要关闭该页面',
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          是否要关闭 <span className='font-bold'>{item.title}</span> 页面
        </div>
      ),
      async onOk() {
        if (item.id === activeTab) {
          setActiveTab('');
          activeTabRef.current = '';
          setActiveUrl('');
        }
        await closeTargetPage(item.id);
        await fetchData();
      },
      onCancel() {},
    });
  };
  const onTabClick = async (id: string) => {
    // 在Electron中激活当前tab

    // 每次任务进行之后过一段时间再激活这个tab，不然会出现 Argument should belong to the same JavaScript world as target object
    // 好像是调用active的问题
    await activeTargetPage(id);
    const { host } = new URL(info[0].webSocketDebuggerUrl);
    setActiveUrl(`http://${host}/devtools/inspector.html?ws=${host}/devtools/page/${id}`);
    setActiveTab(id);
    activeTabRef.current = id;
  };
  useEffect(() => {
    fetchData();
    timer.current = setInterval(() => {
      fetchData();
    }, 1000);
    return () => {
      clearInterval(timer.current);
    };
  }, []);
  return info?.length ? (
    <div className='h-full'>
      <Tabs
        activeKey={activeTab}
        onTabClick={onTabClick}
        type='card'
        items={info.map((item: any, _index: number) => {
          return {
            label: (
              <div className='flex items-center'>
                <Tooltip title={item.title} placement='bottom'>
                  <div className='w-[150px] truncate mr-[10px] text-[#ffffffd9]'>{item.title}</div>
                </Tooltip>
                {info.length > 1 ? (
                  <div
                    className='hover:bg-[#3e3e3e] w-[20px] h-[20px] flex items-center justify-center rounded-full'
                    onClick={(e: any) => handleClosePage(e, item)}>
                    <CloseOutlined style={{ color: '#b0b0b0', fontSize: '13px' }} color='#000' />
                  </div>
                ) : null}
              </div>
            ),
            key: item.id,
          };
        })}
      />
      {activeUrl ? (
        <iframe
          className='w-full border-none'
          style={{ height: 'calc(100% - 56px)' }}
          src={activeUrl}></iframe>
      ) : (
        <div
          className='w-full border-none flex items-center justify-center text-[#ffffff86]'
          style={{ height: 'calc(100% - 56px)' }}>
          <div className='mb-[50px]'>请选择选项卡</div>
        </div>
      )}
      {modalContextHolder}
    </div>
  ) : null;
}

export default App;
