const hre = require("hardhat");

async function main() {
  const Create = await hre.ethers.getContractFactory("Create"); // Call contract named "Create"
  const create = await Create.deploy();

  await create.deployed(); // ✅ Use this for ethers v5

  const address = create.address; // ✅ Get contract address directly in ethers v5

  console.log("Contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
