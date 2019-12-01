pragma solidity ^0.5.0;

contract EternalStorage {

	address private latestOwner = msg.sender;

	mapping(bytes32 => uint) private uIntStorage;
	mapping(bytes32 => string) private stringStorage;
	mapping(bytes32 => address) private addressStorage;
	mapping(bytes32 => bytes) private bytesStorage;
	mapping(bytes32 => bool) private boolStorage;
	mapping(bytes32 => int) private intStorage;

	modifier onlyLatestOwner() {
		require(msg.sender == latestOwner, "not latest version");
		_;
	}

	function upgradeOwner(address _newOwner) public {
		require(msg.sender == latestOwner, "not current owner");
		latestOwner = _newOwner;
	}

    // *** Getter Methods ***
	function getUint(bytes32 _key) external view returns(uint) {
		return uIntStorage[_key];
	}

	function getString(bytes32 _key) external view returns(string memory) {
		return stringStorage[_key];
	}

	function getAddress(bytes32 _key) external view returns(address) {
		return addressStorage[_key];
	}

	function getBytes(bytes32 _key) external view returns(bytes memory) {
		return bytesStorage[_key];
	}

	function getBool(bytes32 _key) external view returns(bool) {
		return boolStorage[_key];
	}

	function getInt(bytes32 _key) external view returns(int) {
		return intStorage[_key];
	}

    // *** Setter Methods ***
	function setUint(bytes32 _key, uint _value) external onlyLatestOwner {
		uIntStorage[_key] = _value;
	}

	function setString(bytes32 _key, string calldata _value) external onlyLatestOwner {
		stringStorage[_key] = _value;
	}

	function setAddress(bytes32 _key, address _value) external onlyLatestOwner {
		addressStorage[_key] = _value;
	}

	function setBytes(bytes32 _key, bytes calldata _value) external onlyLatestOwner {
		bytesStorage[_key] = _value;
	}

	function setBool(bytes32 _key, bool _value) external onlyLatestOwner {
		boolStorage[_key] = _value;
	}

	function setInt(bytes32 _key, int _value) external onlyLatestOwner {
		intStorage[_key] = _value;
	}

    // *** Delete Methods ***
	function deleteUint(bytes32 _key) external onlyLatestOwner {
		delete uIntStorage[_key];
	}

	function deleteString(bytes32 _key) external onlyLatestOwner {
		delete stringStorage[_key];
	}

	function deleteAddress(bytes32 _key) external onlyLatestOwner {
		delete addressStorage[_key];
	}

	function deleteBytes(bytes32 _key) external onlyLatestOwner  {
		delete bytesStorage[_key];
	}

	function deleteBool(bytes32 _key) external onlyLatestOwner {
		delete boolStorage[_key];
	}

	function deleteInt(bytes32 _key) external onlyLatestOwner {
		delete intStorage[_key];
	}
}
