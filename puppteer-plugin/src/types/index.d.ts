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
  similar: boolean;
  parent?: {
    iframeIndex: number;
    selector: string;
    similar: boolean;
  };
}
interface TaskRunnerData {
  targetUrl: string;
  chromePath: string;
  headless: false | 'new';
  wsEndpoint: string;
  slowMo: number;
  parent: string;
  data: string;
  cookies: any[];
  size?: {
    width: number;
    height: number;
  };
  chromeDataPath?: string;
}

interface TextResult {
  label: string;
  similar: boolean;
  values: string[];
}
interface SnapshotResult {
  type: string;
  label: string;
  uid?: string;
  uids?: string[];
  similar?: boolean;
}
interface TaskRunnerResult {
  texts: TextResult[];
  snapshots: SnapshotResult[];
  customResult: any[];
}

interface TaskSetterData {
  targetUrl: string;
  wsEndpoint: string;
  chromePath: string;
  headless: boolean;
  cookies: any[];
  size?: {
    width: number;
    height: number;
  };
  chromeDataPath?: string;
}
