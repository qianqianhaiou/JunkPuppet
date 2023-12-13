import {
  Button,
  Drawer,
  Input,
  Modal,
  Result,
  Space,
  Tabs,
  Upload,
  message,
} from "antd";
import { useEffect, useState } from "react";
import {
  startSetting,
  getTaskConfigDetail,
  updateTaskMockData,
  deleteTask,
  debugPlay,
  uploadJSONSetting,
} from "@/service/index";
import JsonEditor from "@/components/JsonEditor";
import style from "../style.module.scss";
import {
  ToolOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  DeleteOutlined,
  BugOutlined,
  UploadOutlined,
  AimOutlined,
} from "@ant-design/icons";
import JavascriptEditor from "@/components/JavascriptEditor";
import ConfigTab from "./ConfigTab";
import { flushSync } from "react-dom";

function UploadJsonConfig({
  configId,
  reFreshAll,
  messageApi,
  children,
}: {
  configId: string;
  reFreshAll: any;
  children: any;
  messageApi?: any;
}) {
  async function readFileAsText(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (evt: any) {
        resolve(evt.target.result);
      };
      reader.readAsText(file);
    });
  }
  const props = {
    showUploadList: false,
    beforeUpload: async (file: any) => {
      const text = await readFileAsText(file);
      const result = await uploadJSONSetting({
        _id: configId,
        data: text,
      });
      if (messageApi) {
        messageApi.success("覆盖成功");
      }
      reFreshAll();
      return false;
    },
  };
  return <Upload {...props}>{children}</Upload>;
}

