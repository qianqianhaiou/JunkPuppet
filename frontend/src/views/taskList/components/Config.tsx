import {
  Button,
  Drawer,
  Input,
  Modal,
  Result,
  Space,
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
import {
  ToolOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  DeleteOutlined,
  BugOutlined,
  UploadOutlined,
  AimOutlined,
} from "@ant-design/icons";

function JsonBox({
  handleStartSetting,
  config,
  handleDeleteTask,
  messageApi,
  close,
}: {
  handleStartSetting: any;
  config: any;
  messageApi: any;
  handleDeleteTask: any;
  close: any;
}) {
  const [editable, setEditable] = useState(false);
  const [newMockData, setNewMockData] = useState("");
  const handleSubmit = async () => {
    try {
      JSON.parse(newMockData);
    } catch (e) {
      messageApi.error("JSON格式错误，请检查。");
      return false;
    }
    const result = await updateTaskMockData({
      uid: config.mockDataId,
      data: newMockData,
    });
    if (result === "ok") {
      messageApi.success("修改成功");
      setEditable(false);
    }
  };
  return (
    <div className="h-full">
      <div style={{ height: "calc(100% - 42px)" }}>
        <JsonEditor
          defaultValue={config.mockData}
          readonly={!editable}
          setValue={setNewMockData}
        ></JsonEditor>
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
    beforeUpload: async (file: any) => {
      const text = await readFileAsText(file);
      const result = await uploadJSONSetting({
        _id: config._id,
        data: text,
      });
      reFreshAll();
      return false;
    },
  };
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
          <Upload {...props}>
            <Button icon={<UploadOutlined />} type="dashed">
              上传文件
            </Button>
          </Upload>
          <Button icon={<DeleteOutlined />} onClick={handleDeleteTask} type="dashed" danger>
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
    handleGetTaskCOnfigDetail();
  };
  const handleStartSetting = async () => {
    await startSetting({
      ...config,
      mockData: "",
    });
    reFreshAll();
  };
  const handleGetTaskCOnfigDetail = async () => {
    const result = await getTaskConfigDetail({ _id: data._id });
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
      handleGetTaskCOnfigDetail();
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
          <JsonBox
            handleStartSetting={handleStartSetting}
            handleDeleteTask={handleDeleteTask}
            config={config}
            messageApi={messageApi}
            close={handleClose}
          ></JsonBox>
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
