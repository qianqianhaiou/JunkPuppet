import { Button, Space, Table, Modal, message, Tag, Switch } from "antd";
import type { ColumnsType } from "antd/es/table";
import { translateDate } from "@/utils/translator";
import Edit from "./Edit";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { deleteTask, updateTask } from "@/service/index";
import Config from "./Config";
import Detail from "./Detail";
import { useState } from "react";

function App({ reflash, list }: { reflash: Function; list: any[] }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [statusLoading, setStatusLoading] = useState(false);
  const handleTaskStatusChange = async (status: boolean, recard: any) => {
    if (status && !recard.cron) {
      messageApi.warning("请先点击编辑设置任务周期");
      return;
    }
    setStatusLoading(true);
    recard.auto = status;
    await updateTask(recard);
    setStatusLoading(false);
  };
  const columns: ColumnsType<any> = [
    {
      title: "任务名称",
      dataIndex: "name",
      width: "240px",
      key: "name",
      render(value, record, index) {
        return <div className="line-clamp-2">{value}</div>;
      },
    },
    {
      title: "网站地址",
      dataIndex: "targetUrl",
      key: "targetUrl",
      render(value, record, index) {
        return <div className="line-clamp-2">{value}</div>;
      },
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      width: "170px",
      key: "createdAt",
      render(value, record, index) {
        return <div>{translateDate(value)}</div>;
      },
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      width: "170px",
      key: "updatedAt",
      render(value, record, index) {
        return <div>{translateDate(value)}</div>;
      },
    },
    {
      title: "任务状态",
      dataIndex: "status",
      width: "100px",
      key: "status",
      render(value, record, index) {
        if (!record.mockDataId) {
          return (
            <div className="text-center">
              <Tag color="warning">未配置</Tag>
            </div>
          );
        } else {
          return (
            <div className="text-center">
              <Switch
                checkedChildren="自动"
                unCheckedChildren="手动"
                loading={statusLoading}
                checked={record.auto}
                onChange={(status: boolean) =>
                  handleTaskStatusChange(status, record)
                }
              />
            </div>
          );
        }
      },
    },
    {
      title: "操作",
      dataIndex: "operator",
      width: "140px",
      key: "operator",
      render(value, record, index) {
        return (
          <div>
            <Space>
              <Edit reflash={reflash} type="edit" data={record}></Edit>
              <Config
                modal={modal}
                messageApi={messageApi}
                data={record}
                reflash={reflash}
              ></Config>
              <Detail
                modal={modal}
                messageApi={messageApi}
                data={record}
              ></Detail>
            </Space>
          </div>
        );
      },
    },
  ];
  return (
    <div>
      {contextHolder}
      {modalContextHolder}
      <Table
        columns={columns}
        tableLayout="fixed"
        dataSource={list}
        rowKey="_id"
        pagination={{ showTotal: (total) => `共 ${total} 条` }}
      />
    </div>
  );
}

export default App;
