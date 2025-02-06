
import React, { useState} from 'react';
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

  const handleFontSizeChange = (e) =>{
    setFontSize(e.target.value);
  }

  const handleThemeToggle = () => {
    setTheme((prevTheme) => (prevTheme === 'vs-dark' ? 'vs-light' : 'vs-dark'));
  };

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

    // Handle the result from iframe
    window.addEventListener('message', (event) => {
      if (event.origin === window.origin) {
        setOutput(event.data); // Update output with the result from iframe
      }
    });

    // Clean up iframe after execution
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
       {/* Display the output of the code execution */}
       <div className="output-container">
        <h3>Output:</h3>
        <pre>{output}</pre>
      </div>
    </div>
  );
};

export default CodeEditor;
