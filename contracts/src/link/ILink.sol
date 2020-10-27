pragma solidity 0.5.17;

interface ILink {
	function getTokenAddress() external view returns (address);

	function getStorageLastCumulativeInterestPrice()
		external
		view
		returns (uint256);

	function depositFrom(
		address _from,
		address _to,
		uint256 _amount
	) external returns (bool);

	function cancel(address _property) external;

	function withdraw(address _property) external;
}
