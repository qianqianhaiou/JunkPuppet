import * as echarts from 'echarts/core';
import { TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useRef, useState } from 'react';
import { getTaskTypes } from '@/service';

echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout,
  TitleComponent,
]);

function App() {
  const [info, setInfo] = useState<any>();
  const fetchData = async () => {
    const result = await getTaskTypes({});
    setInfo(result);
  };
  const diskInfoRef = useRef<any>();
  const initDom = () => {
    const chartDom = diskInfoRef.current;
    const chartInstance = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);
    chartInstance.setOption({
      tooltip: {
        trigger: 'item',
      },
      title: {
        text: '任务类型',
        left: 'center',
        textStyle: {
          color: '#fff',
        },
      },
      legend: {
        bottom: '2%',
        left: 'center',
        textStyle: {
          color: '#fff',
        },
      },
      color: ['#e2ebf0', '#66a6ff', '#d89614'],
      series: [
        {
          name: '任务类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            formatter: (parmas: any) => {
              return parmas.percent + '%';
            },
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            {
              value: info.total - info.noConfigTaskLength - info.auto,
              name: '手动执行',
            },
            { value: info.auto, name: '自动执行' },
            { value: info.noConfigTaskLength, name: '未配置' },
          ],
        },
      ],
    });
  };
  useEffect(() => {
    if (diskInfoRef.current && info) initDom();
  }, [diskInfoRef, info]);
  useEffect(() => {
    fetchData();
  }, []);
  return <div ref={diskInfoRef} style={{ width: '300px', height: '300px' }}></div>;
}

export default App;
