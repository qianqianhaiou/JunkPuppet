import { ConfigProvider, theme } from 'antd';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
import { defaultRouter, optionalRouter } from '@/routers/index';
import { getGlobalSetting } from './service';
import { useEffect, useState } from 'react';
import { useSettingStore } from './views/stores';

function pickOptionalRouters() {
	// pick some routes
	return optionalRouter;
}
function App() {
	const [visible, setVisible] = useState(false);
	const [routes, setRoutes] = useState<any>(null);
	const { setSettingInfo } = useSettingStore();
	const handleGetGlobalSetting = async () => {
		const result = await getGlobalSetting({});
		const target = JSON.parse(result);
		if (target) {
			setSettingInfo(target);
			setRoutes(createBrowserRouter(pickOptionalRouters()));
		} else {
			setRoutes(createBrowserRouter(defaultRouter));
		}
		setVisible(true);
	};
	useEffect(() => {
		handleGetGlobalSetting();
	}, []);
	return visible ? (
		<ConfigProvider
			theme={{
				algorithm: theme.darkAlgorithm,
				token: {
					fontFamily: 'PuHui55Regular',
					colorPrimary: '#3160F8',
				},
				components: {
					Menu: {
						darkItemSelectedBg: '#3a3a3a',
					},
				},
			}}
			locale={zhCN}>
			<RouterProvider router={routes} />
		</ConfigProvider>
	) : null;
}

export default App;
