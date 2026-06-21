const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(express.json());

app.post("/execute", (req, res) => {
  const { code, input } = req.body;
  const uuid = crypto.randomUUID();
  const folderPath = path.join(__dirname, "temp", uuid);
  fs.mkdirSync(folderPath, { recursive: true });

  const filePath = path.join(folderPath, "solution.cpp");
  fs.writeFileSync(filePath, code);

  const dockerCmd = `docker run --rm -v ${folderPath}:/code -i algoflow-cpp bash -c "g++ solution.cpp -o solution && ./solution"`;

  const child = exec(dockerCmd, (error, stdout, stderr) => {
    fs.rmSync(folderPath, { recursive: true, force: true });

    if (error) {
      return res.status(500).json({ error: stderr || "Execution failed" });
    }
    res.json({ output: stdout });
  });

  child.stdin.write(input || "");
  child.stdin.end();
});

app.listen(6000, () => console.log("Executor running on port 6000"));
