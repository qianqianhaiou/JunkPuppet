import { Button, Input } from 'antd';
import Edit from './Edit';
import { useState } from 'react';
function App({ fetchList }: { fetchList: any }) {
	const [text, setText] = useState('');
	const handleKeyPressEnter = (value: string) => {
		fetchList(value);
	};
	return (
		<div className='flex justify-between'>
			<div>
				<div className='flex items-center'>
					<Input.Search
						value={text}
						className='w-[200px]'
						placeholder='请输入任务名称'
						allowClear
						enterButton={false}
						onChange={(e: any) => setText(e.target.value)}
						onSearch={handleKeyPressEnter}></Input.Search>
				</div>
			</div>
			<Edit reflash={fetchList} type='create'></Edit>
		</div>
	);
}
export default App;
