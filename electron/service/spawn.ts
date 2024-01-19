import { spawn } from 'child_process';

// open chrome
export const openChrome = async (arg: any) => {
  spawn(process.env.CHROME_PATH, [`--user-data-dir=${process.env.DATA_PATH_CHROME_DATA}`]);
};
