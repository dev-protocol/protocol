# Policy proposal

This proposal is the first policy of the Dev Protocol.

All codes in this document are pseudo code for explanation.

## rewards

The total reward for a per block called `rewards` is determined as follows.

- More lockups, less rewards.
- More assets, more rewards.

As lockups increase, rewards decrease, and inflation rates decrease. As assets increase, rewards increase and inflation rates increase. The deflationary trend makes it more rapidly by lockup increases. Ideally, an increase in assets should be accompanied by lockups, so an increase in assets should be a factor in increasing the inflation rate. The maximum value is 0.00025 per block and an asset.

The following formula illustrates the basic concept:

![Rewards = Max*(1-StakingRate)^((12-(StakingRate*10))/2)](https://latex.codecogs.com/svg.latex?%5Cdpi%7B200%7D%20Rewards%20%3D%20Max*%281-StakingRate%29%5E%7B%2812-%28StakingRate*10%29%29/2%7D)

In Solidity:

```solidity
uint120 private constant basis = 10000000000000000000000000;
uint120 private constant power_basis = 10000000000;
uint64 private constant mint_per_block_and_aseet = 250000000000000;

function rewards(uint _lockups, uint _assets) public view returns(uint256) {
	uint256 max = _assets * mint_per_block_and_aseet;
	uint256 t = ERC20(token).totalSupply();
	uint256 l = _lockups * basis / t;
	uint256 _d = basis - l;
	uint256 _p = ((12 * power_basis) - l / (basis / (10 * power_basis))) / 2;
	uint256 p = _p / power_basis;
	uint256 rp = p + 1;
	uint256 f = _p - p * power_basis;
	uint256 d1 = _d;
	uint256 d2 = _d;
	for (uint i=1; i<rp; i++) {
		d1 = d1 * _d / basis;
	}
	for (uint i=1; i<rp+1; i++) {
		d2 = d2 * _d / basis;
	}
	uint256 g = (d1 - d2) * f / power_basis;
	uint256 d = d1 - g;
	uint256 mint = max * d / basis;
	return mint;
}
```

## holdersShare

Property Contract holders receive a reward share is 95%.

```solidity
function holdersShare(uint reward, uint lockups) public pure returns(uint) {
	return reward * 95 / 100;
}
```

## assetValue

The calculation method for an asset value called `assetValue` is determined to multiply the number of lockups on the target Property by the measured value of the target asset.

This formula indicates that asset scores and lockups have equal influence.

```solidity
function assetValue(uint lockups, uint value) public pure returns(uint) {
	return lockups * value;
}
```

## authenticationFee

Property Contract author pays `authenticationFee` is multiplies the number of assets by `0.00025` and subtracts 1/1,000,000 of the number of stakes.

```solidity
function authenticationFee(uint total_assets, uint total_lockups) public pure returns(uint) {
	return total_assets * 250000000000000 - total_lockups / 1000000;
}
```

## marketApproval

This value is still under consideration.

## policyApproval

This value is still under consideration.

## marketVotingBlocks

This value is still under consideration.

## policyVotingBlocks

This value is still under consideration.

## abstentionPenalty

This value is still under consideration.

## lockUpBlocks

This value is still under consideration.
