import { Button, Drawer, Dropdown, Modal, Radio, Result, Space, Upload } from 'antd';
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
import {
  SwapOutlined,
  RedoOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownOutlined,
  CodeSandboxOutlined,
} from '@ant-design/icons';
import JsonEditor from '@/components/JsonEditor';
import { GlobalContext } from '@/App';
import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { formatLifeHookType, formatOperateType } from '@/utils/format';
import JSModal from './JSModal';
import { TaskListContext } from '..';

echarts.use([TitleComponent, TooltipComponent, GraphChart, CanvasRenderer]);

const ViewTypes = [
  {
    label: '任务流',
    value: 'flow',
  },
  {
    label: 'HOOKS',
    value: 'lifeHooks',
  },
  {
    label: '原始数据',
    value: 'json',
  },
];

function TaskFlow({ setTaskFlowVisible }: { setTaskFlowVisible: any }) {
  const { data } = useContext(TaskContext);
  const { drwerHeight } = useContext(GlobalContext);

  const [config, setConfig] = useState<any>({});
  const [viewType, setViewType] = useState('flow');
  const [flow, setFlow] = useState<any>({});

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
          <Radio.Group
            block
            buttonStyle='solid'
            options={ViewTypes}
            style={{ width: '300px' }}
            defaultValue='flow'
            optionType='button'
            onChange={(c) => {
              setViewType(c.target.value);
            }}
          />
          <Space>
            {config.mockDataId ? (
              <ReSettingTask
                config={config}
                fetchTaskConfigDetail={fetchTaskConfigDetail}></ReSettingTask>
            ) : null}
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
            <FlowChart
              flow={flow}
              jsonId={config?.mockDataId}
              fetchTaskConfigDetail={fetchTaskConfigDetail}></FlowChart>
          ) : null}
          {viewType === 'json' ? (
            <FlowJson flow={flow} jsonId={config?.mockDataId}></FlowJson>
          ) : null}
          {viewType === 'lifeHooks' ? (
            <LifeCycleHooks flow={flow} jsonId={config?.mockDataId}></LifeCycleHooks>
          ) : null}
        </>
      ) : (
        <NoFlow config={config} fetchTaskConfigDetail={fetchTaskConfigDetail}></NoFlow>
      )}
    </Drawer>
  ) : null;
}

const LifeCycleHooks = ({ flow, jsonId }: { flow: any; jsonId: string }) => {
  const { messageApi } = useContext(GlobalContext);
  const { refresh } = useContext(TaskListContext);
  const editFunction = useRef('');
  const [editJsVisible, setEditJsVisible] = useState(false);
  const [defaultJsCode, setDefaultJsCode] = useState('');
  const handleEditJs = (functionString: string) => {
    editFunction.current = functionString;
    setDefaultJsCode(flow.lifeHooks[editFunction.current]);
    setEditJsVisible(true);
  };
  const handleEditSave = async (code: string) => {
    flow.lifeHooks[editFunction.current] = code;
    const result = await updateTaskMockData({
      uid: jsonId,
      data: flow,
    });
    if (result === 'ok') {
      messageApi.success('保存成功');
      setEditJsVisible(false);
      refresh();
    }
  };
  const handleCloseEditModal = () => {
    setEditJsVisible(false);
  };
  return (
    <div>
      <div className='mb-[10px]'>HOOKS为任务运行时的生命周期钩子</div>
      <div className='flex items-center mb-[10px]'>
        <Button
          style={{ width: '220px' }}
          type='primary'
          icon={<CodeSandboxOutlined />}
          onClick={() => handleEditJs('onBeforeFirstNavigate')}>
          {formatLifeHookType('onBeforeFirstNavigate')}
        </Button>
      </div>
      <div className='flex items-center mb-[10px]'>
        <Button
          style={{ width: '220px' }}
          type='primary'
          icon={<CodeSandboxOutlined />}
          onClick={() => handleEditJs('onBeforeEachClickNavigate')}>
          {formatLifeHookType('onBeforeEachClickNavigate')}
        </Button>
      </div>
      <div className='flex items-center mb-[10px]'>
        <Button
          style={{ width: '220px' }}
          type='primary'
          icon={<CodeSandboxOutlined />}
          onClick={() => handleEditJs('onBeforeEachStep')}>
          {formatLifeHookType('onBeforeEachStep')}
        </Button>
      </div>
      <div className='flex items-center mb-[10px]'>
        <Button
          style={{ width: '220px' }}
          type='primary'
          icon={<CodeSandboxOutlined />}
          onClick={() => handleEditJs('onAfterQueue')}>
          {formatLifeHookType('onAfterQueue')}
        </Button>
      </div>
      {editJsVisible ? (
        <JSModal
          defaultJsCode={defaultJsCode}
          handleCloseEditModal={handleCloseEditModal}
          handleEditSave={handleEditSave}></JSModal>
      ) : null}
    </div>
  );
};

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
  const { refresh } = useContext(TaskListContext);
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
      refresh();
      return false;
    },
  };
  return <Upload {...props}>{children}</Upload>;
}

