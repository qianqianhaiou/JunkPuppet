import Editor, { useMonaco } from '@monaco-editor/react';
import { Drawer } from 'antd';
import { useEffect, useState } from 'react';

function App({
  defaultCode,
  readonly,
  updateValue,
}: {
  defaultCode?: string;
  readonly?: boolean;
  updateValue: any;
}) {
  const monaco: any = useMonaco();
  const [defaultValue, setDefaultValue] = useState<string>();
  const handleChange = (e: any) => {
    updateValue(e);
  };
  const autoFormatCode = async () => {
    if (monaco?.editor) {
      monaco.editor.getEditors()[0]._actions.get('editor.action.formatDocument')._run();
    }
  };
  useEffect(() => {
    if (monaco) {
      monaco.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems: () => {
          return {
            suggestions: [
              /** 快捷输入 */
              {
                label: 'injectContext',
                kind: monaco.languages.CompletionItemKind.Constant,
                insertText:
                  'const { page, browser, client, notification, sendMail } = _injectContexts;',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'Puppet Context',
              },
              {
                label: 'waitTime',
                kind: monaco.languages.CompletionItemKind.Constant,
                insertText: `await new Pormise((resolve, reject) => { setTimeout(() => { resolve('') }, 1000) })`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: '等待延迟',
              },
            ],
          };
        },
      });
      setTimeout(async () => {
        await autoFormatCode();
      }, 100);
    }
  }, [monaco]);
  useEffect(() => {
    if (defaultCode) {
      setDefaultValue(defaultCode);
    }
  }, [defaultCode]);
  return (
    <Editor
      height='100%'
      defaultLanguage='javascript'
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
  );
}

export default App;
