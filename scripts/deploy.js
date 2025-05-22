const hre = require("hardhat");

async function main() {
  const [deployer, admin] = await hre.ethers.getSigners(); // Get deployer and admin accounts

  console.log("Deploying contract with account:", deployer.address);

  const Create = await hre.ethers.getContractFactory("Create");
  const create = await Create.deploy();

  await create.deployed();

  console.log("Contract deployed to:", create.address);

  // Set the organizer to the admin address
  const tx = await create.setOrganizer(admin.address);
  await tx.wait();
  console.log("Organizer set to:", admin.address);
}
 
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
