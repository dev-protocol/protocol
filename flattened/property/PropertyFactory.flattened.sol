// File: contracts/src/common/lifecycle/Killable.sol

pragma solidity ^0.5.0;

/**
 * A module that allows contracts to self-destruct.
 */
contract Killable {
	address payable public _owner;

	/**
	 * Initialized with the deployer as the owner.
	 */
	constructor() internal {
		_owner = msg.sender;
	}

	/**
	 * Self-destruct the contract.
	 * This function can only be executed by the owner.
	 */
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
	constructor() internal {}

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

	event OwnershipTransferred(
		address indexed previousOwner,
		address indexed newOwner
	);

	/**
	 * @dev Initializes the contract setting the deployer as the initial owner.
	 */
	constructor() internal {
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
		require(
			newOwner != address(0),
			"Ownable: new owner is the zero address"
		);
		emit OwnershipTransferred(_owner, newOwner);
		_owner = newOwner;
	}
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

/**
 * A module that provides common validations patterns.
 */
contract AddressValidator {
	string constant errorMessage = "this is illegal address";

	/**
	 * Validates passed address is not a zero address.
	 */
	function validateIllegalAddress(address _addr) external pure {
		require(_addr != address(0), errorMessage);
	}

	/**
	 * Validates passed address is included in an address set.
	 */
	function validateGroup(address _addr, address _groupAddr) external view {
		require(IGroup(_groupAddr).isGroup(_addr), errorMessage);
	}

	/**
	 * Validates passed address is included in two address sets.
	 */
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

	/**
	 * Validates that the address of the first argument is equal to the address of the second argument.
	 */
	function validateAddress(address _addr, address _target) external pure {
		require(_addr == _target, errorMessage);
	}

	/**
	 * Validates passed address equals to the two addresses.
	 */
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

	/**
	 * Validates passed address equals to the three addresses.
	 */
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

/**
 * Module for contrast handling AddressValidator.
 */
contract UsingValidator {
	AddressValidator private _validator;

	/**
	 * Create a new AddressValidator contract when initialize.
	 */
	constructor() public {
		_validator = new AddressValidator();
	}

	/**
	 * Returns the set AddressValidator address.
	 */
	function addressValidator() internal view returns (AddressValidator) {
		return _validator;
	}
}

// File: contracts/src/common/config/AddressConfig.sol

pragma solidity ^0.5.0;

/**
 * A registry contract to hold the latest contract addresses.
 * Dev Protocol will be upgradeable by this contract.
 */
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

	/**
	 * Set the latest Allocator contract address.
	 * Only the owner can execute this function.
	 */
	function setAllocator(address _addr) external onlyOwner {
		allocator = _addr;
	}

	/**
	 * Set the latest AllocatorStorage contract address.
	 * Only the owner can execute this function.
	 * NOTE: But currently, the AllocatorStorage contract is not used.
	 */
	function setAllocatorStorage(address _addr) external onlyOwner {
		allocatorStorage = _addr;
	}

	/**
	 * Set the latest Withdraw contract address.
	 * Only the owner can execute this function.
	 */
	function setWithdraw(address _addr) external onlyOwner {
		withdraw = _addr;
	}

	/**
	 * Set the latest WithdrawStorage contract address.
	 * Only the owner can execute this function.
	 */
	function setWithdrawStorage(address _addr) external onlyOwner {
		withdrawStorage = _addr;
	}

	/**
	 * Set the latest MarketFactory contract address.
	 * Only the owner can execute this function.
	 */
	function setMarketFactory(address _addr) external onlyOwner {
		marketFactory = _addr;
	}

	/**
	 * Set the latest MarketGroup contract address.
	 * Only the owner can execute this function.
	 */
	function setMarketGroup(address _addr) external onlyOwner {
		marketGroup = _addr;
	}

	/**
	 * Set the latest PropertyFactory contract address.
	 * Only the owner can execute this function.
	 */
	function setPropertyFactory(address _addr) external onlyOwner {
		propertyFactory = _addr;
	}

	/**
	 * Set the latest PropertyGroup contract address.
	 * Only the owner can execute this function.
	 */
	function setPropertyGroup(address _addr) external onlyOwner {
		propertyGroup = _addr;
	}

	/**
	 * Set the latest MetricsFactory contract address.
	 * Only the owner can execute this function.
	 */
	function setMetricsFactory(address _addr) external onlyOwner {
		metricsFactory = _addr;
	}

	/**
	 * Set the latest MetricsGroup contract address.
	 * Only the owner can execute this function.
	 */
	function setMetricsGroup(address _addr) external onlyOwner {
		metricsGroup = _addr;
	}

	/**
	 * Set the latest PolicyFactory contract address.
	 * Only the owner can execute this function.
	 */
	function setPolicyFactory(address _addr) external onlyOwner {
		policyFactory = _addr;
	}

	/**
	 * Set the latest PolicyGroup contract address.
	 * Only the owner can execute this function.
	 */
	function setPolicyGroup(address _addr) external onlyOwner {
		policyGroup = _addr;
	}

	/**
	 * Set the latest PolicySet contract address.
	 * Only the owner can execute this function.
	 */
	function setPolicySet(address _addr) external onlyOwner {
		policySet = _addr;
	}

	/**
	 * Set the latest Policy contract address.
	 * Only the latest PolicyFactory contract can execute this function.
	 */
	function setPolicy(address _addr) external {
		addressValidator().validateAddress(msg.sender, policyFactory);
		policy = _addr;
	}

	/**
	 * Set the latest Dev contract address.
	 * Only the owner can execute this function.
	 */
	function setToken(address _addr) external onlyOwner {
		token = _addr;
	}

	/**
	 * Set the latest Lockup contract address.
	 * Only the owner can execute this function.
	 */
	function setLockup(address _addr) external onlyOwner {
		lockup = _addr;
	}

	/**
	 * Set the latest LockupStorage contract address.
	 * Only the owner can execute this function.
	 * NOTE: But currently, the LockupStorage contract is not used as a stand-alone because it is inherited from the Lockup contract.
	 */
	function setLockupStorage(address _addr) external onlyOwner {
		lockupStorage = _addr;
	}

	/**
	 * Set the latest VoteTimes contract address.
	 * Only the owner can execute this function.
	 * NOTE: But currently, the VoteTimes contract is not used.
	 */
	function setVoteTimes(address _addr) external onlyOwner {
		voteTimes = _addr;
	}

	/**
	 * Set the latest VoteTimesStorage contract address.
	 * Only the owner can execute this function.
	 * NOTE: But currently, the VoteTimesStorage contract is not used.
	 */
	function setVoteTimesStorage(address _addr) external onlyOwner {
		voteTimesStorage = _addr;
	}

	/**
	 * Set the latest VoteCounter contract address.
	 * Only the owner can execute this function.
	 */
	function setVoteCounter(address _addr) external onlyOwner {
		voteCounter = _addr;
	}

	/**
	 * Set the latest VoteCounterStorage contract address.
	 * Only the owner can execute this function.
	 * NOTE: But currently, the VoteCounterStorage contract is not used as a stand-alone because it is inherited from the VoteCounter contract.
	 */
	function setVoteCounterStorage(address _addr) external onlyOwner {
		voteCounterStorage = _addr;
	}
}

// File: contracts/src/common/config/UsingConfig.sol

pragma solidity ^0.5.0;

/**
 * Module for using AddressConfig contracts.
 */
contract UsingConfig {
	AddressConfig private _config;

	/**
	 * Initialize the argument as AddressConfig address.
	 */
	constructor(address _addressConfig) public {
		_config = AddressConfig(_addressConfig);
	}

	/**
	 * Returns the latest AddressConfig instance.
	 */
	function config() internal view returns (AddressConfig) {
		return _config;
	}

	/**
	 * Returns the latest AddressConfig address.
	 */
	function configAddress() external view returns (address) {
		return address(_config);
	}
}

// File: @openzeppelin/contracts/math/SafeMath.sol

pragma solidity ^0.5.0;

/**
 * @dev Wrappers over Solidity's arithmetic operations with added overflow
 * checks.
 *
 * Arithmetic operations in Solidity wrap on overflow. This can easily result
 * in bugs, because programmers usually assume that an overflow raises an
 * error, which is the standard behavior in high level programming languages.
 * `SafeMath` restores this intuition by reverting the transaction when an
 * operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 */
library SafeMath {
	/**
	 * @dev Returns the addition of two unsigned integers, reverting on
	 * overflow.
	 *
	 * Counterpart to Solidity's `+` operator.
	 *
	 * Requirements:
	 * - Addition cannot overflow.
	 */
	function add(uint256 a, uint256 b) internal pure returns (uint256) {
		uint256 c = a + b;
		require(c >= a, "SafeMath: addition overflow");

		return c;
	}

	/**
	 * @dev Returns the subtraction of two unsigned integers, reverting on
	 * overflow (when the result is negative).
	 *
	 * Counterpart to Solidity's `-` operator.
	 *
	 * Requirements:
	 * - Subtraction cannot overflow.
	 */
	function sub(uint256 a, uint256 b) internal pure returns (uint256) {
		return sub(a, b, "SafeMath: subtraction overflow");
	}

	/**
	 * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
	 * overflow (when the result is negative).
	 *
	 * Counterpart to Solidity's `-` operator.
	 *
	 * Requirements:
	 * - Subtraction cannot overflow.
	 *
	 * _Available since v2.4.0._
	 */
	function sub(
		uint256 a,
		uint256 b,
		string memory errorMessage
	) internal pure returns (uint256) {
		require(b <= a, errorMessage);
		uint256 c = a - b;

		return c;
	}

	/**
	 * @dev Returns the multiplication of two unsigned integers, reverting on
	 * overflow.
	 *
	 * Counterpart to Solidity's `*` operator.
	 *
	 * Requirements:
	 * - Multiplication cannot overflow.
	 */
	function mul(uint256 a, uint256 b) internal pure returns (uint256) {
		// Gas optimization: this is cheaper than requiring 'a' not being zero, but the
		// benefit is lost if 'b' is also tested.
		// See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
		if (a == 0) {
			return 0;
		}

		uint256 c = a * b;
		require(c / a == b, "SafeMath: multiplication overflow");

		return c;
	}

	/**
	 * @dev Returns the integer division of two unsigned integers. Reverts on
	 * division by zero. The result is rounded towards zero.
	 *
	 * Counterpart to Solidity's `/` operator. Note: this function uses a
	 * `revert` opcode (which leaves remaining gas untouched) while Solidity
	 * uses an invalid opcode to revert (consuming all remaining gas).
	 *
	 * Requirements:
	 * - The divisor cannot be zero.
	 */
	function div(uint256 a, uint256 b) internal pure returns (uint256) {
		return div(a, b, "SafeMath: division by zero");
	}

	/**
	 * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
	 * division by zero. The result is rounded towards zero.
	 *
	 * Counterpart to Solidity's `/` operator. Note: this function uses a
	 * `revert` opcode (which leaves remaining gas untouched) while Solidity
	 * uses an invalid opcode to revert (consuming all remaining gas).
	 *
	 * Requirements:
	 * - The divisor cannot be zero.
	 *
	 * _Available since v2.4.0._
	 */
	function div(
		uint256 a,
		uint256 b,
		string memory errorMessage
	) internal pure returns (uint256) {
		// Solidity only automatically asserts when dividing by 0
		require(b > 0, errorMessage);
		uint256 c = a / b;
		// assert(a == b * c + a % b); // There is no case in which this doesn't hold

		return c;
	}

	/**
	 * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
	 * Reverts when dividing by zero.
	 *
	 * Counterpart to Solidity's `%` operator. This function uses a `revert`
	 * opcode (which leaves remaining gas untouched) while Solidity uses an
	 * invalid opcode to revert (consuming all remaining gas).
	 *
	 * Requirements:
	 * - The divisor cannot be zero.
	 */
	function mod(uint256 a, uint256 b) internal pure returns (uint256) {
		return mod(a, b, "SafeMath: modulo by zero");
	}

	/**
	 * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
	 * Reverts with custom message when dividing by zero.
	 *
	 * Counterpart to Solidity's `%` operator. This function uses a `revert`
	 * opcode (which leaves remaining gas untouched) while Solidity uses an
	 * invalid opcode to revert (consuming all remaining gas).
	 *
	 * Requirements:
	 * - The divisor cannot be zero.
	 *
	 * _Available since v2.4.0._
	 */
	function mod(
		uint256 a,
		uint256 b,
		string memory errorMessage
	) internal pure returns (uint256) {
		require(b != 0, errorMessage);
		return a % b;
	}
}

// File: @openzeppelin/contracts/token/ERC20/IERC20.sol

pragma solidity ^0.5.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP. Does not include
 * the optional functions; to access them see {ERC20Detailed}.
 */
interface IERC20 {
	/**
	 * @dev Returns the amount of tokens in existence.
	 */
	function totalSupply() external view returns (uint256);

	/**
	 * @dev Returns the amount of tokens owned by `account`.
	 */
	function balanceOf(address account) external view returns (uint256);

	/**
	 * @dev Moves `amount` tokens from the caller's account to `recipient`.
	 *
	 * Returns a boolean value indicating whether the operation succeeded.
	 *
	 * Emits a {Transfer} event.
	 */
	function transfer(address recipient, uint256 amount)
		external
		returns (bool);

	/**
	 * @dev Returns the remaining number of tokens that `spender` will be
	 * allowed to spend on behalf of `owner` through {transferFrom}. This is
	 * zero by default.
	 *
	 * This value changes when {approve} or {transferFrom} are called.
	 */
	function allowance(address owner, address spender)
		external
		view
		returns (uint256);

	/**
	 * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
	 *
	 * Returns a boolean value indicating whether the operation succeeded.
	 *
	 * IMPORTANT: Beware that changing an allowance with this method brings the risk
	 * that someone may use both the old and the new allowance by unfortunate
	 * transaction ordering. One possible solution to mitigate this race
	 * condition is to first reduce the spender's allowance to 0 and set the
	 * desired value afterwards:
	 * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
	 *
	 * Emits an {Approval} event.
	 */
	function approve(address spender, uint256 amount) external returns (bool);

	/**
	 * @dev Moves `amount` tokens from `sender` to `recipient` using the
	 * allowance mechanism. `amount` is then deducted from the caller's
	 * allowance.
	 *
	 * Returns a boolean value indicating whether the operation succeeded.
	 *
	 * Emits a {Transfer} event.
	 */
	function transferFrom(
		address sender,
		address recipient,
		uint256 amount
	) external returns (bool);

	/**
	 * @dev Emitted when `value` tokens are moved from one account (`from`) to
	 * another (`to`).
	 *
	 * Note that `value` may be zero.
	 */
	event Transfer(address indexed from, address indexed to, uint256 value);

	/**
	 * @dev Emitted when the allowance of a `spender` for an `owner` is set by
	 * a call to {approve}. `value` is the new allowance.
	 */
	event Approval(
		address indexed owner,
		address indexed spender,
		uint256 value
	);
}

// File: @openzeppelin/contracts/token/ERC20/ERC20.sol

pragma solidity ^0.5.0;

/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 * For a generic mechanism see {ERC20Mintable}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * We have followed general OpenZeppelin guidelines: functions revert instead
 * of returning `false` on failure. This behavior is nonetheless conventional
 * and does not conflict with the expectations of ERC20 applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */
contract ERC20 is Context, IERC20 {
	using SafeMath for uint256;

	mapping(address => uint256) private _balances;

	mapping(address => mapping(address => uint256)) private _allowances;

	uint256 private _totalSupply;

	/**
	 * @dev See {IERC20-totalSupply}.
	 */
	function totalSupply() public view returns (uint256) {
		return _totalSupply;
	}

	/**
	 * @dev See {IERC20-balanceOf}.
	 */
	function balanceOf(address account) public view returns (uint256) {
		return _balances[account];
	}

	/**
	 * @dev See {IERC20-transfer}.
	 *
	 * Requirements:
	 *
	 * - `recipient` cannot be the zero address.
	 * - the caller must have a balance of at least `amount`.
	 */
	function transfer(address recipient, uint256 amount) public returns (bool) {
		_transfer(_msgSender(), recipient, amount);
		return true;
	}

	/**
	 * @dev See {IERC20-allowance}.
	 */
	function allowance(address owner, address spender)
		public
		view
		returns (uint256)
	{
		return _allowances[owner][spender];
	}

	/**
	 * @dev See {IERC20-approve}.
	 *
	 * Requirements:
	 *
	 * - `spender` cannot be the zero address.
	 */
	function approve(address spender, uint256 amount) public returns (bool) {
		_approve(_msgSender(), spender, amount);
		return true;
	}

	/**
	 * @dev See {IERC20-transferFrom}.
	 *
	 * Emits an {Approval} event indicating the updated allowance. This is not
	 * required by the EIP. See the note at the beginning of {ERC20};
	 *
	 * Requirements:
	 * - `sender` and `recipient` cannot be the zero address.
	 * - `sender` must have a balance of at least `amount`.
	 * - the caller must have allowance for `sender`'s tokens of at least
	 * `amount`.
	 */
	function transferFrom(
		address sender,
		address recipient,
		uint256 amount
	) public returns (bool) {
		_transfer(sender, recipient, amount);
		_approve(
			sender,
			_msgSender(),
			_allowances[sender][_msgSender()].sub(
				amount,
				"ERC20: transfer amount exceeds allowance"
			)
		);
		return true;
	}

	/**
	 * @dev Atomically increases the allowance granted to `spender` by the caller.
	 *
	 * This is an alternative to {approve} that can be used as a mitigation for
	 * problems described in {IERC20-approve}.
	 *
	 * Emits an {Approval} event indicating the updated allowance.
	 *
	 * Requirements:
	 *
	 * - `spender` cannot be the zero address.
	 */
	function increaseAllowance(address spender, uint256 addedValue)
		public
		returns (bool)
	{
		_approve(
			_msgSender(),
			spender,
			_allowances[_msgSender()][spender].add(addedValue)
		);
		return true;
	}

	/**
	 * @dev Atomically decreases the allowance granted to `spender` by the caller.
	 *
	 * This is an alternative to {approve} that can be used as a mitigation for
	 * problems described in {IERC20-approve}.
	 *
	 * Emits an {Approval} event indicating the updated allowance.
	 *
	 * Requirements:
	 *
	 * - `spender` cannot be the zero address.
	 * - `spender` must have allowance for the caller of at least
	 * `subtractedValue`.
	 */
	function decreaseAllowance(address spender, uint256 subtractedValue)
		public
		returns (bool)
	{
		_approve(
			_msgSender(),
			spender,
			_allowances[_msgSender()][spender].sub(
				subtractedValue,
				"ERC20: decreased allowance below zero"
			)
		);
		return true;
	}

	/**
	 * @dev Moves tokens `amount` from `sender` to `recipient`.
	 *
	 * This is internal function is equivalent to {transfer}, and can be used to
	 * e.g. implement automatic token fees, slashing mechanisms, etc.
	 *
	 * Emits a {Transfer} event.
	 *
	 * Requirements:
	 *
	 * - `sender` cannot be the zero address.
	 * - `recipient` cannot be the zero address.
	 * - `sender` must have a balance of at least `amount`.
	 */
	function _transfer(
		address sender,
		address recipient,
		uint256 amount
	) internal {
		require(sender != address(0), "ERC20: transfer from the zero address");
		require(recipient != address(0), "ERC20: transfer to the zero address");

		_balances[sender] = _balances[sender].sub(
			amount,
			"ERC20: transfer amount exceeds balance"
		);
		_balances[recipient] = _balances[recipient].add(amount);
		emit Transfer(sender, recipient, amount);
	}

	/** @dev Creates `amount` tokens and assigns them to `account`, increasing
	 * the total supply.
	 *
	 * Emits a {Transfer} event with `from` set to the zero address.
	 *
	 * Requirements
	 *
	 * - `to` cannot be the zero address.
	 */
	function _mint(address account, uint256 amount) internal {
		require(account != address(0), "ERC20: mint to the zero address");

		_totalSupply = _totalSupply.add(amount);
		_balances[account] = _balances[account].add(amount);
		emit Transfer(address(0), account, amount);
	}

	/**
	 * @dev Destroys `amount` tokens from `account`, reducing the
	 * total supply.
	 *
	 * Emits a {Transfer} event with `to` set to the zero address.
	 *
	 * Requirements
	 *
	 * - `account` cannot be the zero address.
	 * - `account` must have at least `amount` tokens.
	 */
	function _burn(address account, uint256 amount) internal {
		require(account != address(0), "ERC20: burn from the zero address");

		_balances[account] = _balances[account].sub(
			amount,
			"ERC20: burn amount exceeds balance"
		);
		_totalSupply = _totalSupply.sub(amount);
		emit Transfer(account, address(0), amount);
	}

	/**
	 * @dev Sets `amount` as the allowance of `spender` over the `owner`s tokens.
	 *
	 * This is internal function is equivalent to `approve`, and can be used to
	 * e.g. set automatic allowances for certain subsystems, etc.
	 *
	 * Emits an {Approval} event.
	 *
	 * Requirements:
	 *
	 * - `owner` cannot be the zero address.
	 * - `spender` cannot be the zero address.
	 */
	function _approve(
		address owner,
		address spender,
		uint256 amount
	) internal {
		require(owner != address(0), "ERC20: approve from the zero address");
		require(spender != address(0), "ERC20: approve to the zero address");

		_allowances[owner][spender] = amount;
		emit Approval(owner, spender, amount);
	}

	/**
	 * @dev Destroys `amount` tokens from `account`.`amount` is then deducted
	 * from the caller's allowance.
	 *
	 * See {_burn} and {_approve}.
	 */
	function _burnFrom(address account, uint256 amount) internal {
		_burn(account, amount);
		_approve(
			account,
			_msgSender(),
			_allowances[account][_msgSender()].sub(
				amount,
				"ERC20: burn amount exceeds allowance"
			)
		);
	}
}

// File: @openzeppelin/contracts/token/ERC20/ERC20Detailed.sol

pragma solidity ^0.5.0;

/**
 * @dev Optional functions from the ERC20 standard.
 */
contract ERC20Detailed is IERC20 {
	string private _name;
	string private _symbol;
	uint8 private _decimals;

	/**
	 * @dev Sets the values for `name`, `symbol`, and `decimals`. All three of
	 * these values are immutable: they can only be set once during
	 * construction.
	 */
	constructor(
		string memory name,
		string memory symbol,
		uint8 decimals
	) public {
		_name = name;
		_symbol = symbol;
		_decimals = decimals;
	}

	/**
	 * @dev Returns the name of the token.
	 */
	function name() public view returns (string memory) {
		return _name;
	}

	/**
	 * @dev Returns the symbol of the token, usually a shorter version of the
	 * name.
	 */
	function symbol() public view returns (string memory) {
		return _symbol;
	}

	/**
	 * @dev Returns the number of decimals used to get its user representation.
	 * For example, if `decimals` equals `2`, a balance of `505` tokens should
	 * be displayed to a user as `5,05` (`505 / 10 ** 2`).
	 *
	 * Tokens usually opt for a value of 18, imitating the relationship between
	 * Ether and Wei.
	 *
	 * NOTE: This information is only used for _display_ purposes: it in
	 * no way affects any of the arithmetic of the contract, including
	 * {IERC20-balanceOf} and {IERC20-transfer}.
	 */
	function decimals() public view returns (uint8) {
		return _decimals;
	}
}

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

// File: contracts/src/property/IProperty.sol

pragma solidity ^0.5.0;

contract IProperty {
	function author() external view returns (address);

	function withdraw(address _sender, uint256 _value) external;
}

// File: contracts/src/property/Property.sol

pragma solidity ^0.5.0;

// prettier-ignore

/**
 * A contract that represents the assets of the user and collects staking from the stakers.
 * Property contract inherits ERC20.
 * Holders of Property contracts(tokens) receive holder rewards according to their share.
 */
contract Property is
	ERC20,
	ERC20Detailed,
	UsingConfig,
	UsingValidator,
	IProperty
{
	using SafeMath for uint256;
	uint8 private constant _property_decimals = 18;
	uint256 private constant _supply = 10000000000000000000000000;
	address public author;

	/**
	 * Initializes the passed value as AddressConfig address, author address, token name, and token symbol.
	 */
	constructor(
		address _config,
		address _own,
		string memory _name,
		string memory _symbol
	)
		public
		UsingConfig(_config)
		ERC20Detailed(_name, _symbol, _property_decimals)
	{
		/**
		 * Validates the sender is PropertyFactory contract.
		 */
		addressValidator().validateAddress(
			msg.sender,
			config().propertyFactory()
		);

		/**
		 * Sets the author.
		 */
		author = _own;

		/**
		 * Mints to the author 100% of the total supply.
		 */
		_mint(author, _supply);
	}

	/**
	 * Hook on `transfer` and call `Withdraw.beforeBalanceChange` function.
	 */
	function transfer(address _to, uint256 _value) public returns (bool) {
		/**
		 * Validates the destination is not 0 address.
		 */
		addressValidator().validateIllegalAddress(_to);
		require(_value != 0, "illegal transfer value");

		/**
		 * Calls Withdraw contract via Allocator contract.
		 * Passing through the Allocator contract is due to the historical reason for the old Property contract.
		 */
		IAllocator(config().allocator()).beforeBalanceChange(
			address(this),
			msg.sender,
			_to
		);

		/**
		 * Calls the transfer of ERC20.
		 */
		_transfer(msg.sender, _to, _value);
		return true;
	}

	/**
	 * Hook on `transferFrom` and call `Withdraw.beforeBalanceChange` function.
	 */
	function transferFrom(
		address _from,
		address _to,
		uint256 _value
	) public returns (bool) {
		/**
		 * Validates the source and destination is not 0 address.
		 */
		addressValidator().validateIllegalAddress(_from);
		addressValidator().validateIllegalAddress(_to);
		require(_value != 0, "illegal transfer value");

		/**
		 * Calls Withdraw contract via Allocator contract.
		 * Passing through the Allocator contract is due to the historical reason for the old Property contract.
		 */
		IAllocator(config().allocator()).beforeBalanceChange(
			address(this),
			_from,
			_to
		);

		/**
		 * Calls the transfer of ERC20.
		 */
		_transfer(_from, _to, _value);

		/**
		 * Reduces the allowance amount.
		 */
		uint256 allowanceAmount = allowance(_from, msg.sender);
		_approve(
			_from,
			msg.sender,
			allowanceAmount.sub(
				_value,
				"ERC20: transfer amount exceeds allowance"
			)
		);
		return true;
	}

	/**
	 * Transfers the staking amount to the original owner.
	 */
	function withdraw(address _sender, uint256 _value) external {
		/**
		 * Validates the sender is Lockup contract.
		 */
		addressValidator().validateAddress(msg.sender, config().lockup());

		/**
		 * Transfers the passed amount to the original owner.
		 */
		ERC20 devToken = ERC20(config().token());
		bool result = devToken.transfer(_sender, _value);
		require(result, "dev transfer failed");
	}
}

// File: contracts/src/common/storage/EternalStorage.sol

pragma solidity ^0.5.0;

/**
 * Module for persisting states.
 * Stores a map for `uint256`, `string`, `address`, `bytes32`, `bool`, and `int256` type with `bytes32` type as a key.
 */
contract EternalStorage {
	address private currentOwner = msg.sender;

	mapping(bytes32 => uint256) private uIntStorage;
	mapping(bytes32 => string) private stringStorage;
	mapping(bytes32 => address) private addressStorage;
	mapping(bytes32 => bytes32) private bytesStorage;
	mapping(bytes32 => bool) private boolStorage;
	mapping(bytes32 => int256) private intStorage;

	/**
	 * Modifiers to validate that only the owner can execute.
	 */
	modifier onlyCurrentOwner() {
		require(msg.sender == currentOwner, "not current owner");
		_;
	}

	/**
	 * Transfer the owner.
	 * Only the owner can execute this function.
	 */
	function changeOwner(address _newOwner) external {
		require(msg.sender == currentOwner, "not current owner");
		currentOwner = _newOwner;
	}

	// *** Getter Methods ***

	/**
	 * Returns the value of the `uint256` type that mapped to the given key.
	 */
	function getUint(bytes32 _key) external view returns (uint256) {
		return uIntStorage[_key];
	}

	/**
	 * Returns the value of the `string` type that mapped to the given key.
	 */
	function getString(bytes32 _key) external view returns (string memory) {
		return stringStorage[_key];
	}

	/**
	 * Returns the value of the `address` type that mapped to the given key.
	 */
	function getAddress(bytes32 _key) external view returns (address) {
		return addressStorage[_key];
	}

	/**
	 * Returns the value of the `bytes32` type that mapped to the given key.
	 */
	function getBytes(bytes32 _key) external view returns (bytes32) {
		return bytesStorage[_key];
	}

	/**
	 * Returns the value of the `bool` type that mapped to the given key.
	 */
	function getBool(bytes32 _key) external view returns (bool) {
		return boolStorage[_key];
	}

	/**
	 * Returns the value of the `int256` type that mapped to the given key.
	 */
	function getInt(bytes32 _key) external view returns (int256) {
		return intStorage[_key];
	}

	// *** Setter Methods ***

	/**
	 * Maps a value of `uint256` type to a given key.
	 * Only the owner can execute this function.
	 */
	function setUint(bytes32 _key, uint256 _value) external onlyCurrentOwner {
		uIntStorage[_key] = _value;
	}

	/**
	 * Maps a value of `string` type to a given key.
	 * Only the owner can execute this function.
	 */
	function setString(bytes32 _key, string calldata _value)
		external
		onlyCurrentOwner
	{
		stringStorage[_key] = _value;
	}

	/**
	 * Maps a value of `address` type to a given key.
	 * Only the owner can execute this function.
	 */
	function setAddress(bytes32 _key, address _value)
		external
		onlyCurrentOwner
	{
		addressStorage[_key] = _value;
	}

	/**
	 * Maps a value of `bytes32` type to a given key.
	 * Only the owner can execute this function.
	 */
	function setBytes(bytes32 _key, bytes32 _value) external onlyCurrentOwner {
		bytesStorage[_key] = _value;
	}

	/**
	 * Maps a value of `bool` type to a given key.
	 * Only the owner can execute this function.
	 */
	function setBool(bytes32 _key, bool _value) external onlyCurrentOwner {
		boolStorage[_key] = _value;
	}

	/**
	 * Maps a value of `int256` type to a given key.
	 * Only the owner can execute this function.
	 */
	function setInt(bytes32 _key, int256 _value) external onlyCurrentOwner {
		intStorage[_key] = _value;
	}

	// *** Delete Methods ***

	/**
	 * Deletes the value of the `uint256` type that mapped to the given key.
	 * Only the owner can execute this function.
	 */
	function deleteUint(bytes32 _key) external onlyCurrentOwner {
		delete uIntStorage[_key];
	}

	/**
	 * Deletes the value of the `string` type that mapped to the given key.
	 * Only the owner can execute this function.
	 */
	function deleteString(bytes32 _key) external onlyCurrentOwner {
		delete stringStorage[_key];
	}

	/**
	 * Deletes the value of the `address` type that mapped to the given key.
	 * Only the owner can execute this function.
	 */
	function deleteAddress(bytes32 _key) external onlyCurrentOwner {
		delete addressStorage[_key];
	}

	/**
	 * Deletes the value of the `bytes32` type that mapped to the given key.
	 * Only the owner can execute this function.
	 */
	function deleteBytes(bytes32 _key) external onlyCurrentOwner {
		delete bytesStorage[_key];
	}

	/**
	 * Deletes the value of the `bool` type that mapped to the given key.
	 * Only the owner can execute this function.
	 */
	function deleteBool(bytes32 _key) external onlyCurrentOwner {
		delete boolStorage[_key];
	}

	/**
	 * Deletes the value of the `int256` type that mapped to the given key.
	 * Only the owner can execute this function.
	 */
	function deleteInt(bytes32 _key) external onlyCurrentOwner {
		delete intStorage[_key];
	}
}

// File: contracts/src/common/storage/UsingStorage.sol

pragma solidity ^0.5.0;

/**
 * Module for contrast handling EternalStorage.
 */
contract UsingStorage is Ownable {
	address private _storage;

	/**
	 * Modifier to verify that EternalStorage is set.
	 */
	modifier hasStorage() {
		require(_storage != address(0), "storage is not set");
		_;
	}

	/**
	 * Returns the set EternalStorage instance.
	 */
	function eternalStorage()
		internal
		view
		hasStorage
		returns (EternalStorage)
	{
		return EternalStorage(_storage);
	}

	/**
	 * Returns the set EternalStorage address.
	 */
	function getStorageAddress() external view hasStorage returns (address) {
		return _storage;
	}

	/**
	 * Create a new EternalStorage contract.
	 * This function call will fail if the EternalStorage contract is already set.
	 * Also, only the owner can execute it.
	 */
	function createStorage() external onlyOwner {
		require(_storage == address(0), "storage is set");
		EternalStorage tmp = new EternalStorage();
		_storage = address(tmp);
	}

	/**
	 * Assigns the EternalStorage contract that has already been created.
	 * Only the owner can execute this function.
	 */
	function setStorage(address _storageAddress) external onlyOwner {
		_storage = _storageAddress;
	}

	/**
	 * Delegates the owner of the current EternalStorage contract.
	 * Only the owner can execute this function.
	 */
	function changeOwner(address newOwner) external onlyOwner {
		EternalStorage(_storage).changeOwner(newOwner);
	}
}

// File: contracts/src/property/PropertyGroup.sol

pragma solidity ^0.5.0;

contract PropertyGroup is UsingConfig, UsingStorage, UsingValidator, IGroup {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		addressValidator().validateAddress(
			msg.sender,
			config().propertyFactory()
		);

		require(isGroup(_addr) == false, "already enabled");
		eternalStorage().setBool(getGroupKey(_addr), true);
	}

	function isGroup(address _addr) public view returns (bool) {
		return eternalStorage().getBool(getGroupKey(_addr));
	}
}

