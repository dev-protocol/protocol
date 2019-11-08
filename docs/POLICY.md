# Policy proposal

This proposal is the first policy of the Dev Protocol.

All codes in this document are pseudo code for explanation.

## rewards

The total reward for a per block called `rewards` is determined as follows.

- More lockups, less rewards.
- More assets, more rewards.

As lockups increase, rewards decrease, and inflation rates decrease. As assets increase, rewards increase and inflation rates increase. The deflationary trend makes it more rapidly by lockup increases. Ideally, an increase in assets should be accompanied by lockups, so an increase in assets should be a factor in increasing the inflation rate. The maximum value is 1 per block.

```solidity
function rewards(uint lockups, uint assets) public pure returns(uint) {
	return 10^18 - ((lockups - (assets * 10^18)) / block.number);
}
```

## holdersShare

This value is still under consideration.

## assetValue

The calculation method for an asset value called `assetValue` is determined to multiply the number of lockups on the target Property by the measured value of the target asset.

This formula indicates that asset scores and lockups have equal influence.

```solidity
function assetValue(uint lockups, uint value) public pure returns(uint) {
	return lockups * value;
}
```

## authenticationFee

This value is still under consideration.

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
