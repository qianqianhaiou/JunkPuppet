import { useContext, useRef, useState } from 'react';
import { TaskContext } from './List';
import { Button, Checkbox, Drawer, Input, InputNumber, Radio, Space, Switch, Tag } from 'antd';
import { CopyOutlined, CodeSandboxOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { formatOperateType, formatPreviousLimitType } from '@/utils/format';
import { MOUSEKEY_EVENTS, NAVIGATOR_WAITUTIL } from '@/utils/const';
import JSModal from './JSModal';
import { updateTaskMockData } from '@/service';
import { GlobalContext } from '@/App';
import { TaskListContext } from '..';

function TaskStepEdit({
  stepData,
  jsonId,
  flow,
  currentStepIndex,
  setStepEditVisible,
}: {
  stepData: any;
  jsonId: string;
  flow: any;
  currentStepIndex: any;
  setStepEditVisible: any;
}) {
  const { messageApi, drwerHeight } = useContext(GlobalContext);
  const { refresh } = useContext(TaskListContext);

  const [step, setStep] = useState(stepData);
  const [editJsVisible, setEditJsVisible] = useState(false);
  const handleMainSelectorChange = (e: any) => {
    console.log(e.target.value);
    setStep({
      ...step,
      mainSelector: {
        ...step.mainSelector,
        selector: e.target.value,
      },
    });
  };
  const handleParentLimitChange = (e: any) => {
    console.log(e.target.value);
    setStep({
      ...step,
      parentLimit: {
        ...step.parentLimit,
        selector: {
          ...step.parentLimit.selector,
          selector: e.target.value,
        },
      },
    });
  };
  const handlePreviousLimitChange = (e: any) => {
    console.log(e.target.value);
    setStep({
      ...step,
      previousLimit: {
        ...step.previousLimit,
        selector: {
          ...step.previousLimit.selector,
          selector: e.target.value,
        },
      },
    });
  };

  const handleLabelChange = (e: any) => {
    setStep({
      ...step,
      operateData: {
        ...step.operateData,
        label: e.target.value,
      },
    });
  };
  const handleClickButtonChange = (e: any) => {
    setStep({
      ...step,
      operateData: {
        ...step.operateData,
        clickElement: {
          ...step.operateData.clickElement,
          button: e.target.value,
        },
      },
    });
  };
  const handleClickCountChange = (e: any) => {
    setStep({
      ...step,
      operateData: {
        ...step.operateData,
        clickElement: {
          ...step.operateData.clickElement,
          clickCount: e,
        },
      },
    });
  };
  const handleClickDelayChange = (e: any) => {
    setStep({
      ...step,
      operateData: {
        ...step.operateData,
        clickElement: {
          ...step.operateData.clickElement,
          delay: e,
        },
      },
    });
  };
  const handleCopySelector = (text: string) => {
    let textCopy = document.createElement('textarea');
    textCopy.value = text;
    document.body.appendChild(textCopy);
    textCopy.select();
    if (document.execCommand('copy')) {
      messageApi.success('复制成功');
    }
    document.body.removeChild(textCopy);
  };
  const handleInsertTextChange = (e: any) => {
    setStep({
      ...step,
      operateData: {
        ...step.operateData,
        insertText: e.target.value,
      },
    });
  };

  const editFunction = useRef('');
  const [defaultJsCode, setDefaultJsCode] = useState('');
  const handleEditJs = (functionString: string) => {
    editFunction.current = functionString;
    setDefaultJsCode(flow.customFn[editFunction.current]);
    setEditJsVisible(true);
  };
  const handleEditSave = async (code: string) => {
    flow.customFn[editFunction.current] = code;
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
  const handleSubmit = async () => {
    flow.operateListData[currentStepIndex] = step;
    const result = await updateTaskMockData({
      uid: jsonId,
      data: flow,
    });
    if (result === 'ok') {
      messageApi.success('保存成功');
      setStepEditVisible(false);
      refresh();
    }
  };
  const handleClose = () => {
    setStepEditVisible(false);
  };
  return (
    <>
      <Drawer
        style={{ height: `${drwerHeight}px` }}
        title={
          <div className='w-full flex items-center justify-between'>
            <div>{step.operateData.name}</div>
          </div>
        }
        push={false}
        placement='right'
        width={600}
        destroyOnClose={true}
        onClose={handleClose}
        footer={
          <div className='flex justify-end'>
            <Space>
              <Button onClick={handleClose}>取消</Button>
              <Button type='primary' onClick={handleSubmit}>
                保存
              </Button>
            </Space>
          </div>
        }
        open={true}>
        {step?.mainSelector?.selector ? (
          <div className='mb-[10px]'>
            <div className='mb-[5px] flex items-center'>
              <div>元素选择：</div>
              {step.mainSelector.iframeIndex > -1 ? <Tag color='green'>Iframe</Tag> : null}
              {step.mainSelector.similar ? <Tag color='orange'>相似</Tag> : null}
            </div>
            <div>
              <Input
                defaultValue={step?.mainSelector?.selector}
                onChange={handleMainSelectorChange}
                addonAfter={
                  <CopyOutlined onClick={() => handleCopySelector(step?.mainSelector?.selector)} />
                }></Input>
            </div>
          </div>
        ) : null}
        {step?.parentLimit ? (
          <div className='mb-[10px]'>
            <div className='mb-[5px] flex items-center'>
              <div>父元素范围限制：</div>
              {step?.parentLimit?.selector.iframeIndex > -1 ? (
                <Tag color='green'>Iframe</Tag>
              ) : null}
              {step?.parentLimit?.selector.similar ? <Tag color='orange'>相似</Tag> : null}
            </div>
            <div>
              <Input
                defaultValue={step?.parentLimit?.selector?.selector}
                onChange={handleParentLimitChange}
                addonAfter={
                  <CopyOutlined
                    onClick={() => handleCopySelector(step?.parentLimit?.selector?.selector)}
                  />
                }></Input>
            </div>
          </div>
        ) : null}
        {step?.previousLimit ? (
          <div className='mb-[10px]'>
            <div className='mb-[5px] flex items-center'>
              <div>前置条件：</div>
              <Tag color='cyan'>{formatPreviousLimitType(step?.previousLimit?.type)}</Tag>
            </div>
            {['exist', 'inexistence'].includes(step?.previousLimit.type) ? (
              <div>
                <Input
                  defaultValue={step?.previousLimit?.selector?.selector}
                  onChange={handlePreviousLimitChange}
                  addonAfter={
                    <CopyOutlined
                      onClick={() => handleCopySelector(step?.previousLimit?.selector?.selector)}
                    />
                  }></Input>
              </div>
            ) : (
              <div className='flex items-center mt-[10px]'>
                <div className='flex-shrink-0'>函数内容：</div>
                <Button
                  type='primary'
                  icon={<CodeSandboxOutlined />}
                  onClick={() => handleEditJs(step.previousLimit.customFn)}>
                  点击查看
                </Button>
              </div>
            )}
          </div>
        ) : null}
        {step?.recordList ? (
          <div className='mb-[10px]'>
            <div className='mb-[10px]'>键鼠模拟数据：</div>
            <div>
              {/* 需优化精简 */}
              {step.recordList.map((item: any, index: number) => {
                return (
                  <>
                    <Tag className='mb-[8px]' color='volcano'>
                      {item?.data?.type
                        ? MOUSEKEY_EVENTS[item.type][item?.data?.type]
                        : MOUSEKEY_EVENTS[item.type]}
                    </Tag>
                    {index + 1 !== step.recordList.length ? (
                      <ArrowRightOutlined className='mr-[10px]' />
                    ) : null}
                  </>
                );
              })}
            </div>
          </div>
        ) : null}
        {step?.operateData?.type ? (
          <div className='mb-[10px]'>
            <div className='mb-[10px] flex items-center'>
              <div>操作类型：</div>
              <Tag color='orange'> {formatOperateType(step.operateData.type)}</Tag>
            </div>
            {step?.operateData?.type === 'getText' ? (
              <div className='flex items-center'>
                <div className='flex-shrink-0'>文本标题：</div>
                <Input defaultValue={step?.operateData?.label} onChange={handleLabelChange}></Input>
              </div>
            ) : null}
            {step?.operateData?.type === 'getElementSnapshot' ? (
              <div className='flex items-center'>
                <div className='flex-shrink-0'>截图标题：</div>
                <Input defaultValue={step?.operateData?.label} onChange={handleLabelChange}></Input>
              </div>
            ) : null}
            {step?.operateData?.type === 'getAttribute' ? (
              <>
                <div className='flex items-center mb-[10px]'>
                  <div className='flex-shrink-0'>属性标题：</div>
                  <Input
                    defaultValue={step?.operateData?.label}
                    onChange={handleLabelChange}></Input>
                </div>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>提取属性：</div>
                  <Tag color='volcano'>{step.operateData.getAttribute}</Tag>
                </div>
              </>
            ) : null}
            {step?.operateData?.type === 'insertText' ? (
              <div className='flex items-center'>
                <div className='flex-shrink-0'>输入文字：</div>
                <Input
                  defaultValue={step?.operateData?.insertText}
                  onChange={handleInsertTextChange}></Input>
              </div>
            ) : null}
            {step?.operateData?.type === 'clickElement' ? (
              <>
                <div className='flex items-center mb-[10px]'>
                  <div className='flex-shrink-0'>点击位置：</div>
                  <Radio.Group
                    onChange={handleClickButtonChange}
                    value={step?.operateData?.clickElement.button}>
                    <Radio value='left'>鼠标左键</Radio>
                    <Radio value='middle'>鼠标中键</Radio>
                    <Radio value='right'>鼠标右键</Radio>
                  </Radio.Group>
                </div>
                <div className='flex items-center mb-[10px]'>
                  <div className='flex-shrink-0'>点击次数：</div>
                  <InputNumber
                    min={1}
                    defaultValue={step?.operateData?.clickElement?.clickCount}
                    onChange={handleClickCountChange}></InputNumber>
                  <div className='ml-[10px] text-[12px] text-[#b0b0b0]'>
                    *按键的点击次数，可与延迟间隔搭配以防止过频
                  </div>
                </div>
                <div className='flex items-center mb-[10px]'>
                  <div className='flex-shrink-0'>延迟间隔：</div>
                  <InputNumber
                    min={0}
                    defaultValue={step?.operateData?.clickElement?.delay}
                    onChange={handleClickDelayChange}></InputNumber>
                  <div className='ml-[10px] text-[12px] text-[#b0b0b0]'>
                    *鼠标按下和松开的间隔时间
                  </div>
                </div>
              </>
            ) : null}
            {step?.operateData?.type === 'customFn' ? (
              <>
                <div className='flex items-center mb-[10px]'>
                  <div className='flex-shrink-0'>函数标题：</div>
                  <Input
                    defaultValue={step?.operateData?.label}
                    onChange={handleLabelChange}></Input>
                </div>
                <div className='flex items-center mt-[10px]'>
                  <div className='flex-shrink-0'>函数内容：</div>
                  <Button
                    type='primary'
                    icon={<CodeSandboxOutlined />}
                    onClick={() => handleEditJs(step.operateData.customFn)}>
                    点击查看
                  </Button>
                </div>
              </>
            ) : null}
            {step?.operateData?.type === 'clickAndWaitNavigator' ? (
              <>
                <div className='flex items-center mb-[10px]'>
                  <div className='flex-shrink-0'>超时时长：</div>
                  <InputNumber
                    min={1}
                    defaultValue={step?.operateData?.clickAndWaitNavigator?.timeout}
                    onChange={(e) => {
                      setStep({
                        ...step,
                        operateData: {
                          ...step.operateData,
                          clickAndWaitNavigator: {
                            ...step.operateData.clickAndWaitNavigator,
                            timeout: e,
                          },
                        },
                      });
                    }}></InputNumber>
                  <div className='ml-[10px] text-[12px] text-[#b0b0b0]'>
                    *页面导航超时判定时长（单位ms）
                  </div>
                </div>
                <div className='flex items-center mb-[10px]'>
                  <div className='flex-shrink-0'>地址改变：</div>
                  <Switch
                    defaultChecked={step?.operateData?.clickAndWaitNavigator?.urlChange}
                    onChange={(e) => {
                      setStep({
                        ...step,
                        operateData: {
                          ...step.operateData,
                          clickAndWaitNavigator: {
                            ...step.operateData.clickAndWaitNavigator,
                            urlChange: e,
                          },
                        },
                      });
                    }}
                  />
                  <div className='ml-[10px] text-[12px] text-[#b0b0b0]'>
                    *页面URL是否变化，如果没有则只需等待网络连接结束即可
                  </div>
                </div>
                {step?.operateData?.clickAndWaitNavigator?.urlChange ? (
                  <div className='flex items-start mb-[10px]'>
                    <div className='flex-shrink-0'>等待条件：</div>
                    <Checkbox.Group
                      defaultValue={step?.operateData?.clickAndWaitNavigator?.waitUntil}
                      onChange={(e) => {
                        setStep({
                          ...step,
                          operateData: {
                            ...step.operateData,
                            clickAndWaitNavigator: {
                              ...step.operateData.clickAndWaitNavigator,
                              waitUntil: e,
                            },
                          },
                        });
                      }}>
                      <div className='flex flex-col'>
                        {Object.entries(NAVIGATOR_WAITUTIL).map((item) => {
                          return <Checkbox value={item[0]}>{item[1]}</Checkbox>;
                        })}
                      </div>
                    </Checkbox.Group>
                  </div>
                ) : null}
              </>
            ) : null}
            {step?.operateData?.type === 'delay' ? (
              <div className='flex items-center'>
                <div className='flex-shrink-0'>延迟时长：</div>
                <InputNumber
                  min={0}
                  defaultValue={step?.operateData?.delay}
                  onChange={(e) => {
                    setStep({
                      ...step,
                      operateData: {
                        ...step.operateData,
                        delay: e,
                      },
                    });
                  }}></InputNumber>{' '}
                <div className='ml-[10px] text-[12px] text-[#b0b0b0]'>*单位ms</div>
              </div>
            ) : null}
            {step?.operateData?.type === 'snapshotFullScreen' ? (
              <div className='flex items-center'>
                <div className='flex-shrink-0'>截图标题：</div>
                <Input defaultValue={step?.operateData?.label} onChange={handleLabelChange}></Input>
              </div>
            ) : null}
            {step?.operateData?.type === 'snapshotCurrentScreen' ? (
              <>
                <div className='flex items-center mb-[10px]'>
                  <div className='flex-shrink-0'>截图标题：</div>
                  <Input
                    defaultValue={step?.operateData?.label}
                    onChange={handleLabelChange}></Input>
                </div>
                <div className='flex items-center mb-[10px]'>
                  <div className='flex-shrink-0'>滚动高度：</div>
                  <InputNumber
                    min={0}
                    defaultValue={step?.operateData?.snapshotCurrentScreen?.scrollTop}
                    onChange={(e) => {
                      setStep({
                        ...step,
                        operateData: {
                          ...step.operateData,
                          snapshotCurrentScreen: {
                            ...step.operateData.snapshotCurrentScreen,
                            scrollTop: e,
                          },
                        },
                      });
                    }}></InputNumber>{' '}
                  <div className='ml-[10px] text-[12px] text-[#b0b0b0]'>*单位px</div>
                </div>
                <div className='flex items-center mb-[10px]'>
                  <div className='flex-shrink-0'>截取宽度：</div>
                  <InputNumber
                    min={0}
                    defaultValue={step?.operateData?.snapshotCurrentScreen?.width}
                    onChange={(e) => {
                      setStep({
                        ...step,
                        operateData: {
                          ...step.operateData,
                          snapshotCurrentScreen: {
                            ...step.operateData.snapshotCurrentScreen,
                            width: e,
                          },
                        },
                      });
                    }}></InputNumber>{' '}
                  <div className='ml-[10px] text-[12px] text-[#b0b0b0]'>*单位px</div>
                </div>
                <div className='flex items-center mb-[10px]'>
                  <div className='flex-shrink-0'>截取高度：</div>
                  <InputNumber
                    min={0}
                    defaultValue={step?.operateData?.snapshotCurrentScreen?.height}
                    onChange={(e) => {
                      setStep({
                        ...step,
                        operateData: {
                          ...step.operateData,
                          snapshotCurrentScreen: {
                            ...step.operateData.snapshotCurrentScreen,
                            height: e,
                          },
                        },
                      });
                    }}></InputNumber>{' '}
                  <div className='ml-[10px] text-[12px] text-[#b0b0b0]'>*单位px</div>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </Drawer>
      {editJsVisible ? (
        <JSModal
          defaultJsCode={defaultJsCode}
          handleCloseEditModal={handleCloseEditModal}
          handleEditSave={handleEditSave}></JSModal>
      ) : null}
    </>
  );
}

export default TaskStepEdit;
