const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", project: "OGMOP" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`OGMOP backend on :${PORT}`));
