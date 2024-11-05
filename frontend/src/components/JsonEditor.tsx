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
      // monaco.editor.getEditors()[0]._actions.get('editor.foldLevel3')._run();
    }
  };
  useEffect(() => {
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