const FlowChart = ({
  flow,
  jsonId,
  fetchTaskConfigDetail,
}: {
  flow: any;
  jsonId: any;
  fetchTaskConfigDetail: any;
}) => {
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
  const handleDeleteStep = async () => {
    const newFlow = structuredClone(flow);
    const deleteItem = newFlow.operateListData.splice(currentStepIndex, 1);
    if (deleteItem.operateData?.type === 'customFn') {
      delete newFlow.customFn[deleteItem.operateData.customFn];
    }
    if (deleteItem?.previousLimit?.type === 'customFn') {
      delete newFlow.customFn[deleteItem.previousLimit.customFn];
    }
    const result = await updateTaskMockData({
      uid: jsonId,
      data: newFlow,
    });
    if (result === 'ok') {
      messageApi.success('操作成功');
      fetchTaskConfigDetail();
    }
  };
  const handleAddStep = async (type: string) => {
    const newFlow = structuredClone(flow);
    let params: any = {
      mainSelector: {
        iframeIndex: -1,
        selector: '',
        similar: true,
      },
      operateData: { type: type, label: '', name: formatOperateType(type) },
      parentLimit: null,
      previousLimit: null,
      recordList: null,
    };
    if (type === 'delay') {
      params.operateData.delay = 1000;
    } else if (type === 'snapshotCurrentScreen') {
      params.operateData.snapshotCurrentScreen = {
        scrollTop: 0,
        width: 1920,
        height: 1080,
      };
    } else if (type === 'snapshotFullScreen') {
    } else if (type === 'customFn') {
      const functionName = 'function' + (Object.keys(newFlow.customFn).length + 1);
      params.operateData.customFn = functionName;
      newFlow.customFn[functionName] = '';
    }
    newFlow.operateListData.splice(currentStepIndex + 1, 0, params);
    const result = await updateTaskMockData({
      uid: jsonId,
      data: newFlow,
    });
    if (result === 'ok') {
      messageApi.success('操作成功');
      fetchTaskConfigDetail();
    }
  };
  const [copyData, setCopyData] = useState(null);
  const handleCopyStep = async () => {
    const copyItem = flow.operateListData[currentStepIndex];
    setCopyData(copyItem);
  };
  const handlePasteData = async () => {
    const newFlow = structuredClone(flow);
    const pasteItem: any = structuredClone(copyData);
    newFlow.operateListData.splice(currentStepIndex + 1, 0, pasteItem);
    if (pasteItem?.operateData?.type === 'customFn') {
      const functionName = 'function' + (Object.keys(newFlow.customFn).length + 1);
      pasteItem.operateData.customFn = functionName;
      newFlow.customFn[functionName] = '';
    }
    const result = await updateTaskMockData({
      uid: jsonId,
      data: newFlow,
    });
    if (result === 'ok') {
      messageApi.success('操作成功');
      fetchTaskConfigDetail();
    }
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
        <Item onClick={handleCopyStep}>复制</Item>
        <Separator />
        {copyData ? (
          <>
            <Item onClick={handlePasteData}>粘贴</Item>
            <Separator />
          </>
        ) : null}
        <Submenu label='节点后添加'>
          <Item onClick={() => handleAddStep('delay')}>延迟</Item>
          <Item onClick={() => handleAddStep('snapshotCurrentScreen')}>截取当前屏幕</Item>
          <Item onClick={() => handleAddStep('snapshotFullScreen')}>截取全图</Item>
          <Item onClick={() => handleAddStep('customFn')}>自定义函数</Item>
        </Submenu>
        <Separator />
        <Item onClick={handleDeleteStep}>删除该节点</Item>
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
  const { refresh } = useContext(TaskListContext);
  const [url, setUrl] = useState('');
  const handleStartSetting = async () => {
    const result = await startSetting({
      ...config,
      mockData: '',
    });
    setUrl('');
    fetchTaskConfigDetail();
    refresh();
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
