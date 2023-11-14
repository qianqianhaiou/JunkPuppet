import { useEffect, useState } from "react";
import {
  getGlobalSetting,
  selectDir,
  setGlobalSetting,
  selectFile,
} from "@/service";
import { Button, Input, Modal, Space, Tag } from "antd";
import { SelectOutlined, EditOutlined, CheckOutlined } from "@ant-design/icons";

function App() {
  const [status, setStatus] = useState("info");
  const [setting, setSetting] = useState<any>(null);
  const [chromePath, setChromePath] = useState("");
  const [basePath, setBasePath] = useState("");

  const handleGetGlobalSetting = async () => {
    const result = await getGlobalSetting({});
    const setting = JSON.parse(result);
    console.log(JSON.parse(result));
    setSetting(setting);
    setBasePath(setting.DATA_PATH);
    setChromePath(setting.CHROME_PATH);
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
  const handleCancelChange = () => {
    setBasePath(setting.DATA_PATH);
    setChromePath(setting.CHROME_PATH);
    setStatus("info");
  };
  const [modal, contextHolder] = Modal.useModal();
  const handleSubmit = async () => {
    modal.confirm({
      title: "提示",
      content: "保存修改配置后，软件将自动重启以生效",
      onOk: async () => {
        await setGlobalSetting({
          chrome_path: chromePath,
          data_path: basePath,
        });
        setStatus("info");
      },
    });
  };
  useEffect(() => {
    handleGetGlobalSetting();
  }, []);
  return (
    <div className="px-[20px] py-[20px]">
      {contextHolder}
      <div className="flex justify-end">
        <Space>
          {status === "edit" ? (
            <>
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={handleSubmit}
              >
                保存
              </Button>
              <Button type="text" onClick={handleCancelChange}>
                取消
              </Button>
            </>
          ) : (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => setStatus("edit")}
            >
              编辑
            </Button>
          )}
        </Space>
      </div>
      <div className="mb-[20px]">
        <div className="font-bold text-[18px] mb-[10px]">Chrome位置</div>
        <Input
          className="w-[400px]"
          value={chromePath}
          onChange={(e) => setChromePath(e.target.value)}
          disabled={status !== "edit"}
        ></Input>
        {status === "edit" ? (
          <Button
            type="link"
            icon={<SelectOutlined />}
            onClick={handleSelectFile}
          >
            手动选择
          </Button>
        ) : null}
      </div>
      <div>
        <div className="font-bold text-[18px] mb-[10px]">数据存放位置</div>
        <Input
          className="w-[400px]"
          value={basePath}
          onChange={(e) => setBasePath(e.target.value)}
          disabled={status !== "edit"}
        ></Input>
        {status === "edit" ? (
          <Button
            type="link"
            icon={<SelectOutlined />}
            onClick={handleSelectDir}
          >
            手动选择
          </Button>
        ) : null}
      </div>
    </div>
  );
}
export default App;
