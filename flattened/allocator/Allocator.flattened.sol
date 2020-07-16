
// File: contracts/src/allocator/IAllocator.sol

pragma solidity ^0.5.0;

contract IAllocator {
	function calculateMaxRewardsPerBlock() public view returns (uint256);

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
		// solium-disable-next-line indentation
	) external;
}

// File: contracts/src/common/interface/IGroup.sol

pragma solidity ^0.5.0;

contract IGroup {
	function isGroup(address _addr) public view returns (bool);

	function addGroup(address _addr) external;

	function getGroupKey(address _addr) internal pure returns (bytes32) {
		return keccak256(abi.encodePacked("_group", _addr));
	}
}

// File: contracts/src/common/validate/AddressValidator.sol

pragma solidity ^0.5.0;


contract AddressValidator {
	string constant errorMessage = "this is illegal address";

	function validateIllegalAddress(address _addr) external pure {
		require(_addr != address(0), errorMessage);
	}

	function validateGroup(address _addr, address _groupAddr) external view {
		require(IGroup(_groupAddr).isGroup(_addr), errorMessage);
	}

	function validateGroups(
		address _addr,
		address _groupAddr1,
		address _groupAddr2
	) external view {
		if (IGroup(_groupAddr1).isGroup(_addr)) {
			return;
		}
		require(IGroup(_groupAddr2).isGroup(_addr), errorMessage);
	}

	function validateAddress(address _addr, address _target) external pure {
		require(_addr == _target, errorMessage);
	}

	function validateAddresses(
		address _addr,
		address _target1,
		address _target2
	) external pure {
		if (_addr == _target1) {
			return;
		}
		require(_addr == _target2, errorMessage);
	}

	function validate3Addresses(
		address _addr,
		address _target1,
		address _target2,
		address _target3
	) external pure {
		if (_addr == _target1) {
			return;
		}
		if (_addr == _target2) {
			return;
		}
		require(_addr == _target3, errorMessage);
	}
}

// File: contracts/src/common/validate/UsingValidator.sol

pragma solidity ^0.5.0;

// prettier-ignore


contract UsingValidator {
	AddressValidator private _validator;

	constructor() public {
		_validator = new AddressValidator();
	}

	function addressValidator() internal view returns (AddressValidator) {
		return _validator;
	}
}

// File: contracts/src/common/lifecycle/Killable.sol

pragma solidity ^0.5.0;

contract Killable {
	address payable public _owner;

	constructor() internal {
		_owner = msg.sender;
	}

	function kill() public {
		require(msg.sender == _owner, "only owner method");
		selfdestruct(_owner);
	}
}

// File: @openzeppelin/contracts/GSN/Context.sol

pragma solidity ^0.5.0;

/*
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with GSN meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
contract Context {
    // Empty internal constructor, to prevent people from mistakenly deploying
    // an instance of this contract, which should be used via inheritance.
    constructor () internal { }
    // solhint-disable-previous-line no-empty-blocks

    function _msgSender() internal view returns (address payable) {
        return msg.sender;
    }

    function _msgData() internal view returns (bytes memory) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

// File: @openzeppelin/contracts/ownership/Ownable.sol

pragma solidity ^0.5.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () internal {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(isOwner(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Returns true if the caller is the current owner.
     */
    function isOwner() public view returns (bool) {
        return _msgSender() == _owner;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     */
    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

// File: contracts/src/common/config/AddressConfig.sol

pragma solidity ^0.5.0;




contract AddressConfig is Ownable, UsingValidator, Killable {
	address public token = 0x98626E2C9231f03504273d55f397409deFD4a093;
	address public allocator;
	address public allocatorStorage;
	address public withdraw;
	address public withdrawStorage;
	address public marketFactory;
	address public marketGroup;
	address public propertyFactory;
	address public propertyGroup;
	address public metricsGroup;
	address public metricsFactory;
	address public policy;
	address public policyFactory;
	address public policySet;
	address public policyGroup;
	address public lockup;
	address public lockupStorage;
	address public voteTimes;
	address public voteTimesStorage;
	address public voteCounter;
	address public voteCounterStorage;

	function setAllocator(address _addr) external onlyOwner {
		allocator = _addr;
	}

	function setAllocatorStorage(address _addr) external onlyOwner {
		allocatorStorage = _addr;
	}

	function setWithdraw(address _addr) external onlyOwner {
		withdraw = _addr;
	}

	function setWithdrawStorage(address _addr) external onlyOwner {
		withdrawStorage = _addr;
	}

	function setMarketFactory(address _addr) external onlyOwner {
		marketFactory = _addr;
	}

	function setMarketGroup(address _addr) external onlyOwner {
		marketGroup = _addr;
	}

	function setPropertyFactory(address _addr) external onlyOwner {
		propertyFactory = _addr;
	}

	function setPropertyGroup(address _addr) external onlyOwner {
		propertyGroup = _addr;
	}

	function setMetricsFactory(address _addr) external onlyOwner {
		metricsFactory = _addr;
	}

	function setMetricsGroup(address _addr) external onlyOwner {
		metricsGroup = _addr;
	}

	function setPolicyFactory(address _addr) external onlyOwner {
		policyFactory = _addr;
	}

	function setPolicyGroup(address _addr) external onlyOwner {
		policyGroup = _addr;
	}

	function setPolicySet(address _addr) external onlyOwner {
		policySet = _addr;
	}

	function setPolicy(address _addr) external {
		addressValidator().validateAddress(msg.sender, policyFactory);
		policy = _addr;
	}

	function setToken(address _addr) external onlyOwner {
		token = _addr;
	}

	function setLockup(address _addr) external onlyOwner {
		lockup = _addr;
	}

	function setLockupStorage(address _addr) external onlyOwner {
		lockupStorage = _addr;
	}

	function setVoteTimes(address _addr) external onlyOwner {
		voteTimes = _addr;
	}

	function setVoteTimesStorage(address _addr) external onlyOwner {
		voteTimesStorage = _addr;
	}

	function setVoteCounter(address _addr) external onlyOwner {
		voteCounter = _addr;
	}

	function setVoteCounterStorage(address _addr) external onlyOwner {
		voteCounterStorage = _addr;
	}
}

// File: contracts/src/common/config/UsingConfig.sol

pragma solidity ^0.5.0;


contract UsingConfig {
	AddressConfig private _config;

	constructor(address _addressConfig) public {
		_config = AddressConfig(_addressConfig);
	}

	function config() internal view returns (AddressConfig) {
		return _config;
	}

	function configAddress() external view returns (address) {
		return address(_config);
	}
}

// File: contracts/src/metrics/IMetricsGroup.sol

pragma solidity ^0.5.0;


contract IMetricsGroup is IGroup {
	function removeGroup(address _addr) external;

	function totalIssuedMetrics() external view returns (uint256);
}

// File: contracts/src/withdraw/IWithdraw.sol

pragma solidity ^0.5.0;

contract IWithdraw {
	function withdraw(address _property) external;

	function getRewardsAmount(address _property)
		external
		view
		returns (uint256);

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
		// solium-disable-next-line indentation
	) external;

	function calculateWithdrawableAmount(address _property, address _user)
		external
		view
		returns (uint256);

	function calculateTotalWithdrawableAmount(address _property)
		external
		view
		returns (uint256);
}