function EditorBox({
  handleStartSetting,
  config,
  handleDeleteTask,
  messageApi,
  reFreshAll,
  close,
}: {
  handleStartSetting: any;
  config: any;
  messageApi: any;
  reFreshAll: any;
  handleDeleteTask: any;
  close: any;
}) {
  const [editable, setEditable] = useState(false);
  const defaultBuiltInData = config?.mockData?.builtInData
    ? JSON.stringify(config.mockData.builtInData)
    : "";
  const [builtInData, setBuiltInData] = useState(defaultBuiltInData);
  const [customFn, setCustomFn] = useState<any>({});
  const [activeKey, setActiveKey] = useState("JSON配置");
  const [defaultCustomFnKeys, setDefaultCustomFnKeys] = useState<any>([]);
  const handleSubmit = async () => {
    try {
      JSON.parse(builtInData);
    } catch (e) {
      messageApi.error("JSON格式错误，请检查。");
      return false;
    }
    const result = await updateTaskMockData({
      uid: config.mockDataId,
      builtInData: JSON.parse(builtInData),
      customFn: customFn,
    });
    if (result === "ok") {
      messageApi.success("修改成功");
      setEditable(false);
    }
  };
  const handleAddTab = (name: string) => {
    setCustomFn((c: any) => {
      c[name] = {
        label: name,
        functionString: "",
      };
      return c;
    });
  };
  const handleUpdateActive = (active: string) => {
    setActiveKey(active);
  };
  const handleUpdateFn = (e: string, activeKey: string) => {
    setCustomFn((c: any) => {
      c[activeKey]["functionString"] = e;
      return c;
    });
  };
  const handleUpdateTabName = (oldName: string, newName: string) => {
    setCustomFn((c: any) => {
      const oldConfig = structuredClone(c[oldName]);
      delete c[oldName];
      c[newName] = oldConfig;
      return c;
    });
  };
  const handleDeleteTabs = (target: string) => {
    setCustomFn((c: any) => {
      delete c[target];
      return c;
    });
  };
  const handleUploadSuccces = () => {
    reFreshAll();
    close();
  };
  useEffect(() => {
    if (config?.mockData && config?.mockData?.customFn) {
      setCustomFn(config?.mockData?.customFn);
      setDefaultCustomFnKeys(Object.keys(config?.mockData?.customFn));
    }
  }, [config]);
  return (
    <div className="h-full">
      <div className="flex flex-col" style={{ height: "calc(100% - 42px)" }}>
        <ConfigTab
          activeKey={activeKey}
          readonly={!editable}
          defaultCustomFnKeys={defaultCustomFnKeys}
          handleDeleteTabs={handleDeleteTabs}
          handleAddTab={handleAddTab}
          handleUpdateTabName={handleUpdateTabName}
          handleUpdateActive={handleUpdateActive}
        ></ConfigTab>
        <div className="flex-1">
          {activeKey === "JSON配置" ? (
            <JsonEditor
              defaultValue={defaultBuiltInData}
              readonly={!editable}
              setValue={setBuiltInData}
            ></JsonEditor>
          ) : (
            <JavascriptEditor
              customFn={customFn}
              readonly={!editable}
              activeKey={activeKey}
              updateValue={handleUpdateFn}
            ></JavascriptEditor>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center pt-[10px] px-[10px]">
        <Space>
          <Button
            type="dashed"
            onClick={handleStartSetting}
            danger
            icon={<ToolOutlined />}
          >
            重新模拟
          </Button>
          <UploadJsonConfig
            configId={config._id}
            reFreshAll={handleUploadSuccces}
            messageApi={messageApi}
          >
            <Button type="dashed" danger icon={<UploadOutlined />}>
              上传配置
            </Button>
          </UploadJsonConfig>
          <Button
            type="dashed"
            icon={<DeleteOutlined />}
            danger
            onClick={handleDeleteTask}
          >
            删除
          </Button>
        </Space>

        <Space>
          {editable ? (
            <>
              <Button type="primary" onClick={handleSubmit}>
                提交修改
              </Button>
              <Button onClick={() => setEditable(false)}>取消</Button>
            </>
          ) : (
            <>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditable(true)}
              >
                编辑
              </Button>
              <Button onClick={close}>关闭</Button>
            </>
          )}
        </Space>
      </div>
    </div>
  );
}

function NoTaskConfig({
  config,
  handleStartSetting,
  handleDeleteTask,
  reFreshAll,
}: {
  config: any;
  handleStartSetting: any;
  handleDeleteTask: any;
  reFreshAll: any;
}) {
  return (
    <Result
      className="h-full flex flex-col justify-center"
      title="当前没有模拟数据"
      extra={
        <Space>
          <Button
            type="dashed"
            icon={<AimOutlined />}
            onClick={handleStartSetting}
          >
            开始模拟
          </Button>
          <UploadJsonConfig configId={config._id} reFreshAll={reFreshAll}>
            <Button icon={<UploadOutlined />} type="dashed">
              上传文件
            </Button>
          </UploadJsonConfig>
          <Button
            icon={<DeleteOutlined />}
            onClick={handleDeleteTask}
            type="dashed"
            danger
          >
            删除任务
          </Button>
        </Space>
      }
    />
  );
}

function App({
  data,
  reflash,
  modal,
  messageApi,
  drwerHeight,
}: {
  data: any;
  reflash: any;
  modal: any;
  messageApi: any;
  drwerHeight: number;
}) {
  const [config, setConfig] = useState<any>({});
  const [modalVisible, setModalVisible] = useState(false);
  const handleOpenDrawer = () => {
    setModalVisible(true);
  };
  const handleClose = () => {
    setModalVisible(false);
  };
  const reFreshAll = () => {
    reflash();
    handleGetTaskConfigDetail();
  };
  const handleStartSetting = async () => {
    await startSetting({
      ...config,
      mockData: "",
    });
    reFreshAll();
  };
  const handleGetTaskConfigDetail = async () => {
    const result = await getTaskConfigDetail({ _id: data._id });
    if (result.mockData) {
      try {
        const mockData = JSON.parse(result.mockData);
        result.mockData = mockData;
      } catch (e) {
        console.log(e);
        result.mockData = {};
      }
    }
    setConfig(result);
  };
  const handleDeleteTask = () => {
    modal.confirm({
      title: "是否要删除该任务",
      icon: <ExclamationCircleFilled></ExclamationCircleFilled>,
      content: "删除该任务后，该任务所得数据将会同步删除",
      async onOk() {
        await deleteTask({ _id: config._id });
        messageApi.success("删除成功");
        reflash();
      },
      onCancel() {},
    });
  };
  const handleDebugTask = async () => {
    const result = await debugPlay({
      _id: data._id,
      mockDataId: data.mockDataId,
      targetUrl: data.targetUrl,
    });
  };
  useEffect(() => {
    if (modalVisible) {
      handleGetTaskConfigDetail();
    }
  }, [modalVisible]);
  return (
    <>
      <Button type="link" style={{ padding: "0px" }} onClick={handleOpenDrawer}>
        配置
      </Button>
      <Drawer
        style={{ height: `${drwerHeight}px` }}
        title={
          <div className="w-full flex items-center justify-between">
            <div>任务配置</div>
            <div>
              {data.mockDataId && (
                <Button icon={<BugOutlined />} onClick={handleDebugTask}>
                  调试任务
                </Button>
              )}
            </div>
          </div>
        }
        placement="right"
        width={1200}
        destroyOnClose={true}
        onClose={handleClose}
        open={modalVisible}
      >
        {config?.mockDataId ? (
          <EditorBox
            handleStartSetting={handleStartSetting}
            handleDeleteTask={handleDeleteTask}
            config={config}
            messageApi={messageApi}
            close={handleClose}
            reFreshAll={reFreshAll}
          ></EditorBox>
        ) : (
          <NoTaskConfig
            config={config}
            reFreshAll={reFreshAll}
            handleStartSetting={handleStartSetting}
            handleDeleteTask={handleDeleteTask}
          ></NoTaskConfig>
        )}
      </Drawer>
    </>
  );
}

export default App;
