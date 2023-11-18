import * as echarts from "echarts/core";
import {
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";
import { PieChart } from "echarts/charts";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef } from "react";

echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout,
  TitleComponent,
]);

function App({ data }: { data: any }) {
  const diskInfoRef = useRef<any>();
  const initDom = () => {
    const chartDom = diskInfoRef.current;
    const chartInstance =
      echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);
    chartInstance.setOption({
      tooltip: {
        trigger: "item",
        formatter: (parmas: any) => {
          let gb =
            data.system === "Windows_NT"
              ? parmas.data.value / 1024 / 1024 / 1024
              : parmas.data.value / 1024 / 1024;
          const format = parmas.name + "：" + gb.toFixed(2) + "GB";
          return format;
        },
      },
      title: {
        text: "数据盘使用情况",
        left: "center",
        textStyle: {
          color: "#fff",
        },
      },
      legend: {
        bottom: "2%",
        left: "center",
        textStyle: {
          color: "#fff",
        },
      },
      color: ["#389e0d", "#cf1322"],
      series: [
        {
          name: "磁盘使用情况",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            formatter: (parmas: any) => {
              return parmas.percent + "%";
            },
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: data.available, name: "可用" },
            { value: data.used, name: "已用" },
          ],
        },
      ],
    });
  };
  useEffect(() => {
    if (diskInfoRef.current && data) initDom();
  }, [diskInfoRef, data]);
  return (
    <div ref={diskInfoRef} style={{ width: "300px", height: "300px" }}></div>
  );
}

export default App;
