pragma solidity ^0.5.0;

contract PolicyVoteValidator {
	mapping(address=>mapping(address=>bool)) private _voteRecord;
	function validate(
		address _sender,
		address _propatyAddress,
		uint256 _voteCount
	) public {
		require(_voteCount != 0, "vote count is 0");
		require(_voteRecord[_sender][_propatyAddress], "already vote");
		_voteRecord[_sender][_propatyAddress] = true;
	}
}
