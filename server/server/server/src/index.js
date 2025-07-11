// src/index.js
const express = require("express");
const app = express();

app.get("/", (_, res) => {
  res.send("API OK");
});

app.listen(3000, () => {
  console.log("✅ 서버 실행 중! http://localhost:3000");
});
