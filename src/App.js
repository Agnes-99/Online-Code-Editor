
import React from 'react';
import './App.css';
import CodeEditor from './code_editor';

function App() {
  return (
    <div className="App">
      <h1>Online Code Editor</h1>
      <div className="editor-container">
      <CodeEditor />
      </div>
    </div>
  );
}

export default App;

