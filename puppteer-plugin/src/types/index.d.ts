interface ScrollData {
	pageX: number;
	pageY: number;
	deltaY: number;
}
interface CurrentScreenSnapshot {
	scrollTop: number;
	width: number;
	height: number;
}
interface Selector {
	iframeIndex: number;
	selector: string;
}

interface Cookie {
	cookieName: string;
	cookieValue: string;
}
interface TaskRunnerData {
	targetUrl: string;
	chromePath: string;
	headless: false | 'new';
	slowMo: number;
	parent: string;
	data: string;
	cookies?: Array<Cookie>;
	size?: {
		width: number;
		height: number;
	};
	chromeDataPath?: string;
}

interface TextResult {
	label: string;
	multiple: boolean;
	values: [];
}
interface SnapshotResult {
	type: string;
	label: string;
	uid?: string;
	uids?: string[];
	multiple?: boolean;
}
interface TaskRunnerResult {
	texts: TextResult[];
	snapshots: SnapshotResult[];
	customResult: any[];
}

interface TaskSetterData {
	targetUrl: string;
	chromePath: string;
	headless: boolean;
	size?: {
		width: number;
		height: number;
	};
	chromeDataPath?: string;
}
