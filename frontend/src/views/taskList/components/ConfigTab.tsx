import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined, StarTwoTone } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Input, Space, Tag, theme, Tooltip } from 'antd';
import { LIFE_HOOKS } from '@/utils/const';

function App({
	activeKey,
	readonly,
	defaultCustomFnKeys,
	handleDeleteTabs,
	handleUpdateActive,
	handleUpdateTabName,
	handleAddTab,
}: {
	activeKey: string;
	handleUpdateActive: any;
	readonly: boolean;
	handleDeleteTabs: any;
	handleUpdateTabName: any;
	defaultCustomFnKeys: string[];
	handleAddTab: any;
}) {
	const { token } = theme.useToken();
	const [tags, setTags] = useState(['JSON配置']);
	const [inputVisible, setInputVisible] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [editInputIndex, setEditInputIndex] = useState(-1);
	const [editInputValue, setEditInputValue] = useState('');
	const inputRef = useRef<InputRef>(null);
	const editInputRef = useRef<InputRef>(null);

	useEffect(() => {
		setTags(() => {
			return ['JSON配置'].concat(defaultCustomFnKeys);
		});
	}, [defaultCustomFnKeys]);

	useEffect(() => {
		if (inputVisible) {
			inputRef.current?.focus();
		}
	}, [inputVisible]);

	useEffect(() => {
		editInputRef.current?.focus();
	}, [editInputValue]);

	const handleClose = (removedTag: string) => {
		const newTags = tags.filter((tag) => tag !== removedTag);
		setTags(newTags);
		if (removedTag === activeKey) {
			handleUpdateActive('JSON配置');
		}
		handleDeleteTabs(removedTag);
	};

	const showInput = () => {
		setInputVisible(true);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	const handleInputConfirm = () => {
		if (inputValue && !tags.includes(inputValue)) {
			setTags([...tags, inputValue]);
		}
		handleAddTab(inputValue);
		setInputVisible(false);
		setInputValue('');
	};

	const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditInputValue(e.target.value);
	};

	const handleEditInputConfirm = () => {
		const newTags = [...tags];
		newTags[editInputIndex] = editInputValue;
		handleUpdateTabName(tags[editInputIndex], editInputValue);
		setTags(newTags);
		setEditInputIndex(-1);
		setEditInputValue('');
	};

	const tagInputStyle: React.CSSProperties = {
		width: 112,
		height: 26,
		marginInlineEnd: 8,
		verticalAlign: 'top',
	};

	const tagPlusStyle: React.CSSProperties = {
		height: 26,
		lineHeight: '24px',
		background: token.colorBgContainer,
		borderStyle: 'dashed',
	};

	return (
		<Space className='pb-[10px] flex-shrink-0' size={[0, 8]} wrap>
			{tags.map((tag, index) => {
				if (editInputIndex === index) {
					return (
						<Input
							ref={editInputRef}
							key={tag}
							size='small'
							style={tagInputStyle}
							value={editInputValue}
							onChange={handleEditInputChange}
							onBlur={handleEditInputConfirm}
							onPressEnter={handleEditInputConfirm}
						/>
					);
				}
				const isLongTag = tag.length > 8;
				const tagElem = (
					<Tag
						color={activeKey === tag ? '#108ee9' : ''}
						key={tag}
						closable={index !== 0 && !readonly}
						style={{
							userSelect: 'none',
							height: '26px',
							lineHeight: '24px',
							position: 'relative',
						}}
						onClick={() => handleUpdateActive(tag)}
						onClose={() => handleClose(tag)}>
						<span
							onDoubleClick={(e) => {
								if (index !== 0) {
									setEditInputIndex(index);
									setEditInputValue(tag);
									e.preventDefault();
								}
							}}>
							{isLongTag ? `${tag.slice(0, 8)}...` : tag}
						</span>
						{LIFE_HOOKS.includes(tag) ? (
							<div
								className='absolute'
								style={{
									top: '-12px',
									left: '-6px',
								}}>
								<StarTwoTone twoToneColor='#eb2f96' />
							</div>
						) : null}
					</Tag>
				);
				return isLongTag ? (
					<Tooltip title={tag} key={tag}>
						{tagElem}
					</Tooltip>
				) : (
					tagElem
				);
			})}
			{inputVisible ? (
				<Input
					ref={inputRef}
					type='text'
					size='small'
					style={tagInputStyle}
					value={inputValue}
					onChange={handleInputChange}
					onBlur={handleInputConfirm}
					onPressEnter={handleInputConfirm}
				/>
			) : !readonly ? (
				<Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}>
					New Function
				</Tag>
			) : null}
		</Space>
	);
}

export default App;
