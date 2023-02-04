// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./IERC20.sol";

contract Staking {
    IERC20 Token;
    uint256 rate;
    address owner;

    mapping(address => uint256) public StakedAmount;
    mapping(address => uint256) public StakedTime;
    uint256 public TotalSaked;
    uint256 public RewardAvailable;



    constructor(IERC20 _tokenAddess, uint256 _rewardPercentage) {
        Token = _tokenAddess;
        rate = _rewardPercentage;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "user is not owner");
        _;
    }

    function StakeToken(uint256 _amount) public {
        _stake(msg.sender, _amount);
        TotalSaked += _amount;
        // 100 stake for  1 year gives 1 time reward at percent of 5% = 105
        // 100 stake for  2 year gives 1 time reward at percent of 5% = 110.25
    }

    function UnStakeToken(uint256 _amount) public {
        _unStake(msg.sender, _amount);
        TotalSaked -= _amount;
    }

    function _stake(address _staker, uint256 _amount) internal {
        Token.transferFrom(_staker, address(this), _amount);
        StakedAmount[_staker] += _amount;
        StakedTime[_staker] = block.timestamp;
    }

    function _unStake(address _staker, uint256 _amount) internal {
        uint256 reward = _reward(_amount, _staker);
        require(
            RewardAvailable + StakedAmount[_staker] >= reward,
            "reward not available"
        );
        if (reward > _amount) {
            RewardAvailable -= (reward - _amount);
        }
        Token.transfer(_staker, reward);
        StakedAmount[_staker] -= _amount;
    }

    function _reward(uint256 _amount, address _staker)
        internal
        view
        returns (uint256)
    {
        uint256 duration;
        if (StakedTime[msg.sender] + 84 days <= block.timestamp) {
            duration = block.timestamp - StakedTime[_staker]; ///
        }
       
      

        uint256 time = duration / 84 days;

        uint256 _rewardAndPrincipal = _amount;
        if (_rewardAndPrincipal > 0) {
            if (time > 0) {
                for (uint i = 1; i <= time; i++) {
                    _rewardAndPrincipal +=
                        ((_rewardAndPrincipal * rate * 100) / 4) /
                        10000;
                }
                if (time >= 4) {
                    _rewardAndPrincipal =
                        _rewardAndPrincipal +
                        duration /
                        365 days;
                }
            }
        }

        return _rewardAndPrincipal;
    }

    function RewardCheck() public view returns (uint256) {
        uint256 reward = _reward(StakedAmount[msg.sender], msg.sender);

        if (reward > StakedAmount[msg.sender]) {
            return reward - StakedAmount[msg.sender];
        } else {
            return 0;
        }
    }

    // // This function is only for testing
    // function setStakedTime(uint _time, uint year) public {
    //     StakedTime[msg.sender] = block.timestamp - _time * year;
    // }

    function AddReward(uint256 _amount) public onlyOwner {
        Token.transferFrom(msg.sender, address(this), _amount);
        RewardAvailable += _amount;
    }

    function WithdrawReward(uint256 _amount) public onlyOwner {
        require(_amount <= RewardAvailable, "not enough reward available");
        Token.transfer(msg.sender, _amount);
        RewardAvailable -= _amount;
    }

    function WithdrawstakedTokenWithoutReward() public {
        Token.transfer(msg.sender, StakedAmount[msg.sender]);
        TotalSaked -= StakedAmount[msg.sender];
        StakedAmount[msg.sender] = 0;
    }
}


