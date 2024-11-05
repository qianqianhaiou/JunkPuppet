import { Button, Space, Table, Modal, message, Tag, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { translateDate } from '@/utils/translator';
import Edit from './Edit';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { deleteTask, updateTask } from '@/service/index';
import Config from './Config';
import Detail from './Detail';
import TaskFlow from './TaskFlow';
import { createContext, useEffect, useState } from 'react';

export const TaskContext = createContext<any>({
  data: {},
  messageApi: null,
  modal: null,
  drwerHeight: 758,
});

function App({ reflash, list }: { reflash: Function; list: any[] }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [statusLoading, setStatusLoading] = useState(false);
  const handleTaskStatusChange = async (status: boolean, recard: any) => {
    if (status && !recard.cron) {
      messageApi.warning('请先点击编辑设置任务周期');
      recard.auto = false;
      return false;
    }
    setStatusLoading(true);
    recard.auto = status;
    await updateTask(recard);
    setStatusLoading(false);
  };

  const [drwerHeight, setDrawerHeight] = useState(window.innerHeight - 42);
  const computedDrawerHeight = () => {
    setDrawerHeight(window.innerHeight - 42);
  };
  useEffect(() => {
    window.addEventListener('resize', computedDrawerHeight);
    return () => {
      window.removeEventListener('resize', computedDrawerHeight);
    };
  }, []);

  const handleOpenTaskFlow = (data: any) => {
    setTaskData(data);
    setTaskFlowVisible(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      width: '240px',
      key: 'name',
      render(value, record, index) {
        return <div className='line-clamp-2'>{value}</div>;
      },
    },
    {
      title: '网站地址',
      dataIndex: 'targetUrl',
      key: 'targetUrl',
      render(value, record, index) {
        return <div className='line-clamp-2'>{value}</div>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: '170px',
      key: 'createdAt',
      render(value, record, index) {
        return <div>{translateDate(value)}</div>;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: '170px',
      key: 'updatedAt',
      render(value, record, index) {
        return <div>{translateDate(value)}</div>;
      },
    },
    {
      title: '任务状态',
      dataIndex: 'status',
      width: '100px',
      key: 'status',
      render(value, record, index) {
        if (!record.mockDataId) {
          return (
            <div className='text-center'>
              <Tag color='warning'>未配置</Tag>
            </div>
          );
        } else {
          return (
            <div className='text-center'>
              <Switch
                checkedChildren='自动'
                unCheckedChildren='手动'
                loading={statusLoading}
                checked={record.auto}
                onClick={(status: boolean) => handleTaskStatusChange(status, record)}
              />
            </div>
          );
        }
      },
    },
    {
      title: '操作',
      dataIndex: 'operator',
      width: '140px',
      key: 'operator',
      render(value, record, index) {
        return (
          <div>
            <Space>
              <Edit
                reflash={reflash}
                modal={modal}
                messageApi={messageApi}
                type='edit'
                data={record}></Edit>
              <div>
                <Button
                  type='link'
                  style={{ padding: '0px' }}
                  onClick={() => handleOpenTaskFlow(record)}>
                  配置
                </Button>
              </div>
              {/* <Config
                modal={modal}
                messageApi={messageApi}
                drwerHeight={drwerHeight}
                data={record}
                reflash={reflash}></Config> */}
              <Detail
                modal={modal}
                messageApi={messageApi}
                drwerHeight={drwerHeight}
                data={record}></Detail>
            </Space>
          </div>
        );
      },
    },
  ];

  const [taskFlowVisible, setTaskFlowVisible] = useState(false);
  const [taskData, setTaskData] = useState({});
  return (
    <div>
      {contextHolder}
      {modalContextHolder}
      <Table
        columns={columns}
        tableLayout='fixed'
        dataSource={list}
        rowKey='_id'
        pagination={{ pageSize: 8, showTotal: (total) => `共 ${total} 条` }}
      />
      <TaskContext.Provider value={{ data: taskData, messageApi, modal, drwerHeight }}>
        {taskFlowVisible ? <TaskFlow setTaskFlowVisible={setTaskFlowVisible}></TaskFlow> : null}
      </TaskContext.Provider>
    </div>
  );
}

export default App;
