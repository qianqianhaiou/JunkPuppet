import { Button, Drawer, Modal, Radio, Result, Space, Upload } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { TaskContext } from './List';
import {
  getTaskConfigDetail,
  killSetterProcess,
  maxWindow,
  startSetting,
  updateTaskMockData,
  uploadJSONSetting,
} from '@/service';
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent } from 'echarts/components';
import { GraphChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import TaskStepEdit from './TaskStepEdit';
import { SwapOutlined, RedoOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import JsonEditor from '@/components/JsonEditor';
import { GlobalContext } from '@/App';
import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

echarts.use([TitleComponent, TooltipComponent, GraphChart, CanvasRenderer]);

function TaskFlow({ setTaskFlowVisible }: { setTaskFlowVisible: any }) {
  const { data } = useContext(TaskContext);
  const { drwerHeight } = useContext(GlobalContext);

  const [config, setConfig] = useState<any>({});
  const [viewType, setViewType] = useState('flow');
  const [flow, setFlow] = useState<any>({});

  const toggleViewType = () => {
    setViewType(viewType === 'flow' ? 'json' : 'flow');
  };

  const fetchTaskConfigDetail = async () => {
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
    setFlow(result.mockData);
  };
  const handleClose = () => {
    setTaskFlowVisible(false);
  };
  useEffect(() => {
    fetchTaskConfigDetail();
  }, []);

  return config?.targetUrl ? (
    <Drawer
      style={{ height: `${drwerHeight}px` }}
      push={false}
      title={
        <div className='w-full flex items-center justify-between'>
          <div>{viewType === 'flow' ? '任务流' : '原始数据'}</div>
          <Space>
            {config.mockDataId ? (
              <ReSettingTask
                config={config}
                fetchTaskConfigDetail={fetchTaskConfigDetail}></ReSettingTask>
            ) : null}
            <Button type='text' icon={<SwapOutlined />} onClick={toggleViewType}>
              切换视图
            </Button>
          </Space>
        </div>
      }
      placement='right'
      width={1200}
      destroyOnClose={true}
      onClose={handleClose}
      open={true}>
      {config.mockDataId ? (
        <>
          {viewType === 'flow' ? (
            <FlowChart flow={flow} jsonId={config?.mockDataId}></FlowChart>
          ) : null}
          {viewType === 'json' ? (
            <FlowJson flow={flow} jsonId={config?.mockDataId}></FlowJson>
          ) : null}
        </>
      ) : (
        <NoFlow config={config} fetchTaskConfigDetail={fetchTaskConfigDetail}></NoFlow>
      )}
    </Drawer>
  ) : null;
}

function NoFlow({ config, fetchTaskConfigDetail }: { config: any; fetchTaskConfigDetail: any }) {
  return (
    <Result
      className='h-full flex flex-col justify-center'
      title='当前没有任务流数据'
      extra={
        <Space>
          <ReSettingTask
            config={config}
            fetchTaskConfigDetail={fetchTaskConfigDetail}></ReSettingTask>
          <UploadJsonConfig configId={config._id} fetchTaskConfigDetail={fetchTaskConfigDetail}>
            <Button color='default' variant='text' icon={<UploadOutlined />} type='dashed'>
              上传文件
            </Button>
          </UploadJsonConfig>
        </Space>
      }
    />
  );
}

function UploadJsonConfig({
  configId,
  fetchTaskConfigDetail,
  messageApi,
  children,
}: {
  configId: string;
  fetchTaskConfigDetail: any;
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
  const props: any = {
    showUploadList: false,
    beforeUpload: async (file: any) => {
      const text = await readFileAsText(file);
      const result = await uploadJSONSetting({
        _id: configId,
        data: text,
      });
      if (messageApi) {
        messageApi.success('覆盖成功');
      }
      fetchTaskConfigDetail();
      return false;
    },
  };
  return <Upload {...props}>{children}</Upload>;
}

const FlowChart = ({ flow, jsonId }: { flow: any; jsonId: any }) => {
  const { messageApi } = useContext(GlobalContext);

  const chartRef = useRef<any>(null);
  const [stepEditVisible, setStepEditVisible] = useState(false);
  const [stepData, setStepData] = useState();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const MENU_ID = 'flow-chart-menu';
  const { show } = useContextMenu({
    id: MENU_ID,
  });
  function calculatePointsCoordinates(
    canvasWidth: number,
    spacing: number,
    operateListData: any[],
  ): any[] {
    const points: any[] = [];
    const pointsPerRow = Math.floor(canvasWidth / spacing); // 每行的点数

    for (let i = 0; i < operateListData.length; i++) {
      const row = Math.floor(i / pointsPerRow);
      const isReversed = row % 2 === 1; // 判断当前行是否需要反向排列
      const col = isReversed ? pointsPerRow - 1 - (i % pointsPerRow) : i % pointsPerRow;
      const x = col * spacing + spacing / 2; // 点的x坐标
      const y = row * spacing + spacing / 2; // 点的y坐标
      const name = i + 1 + '.' + operateListData[i].operateData.name; // 点的名字
      points.push({ name, x, y, stepIndex: i });
    }
    return points;
  }

  const menuVisible = useRef(false);
  const handlePlanItemClick = () => {
    messageApi.info('开发中，尽请期待');
  };

  useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);
    const data = calculatePointsCoordinates(1200, 300, flow.operateListData);
    const links = [];
    for (let i = 0; i < data.length; i++) {
      if (i + 1 < data.length) {
        links.push({
          source: data[i].name,
          target: data[i + 1].name,
        });
      }
    }
    const option: any = {
      tooltip: {},
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'none',
          symbolSize: [80, 80],
          symbol: 'circle',
          roam: true,
          label: {
            show: true,
          },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [2, 10],
          edgeLabel: {
            fontSize: 20,
          },
          data: data,
          links: links,
          lineStyle: {
            opacity: 1,
            color: '#fff',
            width: 4,
          },
        },
      ],
    };
    option && myChart.setOption(option);
    myChart.on('click', function (params: any) {
      if (typeof params.data.stepIndex === 'number') {
        setCurrentStepIndex(params.data.stepIndex);
        setStepData(flow.operateListData[params.data.stepIndex]);
        setStepEditVisible(true);
      }
    });
    myChart.on('contextmenu', function (params: any) {
      if (typeof params.data.stepIndex === 'number') {
        menuVisible.current = true;
        setCurrentStepIndex(params.data.stepIndex);
        setStepData(flow.operateListData[params.data.stepIndex]);
      }
    });
  }, [flow]);

  return (
    <>
      <div
        style={{ width: '100%', height: '100%' }}
        ref={chartRef}
        onContextMenu={(e) => {
          if (menuVisible.current) {
            show({
              event: e,
            });
          }
        }}></div>
      {stepEditVisible ? (
        <TaskStepEdit
          stepData={stepData}
          jsonId={jsonId}
          flow={flow}
          currentStepIndex={currentStepIndex}
          setStepEditVisible={setStepEditVisible}></TaskStepEdit>
      ) : null}
      <Menu
        id={MENU_ID}
        theme='dark'
        onVisibilityChange={(e) => {
          menuVisible.current = false;
        }}>
        <Item onClick={handlePlanItemClick}>复制</Item>
        <Separator />
        <Item onClick={handlePlanItemClick}>粘贴</Item>
        <Separator />
        <Submenu label='节点后添加'>
          <Item onClick={handlePlanItemClick}>延迟</Item>
          <Item onClick={handlePlanItemClick}>截取当前屏幕</Item>
          <Item onClick={handlePlanItemClick}>截取全图</Item>
          <Item onClick={handlePlanItemClick}>自定义函数</Item>
        </Submenu>
        <Separator />
        <Item onClick={handlePlanItemClick}>删除该节点</Item>
      </Menu>
    </>
  );
};

