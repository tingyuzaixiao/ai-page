// 页面添加水印效果
const setWatermark = (str: string) => {
	const id = '1.23452384164.123412416';
	if (document.getElementById(id) !== null) document.body.removeChild(<HTMLElement>document.getElementById(id));
	const can = document.createElement('canvas');
	can.width = 150;
	can.height = 120;
	const cans = <CanvasRenderingContext2D>can.getContext('2d');
	cans.rotate((-20 * Math.PI) / 180);
	cans.font = '14px Vedana';
	cans.fillStyle = 'rgba(200, 200, 200, 0.30)';
	cans.textBaseline = 'middle';
	cans.fillText(str, can.width / 4, can.height / 2);

	if (true) {
		// 获取当前时间并格式化
		let curDate = new Date();
		let dateStr = curDate.toLocaleDateString();
		let timeStr = curDate.toLocaleTimeString();
		let timeStamp = `${dateStr} ${timeStr}`;
		const timeTextWidth = cans.measureText(timeStamp).width;
		const timeTextX = (can.width - timeTextWidth) / 2;
		cans.font = '12px Vedana';
		cans.fillText(timeStamp, timeTextX, (can.height / 3) * 2);
	}

	const div = document.createElement('div');
	div.id = id;
	div.style.pointerEvents = 'none';
	div.style.top = '20px';
	div.style.left = '0px';
	div.style.position = 'fixed';
	div.style.zIndex = '1';
	div.style.width = `${document.documentElement.clientWidth}px`;
	div.style.height = `${document.documentElement.clientHeight}px`;
	div.style.background = `url(${can.toDataURL('image/png')}) left top repeat`;
	document.body.appendChild(div);
	return id;
};

/**
 * 页面添加水印效果
 * @method set 设置水印
 * @method del 删除水印
 */
const watermark = {
	// 设置水印
	set: (str: string) => {
		let id = setWatermark(str);
		if (document.getElementById(id) === null) {
			id = setWatermark(str);
		}
		// 当窗口大小改变时，重新创建水印
		window.onresize = () => {
			setWatermark(str);
		};
	},
	// 删除水印
	del: () => {
		let id = '1.23452384164.123412416';
		if (document.getElementById(id) !== null) document.body.removeChild(<HTMLElement>document.getElementById(id));
	},
	//删除指定区域水印
	removeWatermarkArea: (x: number, y: number, width: number, height: number) => {
		removeWatermarkArea(x, y, width, height);
	},
};

const removeWatermarkArea = (x: number, y: number, width: number, height: number) => {
	const overlayDiv = document.createElement('div');
	overlayDiv.style.position = 'fixed';
	overlayDiv.style.left = `${x}px`;
	overlayDiv.style.top = `${y}px`;
	overlayDiv.style.width = `${width}px`;
	overlayDiv.style.height = `${height}px`;
	overlayDiv.style.backgroundColor = 'none';
	overlayDiv.style.pointerEvents = 'none';
	overlayDiv.style.zIndex = '1001'; // 放在水印之上
	document.body.appendChild(overlayDiv);
};

// 导出方法
export default watermark;
