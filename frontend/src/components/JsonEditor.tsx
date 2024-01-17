import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect, useState } from 'react';

function App({
	defaultValue,
	setValue,
	readonly,
}: {
	defaultValue: string;
	setValue: any;
	readonly: boolean;
}) {
	const monaco: any = useMonaco();
	const handleChange = (e: any) => {
		setValue(e);
	};
	const autoFormatCode = async () => {
		if (monaco?.editor) {
			monaco.editor.getEditors()[0]._actions.get('editor.action.formatDocument')._run();
			monaco.editor.getEditors()[0]._actions.get('editor.foldLevel3')._run();
		}
	};
	const jumpToTargetLine = (line: number) => {
		if (monaco?.editor) {
			monaco.editor.getEditors()[0].revealLineInCenter(line);
		}
	};
	useEffect(() => {
		if (monaco) {
			const acceptedList = ['"slot": true'];
			acceptedList.forEach((item: string): void => {
				const editorModel = monaco.editor.getModels()[0];
				if (!editorModel) return;
				const matches: any = editorModel.findMatches(item, false, false, false, null, false);
				matches.forEach((match: any): void => {
					editorModel.deltaDecorations(
						[],
						[
							{
								range: match.range,
								options: {
									isWholeLine: true,
									className: 'editor-json-highlight',
									marginClassName: 'editor-json-highlight',
								},
							},
						],
					);
				});
			});
		}
		if (monaco && defaultValue) {
			setTimeout(async () => {
				await autoFormatCode();
			}, 100);
		}
	}, [monaco, defaultValue, readonly]);
	return defaultValue ? (
		<Editor
			height='100%'
			defaultLanguage='json'
			theme='vs-dark'
			value={defaultValue}
			options={{
				readOnly: readonly,
				readOnlyMessage: {
					value: '当前为只读状态',
				},
			}}
			onChange={handleChange}
		/>
	) : null;
}

export default App;
