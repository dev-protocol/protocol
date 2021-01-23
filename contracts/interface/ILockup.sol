// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.5.17;

interface ILockup {
	function lockup(
		address _from,
		address _property,
		uint256 _value
	) external;

	function update() external;

	function withdraw(address _property, uint256 _amount) external;

	function calculateRewardAmount(address _property)
		external
		view
		returns (uint256, uint256);

	/**
	 * caution!!!this function is deprecated!!!
	 * use calculateRewardAmount
	 */
	function calculateCumulativeHoldersRewardAmount(address _property)
		external
		view
		returns (uint256);

	function getPropertyValue(address _property)
		external
		view
		returns (uint256);

	function getAllValue() external view returns (uint256);

	function getValue(address _property, address _sender)
		external
		view
		returns (uint256);

	function calculateWithdrawableInterestAmount(
		address _property,
		address _user
	) external view returns (uint256);

	function geometricMeanLockedUp() external view returns (uint256);

	function setGeometricMean(uint256 _geometricMean) external;
}
