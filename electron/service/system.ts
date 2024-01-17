import { join } from 'node:path';
import { fswriteFile, fsreadFile } from '../utils/file';
import { relaunchElectron } from './electron';
import { type } from 'os';
import { getDrives } from 'diskinfo';

// 设置全局设置
export const setGlobalSetting = async (params: any) => {
	const target: any = {};
	Object.entries(params).map((item: any) => {
		target[item[0].toUpperCase()] = item[1];
	});
	target['DATA_PATH_SNAPSHOT'] = join(target['DATA_PATH'], 'Snapshots');
	target['DATA_PATH_JSON'] = join(target['DATA_PATH'], 'JSON');
	target['DATA_PATH_DB'] = join(target['DATA_PATH'], 'Database');
	target['DATA_PATH_CHROME_DATA'] = join(target['DATA_PATH'], 'ChromeData', 'Default');
	target['DATA_PATH_LOG'] = join(target['DATA_PATH'], 'Logs');
	await fswriteFile(process.env.GLOBAL_SETTING_CONFIG_PATH, JSON.stringify(target));
	relaunchElectron();
};
// 获取全局设置
export const getGlobalSetting = async () => {
	if (process.env.IS_SET === 'set') {
		return await fsreadFile(process.env.GLOBAL_SETTING_CONFIG_PATH);
	}
	return null;
};

// 获取数据盘信息
export const getDataDistInfo = async () => {
	return new Promise((res, rej) => {
		let MOUNTED = '';
		if (type() === 'Windows_NT') {
			MOUNTED = process.env.DATA_PATH.slice(0, 2).toLowerCase();
		} else if (type() === 'Linux') {
			MOUNTED = '/';
		} else {
			rej('未知系统');
		}
		getDrives(function (err: any, aDrives: any) {
			if (err) rej(err);
			const data = aDrives.filter((item: any) => item.mounted.toLowerCase() === MOUNTED)[0];
			delete data.filesystem;
			data.system = type();
			res(data);
		});
	});
};
