//将秒转为时分秒
export function getTime(time: string) {
  let second = parseInt(time);
  //  分
  let minute = 0;
  //  小时
  let hour = 0;
  //天
  let day = 0;
  // 转换为式分秒
  if (second > 60) {
    //  获取分钟，除以60取整数，得到整数分钟
    minute = Math.floor(second / 60);
    //  获取秒数，秒数取佘，得到整数秒数
    second = second % 60;
    //  如果分钟大于60，将分钟转换成小时
    if (minute > 60) {
      //  获取小时，获取分钟除以60，得到整数小时
      hour = Math.floor(minute / 60);
      //  获取小时后取佘的分，获取分钟除以60取佘的分
      minute = minute % 60;
      //  如果小时大于24，将小时转换成天
      if (hour > 23) {
        //  获取天数，获取小时除以24，得到整天数
        day = Math.floor(hour / 24);
        //  获取天数后取余的小时，获取小时除以24取余的小时
        hour = hour % 24;
      }
    }
  }

  let result = `${second}秒`;
  if (minute > 0) {
    result = `${minute}分${result}`;
  }
  if (hour > 0) {
    result = `${hour}小时${result}`;
  }
  if (day > 0) {
    result = `${day}天${result}`;
  }
  return result;
}
