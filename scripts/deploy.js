const hre = require("hardhat");

async function main() {

const Create = await hre.ethers.getContractFactory("Create"); //call contact names Create 
const create = await Create.deploy();

await create.waitForDeployment();

//console.log("Yes it is me ,Lock with 1 ETH deployed to:", create.address);

const address = await create.getAddress();  

console.log("Contract deployed to:", address);
    
}

main().catch((error)=> {
   console.error(error);
   process.exitCode=1; 
});