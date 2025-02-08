import React, { useState, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';
import './code_editor.css';

const ResizeObserverWrapper = ({ children }) => {
  useEffect(() => {
    const observer = new ResizeObserver(() => {
    });
    observer.observe(document.body); 

    return () => observer.disconnect(); 
  }, []);

  return <>{children}</>;
};

const CodeEditor = () => {
  const [code, setCode] = useState('// Start typing your code...');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript'); 

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
   
    if (language === 'python' || language === 'java') {
      const apiUrl = 'https://api.jdoodle.com/v1/execute'; 
      const payload = {
        script: code,
        language: language,
        versionIndex: '0', 
        clientId: 'YOUR_CLIENT_ID', 
        clientSecret: 'YOUR_CLIENT_SECRET', 
      };

      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.output) {
            setOutput(<pre className="success">{data.output}</pre>); 
            setOutput(<pre className="error">{data.error}</pre>); 
          }
        })
        .catch((err) => {
          setOutput(<pre className="error">Error: {err.message}</pre>);
        });
    } else {
    
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
            window.parent.postMessage(output, '*'); 
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
            setOutput(<pre className="error">{result}</pre>); 
          } else {
            setOutput(<pre className="success">{result}</pre>); 
          }
        }
      });

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value); 
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

        {/* Language Selector */}
        <div className="language-selector">
          <label>Language:</label>
          <select value={language} onChange={handleLanguageChange}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            {/* More languages to be added */}
          </select>
        </div>
      </div>

      <ResizeObserverWrapper>
        <div className="editor-wrapper">
          <MonacoEditor
            width="100%"
            height="100%"
            language={language}
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
      </ResizeObserverWrapper>

      <div className="output-container">
        <h3>Output:</h3>
        <div>{output}</div>
      </div>
    </div>
  );
};

export default CodeEditor;
