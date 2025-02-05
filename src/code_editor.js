
import React, { useState} from 'react';
import MonacoEditor from 'react-monaco-editor';
import './code_editor.css';

const CodeEditor = () => {
  const [code, setCode] = useState('// Start typing your code...');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);

  const handleEditorChange = (newCode) => {
    setCode(newCode);
  };

  const handleFontSizeChange = (e) =>{
    setFontSize(e.target.value);
  }

  const handleThemeToggle = () => {
    setTheme((prevTheme) => (prevTheme === 'vs-dark' ? 'vs-light' : 'vs-dark'));
  };
  
  return (
    <div className="code-editor-container">
      <div className="editor-toolbar">
        <button onClick={handleThemeToggle} className="toolbar-btn">Toggle Theme</button>
        <div className="font-size-selector">
          <label>Font Size:</label>
          <input
            type="range"
            min="10"
            max="30"
            value={fontSize}
            onChange={handleFontSizeChange}
            className="toolbar-btn"
          />
        </div>
      </div>

      <div className="editor-wrapper">
        <MonacoEditor
          width="100%"
          height="100%"
          language="javascript"
          value={code}
          onChange={handleEditorChange}
          theme={theme}
          options={{
            selectOnLineNumbers: true,
            fontSize: fontSize,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            renderLineHighlight: 'none', 
            minimap: { enabled: false }, 
            padding: { top: 10, bottom: 10, left: 2, right:2 },
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              useShadows: false,
              alwaysConsumeMouseWheel: false,
            },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
