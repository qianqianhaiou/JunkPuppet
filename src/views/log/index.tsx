import { getRecentLogs } from "@/service";
import VirtualList from "rc-virtual-list";
import { useEffect, useRef, useState } from "react";

function App() {
  const [list, setList] = useState<any[]>([]);
  const [height, setHeight] = useState(400);
  const vListRef = useRef<any>(null);
  const autoScrollKey = useRef<boolean>(true);
  const ColorMap: any = {
    "[INFO]": "#919191",
    "[WARN]": "#faad14",
    "[ERROR]": "#ff7875",
  };
  const itemHeight = 40;
  const onScroll = (e: any) => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === height) {
      autoScrollKey.current = true;
    } else {
      autoScrollKey.current = false;
    }
  };
  const computedContainerHeight = () => {
    const innerHeight = window.innerHeight - 42 - 38 - 36 - 36 - 40;
    setHeight(innerHeight);
  };
  const handleGetRecentLogs = async () => {
    const result = await getRecentLogs();
    setList(result);
  };
  const handleGetOneLog = (value: any) => {
    setList((c: any) => {
      return c.concat({
        time: value.time,
        type: value.type,
        message: value.message,
      });
    });
  };
  useEffect(() => {
    if (autoScrollKey.current) {
      vListRef.current.scrollTo({
        index: list.length,
        align: "bottom",
      });
    }
  }, [list]);
  useEffect(() => {
    handleGetRecentLogs().then(() => {
      window.onLog((_e: any, value: any) => {
        handleGetOneLog(value);
      });
    });
    computedContainerHeight();
    window.onresize = computedContainerHeight;
    return () => {
      window.onresize = null;
    };
  }, []);
  return (
    <div className="bg-[#212121]">
      <div className="h-[36px]"></div>
      <div className="h-[36px] bg-[#000] flex items-center justify-between py-[10px] px-[20px] mx-[20px]">
        <div className="font-bold">服务日志</div>
        <div></div>
      </div>
      <VirtualList
        className="px-[20px] pb-[20px] mx-[20px] bg-[#000]"
        ref={vListRef}
        data={list}
        height={height}
        itemHeight={itemHeight}
        itemKey={(item) => JSON.stringify(item)}
        onScroll={onScroll}
      >
        {(item: any) => (
          <div
            className="flex items-center"
            style={{
              height: `${itemHeight}px`,
              borderBottom: "1px dashed #4c4c4c",
            }}
          >
            <div
              className="leading-[18px] flex text-[14px]"
              style={{
                color: ColorMap[item.type],
              }}
            >
              <div className="flex-shrink-0 mr-[10px]">{item.time}</div>
              <div className="flex-shrink-0 mr-[10px]">{item.type}</div>
              <div className="line-clamp-2">{item.message}</div>
            </div>
          </div>
        )}
      </VirtualList>
      <div className="h-[36px]"></div>
    </div>
  );
}

export default App;
