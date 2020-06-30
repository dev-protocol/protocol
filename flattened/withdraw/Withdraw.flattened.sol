pragma solidity ^0.5.0;

// prettier-ignore

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

/**
 * @title Roles
 * @dev Library for managing addresses assigned to a Role.
 */
library Roles {
	struct Role {
		mapping(address => bool) bearer;
	}

	/**
	 * @dev Give an account access to this role.
	 */
	function add(Role storage role, address account) internal {
		require(!has(role, account), "Roles: account already has role");
		role.bearer[account] = true;
	}

	/**
	 * @dev Remove an account's access to this role.
	 */
	function remove(Role storage role, address account) internal {
		require(has(role, account), "Roles: account does not have role");
		role.bearer[account] = false;
	}

	/**
	 * @dev Check if an account has this role.
	 * @return bool
	 */
	function has(Role storage role, address account)
		internal
		view
		returns (bool)
	{
		require(account != address(0), "Roles: account is the zero address");
		return role.bearer[account];
	}
}

contract MinterRole is Context {
	using Roles for Roles.Role;

	event MinterAdded(address indexed account);
	event MinterRemoved(address indexed account);

	Roles.Role private _minters;

	constructor() internal {
		_addMinter(_msgSender());
	}

	modifier onlyMinter() {
		require(
			isMinter(_msgSender()),
			"MinterRole: caller does not have the Minter role"
		);
		_;
	}

	function isMinter(address account) public view returns (bool) {
		return _minters.has(account);
	}

	function addMinter(address account) public onlyMinter {
		_addMinter(account);
	}

	function renounceMinter() public {
		_removeMinter(_msgSender());
	}

	function _addMinter(address account) internal {
		_minters.add(account);
		emit MinterAdded(account);
	}

	function _removeMinter(address account) internal {
		_minters.remove(account);
		emit MinterRemoved(account);
	}
}

/**
 * @dev Extension of {ERC20} that adds a set of accounts with the {MinterRole},
 * which have permission to mint (create) new tokens as they see fit.
 *
 * At construction, the deployer of the contract is the only minter.
 */
contract ERC20Mintable is ERC20, MinterRole {
	/**
	 * @dev See {ERC20-_mint}.
	 *
	 * Requirements:
	 *
	 * - the caller must have the {MinterRole}.
	 */
	function mint(address account, uint256 amount)
		public
		onlyMinter
		returns (bool)
	{
		_mint(account, amount);
		return true;
	}
}

contract PauserRole is Context {
	using Roles for Roles.Role;

	event PauserAdded(address indexed account);
	event PauserRemoved(address indexed account);

	Roles.Role private _pausers;

	constructor() internal {
		_addPauser(_msgSender());
	}

	modifier onlyPauser() {
		require(
			isPauser(_msgSender()),
			"PauserRole: caller does not have the Pauser role"
		);
		_;
	}

	function isPauser(address account) public view returns (bool) {
		return _pausers.has(account);
	}

	function addPauser(address account) public onlyPauser {
		_addPauser(account);
	}

	function renouncePauser() public {
		_removePauser(_msgSender());
	}

	function _addPauser(address account) internal {
		_pausers.add(account);
		emit PauserAdded(account);
	}

	function _removePauser(address account) internal {
		_pausers.remove(account);
		emit PauserRemoved(account);
	}
}

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
contract Pausable is Context, PauserRole {
	/**
	 * @dev Emitted when the pause is triggered by a pauser (`account`).
	 */
	event Paused(address account);

	/**
	 * @dev Emitted when the pause is lifted by a pauser (`account`).
	 */
	event Unpaused(address account);

	bool private _paused;

	/**
	 * @dev Initializes the contract in unpaused state. Assigns the Pauser role
	 * to the deployer.
	 */
	constructor() internal {
		_paused = false;
	}

	/**
	 * @dev Returns true if the contract is paused, and false otherwise.
	 */
	function paused() public view returns (bool) {
		return _paused;
	}

	/**
	 * @dev Modifier to make a function callable only when the contract is not paused.
	 */
	modifier whenNotPaused() {
		require(!_paused, "Pausable: paused");
		_;
	}

	/**
	 * @dev Modifier to make a function callable only when the contract is paused.
	 */
	modifier whenPaused() {
		require(_paused, "Pausable: not paused");
		_;
	}

	/**
	 * @dev Called by a pauser to pause, triggers stopped state.
	 */
	function pause() public onlyPauser whenNotPaused {
		_paused = true;
		emit Paused(_msgSender());
	}

	/**
	 * @dev Called by a pauser to unpause, returns to normal state.
	 */
	function unpause() public onlyPauser whenPaused {
		_paused = false;
		emit Unpaused(_msgSender());
	}
}

