const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./route/authRoutes");
const testRoute = require("./route/routeTest")
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const voterRoutes = require('./controllers/votingBack');
const archiveRoutes = require('./controllers/archiveController');

dotenv.config(); 

const app = express();

app.use(express.json());
app.use(cors(
  {
    origin: "http://localhost:3000", 
    credentials: true, 
  }
));
app.use(cookieParser())

app.use("/api/auth", authRoutes);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json()); 
app.use("/api/test-users", testRoute);
app.use('/api/voter', voterRoutes);
app.use('/api/archives', archiveRoutes);



mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
