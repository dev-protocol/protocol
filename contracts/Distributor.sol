pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "./modules/BokkyPooBahsDateTimeLibrary.sol";
import "./libs/UintToString.sol";
import "./libs/StringToUint.sol";
import "./libs/Killable.sol";
import "./libs/Timebased.sol";
import "./libs/Withdrawable.sol";
import "./modules/oraclizeAPI_0.5.sol";
import "./Repository.sol";
import "./UseState.sol";

contract Distributor is Timebased, Killable, Ownable, UseState, usingOraclize, Withdrawable {
	using SafeMath for uint;
	using UintToString for uint;
	using StringToUint for string;
	uint public mintVolumePerDay;
	uint public lastDistribute;
	mapping(string => address) distributors;
	struct Request {
		string start;
		string end;
		uint value;
		address invoker;
	}
	struct Query {
		bytes32 requestId;
		address repository;
	}
	mapping(bytes32 => Request) requests;
	mapping(bytes32 => uint) oracleExpectedCallbackCounts;
	mapping(bytes32 => Query) oraclePendingQueries;
	mapping(bytes32 => mapping(address => uint)) downloads;
	mapping(bytes32 => address[]) packages;
	mapping(bytes32 => uint) totalsEachRequests;

	event LogNewOraclizeQuery(string _description);
	event LogDownloadsUpdated(address _repository, uint _downloads);
	event LogFinishedAllQueries();
	event LogPayout(string _package, uint _value);
	event LogComplete();

	function setMintVolumePerDay(uint _vol) public onlyOwner {
		mintVolumePerDay = _vol;
	}

	function setSecondsPerBlock(uint _sec) public onlyOwner {
		_setSecondsPerBlock(_sec);
	}

	function dateFormat(uint _y, uint _m, uint _d)
		internal
		pure
		returns (string memory)
	{
		return string(
			abi.encodePacked(
				_y.toString(),
				"-",
				_m.toString(),
				"-",
				_d.toString()
			)
		);
	}

	function distribute() public payable {
		uint yesterday = timestamp() - 1 days;
		uint diff = BokkyPooBahsDateTimeLibrary.diffDays(
			lastDistribute,
			yesterday
		);
		require(diff >= 1, "Expected an interval is one day or more");
		(uint startY, uint startM, uint startD) = BokkyPooBahsDateTimeLibrary.timestampToDate(
			lastDistribute
		);
		(uint endY, uint endM, uint endD) = BokkyPooBahsDateTimeLibrary.timestampToDate(
			yesterday
		);
		string memory start = dateFormat(startY, startM, startD);
		string memory end = dateFormat(endY, endM, endD);
		uint value = diff.mul(mintVolumePerDay);
		calculate(start, end, value);
		lastDistribute = timestamp();
		msg.sender.transfer(address(this).balance);
	}

	function __callback(bytes32 _id, string memory _result) public {
		Query memory query = oraclePendingQueries[_id];
		if (msg.sender != oraclize_cbAddress()) {
			revert("mismatch oraclize_cbAddress");
		}
		bytes32 requestId = query.requestId;
		address repos = query.repository;
		require(query.repository != address(0), "invalid query id");
		uint count = _result.toUint(0);
		packages[requestId].push(repos);
		downloads[requestId][repos] = count;
		emit LogDownloadsUpdated(repos, count);
		oracleExpectedCallbackCounts[requestId] -= 1;
		finishingCalculation(requestId);
	}

	function calculate(string memory _start, string memory _end, uint _value)
		internal
	{
		bytes32 id = createRequestId(_start, _end);
		requests[id] = Request(_start, _end, _value, msg.sender);
		oracleRun(id);
	}

	function createRequestId(string memory _start, string memory _end)
		private
		pure
		returns (bytes32)
	{
		return sha256(abi.encodePacked(_start, _end));
	}

	function oracleRun(bytes32 _reqId) private {
		address[] memory repositories = getRepositories();
		require(
			oraclize_getPrice("URL").mul(repositories.length) > address(
				this
			).balance,
			"All Oraclize queries were NOT sent, please add some ETH to cover for the query fee"
		);
		for (uint i = 0; i < repositories.length; i++) {
			address repos = repositories[i];
			oracleExpectedCallbackCounts[_reqId] += 1;
			oracleQueryNpmDownloads(_reqId, repos);
		}
	}

	function oracleQueryNpmDownloads(bytes32 _reqId, address _repos) private {
		require(
			oraclize_getPrice("URL") > address(this).balance,
			"Oraclize query was NOT sent, please add some ETH to cover for the query fee"
		);
		Request memory req = requests[_reqId];
		string memory package = Repository(_repos).getPackage();
		string memory url = string(
			abi.encodePacked(
				"https://api.npmjs.org/downloads/point/",
				req.start,
				":",
				req.end,
				"/",
				package
			)
		);
		string memory param = string(
			abi.encodePacked("json(", url, ").downloads")
		);
		bytes32 queryId = oraclize_query("URL", param);
		oraclePendingQueries[queryId] = Query(_reqId, _repos);
	}

	function finishingCalculation(bytes32 _reqId) private {
		if (oracleExpectedCallbackCounts[_reqId] != 0) {
			return;
		}
		emit LogFinishedAllQueries();

		address[] memory pkgs = packages[_reqId];
		for (uint i = 0; i < pkgs.length; i++) {
			uint count = downloads[_reqId][pkgs[i]];
			totalsEachRequests[_reqId] = totalsEachRequests[_reqId].add(count);
		}
		for (uint i = 0; i < pkgs.length; i++) {
			address repos = pkgs[i];
			uint count = downloads[_reqId][pkgs[i]];
			totalsEachRequests[_reqId] = totalsEachRequests[_reqId].add(count);
			uint per = count.div(totalsEachRequests[_reqId]);
			uint value = requests[_reqId].value.mul(per);
			increment(repos, value);
		}
	}
}
