import React, { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import './code_editor.css';

const CodeEditor = () => {
  const [code, setCode] = useState('// Start typing your code...');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [output, setOutput] = useState('');

  const handleEditorChange = (newCode) => {
    setCode(newCode);
  };

  const handleFontSizeChange = (e) => {
    setFontSize(e.target.value);
  };

  const handleThemeToggle = () => {
    setTheme((prevTheme) => (prevTheme === 'vs-dark' ? 'vs-light' : 'vs-dark'));
  };

  const handleRunCode = () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <html><body>
      <script>
        try {
          let output = '';
          const log = (message) => { output += message + '\\n'; };
          console.log = log;
          console.error = log;
          // Run the user code
          ${code}
          window.parent.postMessage(output, '*'); // Send the result back to the parent window
        } catch (err) {
          window.parent.postMessage('Error: ' + err.message, '*');
        }
      </script>
      </body></html>
    `);
    iframeDoc.close();

    window.addEventListener('message', (event) => {
      if (event.origin === window.origin) {
        const result = event.data;
        if (result.startsWith('Error:')) {
          setOutput(<pre className="error">{result}</pre>); // Display error in red
        } else {
          setOutput(<pre className="success">{result}</pre>); // Display success in green
        }
      }
    });

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 5000);
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
            className="font-slider"
          />
        </div>
        <button onClick={handleRunCode} className="toolbar-btn">Run Code</button>
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
            padding: { top: 10, bottom: 10, left: 2, right: 2 },
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              useShadows: false,
              alwaysConsumeMouseWheel: false,
            },
          }}
        />
      </div>

      <div className="output-container">
        <h3>Output:</h3>
        <div>{output}</div>
      </div>
    </div>
  );
};

export default CodeEditor;