const FlowJson = ({ flow, jsonId }: { flow: any; jsonId: string }) => {
  const [data, setData] = useState('');
  const [editable, setEditable] = useState(false);
  const { messageApi } = useContext(GlobalContext);
  const handleRecover = () => {
    setData(JSON.stringify(flow));
  };
  const handleCancel = () => {
    setData(JSON.stringify(flow));
    setEditable(false);
  };
  const handleSave = async () => {
    try {
      JSON.parse(data);
    } catch (e) {
      messageApi.error('JSON格式错误，请检查。');
      return false;
    }
    const result = await updateTaskMockData({
      uid: jsonId,
      data: JSON.parse(data),
    });
    if (result === 'ok') {
      messageApi.success('修改成功');
      setEditable(false);
    }
  };
  useEffect(() => {
    setData(JSON.stringify(flow));
  }, [flow]);
  return (
    <div className='w-full h-full'>
      <div style={{ height: 'calc(100% - 32px - 20px)' }}>
        <JsonEditor defaultValue={data} readonly={!editable} setValue={setData}></JsonEditor>
      </div>
      <div className='pt-[20px] text-right' style={{ height: '32px' }}>
        {editable ? (
          <div className='flex justify-between'>
            <Button onClick={handleRecover}>恢复初始数据</Button>
            <Space>
              <Button type='primary' onClick={handleSave}>
                保存
              </Button>
              <Button onClick={handleCancel}>取消</Button>
            </Space>
          </div>
        ) : (
          <Button type='primary' onClick={() => setEditable(true)}>
            编辑
          </Button>
        )}
      </div>
    </div>
  );
};
function ReSettingTask({
  config,
  fetchTaskConfigDetail,
}: {
  config: any;
  fetchTaskConfigDetail: any;
}) {
  const [url, setUrl] = useState('');
  const handleStartSetting = async () => {
    const result = await startSetting({
      ...config,
      mockData: '',
    });
    setUrl('');
    fetchTaskConfigDetail();
  };
  const handleCancel = async () => {
    const urlSplit = url.split('/');
    killSetterProcess({
      pageId: urlSplit[urlSplit.length - 1],
    });
  };
  useEffect(() => {
    window.openUrlInIframe(async (_e: any, value: any) => {
      if (value) {
        await maxWindow({});
        setUrl(value);
      }
    });
  }, []);
  return (
    <>
      <Button color='danger' variant='text' icon={<RedoOutlined />} onClick={handleStartSetting}>
        重新设置
      </Button>
      {url ? (
        <>
          <iframe
            className='fixed z-[2147483646] w-full left-0 top-[42px]'
            style={{ border: 'none', height: 'calc(100% - 42px)' }}
            src={url}></iframe>
          <div className='fixed flex items-center justify-between px-[20px] box-border z-[2147483647] w-full h-[42px] left-0 top-0 bg-[#282828]'>
            <div>任务流设置</div>
            <Button variant='solid' color='danger' onClick={handleCancel}>
              取消并废弃
            </Button>
          </div>
        </>
      ) : null}
    </>
  );
}
export default TaskFlow;
