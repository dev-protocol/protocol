pragma solidity ^0.5.0;

import "./State.sol";

contract StateTest is State {
    function containsMarket(address _market) public view returns (bool) {
        return markets[_market];
    }
}