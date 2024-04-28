import JavascriptEditor from '@/components/JavascriptEditor';
import { startManualJs } from '@/service';
import { queryURLParams } from '@/utils/translator';
import { Breadcrumb, Button, Input, message, Space } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function Editor() {
  const local = useLocation();
  const { id } = queryURLParams(local.search);
  const [messageApi, contextHolder] = message.useMessage();
  const [code, setCode] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [status, setStatus] = useState('info');
  const handleUpdateFn = (value: any) => {
    localStorage.setItem(`jsbox-${id}`, value);
    setCode(value);
  };
  const handleSubmit = async () => {
    const result = await startManualJs({ code });
  };
  const handleSave = () => {
    if (!title) {
      messageApi.warning('请填写脚本名称');
    } else {
      const jsListString = localStorage.getItem('jsbox-list');
      const jsList = jsListString ? JSON.parse(jsListString) : [];
      const datenow = Date.now();
      const index = jsList.findIndex((item: any) => item.createdAt === Number(id));
      jsList[index].title = title;
      jsList[index].updatedAt = datenow;
      localStorage.setItem(`jsbox-list`, JSON.stringify(jsList));
      messageApi.success('保存成功');
      setStatus('info');
    }
  };
  useEffect(() => {
    const jsListString = localStorage.getItem('jsbox-list');
    const jsList = jsListString ? JSON.parse(jsListString) : [];
    const jsDetail = jsList.find((item: any) => item.createdAt === Number(id));
    setTitle(jsDetail?.title || '');
    setCode(localStorage.getItem(`jsbox-${id}`) || '');
  }, []);
  return (
    <div className='h-full'>
      {contextHolder}
      <div className='h-[60px] flex items-center justify-between px-[30px]'>
        {status === 'edit' ? (
          <Input
            value={title}
            className='mr-[10px]'
            placeholder='脚本名称'
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <div>{title}</div>
        )}
        <Space>
          {status === 'edit' ? (
            <Button onClick={handleSave}>保存</Button>
          ) : (
            <Button onClick={() => setStatus('edit')}>编辑</Button>
          )}
          <Button type='primary' onClick={handleSubmit}>
            运行
          </Button>
        </Space>
      </div>
      <div style={{ height: 'calc(100% - 60px) ' }}>
        <JavascriptEditor defaultCode={code} updateValue={handleUpdateFn}></JavascriptEditor>
      </div>
    </div>
  );
}

export default Editor;
