interface Selector {
	iframeIndex: number;
	selector: string;
}

export const addClass = (selector: Selector, className: string) => {
	const $els = document.querySelectorAll(selector.selector);
	if ($els.length) {
		Array.prototype.forEach.call($els, (item) => {
			item.className = item.className + ` ${className}`;
		});
	}
};

export const removeClass = (className: string) => {
	const $els = document.querySelectorAll(className);
	if ($els.length) {
		Array.prototype.forEach.call($els, (item) => {
			item.className = item.className.replace(className, '');
		});
	}
};
