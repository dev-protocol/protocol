pragma solidity >=0.5.17;

/* solhint-disable max-states-count */
interface IAddressConfig {
	function token() external view returns (address);
	function allocator() external view returns (address);
	function allocatorStorage() external view returns (address);
	function withdraw() external view returns (address);
	function withdrawStorage() external view returns (address);
	function marketFactory() external view returns (address);
	function marketGroup() external view returns (address);
	function propertyFactory() external view returns (address);
	function propertyGroup() external view returns (address);
	function metricsGroup() external view returns (address);
	function metricsFactory() external view returns (address);
	function policy() external view returns (address);
	function policyFactory() external view returns (address);
	function policySet() external view returns (address);
	function policyGroup() external view returns (address);
	function lockup() external view returns (address);

	function lockupStorage() external view returns (address);
	function voteTimes() external view returns (address);
	function voteTimesStorage() external view returns (address);
	function voteCounter() external view returns (address);
	function voteCounterStorage() external view returns (address);
}
