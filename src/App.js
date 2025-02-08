
import React from 'react';
import './App.css';
import CodeEditor from './code_editor';
import logo from './assets/AegisCode_Logo.jpg';

function App() {
  return (
    <div className="App">
      <div className="logo-container">
         <img src={logo} alt="AegisCode Logo" className="logo" />
      </div>
      <div className="editor-container">
      <CodeEditor />
      </div>
    </div>
  );
}

export default App;

