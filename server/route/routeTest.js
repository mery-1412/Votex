const express = require("express");
const { addTestUsers } = require("../controllers/testController");

const router = express.Router();

router.post("/add-test-users", addTestUsers);

module.exports = router;
