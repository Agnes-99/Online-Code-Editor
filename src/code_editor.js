import React, { useState, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';
import './code_editor.css';

// ResizeObserver wrapper to handle resizing issues
const ResizeObserverWrapper = ({ children }) => {
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      // Placeholder logic for ResizeObserver if you want to throttle/debounce
    });
    observer.observe(document.body); // Observe the body or a specific element

    return () => observer.disconnect(); // Cleanup observer on unmount
  }, []);

  return <>{children}</>;
};

const CodeEditor = () => {
  const [code, setCode] = useState('// Start typing your code...');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript'); // Track selected language

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
    // For Python and Java, use JDoodle API to execute code
    if (language === 'python' || language === 'java') {
      const apiUrl = 'https://api.jdoodle.com/v1/execute'; // JDoodle API URL
      const payload = {
        script: code,
        language: language,
        versionIndex: '0', // You can change this if needed
        clientId: 'YOUR_CLIENT_ID', // Replace with your JDoodle Client ID
        clientSecret: 'YOUR_CLIENT_SECRET', // Replace with your JDoodle Client Secret
      };

      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.output) {
            setOutput(<pre className="success">{data.output}</pre>); // Success output
          } else if (data.error) {
            setOutput(<pre className="error">{data.error}</pre>); // Error output
          }
        })
        .catch((err) => {
          setOutput(<pre className="error">Error: {err.message}</pre>);
        });
    } else {
      // For JavaScript, run code directly as before
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
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value); // Update the language based on selection
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
            {/* Add more languages as needed */}
          </select>
        </div>
      </div>

      <ResizeObserverWrapper>
        <div className="editor-wrapper">
          <MonacoEditor
            width="100%"
            height="100%"
            language={language} // Set the language dynamically
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
              minimap: { enabled: false }, // Make sure minimap is completely off
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
