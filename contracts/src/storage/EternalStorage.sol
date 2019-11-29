pragma solidity ^0.5.0;

import "./variable/UInt.sol";
import "./variable/AddressUIntMap.sol";

contract EternalStorage {
	UInt public uInt = new UInt();
	AddressUIntMap public addressUIntMap = new AddressUIntMap();
}
