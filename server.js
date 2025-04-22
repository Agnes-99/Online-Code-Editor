const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/run', (req, res) => {
  const { code, language } = req.body;
  let command;
  let fileName;

  const tempDir = fs.mkdtempSync(path.join(__dirname, 'temp-'));

  try {
    if (language === 'python') {
      fileName = 'script.py';
      const filePath = path.join(tempDir, fileName);
      fs.writeFileSync(filePath, code);

      // ✅ Correct command
      command = `python ${filePath}`;

    } else if (language === 'java') {
      const classNameMatch = code.match(/class\s+(\w+)/);
      if (!classNameMatch) {
        return res.status(400).send({ error: 'Invalid Java code: missing class name' });
      }
      const className = classNameMatch[1];

      fileName = `${className}.java`;
      const filePath = path.join(tempDir, fileName);
      fs.writeFileSync(filePath, code);

      // ✅ Compile and run
      command = `javac ${filePath} && java -cp ${tempDir} ${className}`;
    } else {
      return res.status(400).send({ error: 'Unsupported language' });
    }

    // ✅ Execute code with 5 second timeout
    exec(command, { timeout: 5000 }, (err, stdout, stderr) => {
      fs.rmSync(tempDir, { recursive: true, force: true });

      if (err) {
        return res.status(500).send({ error: stderr || err.message });
      }

      res.send({ output: stdout });
    });

  } catch (error) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    res.status(500).send({ error: 'Internal server error' });
  }
});

// ✅ Corrected port logging
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
