import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import debounce from 'lodash.debounce';
import './code_editor.css';

// ResizeObserverWrapper: Handles dynamic resizing of the Monaco Editor
const ResizeObserverWrapper = ({ children, editorInstance }) => {
  const editorWrapperRef = useRef(null);

  useEffect(() => {
    const handleResize = debounce(() => {
      if (editorInstance) {
        editorInstance.layout(); // Ensure Monaco Editor layout is updated
      }
    }, 100); // Debounce to optimize resize handling

    const observer = new ResizeObserver(handleResize);

    // Observe the editor wrapper element for size changes
    if (editorWrapperRef.current) {
      observer.observe(editorWrapperRef.current);
    }

    return () => {
      observer.disconnect();
      handleResize.cancel();
    };
  }, [editorInstance]);

  return <div ref={editorWrapperRef}>{children}</div>;
};

// CodeEditor: Main component for the code editor
const CodeEditor = () => {
  const [code, setCode] = useState('// Start typing your code...');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [editorInstance, setEditorInstance] = useState(null); // Store editor instance

  // Code changes
  const handleEditorChange = (newCode) => {
    setCode(newCode);
  };

  // Font size selection
  const handleFontSizeChange = (e) => {
    setFontSize(Number(e.target.value));
  };

  // Themes changes
  const handleThemeToggle = () => {
    setTheme((prevTheme) => (prevTheme === 'vs-dark' ? 'vs-light' : 'vs-dark'));
  };

  // Languages selection
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  // Execute the code and display output
  const handleRunCode = () => {
    if (language === 'python' || language === 'java') {
      const apiUrl = 'http://localhost:5000/run';
      const payload = {
        code: code,
        language: language,
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
          }
          if (data.console && data.console.error) {
            setOutput(<pre className="error">{data.console.error}</pre>);
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

  // Editor mounted callback to store Monaco editor instance
  const editorDidMount = (editor, monaco) => {
    setEditorInstance(editor); // Store the Monaco editor instance
  };

  return (
    <div className="code-editor-container">
      {/* Editor Toolbar */}
      <div className="editor-toolbar">
        <button onClick={handleThemeToggle} className="toolbar-btn">
          {theme === 'vs-dark' ? 'Light Theme' : 'Dark Theme'}
        </button>
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
          <span>{fontSize}px</span>
        </div>
        <div className="language-selector">
          <label>Language:</label>
          <select value={language} onChange={handleLanguageChange}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>
        <button onClick={handleRunCode} className="toolbar-btn run-btn">
          Run Code
        </button>
      </div>

      {/* Monaco Editor */}
      <ResizeObserverWrapper editorInstance={editorInstance}>
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
              scrollbar: { vertical: 'auto', horizontal: 'auto' },
            }}
            editorDidMount={editorDidMount} // Set the editor instance
          />
        </div>
      </ResizeObserverWrapper>

      {/* Output Container */}
      <div className="output-container">
        <h3>Output:</h3>
        <div>{output}</div>
      </div>
    </div>
  );
};

export default CodeEditor;
