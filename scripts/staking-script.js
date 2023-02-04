
const hre = require("hardhat");

async function main() {


  const Staking = await ethers.getContractFactory("Staking");
  let staking = await Staking.deploy("0x5FbDB2315678afecb367f032d93F642f64180aa3", 5);
  await staking.deployed();
  console.log(`Staking Deployed to : ${staking.address},`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
