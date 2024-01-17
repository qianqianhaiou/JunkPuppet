import moment from 'moment';

export const translateDate = (value: any, format = 'YYYY-MM-DD HH:mm') => {
	if (!value) return '';
	return moment(value).format(format);
};
