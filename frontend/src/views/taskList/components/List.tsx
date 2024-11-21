import { Button, Space, Table, Modal, message, Tag, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { translateDate } from '@/utils/translator';
import Edit from './Edit';
import { deleteTask, updateTask } from '@/service/index';
import Detail from './Detail';
import TaskFlow from './TaskFlow';
import { createContext, useContext, useEffect, useState } from 'react';
import { GlobalContext } from '@/App';
import { TaskListContext } from '..';

export const TaskContext = createContext<{ data: any }>({
  data: {},
});

function App({ list }: { list: any[] }) {
  const { messageApi } = useContext(GlobalContext);
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
              <div>
                <Button
                  type='link'
                  onClick={() => {
                    setTaskData(record);
                    setEditVisible(true);
                  }}
                  style={{ paddingLeft: '0px', paddingRight: '0px' }}>
                  编辑
                </Button>
              </div>
              <div>
                <Button
                  type='link'
                  style={{ padding: '0px' }}
                  onClick={() => {
                    setTaskData(record);
                    setTaskFlowVisible(true);
                  }}>
                  配置
                </Button>
              </div>
              <div>
                <Button
                  type='link'
                  style={{ padding: '0px' }}
                  onClick={() => {
                    setTaskData(record);
                    setDetailVisible(true);
                  }}>
                  详情
                </Button>
              </div>
            </Space>
          </div>
        );
      },
    },
  ];

  const [taskFlowVisible, setTaskFlowVisible] = useState(false);
  const [taskData, setTaskData] = useState({});

  const [editVisible, setEditVisible] = useState(false);

  const [detailVisible, setDetailVisible] = useState(false);
  return (
    <div>
      <Table
        columns={columns}
        tableLayout='fixed'
        dataSource={list}
        rowKey='_id'
        pagination={{ pageSize: 8, showTotal: (total) => `共 ${total} 条` }}
      />
      <TaskContext.Provider value={{ data: taskData }}>
        {taskFlowVisible ? <TaskFlow setTaskFlowVisible={setTaskFlowVisible}></TaskFlow> : null}
        {editVisible ? <Edit type='edit' setEditVisible={setEditVisible}></Edit> : null}
        {detailVisible ? <Detail setDetailVisible={setDetailVisible}></Detail> : null}
      </TaskContext.Provider>
    </div>
  );
}

export default App;
