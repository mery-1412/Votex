const hre = require("hardhat");

async function main() {
  const Create = await hre.ethers.getContractFactory("Create");
  const create = await Create.deploy();

  await create.deployed(); // 

  const address = create.address; 

  console.log("Contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
