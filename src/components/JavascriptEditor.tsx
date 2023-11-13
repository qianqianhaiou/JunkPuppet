import Editor, { useMonaco } from "@monaco-editor/react";
import { Drawer } from "antd";
import { useEffect, useState } from "react";

function App() {
  const monaco: any = useMonaco();
  const [value, setValue] = useState<string>("const a = 123; let b = 1232");
  const handleChange = (e: any) => {
    setValue(e);
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
      autoFormatCode();
      monaco.languages.registerCompletionItemProvider("javascript", {
        provideCompletionItems: () => {
          return {
            suggestions: [
              /**   * 内置函数   */
              {
                label: "puppetinstance",
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: "_ABS(${1:val})",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: "返回指定参数的绝对值",
              },
              {
                label: "_COS(val:number)",
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: "_COS(${1:val})",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: "求指定角度的余弦值",
              },
            ],
          };
        },
      });
    }
  }, [monaco]);
  return (
    <Editor
      height="80vh"
      defaultLanguage="javascript"
      theme="vs-dark"
      defaultValue={value}
      onChange={handleChange}
    />
  );
}

export default App;
