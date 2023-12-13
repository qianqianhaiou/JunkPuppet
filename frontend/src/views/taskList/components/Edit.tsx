import { Button, Form, Input, Modal, Space, Switch } from "antd";
import { useEffect, useRef, useState } from "react";
import { addTask, deleteTask, updateTask } from "@/service/index";
import {
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { validCronString } from "@/utils/valid";

const cronStringValid = (rule: any, value: string) => {
  try {
    if (!value) {
      throw new Error("请输入Cron表达式");
    } else if (validCronString(value)) {
      return Promise.resolve(true);
    } else {
      throw new Error("请输入格式正确的Cron表达式");
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

function App({
  messageApi,
  modal,
  type,
  reflash,
  data,
}: {
  messageApi: any;
  modal: any;
  type: string;
  reflash: any;
  data?: any;
}) {
  const [modelVisible, setModelVisible] = useState(false);
  const [autoTask, setAutoTask] = useState(false);
  const formRef = useRef<any>(null);
  const handleOpen = () => {
    setModelVisible(true);
  };
  const handleClose = () => {
    setModelVisible(false);
  };
  const handleAutoChange = (type: any) => {
    if (type === true) {
      if (data.mockDataId) {
        setAutoTask(true);
      } else {
        setAutoTask(false);
        messageApi.warning("请先配置任务");
      }
    } else {
      setAutoTask(false);
    }
  };
  const handleDeleteTask = () => {
    modal.confirm({
      title: "是否要删除该任务",
      icon: <ExclamationCircleFilled />,
      content: "删除该任务后，该任务所得数据将会同步删除",
      async onOk() {
        await deleteTask({ _id: data._id });
        messageApi.success("删除成功");
        reflash();
      },
      onCancel() {},
    });
  };
  const onFinish = async (values: any) => {
    let result = "";
    if (type === "create") {
      result = await addTask({
        ...values,
        auto: false,
        cron: "",
      });
    } else {
      result = await updateTask({
        ...values,
        _id: data._id,
      });
    }
    if (result === "ok") {
      messageApi && messageApi.success("修改成功");
      reflash();
      setModelVisible(false);
    }
  };
  useEffect(() => {
    if (modelVisible && type === "edit") {
      formRef.current.setFieldValue("name", data.name);
      formRef.current.setFieldValue("targetUrl", data.targetUrl);
      formRef.current.setFieldValue("cron", data.cron);
      formRef.current.setFieldValue("auto", data.auto);
      setAutoTask(data.auto);
    }
  }, [modelVisible]);
  return (
    <div>
      {type === "create" ? (
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpen}>
          新建任务
        </Button>
      ) : (
        <Button
          type="link"
          onClick={handleOpen}
          style={{ paddingLeft: "0px", paddingRight: "0px" }}
        >
          编辑
        </Button>
      )}
      <Modal
        title={(type === "create" ? "新建" : "编辑") + "任务"}
        open={modelVisible}
        width={600}
        footer={null}
        onOk={handleClose}
        onCancel={handleClose}
      >
        <Form
          ref={formRef}
          name="control-ref"
          labelAlign="right"
          labelCol={{ span: 5, offset: 0 }}
          onFinish={onFinish}
          style={{ maxWidth: 600, marginTop: "20px" }}
        >
          <Form.Item name="name" label="任务名称" rules={[{ required: true }]}>
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item
            name="targetUrl"
            label="网站地址"
            rules={[{ required: true }]}
          >
            <Input placeholder="请输入网站地址" />
          </Form.Item>
          {type === "edit" && (
            <>
              <Form.Item name="auto" label="自动任务">
                <Switch
                  checked={autoTask}
                  checkedChildren="开启自动执行"
                  unCheckedChildren="关闭自动执行"
                  onChange={handleAutoChange}
                />
              </Form.Item>
              {autoTask && (
                <Form.Item
                  name="cron"
                  label="任务周期"
                  rules={[
                    {
                      required: true,
                      validator: cronStringValid,
                    },
                  ]}
                >
                  <Input placeholder="请输入Cron表达式" />
                </Form.Item>
              )}
            </>
          )}

          <Form.Item className="mb-[0px]">
            <div className="flex justify-between">
              {type !== "create" ? (
                <Button
                  danger
                  type="dashed"
                  onClick={handleDeleteTask}
                  icon={<DeleteOutlined />}
                >
                  删除
                </Button>
              ) : (
                <div></div>
              )}
              <Space>
                <Button type="primary" htmlType="submit">
                  提 交
                </Button>
                <Button htmlType="button" onClick={handleClose}>
                  取 消
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
export default App;
