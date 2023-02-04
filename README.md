# Basic Sample Hardhat Project

This project is a simple staking contract which can give stake holder reward  with  auto compounding.
The reward is  statically set for every 3 months months ( 84 days ) on every 3 months the reward is added on current principal.
The owner need to add the reward in staking contract via AddReward method.


Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test 
npx hardhat node
node scripts/staking-script.js
npx hardhat help
```
