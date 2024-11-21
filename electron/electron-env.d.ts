/// <reference types="vite-plugin-electron/electron-env" />
declare module 'uuid';
declare module 'nodemailer';
declare namespace globalThis {
  var cronList: Map<string, any>;
  var wsEndpoint: string;
  var setterProcess: ChildProcess | null;
  var runnerProcess: ChildProcess | null;
  var managerProcess: ChildProcess | null;
}

declare namespace NodeJS {
  interface ProcessEnv {
    /** 打包输出文件 */
    DIST: string;
    /** Public文件夹 */
    VITE_PUBLIC: string;
    /** 执行脚本存放位置 */
    SCRIPTS_PATH: string;
    /** 数据总文件夹 */
    DATA_PATH: string;
    /** 邮件地址 */
    MAIL: string;
    /** 邮件令牌 */
    MAIL_TOKEN: string;
    /** 是否已经完成过全局设置 set noset */
    IS_SET: string;
    /** 全局设置配置文件存放位置 */
    GLOBAL_SETTING_CONFIG_PATH: string;
    /** 截图存放路径 */
    DATA_PATH_SNAPSHOT: string;
    /** JSON配置文件存放路径 */
    DATA_PATH_JSON: string;
    /** JSON数据库文件存放路径 */
    DATA_PATH_DB: string;
    /** Chrome用户数据存放位置 */
    DATA_PATH_CHROME_DATA: string;
    /** Chrome浏览器存放位置 */
    CHROME_PATH: string;
    /** 日志文件夹 */
    DATA_PATH_LOG: string;
  }
}

interface ChromeSetting {
  headless?: boolean;
  size?: {
    width: number;
    height: number;
  };
  chromePath: string;
  chromeDataPath: string;
}

interface ISetting extends ChromeSetting {
  targetUrl: string;
}

interface IRunner extends ISetting {
  cookies: [
    {
      cookieName: string;
      cookieValue: string;
    },
  ];
}

declare module 'diskinfo';
