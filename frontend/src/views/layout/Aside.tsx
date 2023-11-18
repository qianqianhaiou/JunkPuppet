import {
  SettingOutlined,
  UnorderedListOutlined,
  HomeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Menu, Tooltip } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import Terminal from "@/assets/images/icons/terminal.svg";
import { useEffect, useState } from "react";
const items: any = [
  {
    label: "首页",
    key: "/",
    icon: <HomeOutlined />,
  },
  {
    label: "任务列表",
    key: "/tasklist",
    icon: <UnorderedListOutlined />,
  },
  {
    label: "服务日志",
    key: "/logs",
    icon: <img src={Terminal} className="w-[16px] h-[16px]" alt="" />,
  },
  {
    label: "全局设置",
    key: "/setting",
    icon: <SettingOutlined />,
  },
];
function App() {
  const navigator = useNavigate();
  const local = useLocation();
  const MenuChange = (e: any) => {
    navigator(e.key);
  };
  return (
    <div className="h-full flex flex-col justify-between">
      <Menu
        defaultSelectedKeys={[local.pathname]}
        mode="inline"
        style={{ width: "60px", backgroundColor: "transparent" }}
        theme="dark"
        inlineCollapsed={true}
        onClick={MenuChange}
        items={items}
      />
      <div className="flex flex-col items-center justify-center pb-[20px]">
        <div className="cursor-pointer">
          <Tooltip placement="right" title="关于">
            <InfoCircleOutlined
              style={{ color: "#d1d1d1", fontSize: "20px" }}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
export default App;
