import JavascriptEditor from '@/components/JavascriptEditor';
import { startManualJs } from '@/service';
import { Button } from 'antd';
import { useEffect, useState } from 'react';

function App() {
  const [code, setCode] = useState<string>('');
  const handleUpdateFn = (value: any) => {
    localStorage.setItem('manualjs', value);
    setCode(value);
  };
  const handleSubmit = async () => {
    const result = await startManualJs({ code });
  };
  useEffect(() => {
    setCode(localStorage.getItem('manualjs') || '');
  }, []);
  return (
    <div className='h-full'>
      <div className='h-[60px] flex items-center justify-between px-[30px]'>
        <div>Pupppeteer</div>
        <Button onClick={handleSubmit}>运行</Button>
      </div>
      <div style={{ height: 'calc(100% - 40px) ' }}>
        <JavascriptEditor defaultCode={code} updateValue={handleUpdateFn}></JavascriptEditor>
      </div>
    </div>
  );
}

export default App;