// File: contracts/src/policy/IPolicy.sol

pragma solidity ^0.5.0;

contract IPolicy {
	function rewards(uint256 _lockups, uint256 _assets)
		external
		view
		returns (uint256);

	function holdersShare(uint256 _amount, uint256 _lockups)
		external
		view
		returns (uint256);

	function assetValue(uint256 _value, uint256 _lockups)
		external
		view
		returns (uint256);

	function authenticationFee(uint256 _assets, uint256 _propertyAssets)
		external
		view
		returns (uint256);

	function marketApproval(uint256 _agree, uint256 _opposite)
		external
		view
		returns (bool);

	function policyApproval(uint256 _agree, uint256 _opposite)
		external
		view
		returns (bool);

	function marketVotingBlocks() external view returns (uint256);

	function policyVotingBlocks() external view returns (uint256);

	function abstentionPenalty(uint256 _count) external view returns (uint256);

	function lockUpBlocks() external view returns (uint256);
}

// File: contracts/src/lockup/ILockup.sol

pragma solidity ^0.5.0;

contract ILockup {
	function lockup(
		address _from,
		address _property,
		uint256 _value
		// solium-disable-next-line indentation
	) external;

	function update() public;

	function cancel(address _property) external;

	function withdraw(address _property) external;

	function difference(address _property, uint256 _lastReward)
		public
		view
		returns (
			uint256 _reward,
			uint256 _holdersAmount,
			uint256 _holdersPrice,
			uint256 _interestAmount,
			uint256 _interestPrice
		);

	function next(address _property)
		public
		view
		returns (
			uint256 _holders,
			uint256 _interest,
			uint256 _holdersPrice,
			uint256 _interestPrice
		);

	function getPropertyValue(address _property)
		external
		view
		returns (uint256);

	function getAllValue() external view returns (uint256);

	function getValue(address _property, address _sender)
		external
		view
		returns (uint256);

	function calculateWithdrawableInterestAmount(
		address _property,
		address _user
	)
		public
		view
		returns (
			// solium-disable-next-line indentation
			uint256
		);

	function withdrawInterest(address _property) external;
}

// File: contracts/src/allocator/Allocator.sol

pragma solidity ^0.5.0;








contract Allocator is UsingConfig, IAllocator, UsingValidator {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function calculateMaxRewardsPerBlock() public view returns (uint256) {
		uint256 totalAssets = IMetricsGroup(config().metricsGroup())
			.totalIssuedMetrics();
		uint256 totalLockedUps = ILockup(config().lockup()).getAllValue();
		return IPolicy(config().policy()).rewards(totalLockedUps, totalAssets);
	}

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
	) external {
		addressValidator().validateGroup(msg.sender, config().propertyGroup());

		IWithdraw(config().withdraw()).beforeBalanceChange(
			_property,
			_from,
			_to
		);
	}
}
