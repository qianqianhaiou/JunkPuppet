import { Suspense, lazy } from 'react';
import Layout from '@/views/layout';
import Home from '@/views/home';
import { Spin } from 'antd';
import { Navigate } from 'react-router-dom';
const InitRouter = lazy(() => import('@/views/init'));
const SettingRouter = lazy(() => import('@/views/setting'));
const TaskListRouter = lazy(() => import('@/views/taskList'));
const ManualjsRouter = lazy(() => import('@/views/manualjs'));
const ManualjsEditorRouter = lazy(() => import('@/views/manualjs/editor'));
const LogRouter = lazy(() => import('@/views/log'));

function LodingPage(props: any) {
  document.title = props.title;
  return (
    <Layout>
      <Suspense
        fallback={
          <div className='page-loading'>
            <Spin size='large'></Spin>
          </div>
        }>
        {props.children}
      </Suspense>
    </Layout>
  );
}

export const defaultRouter: any[] = [
  {
    path: '/init',
    element: (
      <LodingPage title='初始化配置'>
        <InitRouter></InitRouter>
      </LodingPage>
    ),
  },
  {
    path: '*',
    permission: '',
    element: <Navigate to={`/init`} replace />,
  },
];

export const optionalRouter: any[] = [
  {
    path: '/',
    element: (
      <LodingPage title='首页'>
        <Home></Home>
      </LodingPage>
    ),
  },
  {
    path: '/tasklist',
    element: (
      <LodingPage title='任务列表'>
        <TaskListRouter></TaskListRouter>
      </LodingPage>
    ),
  },
  {
    path: '/manualjs',
    element: (
      <LodingPage title='代码箱'>
        <ManualjsRouter></ManualjsRouter>
      </LodingPage>
    ),
  },
  {
    path: '/manualjs/detail',
    element: (
      <LodingPage title='代码箱-编辑器'>
        <ManualjsEditorRouter></ManualjsEditorRouter>
      </LodingPage>
    ),
  },
  {
    path: '/logs',
    element: (
      <LodingPage title='服务日志'>
        <LogRouter></LogRouter>
      </LodingPage>
    ),
  },
  {
    path: '/setting',
    element: (
      <LodingPage title='全局设置'>
        <SettingRouter></SettingRouter>
      </LodingPage>
    ),
  },
  {
    path: '*',
    permission: '',
    element: <Navigate to={`/`} replace />,
  },
];