// File: contracts/src/property/IPropertyFactory.sol

pragma solidity ^0.5.0;

contract IPropertyFactory {
	function create(
		string calldata _name,
		string calldata _symbol,
		address _author
	)
		external
		returns (
			// solium-disable-next-line indentation
			address
		);

	function createAndAuthenticate(
		string calldata _name,
		string calldata _symbol,
		address _market,
		string calldata _args1,
		string calldata _args2,
		string calldata _args3
	)
		external
		returns (
			// solium-disable-next-line indentation
			bool
		);
}

// File: contracts/src/market/IMarket.sol

pragma solidity ^0.5.0;

interface IMarket {
	function authenticate(
		address _prop,
		string calldata _args1,
		string calldata _args2,
		string calldata _args3,
		string calldata _args4,
		string calldata _args5
	)
		external
		returns (
			// solium-disable-next-line indentation
			bool
		);

	function authenticateFromPropertyFactory(
		address _prop,
		address _author,
		string calldata _args1,
		string calldata _args2,
		string calldata _args3,
		string calldata _args4,
		string calldata _args5
	)
		external
		returns (
			// solium-disable-next-line indentation
			bool
		);

	function authenticatedCallback(address _property, bytes32 _idHash)
		external
		returns (address);

	function deauthenticate(address _metrics) external;

