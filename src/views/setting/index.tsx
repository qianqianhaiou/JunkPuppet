import { useEffect, useState } from "react";
import {
  getGlobalSetting,
  selectDir,
  setGlobalSetting,
  selectFile,
} from "@/service";

function App() {
  const [setting, setSetting] = useState(null);
  const [chromePath, setChromePath] = useState("");
  const [basePath, setBasePath] = useState("");

  const handleGetGlobalSetting = async () => {
    const result = await getGlobalSetting({});
    console.log(JSON.parse(result));
    setSetting(result);
  };

  const handleSelectDir = async () => {
    const result = await selectDir({});
    if (!result) return;
    setBasePath(result);
  };
  const handleSelectFile = async () => {
    const result = await selectFile({});
    if (!result) return;
    setChromePath(result);
  };
  const handleSubmit = async () => {
    const result = await setGlobalSetting({
      chrome_path: chromePath,
      data_path: basePath,
    });
    console.log(result);
  };
  useEffect(() => {
    handleGetGlobalSetting();
  }, []);
  return (
    <div>
      {setting ? (
        <div className="card">
          sett
        </div>
      ) : (
        <div className="card">
          <div>
            you has not select the main path of this project, please select
            first!
          </div>
          <div>
            fisrt: you should select the chrome path:
            <button onClick={handleSelectFile}>SELECT</button>
            <div>you has select: {chromePath}</div>
          </div>
          <div>
            then: you should select the base path:
            <button onClick={handleSelectDir}>SELECT</button>
            <div>you has select: {basePath}</div>
          </div>
          <div>
            <button onClick={handleSubmit}>submit</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
