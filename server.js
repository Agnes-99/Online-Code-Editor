const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 5000;

// Enable CORS
app.use(cors());
// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Endpoint to handle code execution
app.post('/run', (req, res) => {
  const { code, language } = req.body;
  let command;
  let fileName;

  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // Determine which language we're executing
  if (language === 'python') {
    fileName = 'script.py';
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, code);

    // Run the Python file (use 'python3' if necessary)
    command = `python ${filePath}`;
  } else if (language === 'java') {
    fileName = 'Main.java';
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, code);

    // Compile and run the Java file
    command = `javac ${filePath} && java -cp ${tempDir} Main`;
  } else {
    return res.status(400).send('Unsupported language');
  }

  // Run the code using the appropriate command
  exec(command, (err, stdout, stderr) => {
    // Cleanup the temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    if (err) {
      console.error('Execution error:', err);
      console.error('stderr:', stderr);
      return res.status(500).send({ error: stderr });
    }
    return res.send({ output: stdout });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