library Decimals {
	using SafeMath for uint256;
	uint120 private constant basisValue = 1000000000000000000;

	function outOf(uint256 _a, uint256 _b)
		internal
		pure
		returns (uint256 result)
	{
		if (_a == 0) {
			return 0;
		}
		uint256 a = _a.mul(basisValue);
		if (a < _b) {
			return 0;
		}
		return (a.div(_b));
	}

	function basis() external pure returns (uint120) {
		return basisValue;
	}
}

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

// prettier-ignore

contract IGroup {
	function isGroup(address _addr) public view returns (bool);

	function addGroup(address _addr) external;

	function getGroupKey(address _addr) internal pure returns (bytes32) {
		return keccak256(abi.encodePacked("_group", _addr));
	}
}

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

contract UsingValidator {
	AddressValidator private _validator;

	constructor() public {
		_validator = new AddressValidator();
	}

	function addressValidator() internal view returns (AddressValidator) {
		return _validator;
	}
}

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

contract EternalStorage {
	address private currentOwner = msg.sender;

	mapping(bytes32 => uint256) private uIntStorage;
	mapping(bytes32 => string) private stringStorage;
	mapping(bytes32 => address) private addressStorage;
	mapping(bytes32 => bytes32) private bytesStorage;
	mapping(bytes32 => bool) private boolStorage;
	mapping(bytes32 => int256) private intStorage;

	modifier onlyCurrentOwner() {
		require(msg.sender == currentOwner, "not current owner");
		_;
	}

	function changeOwner(address _newOwner) external {
		require(msg.sender == currentOwner, "not current owner");
		currentOwner = _newOwner;
	}

	// *** Getter Methods ***
	function getUint(bytes32 _key) external view returns (uint256) {
		return uIntStorage[_key];
	}

	function getString(bytes32 _key) external view returns (string memory) {
		return stringStorage[_key];
	}

	function getAddress(bytes32 _key) external view returns (address) {
		return addressStorage[_key];
	}

	function getBytes(bytes32 _key) external view returns (bytes32) {
		return bytesStorage[_key];
	}

	function getBool(bytes32 _key) external view returns (bool) {
		return boolStorage[_key];
	}

	function getInt(bytes32 _key) external view returns (int256) {
		return intStorage[_key];
	}

	// *** Setter Methods ***
	function setUint(bytes32 _key, uint256 _value) external onlyCurrentOwner {
		uIntStorage[_key] = _value;
	}

	function setString(bytes32 _key, string calldata _value)
		external
		onlyCurrentOwner
	{
		stringStorage[_key] = _value;
	}

	function setAddress(bytes32 _key, address _value)
		external
		onlyCurrentOwner
	{
		addressStorage[_key] = _value;
	}

	function setBytes(bytes32 _key, bytes32 _value) external onlyCurrentOwner {
		bytesStorage[_key] = _value;
	}

	function setBool(bytes32 _key, bool _value) external onlyCurrentOwner {
		boolStorage[_key] = _value;
	}

	function setInt(bytes32 _key, int256 _value) external onlyCurrentOwner {
		intStorage[_key] = _value;
	}

	// *** Delete Methods ***
	function deleteUint(bytes32 _key) external onlyCurrentOwner {
		delete uIntStorage[_key];
	}

	function deleteString(bytes32 _key) external onlyCurrentOwner {
		delete stringStorage[_key];
	}

	function deleteAddress(bytes32 _key) external onlyCurrentOwner {
		delete addressStorage[_key];
	}

	function deleteBytes(bytes32 _key) external onlyCurrentOwner {
		delete bytesStorage[_key];
	}

	function deleteBool(bytes32 _key) external onlyCurrentOwner {
		delete boolStorage[_key];
	}

	function deleteInt(bytes32 _key) external onlyCurrentOwner {
		delete intStorage[_key];
	}
}

