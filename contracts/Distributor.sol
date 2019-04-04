pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './modules/oraclizeAPI_0.5.sol';
import './libs/Killable.sol';
import './UseState.sol';
import './Security.sol';

contract Distributor is Killable, usingOraclize, UseState {
	using SafeMath for uint;
	struct Package {
		uint point;
		uint downloads;
		uint balance;
	}

	uint public total = 0;
	Package[] public packages;

	constructor(string memory start, string memory end, uint value) public {
		distribute(start, end, value);
		kill();
	}

	function distribute(string memory start, string memory end, uint value)
		private
	{
		address token = getToken();
		address[] memory securities = getSecurities();
		for (uint i = 0; i < securities.length; i++) {
			address security = securities[i];
			uint balance = getTotalBalance(security);
			uint downloads = getNpmDownloads(
				start,
				end,
				Security(security).getPackage()
			);
			uint point = balance.add(downloads);
			total = total.add(point);
			packages.push(Package(point, downloads, balance));
		}
		for (uint i = 0; i < securities.length; i++) {
			address security = securities[i];
			uint point = packages[i].point;
			uint per = point.div(total);
			uint count = value.mul(per);
			// solium-disable-next-line security/no-low-level-calls
			token.delegatecall(
				abi.encodePacked(
					bytes4(keccak256('mint(address, uint256)')),
					security,
					count
				)
			);
		}
	}

	function getNpmDownloads(
		string memory start,
		string memory end,
		string memory package
	) private returns (uint) {
		string memory url = string(
			abi.encodePacked(
				'https://api.npmjs.org/downloads/point/',
				start,
				':',
				end,
				'/',
				package
			)
		);
		oraclize_query('URL', url);
	}
}
