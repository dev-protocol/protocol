pragma solidity 0.5.17;
pragma experimental ABIEncoderV2;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Counters} from "@openzeppelin/contracts/drafts/Counters.sol";
import {Strings} from "@openzeppelin/contracts/drafts/Strings.sol";
import {IAddressConfig} from "../../interface/IAddressConfig.sol";

contract STokensManagerTest is ERC721 {
	using Counters for Counters.Counter;
	using Strings for uint256;
	Counters.Counter private _tokenIds;
	address public config;
	uint256 public latestTokenId;
	mapping(bytes32 => bytes) private bytesStorage;
	mapping(uint256 => bytes32) private payloadStorage;

	struct StakingPositionV1 {
		address property;
		uint256 amount;
		uint256 price;
		uint256 cumulativeReward;
		uint256 pendingReward;
	}

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

	function tokenURI(uint256 _tokenId) public pure returns (string memory) {
		return _tokenId.fromUint256();
	}

	function mint(
		address _owner,
		address _property,
		uint256 _amount,
		uint256 _price,
		bytes32 _payload
	) external onlyLockup returns (uint256 tokenId_) {
		_tokenIds.increment();
		uint256 newTokenId = _tokenIds.current();
		_safeMint(_owner, newTokenId);
		StakingPositionV1 memory newPosition = StakingPositionV1(
			_property,
			_amount,
			_price,
			0,
			0
		);
		setStoragePositionsV1(newTokenId, newPosition);
		latestTokenId = newTokenId;
		payloadStorage[newTokenId] = _payload;
		return newTokenId;
	}

	function payloadOf(uint256 _tokenId) external view returns (bytes32) {
		return payloadStorage[_tokenId];
	}

	function update(
		uint256 _tokenId,
		uint256 _amount,
		uint256 _price,
		uint256 _cumulativeReward,
		uint256 _pendingReward
	) external onlyLockup returns (bool) {
		require(_exists(_tokenId), "not found");
		StakingPositionV1 memory currentPosition = getStoragePositionsV1(
			_tokenId
		);
		currentPosition.amount = _amount;
		currentPosition.price = _price;
		currentPosition.cumulativeReward = _cumulativeReward;
		currentPosition.pendingReward = _pendingReward;
		setStoragePositionsV1(_tokenId, currentPosition);
		return true;
	}

	function positions(uint256 _tokenId)
		external
		view
		returns (
			address,
			uint256,
			uint256,
			uint256,
			uint256
		)
	{
		StakingPositionV1 memory currentPosition = getStoragePositionsV1(
			_tokenId
		);
		return (
			currentPosition.property,
			currentPosition.amount,
			currentPosition.price,
			currentPosition.cumulativeReward,
			currentPosition.pendingReward
		);
	}

	function getStoragePositionsV1(uint256 _tokenId)
		private
		view
		returns (StakingPositionV1 memory)
	{
		bytes32 key = getStoragePositionsV1Key(_tokenId);
		bytes memory tmp = bytesStorage[key];
		require(keccak256(tmp) != keccak256(bytes("")), "illegal token id");
		return abi.decode(tmp, (StakingPositionV1));
	}

	function setStoragePositionsV1(
		uint256 _tokenId,
		StakingPositionV1 memory _position
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