contract UsingStorage is Ownable, Pausable {
	address private _storage;

	modifier hasStorage() {
		require(_storage != address(0), "storage is not setted");
		_;
	}

	function eternalStorage()
		internal
		view
		hasStorage
		returns (EternalStorage)
	{
		require(paused() == false, "You cannot use that");
		return EternalStorage(_storage);
	}

	function getStorageAddress() external view hasStorage returns (address) {
		return _storage;
	}

	function createStorage() external onlyOwner {
		require(_storage == address(0), "storage is setted");
		EternalStorage tmp = new EternalStorage();
		_storage = address(tmp);
	}

	function setStorage(address _storageAddress) external onlyOwner {
		_storage = _storageAddress;
	}

	function changeOwner(address newOwner) external onlyOwner {
		EternalStorage(_storage).changeOwner(newOwner);
	}
}

contract WithdrawStorage is UsingStorage, UsingConfig, UsingValidator {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	// RewardsAmount
	function setRewardsAmount(address _property, uint256 _value) external {
		addressValidator().validateAddress(msg.sender, config().withdraw());

		eternalStorage().setUint(getRewardsAmountKey(_property), _value);
	}

	function getRewardsAmount(address _property)
		external
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getRewardsAmountKey(_property));
	}

	function getRewardsAmountKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_rewardsAmount", _property));
	}

	// CumulativePrice
	function setCumulativePrice(address _property, uint256 _value) external {
		// The previously used function
		// This function is only used in testing
		addressValidator().validateAddress(msg.sender, config().withdraw());

		eternalStorage().setUint(getCumulativePriceKey(_property), _value);
	}

	function getCumulativePrice(address _property)
		external
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getCumulativePriceKey(_property));
	}

	function getCumulativePriceKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_cumulativePrice", _property));
	}

	// WithdrawalLimitTotal
	function setWithdrawalLimitTotal(
		address _property,
		address _user,
		uint256 _value
	) external {
		addressValidator().validateAddress(msg.sender, config().withdraw());

		eternalStorage().setUint(
			getWithdrawalLimitTotalKey(_property, _user),
			_value
		);
	}

	function getWithdrawalLimitTotal(address _property, address _user)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getWithdrawalLimitTotalKey(_property, _user)
			);
	}

	function getWithdrawalLimitTotalKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_withdrawalLimitTotal", _property, _user)
			);
	}

	// WithdrawalLimitBalance
	function setWithdrawalLimitBalance(
		address _property,
		address _user,
		uint256 _value
	) external {
		addressValidator().validateAddress(msg.sender, config().withdraw());

		eternalStorage().setUint(
			getWithdrawalLimitBalanceKey(_property, _user),
			_value
		);
	}

	function getWithdrawalLimitBalance(address _property, address _user)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getWithdrawalLimitBalanceKey(_property, _user)
			);
	}

	function getWithdrawalLimitBalanceKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_withdrawalLimitBalance", _property, _user)
			);
	}

	//LastWithdrawalPrice
	function setLastWithdrawalPrice(
		address _property,
		address _user,
		uint256 _value
	) external {
		addressValidator().validateAddress(msg.sender, config().withdraw());

		eternalStorage().setUint(
			getLastWithdrawalPriceKey(_property, _user),
			_value
		);
	}

	function getLastWithdrawalPrice(address _property, address _user)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getLastWithdrawalPriceKey(_property, _user)
			);
	}

	function getLastWithdrawalPriceKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_lastWithdrawalPrice", _property, _user)
			);
	}

	//PendingWithdrawal
	function setPendingWithdrawal(
		address _property,
		address _user,
		uint256 _value
	) external {
		addressValidator().validateAddress(msg.sender, config().withdraw());

		eternalStorage().setUint(
			getPendingWithdrawalKey(_property, _user),
			_value
		);
	}

	function getPendingWithdrawal(address _property, address _user)
		external
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(getPendingWithdrawalKey(_property, _user));
	}

	function getPendingWithdrawalKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(abi.encodePacked("_pendingWithdrawal", _property, _user));
	}

	//LastCumulativeGlobalHoldersPrice
	function setLastCumulativeGlobalHoldersPrice(
		address _property,
		address _user,
		uint256 _value
	) external {
		addressValidator().validateAddress(msg.sender, config().withdraw());

		eternalStorage().setUint(
			getLastCumulativeGlobalHoldersPriceKey(_property, _user),
			_value
		);
	}

	function getLastCumulativeGlobalHoldersPrice(
		address _property,
		address _user
	) external view returns (uint256) {
		return
			eternalStorage().getUint(
				getLastCumulativeGlobalHoldersPriceKey(_property, _user)
			);
	}

	function getLastCumulativeGlobalHoldersPriceKey(
		address _property,
		address _user
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					"_lastCumulativeGlobalHoldersPrice",
					_property,
					_user
				)
			);
	}
}

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

