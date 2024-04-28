import moment from 'moment';

export const translateDate = (value: any, format = 'YYYY-MM-DD HH:mm') => {
  if (!value) return '';
  return moment(value).format(format);
};
export const queryURLParams = (url: string) => {
  let pattern = /(\w+)=(\w+)/gi;
  let parames: any = {};
  url.replace(pattern, (_$, $1, $2) => {
    parames[$1] = $2;
    return '';
  });
  return parames;
};
