import { useEffect, useState } from "react";
import { selectDir, setGlobalSetting, selectFile } from "@/service";
import { Button, Modal, Space, Steps, Tag } from "antd";
import {
  SelectOutlined,
  ArrowLeftOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

function App() {
  const [chromePath, setChromePath] = useState("");
  const [basePath, setBasePath] = useState("");

  const [step, setStep] = useState(0);
  const handleSelectDir = async () => {
    const result = await selectDir({});
    if (!result) return;
    setBasePath(result);
    setStep((c) => c + 1);
  };
  const handleSelectFile = async () => {
    const result = await selectFile({});
    if (!result) return;
    setChromePath(result);
    setStep((c) => c + 1);
  };
  const handleBackStep = () => {
    setStep((c) => c - 1);
  };
  const handleNextStep = () => {
    setStep((c) => c + 1);
  };
  const [modal, contextHolder] = Modal.useModal();
  const handleSubmit = async () => {
    modal.confirm({
      title: "提示",
      content: "请确认初始化配置，提交之后软件将重新启动",
      onOk: () => {
        setGlobalSetting({
          chrome_path: chromePath,
          data_path: basePath,
        });
      },
    });
  };
  return (
    <div>
      {contextHolder}
      <div className="text-[22px] py-[30px] font-bold text-center">
        初始化应用程序
      </div>
      <div className="flex justify-center">
        <Steps
          className="w-[320px] flex-shrink-0"
          direction="vertical"
          current={step}
          items={[
            {
              title: "选择Chrome应用程序",
              description: <div className="h-[100px]"></div>,
            },
            {
              title: "选择数据存放位置",
              description: <div className="h-[100px]"></div>,
            },
            {
              title: "确认",
              description: <div className="h-[100px]"></div>,
            },
          ]}
        />
        <div className="w-[600px] ml-[20px]">
          {step === 0 && (
            <div className="text-center">
              <div className="leading-[36px]">
                <div>选择Chrome应用程序所在位置</div>
                <div>一般该应用程序被命名为chrome.exe</div>
                <div>一般被存放在：</div>
                <div
                  className="whitespace-pre-line mt-[10px]"
                  style={{ overflowWrap: "anywhere" }}
                >
                  C:\\ProgramFiles\\Google\\Chrome\\Application\\chrome.exe
                </div>
              </div>
              {chromePath && (
                <div className="py-[30px]">
                  <Tag
                    className="text-[14px] px-[10px] py-[6px] whitespace-pre-wrap"
                    color="lime"
                  >
                    已选： {chromePath}
                  </Tag>
                </div>
              )}
              <Space>
                <Button
                  className="w-[200px] mt-[10px]"
                  size="large"
                  type="primary"
                  icon={<SelectOutlined />}
                  onClick={handleSelectFile}
                >
                  {chromePath ? "重新选择" : "选择"}
                </Button>
                {chromePath && (
                  <Button
                    className="w-[150px] mt-[10px]"
                    size="large"
                    icon={<ArrowDownOutlined />}
                    onClick={handleNextStep}
                  >
                    下一步
                  </Button>
                )}
              </Space>
            </div>
          )}
          {step === 1 && (
            <div className="text-center">
              <div className="leading-[36px]">
                <div>请选择应用程序所产生的数据存放位置</div>
                <div>由于数据量在日常使用过程中会不断增加</div>
                <div>建议存放在非系统盘或机械硬盘中</div>
              </div>
              {basePath && (
                <div className="py-[30px]">
                  <Tag
                    className="text-[14px] px-[10px] py-[6px] whitespace-pre-wrap"
                    color="lime"
                  >
                    已选： {basePath}
                  </Tag>
                </div>
              )}
              <Space>
                <Button
                  className="w-[150px] mt-[10px]"
                  size="large"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackStep}
                >
                  上一步
                </Button>
                <Button
                  className="w-[200px] mt-[10px]"
                  size="large"
                  type="primary"
                  icon={<SelectOutlined />}
                  onClick={handleSelectDir}
                >
                  {basePath ? "重新选择" : "选择"}
                </Button>
                {basePath && (
                  <Button
                    className="w-[150px] mt-[10px]"
                    size="large"
                    icon={<ArrowDownOutlined />}
                    onClick={handleNextStep}
                  >
                    下一步
                  </Button>
                )}
              </Space>
            </div>
          )}
          {step === 2 && (
            <div className="text-center">
              <div>请确认初始化配置，点击提交之后软件将重新启动。</div>
              <div>
                <div className="pt-[30px]">
                  <Tag
                    className="w-full text-[14px] px-[10px] py-[6px] whitespace-pre-wrap"
                    color="lime"
                  >
                    Chrome位置： {chromePath}
                  </Tag>
                </div>
                <div className="py-[20px]">
                  <Tag
                    className="w-full text-[14px] px-[10px] py-[6px] whitespace-pre-wrap"
                    color="lime"
                  >
                    数据存放位置： {basePath}
                  </Tag>
                </div>
              </div>
              <Space>
                <Button
                  className="w-[200px] mt-[10px]"
                  size="large"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackStep}
                >
                  上一步
                </Button>
                <Button
                  className="w-[200px] mt-[10px]"
                  size="large"
                  icon={<SelectOutlined />}
                  type="primary"
                  onClick={handleSubmit}
                >
                  确认并提交
                </Button>
              </Space>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default App;