contract Withdraw is IWithdraw, Pausable, UsingConfig, UsingValidator {
	using SafeMath for uint256;
	using Decimals for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function withdraw(address _property) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		(uint256 value, uint256 lastPrice) = _calculateWithdrawableAmount(
			_property,
			msg.sender
		);
		require(value != 0, "withdraw value is 0");
		WithdrawStorage withdrawStorage = getStorage();
		withdrawStorage.setLastCumulativeGlobalHoldersPrice(
			_property,
			msg.sender,
			lastPrice
		);
		withdrawStorage.setPendingWithdrawal(_property, msg.sender, 0);
		__updateLegacyWithdrawableAmount(_property, msg.sender);
		ERC20Mintable erc20 = ERC20Mintable(config().token());
		ILockup lockup = ILockup(config().lockup());
		require(erc20.mint(msg.sender, value), "dev mint failed");
		lockup.update();
		withdrawStorage.setRewardsAmount(
			_property,
			withdrawStorage.getRewardsAmount(_property).add(value)
		);
	}

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
	) external {
		addressValidator().validateAddress(msg.sender, config().allocator());
		WithdrawStorage withdrawStorage = getStorage();

		(uint256 amountFrom, uint256 priceFrom) = _calculateAmount(
			_property,
			_from
		);
		(uint256 amountTo, uint256 priceTo) = _calculateAmount(_property, _to);
		withdrawStorage.setLastCumulativeGlobalHoldersPrice(
			_property,
			_from,
			priceFrom
		);
		withdrawStorage.setLastCumulativeGlobalHoldersPrice(
			_property,
			_to,
			priceTo
		);
		uint256 pendFrom = withdrawStorage.getPendingWithdrawal(
			_property,
			_from
		);
		uint256 pendTo = withdrawStorage.getPendingWithdrawal(_property, _to);
		withdrawStorage.setPendingWithdrawal(
			_property,
			_from,
			pendFrom.add(amountFrom)
		);
		withdrawStorage.setPendingWithdrawal(
			_property,
			_to,
			pendTo.add(amountTo)
		);
		uint256 totalLimit = withdrawStorage.getWithdrawalLimitTotal(
			_property,
			_to
		);
		(, uint256 total, , , ) = difference(withdrawStorage, _property, _to);
		if (totalLimit != total) {
			withdrawStorage.setWithdrawalLimitTotal(_property, _to, total);
			withdrawStorage.setWithdrawalLimitBalance(
				_property,
				_to,
				ERC20Mintable(_property).balanceOf(_to)
			);
		}
	}

	function getRewardsAmount(address _property)
		external
		view
		returns (uint256)
	{
		return getStorage().getRewardsAmount(_property);
	}

	function difference(
		WithdrawStorage withdrawStorage,
		address _property,
		address _user
	)
		private
		view
		returns (
			uint256 _reward,
			uint256 _holdersAmount,
			uint256 _holdersPrice,
			uint256 _interestAmount,
			uint256 _interestPrice
		)
	{
		uint256 _last = withdrawStorage.getLastCumulativeGlobalHoldersPrice(
			_property,
			_user
		);
		return ILockup(config().lockup()).difference(_property, _last);
	}

	function _calculateAmount(address _property, address _user)
		private
		view
		returns (uint256 _amount, uint256 _price)
	{
		WithdrawStorage withdrawStorage = getStorage();
		uint256 totalLimit = withdrawStorage.getWithdrawalLimitTotal(
			_property,
			_user
		);
		uint256 balanceLimit = withdrawStorage.getWithdrawalLimitBalance(
			_property,
			_user
		);
		(
			uint256 reward,
			uint256 _holders,
			uint256 _holdersPrice,
			,

		) = difference(withdrawStorage, _property, _user);
		uint256 balance = ERC20Mintable(_property).balanceOf(_user);
		if (totalLimit == _holders) {
			balance = balanceLimit;
		}
		uint256 value = _holdersPrice.mul(balance);
		return (value.div(Decimals.basis()).div(Decimals.basis()), reward);
	}

	function _calculateWithdrawableAmount(address _property, address _user)
		private
		view
		returns (uint256 _amount, uint256 _price)
	{
		(uint256 _value, uint256 price) = _calculateAmount(_property, _user);
		uint256 legacy = __legacyWithdrawableAmount(_property, _user);
		uint256 value = _value
			.add(getStorage().getPendingWithdrawal(_property, _user))
			.add(legacy);
		return (value, price);
	}

	function calculateWithdrawableAmount(address _property, address _user)
		external
		view
		returns (uint256)
	{
		(uint256 value, ) = _calculateWithdrawableAmount(_property, _user);
		return value;
	}

	function calculateTotalWithdrawableAmount(address _property)
		external
		view
		returns (uint256)
	{
		(, uint256 _amount, , , ) = ILockup(config().lockup()).difference(
			_property,
			0
		);
		return _amount.div(Decimals.basis()).div(Decimals.basis());
	}

	function __legacyWithdrawableAmount(address _property, address _user)
		private
		view
		returns (uint256)
	{
		WithdrawStorage withdrawStorage = getStorage();
		uint256 _last = withdrawStorage.getLastWithdrawalPrice(
			_property,
			_user
		);
		uint256 price = withdrawStorage.getCumulativePrice(_property);
		uint256 priceGap = price.sub(_last);
		uint256 balance = ERC20Mintable(_property).balanceOf(_user);
		uint256 value = priceGap.mul(balance);
		return value.div(Decimals.basis());
	}

	function __updateLegacyWithdrawableAmount(address _property, address _user)
		private
	{
		WithdrawStorage withdrawStorage = getStorage();
		uint256 price = withdrawStorage.getCumulativePrice(_property);
		withdrawStorage.setLastWithdrawalPrice(_property, _user, price);
	}

	function getStorage() private view returns (WithdrawStorage) {
		require(paused() == false, "You cannot use that");
		return WithdrawStorage(config().withdrawStorage());
	}
}
