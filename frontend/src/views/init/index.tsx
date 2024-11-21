import { useEffect, useRef, useState } from 'react';
import { selectDir, setGlobalSetting, selectFile, searchChromePath } from '@/service';
import { Button, Input, message, Modal, Space, Steps, Tag } from 'antd';
import {
  SelectOutlined,
  ArrowLeftOutlined,
  ArrowDownOutlined,
  SearchOutlined,
} from '@ant-design/icons';

function Init() {
  const [chromePath, setChromePath] = useState('');
  const [basePath, setBasePath] = useState('');

  const [mail, setMail] = useState('');
  const [mailToken, setMailToken] = useState('');

  const [step, setStep] = useState(0);
  const handleSelectDir = async () => {
    const result = await selectDir({});
    if (!result) return;
    setBasePath(result);
    setStep((c) => c + 1);
  };
  const handleSelectFile = async () => {
    const result = await selectFile({});
    if (!result) return;
    setChromePath(result);
    setStep((c) => c + 1);
  };

  const handleSearchChromePath = async () => {
    const result = await searchChromePath({});
    if (!result) {
      message.warning('检测失败，请手动选择');
      return;
    }
    setChromePath(result);
  };

  const handleMailChange = (e: any) => {
    setMail(e.target.value);
  };
  const handleMailTokenChange = (e: any) => {
    setMailToken(e.target.value);
  };
  const handleBackStep = () => {
    setStep((c) => c - 1);
  };
  const handleNextStep = () => {
    setStep((c) => c + 1);
  };
  const [modal, contextHolder] = Modal.useModal();
  const handleSubmit = async () => {
    modal.confirm({
      title: '提示',
      content: '请确认初始化配置，提交之后软件将重新启动',
      onOk: () => {
        setGlobalSetting({
          chrome_path: chromePath,
          data_path: basePath,
          mail: mail,
          mail_token: mailToken,
        });
      },
    });
  };
  return (
    <div className='h-full'>
      {contextHolder}
      <div className='text-[22px] py-[30px] font-bold text-center'>初始化应用程序</div>
      <div className='flex justify-center' style={{ height: 'calc(100% - 150px)' }}>
        <Steps
          className='w-[320px] flex-shrink-0'
          direction='vertical'
          current={step}
          items={[
            {
              title: '选择Chrome应用程序',
              description: <div className='h-[100px]'></div>,
            },
            {
              title: '选择数据存放位置',
              description: <div className='h-[100px]'></div>,
            },
            {
              title: '邮件服务（可选）',
              description: <div className='h-[100px]'></div>,
            },
            {
              title: '确认',
              description: <div className='h-[100px]'></div>,
            },
          ]}
        />
        <div className='w-[600px] ml-[20px]'>
          {step === 0 && (
            <div className='text-center'>
              <div className='leading-[36px]'>
                <div>选择Chrome应用程序所在位置</div>
                <div>一般该应用程序被命名为chrome.exe</div>
                <div>一般被存放在：</div>
                <div className='whitespace-pre-line mt-[10px]' style={{ overflowWrap: 'anywhere' }}>
                  C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe
                </div>
              </div>
              {chromePath && (
                <div className='py-[30px]'>
                  <Tag className='text-[14px] px-[10px] py-[6px] whitespace-pre-wrap' color='lime'>
                    已选： {chromePath}
                  </Tag>
                </div>
              )}
              <Space>
                <Button
                  className='w-[200px] mt-[10px]'
                  size='large'
                  icon={<SelectOutlined />}
                  onClick={handleSelectFile}>
                  {chromePath ? '重新选择' : '手动选择'}
                </Button>
                <Button
                  className='w-[200px] mt-[10px]'
                  size='large'
                  icon={<SearchOutlined />}
                  onClick={handleSearchChromePath}>
                  自动检测位置
                </Button>
                {chromePath && (
                  <Button
                    className='w-[150px] mt-[10px]'
                    size='large'
                    type='primary'
                    icon={<ArrowDownOutlined />}
                    onClick={handleNextStep}>
                    下一步
                  </Button>
                )}
              </Space>
            </div>
          )}
          {step === 1 && (
            <div className='text-center'>
              <div className='leading-[36px]'>
                <div>请选择应用程序所产生的数据存放位置</div>
                <div>由于数据量在日常使用过程中会不断增加</div>
                <div>建议存放在非系统盘或机械硬盘中</div>
              </div>
              {basePath && (
                <div className='py-[30px]'>
                  <Tag className='text-[14px] px-[10px] py-[6px] whitespace-pre-wrap' color='lime'>
                    已选： {basePath}
                  </Tag>
                </div>
              )}
              <Space>
                <Button
                  className='w-[150px] mt-[10px]'
                  size='large'
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackStep}>
                  上一步
                </Button>
                <Button
                  className='w-[200px] mt-[10px]'
                  size='large'
                  type='primary'
                  icon={<SelectOutlined />}
                  onClick={handleSelectDir}>
                  {basePath ? '重新选择' : '选择'}
                </Button>
                {basePath && (
                  <Button
                    className='w-[150px] mt-[10px]'
                    size='large'
                    type='primary'
                    icon={<ArrowDownOutlined />}
                    onClick={handleNextStep}>
                    下一步
                  </Button>
                )}
              </Space>
            </div>
          )}
          {step === 2 && (
            <div className='text-center'>
              <div className='leading-[36px]'>
                <div>填写邮件服务Token（可选）</div>
              </div>
              <div className='w-[80%] mx-[auto] mt-[20px]'>
                <Space className='w-full' direction='vertical'>
                  <Input placeholder='mail' value={mail} onChange={handleMailChange}></Input>
                  <Input
                    placeholder='mailToken'
                    value={mailToken}
                    onChange={handleMailTokenChange}></Input>
                </Space>
              </div>
              <Space className='mt-[10px]'>
                <Button
                  className='w-[150px] mt-[10px]'
                  size='large'
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackStep}>
                  上一步
                </Button>
                <Button
                  className='w-[150px] mt-[10px]'
                  size='large'
                  type='primary'
                  icon={<ArrowDownOutlined />}
                  onClick={handleNextStep}>
                  下一步
                </Button>
              </Space>
            </div>
          )}
          {step === 3 && (
            <div className='text-center'>
              <div>请确认初始化配置，点击提交之后软件将重新启动。</div>
              <div>
                <div className='pt-[30px]'>
                  <Tag
                    className='w-full text-[14px] px-[10px] py-[6px] whitespace-pre-wrap'
                    color='lime'>
                    Chrome位置： {chromePath}
                  </Tag>
                </div>
                <div className='py-[20px]'>
                  <Tag
                    className='w-full text-[14px] px-[10px] py-[6px] whitespace-pre-wrap'
                    color='lime'>
                    数据存放位置： {basePath}
                  </Tag>
                </div>
              </div>
              <Space>
                <Button
                  className='w-[200px] mt-[10px]'
                  size='large'
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackStep}>
                  上一步
                </Button>
                <Button
                  className='w-[200px] mt-[10px]'
                  size='large'
                  icon={<SelectOutlined />}
                  type='primary'
                  onClick={handleSubmit}>
                  确认并提交
                </Button>
              </Space>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [iAgress, setIAgress] = useState(false);
  const [count, setCount] = useState(10);
  const countRef = useRef(10);
  const handleCheck = () => {
    setIAgress(true);
  };
  useEffect(() => {
    let timer: any = null;
    const countDownFn = () => {
      setCount((c) => {
        const target = c - 1;
        countRef.current = target;
        return target;
      });
      if (countRef.current > 1) {
        timer = setTimeout(countDownFn, 1000);
      }
    };
    timer = setTimeout(countDownFn, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  return iAgress ? (
    <Init></Init>
  ) : (
    <Modal title='免责声明' open={true} footer={null} closable={false}>
      <p>
        本软件是一个开源软件，遵循MIT许可证的条款，您可以自由地使用、复制、修改和分发本软件及其源代码，无需支付任何费用，也无需通知作者或版权所有者。但您必须在本软件的所有副本中保留原有的版权声明和许可证声明。
      </p>
      <p>
        本软件按“原样”提供，不作任何明示或暗示的保证，包括但不限于对适销性、适用性或不侵权的保证。在任何情况下，作者或版权所有者均不对因使用本软件或其源代码而引起的或与之相关的任何直接或间接的损害、责任或索赔负责，即使事先被告知此类损害的可能性。
      </p>
      <p>
        您使用本软件及其源代码的风险由您自己承担，您应该自行评估和验证本软件的功能和质量。作者或版权所有者不对本软件的任何错误、缺陷或漏洞承担任何责任，也不负责提供任何技术支持或维护服务。
      </p>
      <p>
        您应该遵守适用的法律法规，不得将本软件用于任何非法或不道德的目的，也不得侵犯他人的合法权益。如果您违反了本免责声明的任何条款，您的使用许可将自动终止，作者或版权所有者有权要求您停止使用本软件，并销毁本软件的所有副本。
      </p>
      <div className='text-center'>
        <Button type='primary' disabled={Boolean(count)} onClick={handleCheck}>
          我同意遵守以上规则 {count ? count + 's' : ''}
        </Button>
      </div>
    </Modal>
  );
}
export default App;
