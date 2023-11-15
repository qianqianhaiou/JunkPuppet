import VirtualList from "rc-virtual-list";
import { useEffect, useRef, useState } from "react";

function App() {
  const [list, setList] = useState<any>([]);
  const [height, setHeight] = useState(400);
  const vListRef = useRef<any>(null);
  const autoScrollKey = useRef<boolean>(true);
  const itemHeight = 40;
  const fetchList = async () => {
    setList((c: any) => {
      const length = c.length + 1;
      if (autoScrollKey.current) {
        vListRef.current.scrollTo({
          index: length,
          align: "bottom",
        });
      }
      return c.concat({
        _id: length,
      });
    });
  };
  const onScroll = (e: any) => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === height) {
      autoScrollKey.current = true;
    } else {
      autoScrollKey.current = false;
    }
  };
  const computedContainerHeight = () => {
    const innerHeight = window.innerHeight - 42 - 38;
    setHeight(innerHeight);
  };
  useEffect(() => {
    const timer = setInterval(() => {
      fetchList();
    }, 1000);
    computedContainerHeight();
    window.onresize = computedContainerHeight;
    return () => {
      clearInterval(timer);
      window.onresize = null;
    };
  }, []);
  return (
    <div>
      <div className="h-[36px] bg-[#2e2d2d]"></div>
      <VirtualList
        ref={vListRef}
        data={list}
        height={height}
        itemHeight={itemHeight}
        itemKey="_id"
        onScroll={onScroll}
      >
        {(item: any) => (
          <div
            className="flex items-center"
            style={{
              height: `${itemHeight}px`,
              borderBottom: "1px dashed #f1f1f1",
            }}
          >
            <div className="text-[#919191] leading-[18px] flex text-[14px]">
              <div className="flex-shrink-0 mr-[10px]">
                [2023-11-15T14:03:53.005]
              </div>
              <div className="flex-shrink-0 mr-[10px]">[ERROR]</div>
              <div className="line-clamp-2">
                system - {item._id}
                开源的特征开源的特征开源的特征开
                源的特征开源的特征开源的特征开源
                的特征开源的特征开源的特征开源的
                特征开源的特征开源的特征开源的特征
                开源的特征开源的特征开源的特征开源
                的特征开源的特征开源的特征开源的特
                征开源的特征开源的特征开源的特征开
                源的特征开源的特征开源的特征开源的
                特征开源的特征开源的特征开源的特征
                开源的特征开源的特征开源的特征开源 的特征开源的特征
              </div>
            </div>
          </div>
        )}
      </VirtualList>
    </div>
  );
}

export default App;
