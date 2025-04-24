import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import debounce from 'lodash.debounce';
import './code_editor.css';

const ResizeObserverWrapper = ({ children, editorInstance }) => {
  const editorWrapperRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(() => {
        editorInstance?.layout();
      });
    });

    if (editorWrapperRef.current) observer.observe(editorWrapperRef.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [editorInstance]);

  return <div ref={editorWrapperRef}>{children}</div>;
};

const THEMES = ['vs-dark', 'vs-light', 'hc-black'];

const CodeEditor = () => {
  const [code, setCode] = useState(() => {
    return localStorage.getItem('savedCode') || '// Start typing your code...';
  });
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(16);
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [editorInstance, setEditorInstance] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    localStorage.setItem('savedCode', code);
  }, [code]);

  const handleEditorChange = (newCode) => {
    setCode(newCode);
  };

  const handleFontSizeChange = (e) => {
    setFontSize(Number(e.target.value));
  };

  const handleThemeToggle = () => {
    const nextIndex = (THEMES.indexOf(theme) + 1) % THEMES.length;
    setTheme(THEMES[nextIndex]);
  };

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
  
    if (selectedLang === 'java') {
      setCode(`public class HelloWorld {
      public static void main(String[] args) {
          System.out.println("Hello from Java!");
      }
  }`);
    } else if (selectedLang === 'python') {
      setCode(`# Python Example
  print('Hello from Python!')`);
    } else if (selectedLang === 'javascript') {
      setCode(`// JavaScript Example
  console.log("Hello from JavaScript!");`);
    }
  };
  

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(<pre className="info">⏳ Running...</pre>);

    if (language === 'python' || language === 'java') {
      try {
        const res = await fetch('http://localhost:5000/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language }),
        });
        const data = await res.json();
        setOutput(
          data.output
            ? <pre className="success">{data.output}</pre>
            : <pre className="error">{data.console?.error || 'Unknown Error'}</pre>
        );
      } catch (err) {
        setOutput(<pre className="error">🚨 {err.message}</pre>);
      }
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
            const log = (msg) => { output += msg + '\\n'; };
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

      const messageHandler = (event) => {
        if (event.origin === window.origin) {
          const result = event.data;
          setOutput(result.startsWith('Error:')
            ? <pre className="error">🚨 {result}</pre>
            : <pre className="success"> {result}</pre>
          );
          window.removeEventListener('message', messageHandler);
        }
      };

      window.addEventListener('message', messageHandler);
      setTimeout(() => document.body.removeChild(iframe), 5000);
    }

    setIsRunning(false);
  };

  const handleAIHelp = () => {
    alert('🧠 AI Suggestion feature coming soon!');
  };

  const editorDidMount = (editor) => {
    setEditorInstance(editor);
  };

  return (
    <div className="code-editor-container">
      <div className="editor-toolbar">
        <button onClick={handleThemeToggle} className="toolbar-btn">
          🎨 Theme: {theme}
        </button>
        <div className="font-size-selector">
          <label>Font:</label>
          <input type="range" min="10" max="24" value={fontSize} onChange={handleFontSizeChange} className="font-slider" />
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
        <button onClick={handleAIHelp} className="toolbar-btn ai-btn">🤖 AI Suggest</button>
        <button onClick={handleRunCode} className="toolbar-btn run-btn" disabled={isRunning}>
          {isRunning ? 'Running...' : '🚀 Run Code'}
        </button>
      </div>

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
              fontSize,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              minimap: { enabled: false },
              padding: { top: 12 },
              renderLineHighlight: 'all',
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
              },
            }}
            editorDidMount={editorDidMount}
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
