pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./modules/oraclizeAPI_0.5.sol";
import "./libs/Killable.sol";
import "./libs/StringToUint.sol";
import "./UseState.sol";
import "./Repository.sol";

contract Distributor is usingOraclize, UseState {
	using SafeMath for uint;
	using StringToUint for string;
	struct Options {
		string start;
		string end;
		uint value;
		address payable invoker;
	}
	Options public options;
	struct Package {
		string name;
		uint downloads;
		address repository;
	}
	string[] public packages;
	uint public total = 0;
	uint expectedQueriesCount;
	uint pendingPayouts;
	address payable public factory;
	mapping(bytes32 => bool) pendingQueries;
	mapping(bytes32 => string) pendingPackages;
	mapping(string => uint) downloads;
	mapping(string => Package) details;
	mapping(string => bool) payoutCompleted;
	event LogNewOraclizeQuery(string _description);
	event LogDownloadsUpdated(string _package, uint _downloads);
	event LogFinishedAllQueries();
	event LogPayout(string _package, uint _value);
	event LogComplete();

	constructor(
		string memory start,
		string memory end,
		uint value,
		address payable invoker
	) public payable {
		factory = msg.sender;
		options = Options(start, end, value, invoker);
		oraclizing();
	}

	function oraclizing() private {
		address[] memory repositories = getRepositories();
		if (oraclize_getPrice("URL").mul(repositories.length) > address(
			this
		).balance) {
			emit LogNewOraclizeQuery(
				"All Oraclize queries were NOT sent, please add some ETH to cover for the query fee"
			);
			kill(factory);
		} else {
			for (uint i = 0; i < repositories.length; i++) {
				address repository = repositories[i];
				string memory package = Repository(repository).getPackage();
				queryNpmDownloads(options.start, options.end, package);
				expectedQueriesCount += 1;
			}
		}
	}

	function queryNpmDownloads(
		string memory start,
		string memory end,
		string memory package
	) private {
		if (oraclize_getPrice("URL") > address(this).balance) {
			emit LogNewOraclizeQuery(
				"Oraclize query was NOT sent, please add some ETH to cover for the query fee"
			);
			kill(factory);
		} else {
			emit LogNewOraclizeQuery(
				"Oraclize query was sent, standing by for the answer.."
			);
			string memory url = string(
				abi.encodePacked(
					"https://api.npmjs.org/downloads/point/",
					start,
					":",
					end,
					"/",
					package
				)
			);
			string memory param = string(
				abi.encodePacked("json(", url, ").downloads")
			);
			bytes32 queryId = oraclize_query("URL", param);
			pendingQueries[queryId] = true;
			pendingPackages[queryId] = package;
		}
	}

	function __callback(bytes32 id, string memory result) public {
		if (msg.sender != oraclize_cbAddress()) {
			revert("mismatch oraclize_cbAddress");
		}
		require(pendingQueries[id] == true, "invalid query id");
		string memory package = pendingPackages[id];
		uint count = result.toUint(0);
		address repos = getRepository(package);
		packages.push(package);
		details[package] = Package(package, count, repos);
		emit LogDownloadsUpdated(package, count);
		expectedQueriesCount -= 1;
		pendingPayouts += 1;
		if (expectedQueriesCount == 0) {
			emit LogFinishedAllQueries();
			calcTotal();
		}
	}

	function calcTotal() private {
		for (uint i = 0; i < packages.length; i++) {
			Package memory pkg = details[packages[i]];
			total = total.add(pkg.downloads);
		}
	}

	function payout(string memory _package) public {
		require(payoutCompleted[_package] == false, "already payout");
		Package memory pkg = details[_package];
		uint point = pkg.downloads;
		uint per = point.div(total);
		uint count = options.value.mul(per);
		address token = getToken();
		ERC20Mintable(token).mint(pkg.repository, count);
		Repository(pkg.repository).increment(count);
		emit LogPayout(_package, count);
		payoutCompleted[_package] = true;
		pendingPayouts -= 1;
		if (pendingPayouts == 0) {
			emit LogComplete();
			kill(options.invoker);
		}
	}

	function payoutAll() public {
		for (uint i = 0; i < packages.length; i++) {
			string memory _package = packages[i];
			payout(_package);
		}
	}

	function kill(address payable _addr) private {
		selfdestruct(_addr);
	}
}
