// src/CodeEditor.js

import React, { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';

const CodeEditor = () => {
  const [code, setCode] = useState('// Start typing your code...');
  
  const handleEditorChange = (newCode) => {
    setCode(newCode);
  };

  return (
    <div style={{ height: '400px' }}>
      <MonacoEditor
        width="100%"
        height="100%"
        language="javascript"
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
      />
    </div>
  );
};

export default CodeEditor;
