import { taskListDb } from './db';

// 获取任务总数和自动执行数
export const getTaskTypes = async (params: any) => {
  const database = await taskListDb();
  let allTaskLength = database.chain.get('list').size().value();
  let noConfigTaskLength = database.chain.get('list').filter({ mockDataId: '' }).size().value();
  let autoTaskLength = global.cronList.size;
  return {
    total: allTaskLength,
    auto: autoTaskLength,
    noConfigTaskLength: noConfigTaskLength,
  };
};
