const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend çalışıyor!");
});

app.use("/api/auth", authRoutes);

// PORT'u Cloud Run ortam değişkeninden al, yoksa 8080 kullan
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
