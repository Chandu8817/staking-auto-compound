const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
describe("Staking", function () {
  const rate = 5; // 5 %
  let staking;
  let token;
  let accounts;
  let stakeTokensAmt;
  let unStakeTokensAmt;


  before(async () => {

    accounts = await ethers.getSigners();
    stakeTokensAmt = ethers.BigNumber.from(100)
    unStakeTokensAmt = ethers.BigNumber.from(50)

    const GLDToken = await ethers.getContractFactory("GLDToken");
    token = await GLDToken.deploy(ethers.BigNumber.from("1000000"));
    await token.deployed();
    console.log(`Token Deployed to : ${token.address},`);
    for (let index = 1; index < 10; index++) {
      await token.transfer(accounts[index].address, stakeTokensAmt)

    }

    const Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(token.address, rate);
    await staking.deployed();
    console.log(`Staking Deployed to : ${staking.address},`);
    // await usdc.connect(account).transfer(testflashloan.address, ethers.utils.parseUnits("2000", 6));
  });

  it("it should check totalsupply in Token ", async function () {
    let data = await token.totalSupply()
    console.log("data", data);

  });


  it("it should stake token ", async function () {
    await token.connect(accounts[1]).approve(staking.address, stakeTokensAmt)
    await staking.connect(accounts[1]).StakeToken(stakeTokensAmt)
    expect(await staking.StakedAmount(accounts[1].address)).to.equal(stakeTokensAmt);
  });

  it("it should unStake token without any reward  ", async function () {
    await staking.connect(accounts[1]).UnStakeToken(unStakeTokensAmt)
    expect(await staking.StakedAmount(accounts[1].address)).to.equal(unStakeTokensAmt);
  });


  it("it should revert when  unStake tokens without pool reward  ", async function () {

    console.log(await token.balanceOf(accounts[2].address));
    await token.connect(accounts[2]).approve(staking.address, stakeTokensAmt)
    await staking.connect(accounts[2]).StakeToken(stakeTokensAmt)
    await time.increase(7899229)
    console.log(`after unsake total stake remaining ${await staking.TotalSaked()}`);
    await expect(staking.connect(accounts[2]).UnStakeToken(stakeTokensAmt)).to.be.revertedWith("reward not available")
  });
  it('should Check staker reward  ',async function() {
    await time.increase(7899239 * 3)
     let reward = await staking.connect(accounts[2]).RewardCheck()
     console.log(reward,"reward after one year");
     
     
   });



  it("it should unStake token with his quaterly reward  ", async function () {
    await token.connect(accounts[0]).approve(staking.address, ethers.BigNumber.from("1000"))
    await staking.connect(accounts[0]).AddReward(ethers.BigNumber.from("1000"))

    await token.connect(accounts[3]).approve(staking.address, stakeTokensAmt)
    let oldBalance = await token.balanceOf(accounts[3].address)
    await staking.connect(accounts[3]).StakeToken(stakeTokensAmt)
    await time.increase(7899239)

    await staking.connect(accounts[3]).UnStakeToken(stakeTokensAmt)
    let newBalance = await token.balanceOf(accounts[3].address)
    console.log(`New blanace with reward ${newBalance} & old blanace without reward ${oldBalance}`)
  });

  it("it should unStake token with his two quaters reward  ", async function () {
    await token.connect(accounts[4]).approve(staking.address, stakeTokensAmt)

    let oldBalance = await token.balanceOf(accounts[4].address)

    await staking.connect(accounts[4]).StakeToken(stakeTokensAmt)
    await time.increase(7899229 * 2)
    await staking.connect(accounts[4]).UnStakeToken(stakeTokensAmt)
    let newBalance = await token.balanceOf(accounts[4].address)

    console.log(`New blanace with reward ${newBalance} & old blanace without reward ${oldBalance}`)
  });

  it("it should unStake token with his one yearly rewards ", async function () {


    await token.connect(accounts[5]).approve(staking.address, stakeTokensAmt)
    let oldBalance = await token.balanceOf(accounts[5].address)
    await staking.connect(accounts[5]).StakeToken(stakeTokensAmt)
    await time.increase(7899239 * 4)

    await staking.connect(accounts[5]).UnStakeToken(stakeTokensAmt)
    let newBalance = await token.balanceOf(accounts[5].address)
    console.log(`New blanace with reward ${newBalance} & old blanace without reward ${oldBalance}`)
  });

  it("it should unStake token with his two years rewards  ", async function () {
    await token.connect(accounts[6]).approve(staking.address, stakeTokensAmt)

    let oldBalance = await token.balanceOf(accounts[6].address)

    await staking.connect(accounts[6]).StakeToken(stakeTokensAmt)
    await time.increase(7899229 * 8)
    // await token.connect(accounts[0]).approve(staking.address, ethers.BigNumber.from("1000"))

    // await staking.connect(accounts[0]).AddReward(ethers.BigNumber.from("1000"))
    await staking.connect(accounts[6]).UnStakeToken(stakeTokensAmt)
    let newBalance = await token.balanceOf(accounts[6].address)

    console.log(`New blanace with reward ${newBalance} & old blanace without reward ${oldBalance}`)
  });

  it('should withdraw reward from contract',async function() {
    let availableReward = await staking.RewardAvailable()
    console.log(availableReward,"availableReward");
    await staking.WithdrawReward(availableReward)
    expect( await staking.RewardAvailable() ).to.equal("0")
  });

  it('should Check total staked ',async function() {
    let totalSaked = await staking.TotalSaked()
    console.log(totalSaked,"totalSaked");
    
    
  });

  it('should  unstaked token with emergency  withdrawstakedTokenWithoutReward method if contract dose not have any reward ',async function() {
    let beforeTotalSaked = await staking.TotalSaked()

     await staking.connect(accounts[1]).WithdrawstakedTokenWithoutReward()
     let afterTotalSaked = await staking.TotalSaked()
     console.log(`before emergency withdraw TotalSaked ${beforeTotalSaked} , after TotalSaked ${afterTotalSaked}`);
    
    
  });

  



});
