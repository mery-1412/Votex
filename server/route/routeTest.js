const express = require("express");
const { addTestUsers, getUser} = require("../controllers/testController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add-test-users", addTestUsers);
router.get("/getUser", authMiddleware, getUser); 

module.exports = router;
