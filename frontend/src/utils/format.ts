export function formatSnapshotType(type: string) {
	const map: any = {
		getElementSnapshot: '截取元素',
		snapshotFullScreen: '截取全屏',
		snapshotCurrentScreen: '截取当前可视区',
	};
	return map[type] || '';
}
