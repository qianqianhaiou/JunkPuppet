import { Button, Form, Input, Modal, Space, Switch } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { addTask, deleteTask, updateTask } from '@/service/index';
import { PlusOutlined, DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { validCronString, validateMail } from '@/utils/valid';
import { TaskContext } from './List';
import { GlobalContext } from '@/App';
import { TaskListContext } from '..';
import TextArea from 'antd/es/input/TextArea';

const cronStringValid = (rule: any, value: string) => {
  try {
    if (!value) {
      throw new Error('请输入Cron表达式');
    } else if (validCronString(value)) {
      return Promise.resolve(true);
    } else {
      throw new Error('请输入格式正确的Cron表达式');
    }
  } catch (err) {
    return Promise.reject(err);
  }
};
const mailStringValid = (rule: any, value: string) => {
  try {
    if (!value) {
      throw new Error('请输入邮件地址');
    } else if (validateMail(value)) {
      return Promise.resolve(true);
    } else {
      throw new Error('请输入格式正确的邮件地址');
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

function App({ type, setEditVisible }: { type: string; setEditVisible: any }) {
  const { refresh } = useContext(TaskListContext);
  const { data } = useContext(TaskContext);
  const { messageApi, modal } = useContext(GlobalContext);
  const [autoTask, setAutoTask] = useState(false);
  const [autoMail, setAutoMail] = useState(false);
  const formRef = useRef<any>(null);
  const handleClose = () => {
    setEditVisible(false);
  };
  const handleAutoChange = (type: any) => {
    if (type === true) {
      if (data.mockDataId) {
        setAutoTask(true);
      } else {
        setAutoTask(false);
        messageApi.warning('请先配置任务');
      }
    } else {
      setAutoTask(false);
    }
  };
  const handleAutoMailChange = (status: boolean) => {
    setAutoMail(status);
  };
  const handleDeleteTask = () => {
    modal.confirm({
      title: '是否要删除该任务',
      icon: <ExclamationCircleFilled />,
      content: '删除该任务后，该任务所得数据将会同步删除',
      async onOk() {
        await deleteTask({ _id: data._id });
        messageApi.success('删除成功');
        handleClose();
        refresh();
      },
      onCancel() {},
    });
  };
  const onFinish = async (values: any) => {
    let result = '';
    if (values.cookies) {
      try {
        const cookies = JSON.parse(values.cookies);
        if (!Array.isArray(cookies)) {
          throw new Error('请输入数组格式');
        }
      } catch (error: any) {
        return messageApi.error(`Cookies格式错误:${error?.message || '请检查'}`);
      }
    }
    if (type === 'create') {
      result = await addTask({
        ...values,
        auto: false,
        cron: '',
      });
    } else {
      result = await updateTask({
        ...values,
        _id: data._id,
      });
    }
    if (result === 'ok') {
      messageApi && messageApi.success('操作成功');
      handleClose();
      refresh();
    }
  };
  useEffect(() => {
    if (type === 'edit') {
      formRef.current.setFieldValue('name', data.name);
      formRef.current.setFieldValue('targetUrl', data.targetUrl);
      if (data.cookies) formRef.current.setFieldValue('cookies', JSON.stringify(data.cookies));
      formRef.current.setFieldValue('cron', data.cron);
      formRef.current.setFieldValue('auto', data.auto);
      formRef.current.setFieldValue('autoMail', data.autoMail);
      formRef.current.setFieldValue('mail', data.mail);
      setAutoTask(data.auto);
      setAutoMail(data.autoMail);
    }
  }, []);
  return (
    <Modal
      title={(type === 'create' ? '新建' : '编辑') + '任务'}
      open={true}
      width={600}
      footer={null}
      onOk={handleClose}
      onCancel={handleClose}>
      <Form
        ref={formRef}
        name='control-ref'
        labelAlign='right'
        labelCol={{ span: 5, offset: 0 }}
        onFinish={onFinish}
        style={{ maxWidth: 600, marginTop: '20px' }}>
        <Form.Item name='name' label='任务名称' rules={[{ required: true }]}>
          <Input placeholder='请输入任务名称' />
        </Form.Item>
        <Form.Item name='targetUrl' label='网站地址' rules={[{ required: true }]}>
          <Input placeholder='请输入网站地址' />
        </Form.Item>
        <Form.Item name='cookies' label='Cookies'>
          <TextArea placeholder='请输入Cookies（JSON数组格式）' rows={4} maxLength={8} />
        </Form.Item>
        {type === 'edit' && (
          <>
            <Form.Item name='auto' label='自动任务'>
              <Switch
                checked={autoTask}
                checkedChildren='开启自动执行'
                unCheckedChildren='关闭自动执行'
                onChange={handleAutoChange}
              />
            </Form.Item>
            {autoTask && (
              <Form.Item
                name='cron'
                label='任务周期'
                rules={[
                  {
                    required: true,
                    validator: cronStringValid,
                  },
                ]}>
                <Input placeholder='请输入Cron表达式' />
              </Form.Item>
            )}
          </>
        )}
        <>
          <Form.Item name='autoMail' label='发送邮件'>
            <Switch
              checked={autoMail}
              checkedChildren='开启'
              unCheckedChildren='关闭'
              onChange={handleAutoMailChange}
            />
          </Form.Item>
          {autoMail && (
            <Form.Item
              name='mail'
              label='邮件地址'
              rules={[
                {
                  required: true,
                  validator: mailStringValid,
                },
              ]}>
              <Input placeholder='请输入邮件地址' />
            </Form.Item>
          )}
        </>
        <Form.Item className='mb-[0px]'>
          <div className='flex justify-between'>
            {type !== 'create' ? (
              <Button danger type='dashed' onClick={handleDeleteTask} icon={<DeleteOutlined />}>
                删除
              </Button>
            ) : (
              <div></div>
            )}
            <Space>
              <Button type='primary' htmlType='submit'>
                提 交
              </Button>
              <Button htmlType='button' onClick={handleClose}>
                取 消
              </Button>
            </Space>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
export default App;
