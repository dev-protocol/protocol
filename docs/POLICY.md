# Policy proposal

This proposal is the first policy of the Dev Protocol.

All codes in this document are pseudo code for explanation.

## rewards

The total reward for a per block called `rewards` is determined as follows.

- More lockups, less rewards.
- More assets, more rewards.

As lockups increase, rewards decrease, and inflation rates decrease. As assets increase, rewards increase and inflation rates increase. The deflationary trend makes it more rapidly by lockup increases. Ideally, an increase in assets should be accompanied by lockups, so an increase in assets should be a factor in increasing the inflation rate. The maximum value is 0.00025 per block and an asset.

The following formula illustrates the basic concept:

![Rewards = Max*(1-StakingRatio)^((12-(StakingRatio*10))/2+1)](https://latex.codecogs.com/svg.latex?Rewards%20%3D%20Max*%281-StakingRatio%29%5E%7B%2812-%28StakingRatio*10%29%29/2+1%7D)

The number of reward vs. staking ratio will as follows curve:

![Reward curve](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/policy/staking-ratio-vs-mint-amount.svg?sanitize=true)

In Solidity:

```solidity
using SafeMath for uint256;
uint120 private constant basis = 10000000000000000000000000;
uint120 private constant power_basis = 10000000000;
uint64 private constant mint_per_block_and_aseet = 250000000000000;

function rewards(uint256 _lockups, uint256 _assets) external view returns(uint256) {
	uint256 max = _assets.mul(mint_per_block_and_aseet);
	uint256 t = ERC20(config().token()).totalSupply();
	uint256 s = (_lockups.mul(basis)).div(t);
	uint256 _d = basis.sub(s);
	uint256 _p = (
		(power_basis.mul(12)).sub(s.div((basis.div((power_basis.mul(10))))))
	).div(2);
	uint256 p = _p.div(power_basis);
	uint256 rp = p.add(1);
	uint256 f = _p.sub(p.mul(power_basis));
	uint256 d1 = _d;
	uint256 d2 = _d;
	for (uint256 i = 0; i < p; i++) {
		d1 = (d1.mul(_d)).div(basis);
	}
	for (uint256 i = 0; i < rp; i++) {
		d2 = (d2.mul(_d)).div(basis);
	}
	uint256 g = ((d1.sub(d2)).mul(f)).div(power_basis);
	uint256 d = d1.sub(g);
	uint256 mint = max.mul(d);
	mint = mint.div(basis);
	return mint;
}
```

## holdersShare

Property Contract holders receive a reward share is 95%.

```solidity
function holdersShare(uint256 _reward, uint256 _lockups) external view returns (uint256) {
	return _lockups > 0 ? (_reward.mul(95)).div(100) : _reward;
}
```

## assetValue

The calculation method for an asset value called `assetValue` is determined to multiply the number of lockups on the target Property by the measured value of the target asset.

This formula indicates that asset scores and lockups have equal influence.

```solidity
function assetValue(uint256 _value, uint256 _lockups) external view returns (uint256) {
	return (_lockups.add(1)).mul(_value);
}
```

## authenticationFee

Property Contract author pays `authenticationFee` is multiplies the number of assets by `0.00025` and subtracts 1/1000 of the number of stakes to the Property.

```solidity
function authenticationFee(uint256 total_assets, uint256 property_lockups) external view returns (uint256) {
		return (total_assets.div(10000)).sub((property_lockups.div(100000000000000000000000)));
}
```

## marketApproval

The number of votes required before a new Market is approved is called `marketApproval` is requires 10 or more votes in favor, and more than 10 times more votes than negative votes.

```solidity
function marketApproval(uint256 _up_votes, uint256 _negative_votes) external view returns (bool) {
	if (_up_votes < 9999999999999999999) {
		return false;
	}
	uint256 negative_votes = _negative_votes > 0
		? _negative_votes
		: 1000000000000000000;
	return _up_votes > negative_votes * 10;
}
```

## policyApproval

The number of votes required before a new Policy is approved is called `policyApproval` is requires 10 or more votes in favor, and more than 10 times more votes than negative votes.

```solidity
function policyApproval(uint256 _up_votes, uint256 _negative_votes) external view returns (bool) {
	if (_up_votes < 9999999999999999999) {
		return false;
	}
	uint256 negative_votes = _negative_votes > 0
		? _negative_votes
		: 1000000000000000000;
	return _up_votes > negative_votes * 10;
}
```

## marketVotingBlocks

The voting period for a new Market called `marketVotingBlocks` is 525600 blocks equals 3 months.

```solidity
uint public marketVotingBlocks = 525600;
```

## policyVotingBlocks

The voting period for a new Policy called `policyVotingBlocks` is 525600 blocks equals 3 months.

```solidity
uint public policyVotingBlocks = 525600;
```

## abstentionPenalty

The abstainers' penalty called `abstentionPenalty` impose an exclusion penalty of 175200 blocks (equals 1 month) on 9 times or more abstainers.

```solidity
function abstentionPenalty(uint256 abstentions) external view returns (uint256) {
	uint256 penalty = 0;
	if (abstentions > 9) {
		penalty = 175200;
	}
	return penalty;
}
```

## lockUpBlocks

The lock-up period from the request for cancellation of staking until the withdrawal becomes possible is 175200 blocks equals 1 month.

```solidity
uint public lockUpBlocks = 175200;
```
