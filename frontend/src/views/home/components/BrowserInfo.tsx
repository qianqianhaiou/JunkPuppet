import { getBrowserInstanceInfo } from '@/service';
import { useEffect, useState } from 'react';

function App() {
  const [info, setInfo] = useState([]);
  const fetchData = async () => {
    const result = await getBrowserInstanceInfo({});
    console.log(result);
    setInfo(result);
  };
  useEffect(() => {
    fetchData();
  }, []);
  return <div>browser: {JSON.stringify(info)}</div>;
}

export default App;
