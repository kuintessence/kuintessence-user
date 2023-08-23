import { date } from 'quasar';

export function DataResort(data: any) {
  // 定义空数组，用于存储新组装的数据
  const newData: any = {
    timeList: [],
    lengthList: [],
  };
  // 遍历数组
  data.forEach((item: any, i: any) => {
    // 默认当前操作的数据下标 -1
    let index = -1;
    item.created_time = date.formatDate(item.created_time, 'YYYY/MM/DD');
    // 判断数组中是否已经存在当前遍历数据的时间
    const isExists = newData.timeList.some((newItem: any, j: number) => {
      if (item.created_time == newItem) {
        // 存在就保存当前数据下标  用于插入数据
        index = j;
        return true;
      }
    });
    // 如果没有就存储一条新对象数据
    if (!isExists) {
      newData.timeList.push(item.created_time);
      newData.lengthList.push(1);
    } else {
      // 如果有就插入到已存在的对象中
      newData.lengthList[index]++;
    }
  });
  // 返回新数组
  return newData;
}
