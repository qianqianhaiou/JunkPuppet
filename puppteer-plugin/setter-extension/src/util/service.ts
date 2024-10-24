export const sendMessage = (data: any) => {
  window._junkpuppet_send_data(JSON.stringify(data));
};

export const sendChromeMessage = async (type: string, message?: string) => {
  return await chrome.runtime.sendMessage({
    type: type,
    message: message,
  });
};
