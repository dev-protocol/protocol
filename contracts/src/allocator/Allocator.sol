pragma solidity ^0.5.0;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Pausable} from "@openzeppelin/contracts/lifecycle/Pausable.sol";
import {IAllocator} from "contracts/src/allocator/IAllocator.sol";
import {Decimals} from "contracts/src/common/libs/Decimals.sol";
import {UsingValidator} from "contracts/src/common/validate/UsingValidator.sol";
import {UsingConfig} from "contracts/src/common/config/UsingConfig.sol";
import {Market} from "contracts/src/market/Market.sol";
import {IMarketBehavior} from "contracts/src/market/IMarketBehavior.sol";
import {Metrics} from "contracts/src/metrics/Metrics.sol";
import {MetricsGroup} from "contracts/src/metrics/MetricsGroup.sol";
import {Withdraw} from "contracts/src/withdraw/Withdraw.sol";
import {Policy} from "contracts/src/policy/Policy.sol";
import {Lockup} from "contracts/src/lockup/Lockup.sol";
import {AllocatorStorage} from "contracts/src/allocator/AllocatorStorage.sol";

contract Allocator is Pausable, UsingConfig, IAllocator, UsingValidator {
	using SafeMath for uint256;
	using Decimals for uint256;

	uint64 public constant basis = 1000000000000000000;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function calculatePerBlock(address _property)
		public
		view
		returns (
			uint256 _holders,
			uint256 _interest,
			uint256 _maxHolders,
			uint256 _maxInterest
		)
	{
		uint256 totalAssets = MetricsGroup(config().metricsGroup())
			.totalIssuedMetrics();
		uint256 lockedUps = Lockup(config().lockup()).getPropertyValue(
			_property
		);
		uint256 totalLockedUps = Lockup(config().lockup()).getAllValue();
		uint256 mint = Policy(config().policy()).rewards(
			totalLockedUps,
			totalAssets
		);
		uint256 result = allocation(1, mint, lockedUps, totalLockedUps);
		uint256 holders = Policy(config().policy()).holdersShare(
			result,
			lockedUps
		);
		uint256 maxHolders = Policy(config().policy()).holdersShare(
			mint,
			totalLockedUps
		);
		uint256 interest = result.sub(holders);
		uint256 maxInterest = mint.sub(maxHolders);
		return (holders, interest, maxHolders, maxInterest);
	}

	function calculate(
		address _property,
		uint256 _beginBlock,
		uint256 _endBlock
	)
		external
		view
		returns (
			uint256 _holders,
			uint256 _interest,
			uint256 _maxHolders,
			uint256 _maxInterest
		)
	{
		uint256 beginBlock = getBeginBlock(_property, _beginBlock);
		uint256 blocks = _endBlock.sub(beginBlock);
		if (blocks == 0) {
			return (0, 0, 0, 0);
		}
		(
			uint256 _holdersPerBlock,
			uint256 _interestPerBlock,
			uint256 _maxHoldersPerBlock,
			uint256 _maxInterestPerBlock
		) = calculatePerBlock(_property);
		uint256 holders = _holdersPerBlock.mul(blocks);
		uint256 interest = _interestPerBlock.mul(blocks);
		uint256 maxHolders = _maxHoldersPerBlock.mul(blocks);
		uint256 maxInterest = _maxInterestPerBlock.mul(blocks);
		return (holders, interest, maxHolders, maxInterest);
	}

	function getBeginBlock(address _property, uint256 _beginBlock)
		private
		view
		returns (uint256)
	{
		if (_beginBlock > 0) {
			return _beginBlock;
		}
		uint256 tmp = getStorage().getLastBlockNumber(_property);
		if (tmp > 0) {
			return tmp;
		}
		return block.number;
	}

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
	) external {
		addressValidator().validateGroup(msg.sender, config().propertyGroup());

		Withdraw(config().withdraw()).beforeBalanceChange(
			_property,
			_from,
			_to
		);
	}

	function getRewardsAmount(address _property)
		external
		view
		returns (uint256)
	{
		return Withdraw(config().withdraw()).getRewardsAmount(_property);
	}

	function allocation(
		uint256 _blocks,
		uint256 _mint,
		uint256 _lockedUps,
		uint256 _totalLockedUps
	) public pure returns (uint256) {
		uint256 lShare = _totalLockedUps > 0
			? _lockedUps.outOf(_totalLockedUps)
			: Decimals.basis();
		uint256 mint = _mint.mul(_blocks);
		return mint.mul(lShare).div(Decimals.basis());
	}

	function getStorage() private view returns (AllocatorStorage) {
		require(paused() == false, "You cannot use that");
		return AllocatorStorage(config().allocatorStorage());
	}
}
