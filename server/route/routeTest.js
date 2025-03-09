const express = require("express");
const { addTestUsers, getUser} = require("../controllers/testController");

const router = express.Router();

router.post("/add-test-users", addTestUsers);
router.get("/getUser", getUser);


module.exports = router;
