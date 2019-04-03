pragma solidity >=0.5.2;
pragma experimental ABIEncoderV2;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract Project is Ownable {
	struct Options {
		address relayer;
		address backlog;
		string id;
		string source;
	}
	struct Entry {
		address user;
		address relayer;
	}
	struct Score {
		address user;
		uint value;
	}

	Options public options;
	string[] public keys;
	address[] public users;
	mapping(string => bool) private usedKey;
	mapping(address => bool) private enteredUsers;
	mapping(address => address) public entries;
	mapping(string => uint) private totalScores;
	mapping(address => mapping(string => uint)) private userScores;
	event StartEvaluate(string _key, uint blocknumber);

	constructor(address relayer, address backlog,
		string memory id,
		string memory source) public {
		options = Options(relayer, backlog, id, source);
	}

	function entry(address _relayer) public {
		address user = msg.sender;
		if (!enteredUsers[user]) {
			enteredUsers[user] = true;
			users.push(user);
		}
		entries[user] = _relayer;
	}

	function evaluate(string memory key) public {
		if (!usedKey[key]) {
			usedKey[key] = true;
			keys.push(key);
		}
		emit StartEvaluate(key, block.number);
	}

	function setScore(string memory key, Score[] memory scores) public {
		uint length = scores.length;
		uint total = 0;
		for (uint i = 0; i < length; i++) {
			Score memory item = scores[i];
			total += item.value;
			userScores[item.user][key] = item.value;
		}
		totalScores[key] = total;
	}

	function getScore() public returns(uint, Score[] memory) {
		uint total = getTotalScore();
		Score[] memory scores;
		for(uint i = 0; i < users.length; i++){
			address user = users[i];
			scores[i] = Score(user, getUserScore(user));
		}
		return (total, scores);
	}

	function getTotalScore() public returns(uint) {
		uint total = 0;
		for(uint i = 0; i < keys.length; i++){
			string memory key = keys[i];
			total += totalScores[key];
		}
		return total;
	}

	function getUserScore(address user) public returns(uint) {
		uint total = 0;
		for(uint i = 0; i < keys.length; i++){
			string memory key = keys[i];
			total += userScores[user][key];
		}
		return total;
	}

	function kill() public onlyOwner {
		selfdestruct(msg.sender);
	}
}
