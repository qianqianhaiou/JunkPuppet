import {
  Button,
  Drawer,
  Tabs,
  Image,
  Row,
  Card,
  Col,
  Alert,
  Spin,
  Result,
  Space,
  Dropdown,
} from 'antd';
import { useContext, useEffect, useState } from 'react';
import { deleteTaskDataDb, getTaskDataDetail, startPlay } from '@/service/index';
import { translateDate } from '@/utils/translator';
import style from '../style.module.scss';
import { formatOperateType } from '@/utils/format';
import { useSettingStore } from '@/views/stores';
import {
  DeleteOutlined,
  ExclamationCircleFilled,
  ReloadOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { GlobalContext } from '@/App';
import { TaskContext } from './List';

function ListItem({ data, taskId }: { data: any; taskId: string }) {
  const DATA_PATH_SNAPSHOT = useSettingStore((state) => state.DATA_PATH_SNAPSHOT);
  const snapshotPath = (uid: string) => {
    return `file:///${DATA_PATH_SNAPSHOT}\\${taskId}\\${uid}.png`;
  };
  console.log(data);
  return (
    <div className='h-full overflow-y-auto f-beautify-scrollbar'>
      <div>
        <div className='mb-[30px]'>
          <Alert
            className='px-[10px] py-[20px] bg-[#292929] border-[#292929]'
            message={<div className='text-[20px] font-bold pl-[12px]'>文本数据</div>}
            type='success'
            description={
              <Row style={{ margin: '0px' }} gutter={[16, 16]}>
                {data.texts.map((item: any, index: number) => {
                  return (
                    <Col span={8} key={index}>
                      <Card
                        title={
                          <div>
                            {item.label || '未命名' + (index + 1)}{' '}
                            <span className='text-[#b0b0b0]'>（{item?.values?.length}条）</span>
                          </div>
                        }
                        bordered={false}>
                        <div>
                          {item.values.map((textItem: string, index: number) => {
                            return (
                              <div className='mb-[10px]' key={index}>
                                {textItem}
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            }
          />
        </div>
        <div className='mb-[30px]'>
          <Alert
            className='px-[10px] py-[20px] bg-[#292929] border-[#292929]'
            message={<div className='text-[20px] font-bold pl-[12px]'>截图数据</div>}
            type='success'
            description={
              <Row style={{ margin: '0px' }} gutter={[16, 16]}>
                {data.snapshots.map((item: any, index: number) => {
                  return (
                    <Col span={8} key={index}>
                      <Card title={<div>{formatOperateType(item.type)}</div>} bordered={false}>
                        <div>
                          <div className='text-center'>
                            {item.label || '未命名' + (index + 1)}{' '}
                            <span className='text-[#b0b0b0]'>（{item?.uids?.length}条）</span>
                          </div>
                          <div className='flex justify-center flex-wrap mt-[10px]'>
                            {item?.uids?.length
                              ? item.uids.map((uid: string) => {
                                  return (
                                    <Image
                                      className='mb-[10px]'
                                      key={uid}
                                      width={200}
                                      src={snapshotPath(uid)}
                                    />
                                  );
                                })
                              : null}
                          </div>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            }
          />
        </div>
        <div>
          <Alert
            className='px-[10px] py-[20px] bg-[#292929] border-[#292929]'
            message={<div className='text-[20px] font-bold pl-[12px]'>自定义数据</div>}
            type='success'
            description={
              <Row style={{ margin: '0px' }} gutter={[16, 16]}>
                {data.customResult.map((item: any, index: number) => {
                  return (
                    <Col span={8} key={index}>
                      <Card
                        title={<div>{item.label || '未命名' + (index + 1)}</div>}
                        bordered={false}>
                        <div>{JSON.stringify(item)}</div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            }
          />
        </div>
      </div>
    </div>
  );
}

function App({ setDetailVisible }: { setDetailVisible: any }) {
  const { messageApi, modal, drwerHeight } = useContext(GlobalContext);
  const { data } = useContext(TaskContext);

  const [list, setList] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const handlePlay = async () => {
    setLoading(true);
    const result = await startPlay({
      _id: data._id,
      mockDataId: data.mockDataId,
      targetUrl: data.targetUrl,
      autoMail: data.autoMail,
      mail: data.mail,
    }).finally(() => {
      setLoading(false);
    });
    fetchList();
  };
  const handleDeleteAllTaskData = async () => {
    modal.confirm({
      title: '警告',
      icon: <ExclamationCircleFilled></ExclamationCircleFilled>,
      content: '该操作将删除该任务的所以所得数据，是否继续',
      async onOk() {
        const result = await deleteTaskDataDb({
          taskId: data._id,
        });
        messageApi.success('删除成功');
        setDetailVisible(false);
      },
      onCancel() {},
    });
  };
  const fetchList = async () => {
    const result = await getTaskDataDetail({ _id: data._id });
    setList(result);
  };

  const handleExportDetail = async () => {
    messageApi.info('开发中，尽请期待');
  };
  const handleClose = () => {
    setDetailVisible(false);
  };
  useEffect(() => {
    fetchList();
  }, []);

  return (
    <Drawer
      className={loading ? style.Drawer : style.DrawerScroll}
      style={{ height: `${drwerHeight}px` }}
      title={
        <div className='w-full flex items-center justify-between'>
          <div className='flex items-center'>
            <div>任务详情</div>
            <div>（共 {list.length} 条）</div>
            <Dropdown
              menu={{
                items: [
                  {
                    key: '1',
                    label: <div className='flex justify-center'>导出Excel</div>,
                  },
                  { key: '2', label: <div className='flex justify-center'>导出JSON</div> },
                ],
              }}>
              <Button type='text' icon={<ExportOutlined />} onClick={handleExportDetail}>
                导出全部数据
              </Button>
            </Dropdown>
          </div>
          <div>
            {data.mockDataId && (
              <Space>
                {list.length ? (
                  <Button
                    type='dashed'
                    danger
                    loading={loading}
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteAllTaskData}>
                    清空全部数据
                  </Button>
                ) : null}
                <Button
                  onClick={handlePlay}
                  loading={loading}
                  type='primary'
                  icon={<ReloadOutlined />}>
                  运行脚本
                </Button>
              </Space>
            )}
          </div>
        </div>
      }
      placement='right'
      width={1200}
      destroyOnClose={true}
      onClose={handleClose}
      open={true}>
      <Spin
        size='large'
        tip={<div className='mt-[16px] font-bold text-[20px]'>运行中...</div>}
        spinning={loading}>
        {list.length ? (
          <Tabs
            className={style.Tabs + ' h-full'}
            defaultActiveKey='0'
            tabPosition='top'
            destroyInactiveTabPane={true}
            items={list.map((item: any, index: number) => {
              const id = String(index);
              return {
                label: translateDate(item.createdAt, 'YYYY-MM-DD HH:mm:ss'),
                key: id,
                children: <ListItem data={item} taskId={data._id}></ListItem>,
              };
            })}
          />
        ) : (
          <Result className='h-full flex flex-col justify-center' title='暂无数据' />
        )}
      </Spin>
    </Drawer>
  );
}

export default App;
