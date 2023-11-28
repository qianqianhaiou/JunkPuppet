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
} from "antd";
import { useEffect, useState } from "react";
import {
  deleteTaskDataDb,
  getTaskDataDetail,
  startPlay,
} from "@/service/index";
import { translateDate } from "@/utils/translator";
import style from "../style.module.scss";
import { formatSnapshotType } from "@/utils/format";
import { useSettingStore } from "@/views/stores";
import {
  DeleteOutlined,
  ExclamationCircleFilled,
  ReloadOutlined,
} from "@ant-design/icons";

function ListItem({ data, taskId }: { data: any; taskId: string }) {
  const DATA_PATH_SNAPSHOT = useSettingStore(
    (state) => state.DATA_PATH_SNAPSHOT
  );
  const snapshotPath = (uid: string) => {
    return `file:///${DATA_PATH_SNAPSHOT}\\${taskId}\\${uid}.png`;
  };
  return (
    <div className="h-full overflow-y-auto f-beautify-scrollbar">
      <div>
        <div className="mb-[30px] ">
          <Alert
            className="px-[10px] py-[20px] bg-[#292929] border-[#292929]"
            message={
              <div className="text-[20px] font-bold pl-[12px]">文本数据</div>
            }
            type="success"
            description={
              <Row style={{ margin: "0px" }} gutter={[16, 16]}>
                {data.texts.map((item: any, index: number) => {
                  return (
                    <Col span={8} key={index}>
                      <Card
                        title={
                          <div>{item.label || "未命名" + (index + 1)}</div>
                        }
                        bordered={false}
                      >
                        <div>
                          {item.values.map(
                            (textItem: string, index: number) => {
                              return (
                                <div className="mb-[10px]" key={index}>
                                  {textItem}
                                </div>
                              );
                            }
                          )}
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
            className="px-[10px] py-[20px] bg-[#292929] border-[#292929]"
            message={
              <div className="text-[20px] font-bold pl-[12px]">截图数据</div>
            }
            type="success"
            description={
              <Row style={{ margin: "0px" }} gutter={[16, 16]}>
                {data.snapshots.map((item: any, index: number) => {
                  return (
                    <Col span={8} key={index}>
                      <Card
                        title={<div>{formatSnapshotType(item.type)}</div>}
                        bordered={false}
                      >
                        <div>
                          <div className="text-center">
                            {item.snapshotName || "未命名" + (index + 1)}
                          </div>
                          <div className="flex justify-center flex-wrap mt-[10px]">
                            {item.uids ? (
                              item.uids.map((uid: string) => {
                                return (
                                  <Image
                                    className="mb-[10px]"
                                    key={uid}
                                    width={200}
                                    src={snapshotPath(uid)}
                                  />
                                );
                              })
                            ) : (
                              <Image width={200} src={snapshotPath(item.uid)} />
                            )}
                          </div>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            }
          />
          <div></div>
        </div>
      </div>
    </div>
  );
}

function App({
  modal,
  messageApi,
  data,
}: {
  modal: any;
  messageApi: any;
  data: any;
}) {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [list, setList] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const handlePlay = async () => {
    setLoading(true);
    const result = await startPlay({
      _id: data._id,
      mockDataId: data.mockDataId,
      targetUrl: data.targetUrl,
    });
    setLoading(false);
    fetchList();
  };
  const handleDeleteAllTaskData = async () => {
    modal.confirm({
      title: "警告",
      icon: <ExclamationCircleFilled></ExclamationCircleFilled>,
      content: "该操作将删除该任务的所以所得数据，是否继续",
      async onOk() {
        const result = await deleteTaskDataDb({
          taskId: data._id,
        });
        messageApi.success("删除成功");
        setModalVisible(false);
      },
      onCancel() {},
    });
  };
  const fetchList = async () => {
    const result = await getTaskDataDetail({ _id: data._id });
    setList(result);
  };
  const handleOpenDrawer = () => {
    setModalVisible(true);
  };
  const handleClose = () => {
    setModalVisible(false);
  };
  useEffect(() => {
    if (modalVisible) {
      fetchList();
    }
  }, [modalVisible]);
  return (
    <>
      <Button type="link" style={{ padding: "0px" }} onClick={handleOpenDrawer}>
        详情
      </Button>
      <Drawer
        className={loading ? style.Drawer : style.DrawerScroll}
        title={
          <div className="w-full flex items-center justify-between">
            <div>
              <span>任务详情</span>
              <span>（共 {list.length} 条）</span>
            </div>
            <div>
              {data.mockDataId && (
                <Space>
                  {list.length ? (
                    <Button
                      type="dashed"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleDeleteAllTaskData}
                    >
                      删除全部数据
                    </Button>
                  ) : null}
                  <Button onClick={handlePlay} icon={<ReloadOutlined />}>
                    运行脚本
                  </Button>
                </Space>
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
        <Spin
          size="large"
          tip={<div className="mt-[16px] font-bold text-[20px]">运行中...</div>}
          spinning={loading}
        >
          {list.length ? (
            <Tabs
              className={style.Tabs + " h-full"}
              defaultActiveKey="0"
              tabPosition="top"
              destroyInactiveTabPane={true}
              items={list.map((item: any, index: number) => {
                const id = String(index);
                return {
                  label: translateDate(item.createdAt, "YYYY-MM-DD HH:mm:ss"),
                  key: id,
                  children: <ListItem data={item} taskId={data._id}></ListItem>,
                };
              })}
            />
          ) : (
            <Result
              className="h-full flex flex-col justify-center"
              title="暂无数据"
            />
          )}
        </Spin>
      </Drawer>
    </>
  );
}

export default App;
