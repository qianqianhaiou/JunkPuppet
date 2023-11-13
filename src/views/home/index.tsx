import { getDataDistInfo } from "@/service/index";
import { useEffect, useState } from "react";
import DistInfo from "./components/DistInfo";

function App() {
  const [info, setInfo] = useState();
  const fetchData = async () => {
    const result = await getDataDistInfo({});
    setInfo(result);
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div>
      <DistInfo data={info}></DistInfo>
    </div>
  );
}
export default App;
