import Editor, { useMonaco } from "@monaco-editor/react";
import { Drawer } from "antd";
import { useEffect, useState } from "react";

function App({
  customFn,
  activeKey,
  readonly,
  updateValue,
}: {
  customFn: any;
  activeKey: string;
  readonly: boolean;
  updateValue: any;
}) {
  const monaco: any = useMonaco();
  const [defaultValue, setDefaultValue] = useState<string>();
  const handleChange = (e: any) => {
    updateValue(e, activeKey);
  };
  const autoFormatCode = async () => {
    if (monaco?.editor) {
      monaco.editor
        .getEditors()[0]
        ._actions.get("editor.action.formatDocument")
        ._run();
    }
  };
  useEffect(() => {
    if (monaco) {
      monaco.languages.registerCompletionItemProvider("javascript", {
        provideCompletionItems: () => {
          return {
            suggestions: [
              /**   * 内置变量   */
              {
                label: "injectContext",
                kind: monaco.languages.CompletionItemKind.Constant,
                insertText: "injectContext",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: "Puppet上下文",
              },
              {
                label: "task",
                kind: monaco.languages.CompletionItemKind.Constant,
                insertText: "task",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: "task配置",
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
    setDefaultValue(customFn[activeKey]["functionString"] || `// ${activeKey}`);
  }, [activeKey]);
  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      theme="vs-dark"
      value={defaultValue}
      options={{
        readOnly: readonly,
        readOnlyMessage: {
          value: "当前为只读状态",
        },
      }}
      onChange={handleChange}
    />
  );
}

export default App;
