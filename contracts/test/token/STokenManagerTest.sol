pragma solidity 0.5.17;
pragma experimental ABIEncoderV2;

import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Counters} from "@openzeppelin/contracts/drafts/Counters.sol";
import {Strings} from "@openzeppelin/contracts/drafts/Strings.sol";
import {IAddressConfig} from "../../interface/IAddressConfig.sol";

contract STokensManagerTest is ISTokensManager, ERC721 {
	using Counters for Counters.Counter;
	using Strings for uint256;
	Counters.Counter private _tokenIds;
	address public config;
	mapping(bytes32 => bytes) private bytesStorage;

	modifier onlyLockup() {
		require(
			IAddressConfig(config).lockup() == _msgSender(),
			"illegal access"
		);
		_;
	}

	function initialize(address _config) external {
		config = _config;
	}

	function tokenURI(uint256 _tokenId) public view returns (string memory) {
		return _tokenId.fromUint256();
	}

	function mint(MintParams calldata _params)
		external
		onlyLockup
		returns (uint256, StakingPosition memory)
	{
		_tokenIds.increment();
		uint256 newItemId = _tokenIds.current();
		_safeMint(_params.owner, newItemId);
		StakingPosition memory newPosition = StakingPosition(
			_params.property,
			_params.amount,
			_params.price,
			0,
			0
		);
		setStoragePositionsV1(newItemId, newPosition);
		return (newItemId, newPosition);
	}

	function update(UpdateParams calldata _params)
		external
		onlyLockup
		returns (StakingPosition memory)
	{
		require(_exists(_params.tokenId), "not found");
		StakingPosition memory currentPosition = getStoragePositionsV1(
			_params.tokenId
		);
		currentPosition.amount = _params.amount;
		currentPosition.price = _params.price;
		currentPosition.cumulativeReward = _params.cumulativeReward;
		currentPosition.pendingReward = _params.pendingReward;
		setStoragePositionsV1(_params.tokenId, currentPosition);
		return currentPosition;
	}

	function positions(uint256 _tokenId)
		external
		view
		returns (StakingPosition memory)
	{
		return getStoragePositionsV1(_tokenId);
	}

	function getStoragePositionsV1(uint256 _tokenId)
		private
		view
		returns (StakingPosition memory)
	{
		bytes32 key = getStoragePositionsV1Key(_tokenId);
		bytes memory tmp = bytesStorage[key];
		require(keccak256(tmp) != keccak256(bytes("")), "illegal token id");
		return abi.decode(tmp, (StakingPosition));
	}

	function setStoragePositionsV1(
		uint256 _tokenId,
		StakingPosition memory _position
	) private {
		bytes32 key = getStoragePositionsV1Key(_tokenId);
		bytes memory tmp = abi.encode(_position);
		bytesStorage[key] = tmp;
	}

	function getStoragePositionsV1Key(uint256 _tokenId)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_positionsV1", _tokenId));
	}
}