	function schema() external view returns (string memory);

	function behavior() external view returns (address);

	function enabled() external view returns (bool);

	function votingEndBlockNumber() external view returns (uint256);

	function toEnable() external;
}

// File: contracts/src/property/PropertyFactory.sol

pragma solidity ^0.5.0;

/**
 * A factory contract that creates a new Property contract.
 */
contract PropertyFactory is UsingConfig, IPropertyFactory {
	event Create(address indexed _from, address _property);

	/**
	 * Initialize the passed address as AddressConfig address.
	 */
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	/**
	 * Creates a new Property contract.
	 */
	function create(
		string calldata _name,
		string calldata _symbol,
		address _author
	) external returns (address) {
		return _create(_name, _symbol, _author);
	}

	/**
	 * Creates a new Property contract and authenticate.
	 * There are too many local variables, so when using this method limit the number of arguments that can be used to authenticate to a maximum of 3.
	 */
	function createAndAuthenticate(
		string calldata _name,
		string calldata _symbol,
		address _market,
		string calldata _args1,
		string calldata _args2,
		string calldata _args3
	) external returns (bool) {
		return
			IMarket(_market).authenticateFromPropertyFactory(
				_create(_name, _symbol, msg.sender),
				msg.sender,
				_args1,
				_args2,
				_args3,
				"",
				""
			);
	}

	/**
	 * Creates a new Property contract.
	 */
	function _create(
		string memory _name,
		string memory _symbol,
		address _author
	) private returns (address) {
		/**
		 * Creates a new Property contract.
		 */
		Property property = new Property(
			address(config()),
			_author,
			_name,
			_symbol
		);

		/**
		 * Adds the new Property contract to the Property address set.
		 */
		IGroup(config().propertyGroup()).addGroup(address(property));

		emit Create(msg.sender, address(property));
		return address(property);
	}
}
