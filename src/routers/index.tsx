import { Suspense, lazy } from "react";
import Layout from "@/views/layout";
import Home from "@/views/home";
import { Spin } from "antd";
import { Navigate } from "react-router-dom";
const InitRouter = lazy(() => import("@/views/init"));
const SettingRouter = lazy(() => import("@/views/setting"));
const TaskListRouter = lazy(() => import("@/views/taskList"));

function LodingPage(props: any) {
  document.title = props.title;
  return (
    <Layout>
      <Suspense
        fallback={
          <div className="page-loading">
            <Spin size="large"></Spin>
          </div>
        }
      >
        {props.children}
      </Suspense>
    </Layout>
  );
}

export const defaultRouter: any[] = [
  {
    path: "/init",
    element: (
      <LodingPage title="初始化配置">
        <InitRouter></InitRouter>
      </LodingPage>
    ),
  },
  {
    path: "*",
    permission: "",
    element: <Navigate to={`/init`} replace />,
  },
];

export const optionalRouter: any[] = [
  {
    path: "/",
    element: (
      <LodingPage title="首页">
        <Home></Home>
      </LodingPage>
    ),
  },
  {
    path: "/tasklist",
    element: (
      <LodingPage title="任务列表">
        <TaskListRouter></TaskListRouter>
      </LodingPage>
    ),
  },
  {
    path: "/logs",
    element: (
      <LodingPage title="服务日志">
        <div>服务日志</div>
      </LodingPage>
    ),
  },
  {
    path: "/setting",
    element: (
      <LodingPage title="全局设置">
        <SettingRouter></SettingRouter>
      </LodingPage>
    ),
  },
  {
    path: "*",
    permission: "",
    element: <Navigate to={`/`} replace />,
  },
];
