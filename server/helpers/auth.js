const bcrypt = require("bcrypt");

const saltRounds = 10; 

const hashPassword = async (password) => {
  try {
    console.log("🔍 Raw password before hashing:", password); 
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password.trim(), salt);
  } catch (err) {
    console.error("Error hashing password:", err);
    throw err;
  }
};

const ComparePassword = async (password, hashedPassword) => {
  try {
    console.log("🔹 Entered password:", password);
    console.log("🔹 Stored hashed password:", hashedPassword);

    if (!password || !hashedPassword) {
      console.error(" Password or hash is undefined!");
      return false;
    }

    const match = await bcrypt.compare(password.trim(), hashedPassword);
    console.log("🔹 Password match result:", match);
    return match;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};


module.exports = { hashPassword, ComparePassword };
