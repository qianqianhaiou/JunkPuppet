export const sendMessage = (data: any) => {
	data['author'] = 'qianqianhaiou';
	(window.top as Window).postMessage(JSON.stringify(data), '*');
};

export const sendChromeMessage = async (type: string, message?: string) => {
	return await chrome.runtime.sendMessage({
		type: type,
		message: message,
	});
};
