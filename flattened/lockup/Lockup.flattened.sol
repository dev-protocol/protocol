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
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

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
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

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
    event Approval(address indexed owner, address indexed spender, uint256 value);
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
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
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
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
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
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
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

    mapping (address => uint256) private _balances;

    mapping (address => mapping (address => uint256)) private _allowances;

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
    function allowance(address owner, address spender) public view returns (uint256) {
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
    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
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
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
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
    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
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
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _balances[sender] = _balances[sender].sub(amount, "ERC20: transfer amount exceeds balance");
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

        _balances[account] = _balances[account].sub(amount, "ERC20: burn amount exceeds balance");
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
    function _approve(address owner, address spender, uint256 amount) internal {
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
        _approve(account, _msgSender(), _allowances[account][_msgSender()].sub(amount, "ERC20: burn amount exceeds allowance"));
    }
}


/**
 * @title Roles
 * @dev Library for managing addresses assigned to a Role.
 */
library Roles {
    struct Role {
        mapping (address => bool) bearer;
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
    function has(Role storage role, address account) internal view returns (bool) {
        require(account != address(0), "Roles: account is the zero address");
        return role.bearer[account];
    }
}

contract MinterRole is Context {
    using Roles for Roles.Role;

    event MinterAdded(address indexed account);
    event MinterRemoved(address indexed account);

    Roles.Role private _minters;

    constructor () internal {
        _addMinter(_msgSender());
    }

    modifier onlyMinter() {
        require(isMinter(_msgSender()), "MinterRole: caller does not have the Minter role");
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
    function mint(address account, uint256 amount) public onlyMinter returns (bool) {
        _mint(account, amount);
        return true;
    }
}



contract PauserRole is Context {
    using Roles for Roles.Role;

    event PauserAdded(address indexed account);
    event PauserRemoved(address indexed account);

    Roles.Role private _pausers;

    constructor () internal {
        _addPauser(_msgSender());
    }

    modifier onlyPauser() {
        require(isPauser(_msgSender()), "PauserRole: caller does not have the Pauser role");
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
    constructor () internal {
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

	function mulBasis(uint256 _a) internal pure returns (uint256) {
		return _a.mul(basisValue);
	}

	function divBasis(uint256 _a) internal pure returns (uint256) {
		return _a.div(basisValue);
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

// prettier-ignore


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
    constructor (string memory name, string memory symbol, uint8 decimals) public {
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


contract IAllocator {
	function calculateMaxRewardsPerBlock() public view returns (uint256);

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
		// solium-disable-next-line indentation
	) external;
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

contract MetricsGroup is UsingConfig, UsingStorage, UsingValidator, IGroup {
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		require(paused() == false, "You cannot use that");
		addressValidator().validateAddress(
			msg.sender,
			config().metricsFactory()
		);

		require(isGroup(_addr) == false, "already enabled");
		eternalStorage().setBool(getGroupKey(_addr), true);
		uint256 totalCount = eternalStorage().getUint(getTotalCountKey());
		totalCount = totalCount.add(1);
		eternalStorage().setUint(getTotalCountKey(), totalCount);
	}

	function removeGroup(address _addr) external {
		require(paused() == false, "You cannot use that");
		addressValidator().validateAddress(
			msg.sender,
			config().metricsFactory()
		);

		require(isGroup(_addr), "address is not group");
		eternalStorage().setBool(getGroupKey(_addr), false);
		uint256 totalCount = eternalStorage().getUint(getTotalCountKey());
		totalCount = totalCount.sub(1);
		eternalStorage().setUint(getTotalCountKey(), totalCount);
	}

	function isGroup(address _addr) public view returns (bool) {
		return eternalStorage().getBool(getGroupKey(_addr));
	}

	function totalIssuedMetrics() external view returns (uint256) {
		return eternalStorage().getUint(getTotalCountKey());
	}

	function getTotalCountKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_totalCount"));
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

contract IVoteTimes {
	function validateTargetPeriod(
		address _property,
		uint256 _beginBlock,
		uint256 _endBlock
	)
		external
		returns (
			// solium-disable-next-line indentation
			bool
		);

	function addVoteTime() external;

	function addVoteTimesByProperty(address _property) external;

	function resetVoteTimesByProperty(address _property) public;
}

contract IVoteCounter {
	function addVoteCount(
		address _user,
		address _property,
		bool _agree
		// solium-disable-next-line indentation
	) external;

	function getAgreeCount(address _sender) external view returns (uint256);

	function getOppositeCount(address _sender) external view returns (uint256);
}
// prettier-ignore


contract VoteCounterStorage is UsingStorage, UsingConfig, UsingValidator {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	// Already Vote Flg
	function setAlreadyVoteFlg(
		address _user,
		address _sender,
		address _property
	) external {
		addressValidator().validateAddress(msg.sender, config().voteCounter());

		bytes32 alreadyVoteKey = getAlreadyVoteKey(_user, _sender, _property);
		return eternalStorage().setBool(alreadyVoteKey, true);
	}

	function getAlreadyVoteFlg(
		address _user,
		address _sender,
		address _property
	) external view returns (bool) {
		bytes32 alreadyVoteKey = getAlreadyVoteKey(_user, _sender, _property);
		return eternalStorage().getBool(alreadyVoteKey);
	}

	function getAlreadyVoteKey(
		address _sender,
		address _target,
		address _property
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked("_alreadyVote", _sender, _target, _property)
			);
	}

	// Agree Count
	function getAgreeCount(address _sender) external view returns (uint256) {
		return eternalStorage().getUint(getAgreeVoteCountKey(_sender));
	}

	function setAgreeCount(address _sender, uint256 count) external {
		addressValidator().validateAddress(msg.sender, config().voteCounter());

		eternalStorage().setUint(getAgreeVoteCountKey(_sender), count);
	}

	function getAgreeVoteCountKey(address _sender)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_sender, "_agreeVoteCount"));
	}

	// Opposite Count
	function getOppositeCount(address _sender) external view returns (uint256) {
		return eternalStorage().getUint(getOppositeVoteCountKey(_sender));
	}

	function setOppositeCount(address _sender, uint256 count) external {
		addressValidator().validateAddress(msg.sender, config().voteCounter());

		eternalStorage().setUint(getOppositeVoteCountKey(_sender), count);
	}

	function getOppositeVoteCountKey(address _sender)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked(_sender, "_oppositeVoteCount"));
	}
}

contract VoteCounter is IVoteCounter, UsingConfig, UsingValidator, Pausable {
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addVoteCount(
		address _user,
		address _property,
		bool _agree
	) external {
		addressValidator().validateGroups(
			msg.sender,
			config().marketGroup(),
			config().policyGroup()
		);

		bool alreadyVote = getStorage().getAlreadyVoteFlg(
			_user,
			msg.sender,
			_property
		);
		require(alreadyVote == false, "already vote");
		uint256 voteCount = getVoteCount(_user, _property);
		require(voteCount != 0, "vote count is 0");
		getStorage().setAlreadyVoteFlg(_user, msg.sender, _property);
		if (_agree) {
			addAgreeCount(msg.sender, voteCount);
		} else {
			addOppositeCount(msg.sender, voteCount);
		}
	}

	function getAgreeCount(address _sender) external view returns (uint256) {
		return getStorage().getAgreeCount(_sender);
	}

	function getOppositeCount(address _sender) external view returns (uint256) {
		return getStorage().getOppositeCount(_sender);
	}

	function getVoteCount(address _sender, address _property)
		private
		returns (uint256)
	{
		uint256 voteCount;
		if (Property(_property).author() == _sender) {
			// solium-disable-next-line operator-whitespace
			voteCount = ILockup(config().lockup())
				.getPropertyValue(_property)
				.add(
				IWithdraw(config().withdraw()).getRewardsAmount(_property)
			);
			IVoteTimes(config().voteTimes()).addVoteTimesByProperty(_property);
		} else {
			voteCount = ILockup(config().lockup()).getValue(_property, _sender);
		}
		return voteCount;
	}

	function addAgreeCount(address _target, uint256 _voteCount) private {
		uint256 agreeCount = getStorage().getAgreeCount(_target);
		agreeCount = agreeCount.add(_voteCount);
		getStorage().setAgreeCount(_target, agreeCount);
	}

	function addOppositeCount(address _target, uint256 _voteCount) private {
		uint256 oppositeCount = getStorage().getOppositeCount(_target);
		oppositeCount = oppositeCount.add(_voteCount);
		getStorage().setOppositeCount(_target, oppositeCount);
	}

	function getStorage() private view returns (VoteCounterStorage) {
		require(paused() == false, "You cannot use that");
		return VoteCounterStorage(config().voteCounterStorage());
	}
}


contract PropertyGroup is
	UsingConfig,
	UsingStorage,
	UsingValidator,
	IGroup,
	Killable
{
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




contract VoteTimesStorage is
	UsingStorage,
	UsingConfig,
	UsingValidator,
	Killable
{
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	// Vote Times
	function getVoteTimes() external view returns (uint256) {
		return eternalStorage().getUint(getVoteTimesKey());
	}

	function setVoteTimes(uint256 times) external {
		addressValidator().validateAddress(msg.sender, config().voteTimes());

		return eternalStorage().setUint(getVoteTimesKey(), times);
	}

	function getVoteTimesKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_voteTimes"));
	}

	//Vote Times By Property
	function getVoteTimesByProperty(address _property)
		external
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getVoteTimesByPropertyKey(_property));
	}

	function setVoteTimesByProperty(address _property, uint256 times) external {
		addressValidator().validateAddress(msg.sender, config().voteTimes());

		return
			eternalStorage().setUint(
				getVoteTimesByPropertyKey(_property),
				times
			);
	}

	function getVoteTimesByPropertyKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_voteTimesByProperty", _property));
	}
}

contract VoteTimes is IVoteTimes, UsingConfig, UsingValidator, Pausable {
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addVoteTime() external {
		addressValidator().validateAddresses(
			msg.sender,
			config().marketFactory(),
			config().policyFactory()
		);

		uint256 voteTimes = getStorage().getVoteTimes();
		voteTimes = voteTimes.add(1);
		getStorage().setVoteTimes(voteTimes);
	}

	function addVoteTimesByProperty(address _property) external {
		addressValidator().validateAddress(msg.sender, config().voteCounter());

		uint256 voteTimesByProperty = getStorage().getVoteTimesByProperty(
			_property
		);
		voteTimesByProperty = voteTimesByProperty.add(1);
		getStorage().setVoteTimesByProperty(_property, voteTimesByProperty);
	}

	function resetVoteTimesByProperty(address _property) public {
		addressValidator().validate3Addresses(
			msg.sender,
			config().lockup(),
			config().withdraw(),
			config().propertyFactory()
		);

		uint256 voteTimes = getStorage().getVoteTimes();
		getStorage().setVoteTimesByProperty(_property, voteTimes);
	}

	function validateTargetPeriod(
		address _property,
		uint256 _beginBlock,
		uint256 _endBlock
	) external returns (bool) {
		addressValidator().validateAddresses(
			msg.sender,
			config().lockup(),
			config().withdraw()
		);

		require(
			abstentionPenalty(_property, _beginBlock, _endBlock),
			"outside the target period"
		);
		resetVoteTimesByProperty(_property);
		return true;
	}

	function getAbstentionTimes(address _property)
		private
		view
		returns (uint256)
	{
		uint256 voteTimes = getStorage().getVoteTimes();
		uint256 voteTimesByProperty = getStorage().getVoteTimesByProperty(
			_property
		);
		return voteTimes.sub(voteTimesByProperty);
	}

	function abstentionPenalty(
		address _property,
		uint256 _beginBlock,
		uint256 _endBlock
	) private view returns (bool) {
		uint256 abstentionCount = getAbstentionTimes(_property);
		uint256 notTargetPeriod = Policy(config().policy()).abstentionPenalty(
			abstentionCount
		);
		if (notTargetPeriod == 0) {
			return true;
		}
		uint256 notTargetBlockNumber = _beginBlock.add(notTargetPeriod);
		return notTargetBlockNumber < _endBlock;
	}

	function getStorage() private view returns (VoteTimesStorage) {
		require(paused() == false, "You cannot use that");
		return VoteTimesStorage(config().voteTimesStorage());
	}
}



contract MarketGroup is
	UsingConfig,
	UsingStorage,
	IGroup,
	UsingValidator,
	Killable
{
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) UsingStorage() {}

	function addGroup(address _addr) external {
		addressValidator().validateAddress(
			msg.sender,
			config().marketFactory()
		);

		require(isGroup(_addr) == false, "already enabled");
		eternalStorage().setBool(getGroupKey(_addr), true);
		addCount();
	}

	function isGroup(address _addr) public view returns (bool) {
		return eternalStorage().getBool(getGroupKey(_addr));
	}

	function addCount() private {
		bytes32 key = getCountKey();
		uint256 number = eternalStorage().getUint(key);
		number = number.add(1);
		eternalStorage().setUint(key, number);
	}

	function getCount() external view returns (uint256) {
		bytes32 key = getCountKey();
		return eternalStorage().getUint(key);
	}

	function getCountKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_count"));
	}
}

contract PolicySet is UsingConfig, UsingStorage, UsingValidator, Killable {
	using SafeMath for uint256;

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addSet(address _addr) external {
		addressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);

		uint256 index = eternalStorage().getUint(getPlicySetIndexKey());
		bytes32 key = getIndexKey(index);
		eternalStorage().setAddress(key, _addr);
		index = index.add(1);
		eternalStorage().setUint(getPlicySetIndexKey(), index);
	}

	function deleteAll() external {
		addressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);

		uint256 index = eternalStorage().getUint(getPlicySetIndexKey());
		for (uint256 i = 0; i < index; i++) {
			bytes32 key = getIndexKey(i);
			eternalStorage().setAddress(key, address(0));
		}
		eternalStorage().setUint(getPlicySetIndexKey(), 0);
	}

	function count() external view returns (uint256) {
		return eternalStorage().getUint(getPlicySetIndexKey());
	}

	function get(uint256 _index) external view returns (address) {
		bytes32 key = getIndexKey(_index);
		return eternalStorage().getAddress(key);
	}

	function getIndexKey(uint256 _index) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_index", _index));
	}

	function getPlicySetIndexKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_policySetIndex"));
	}
}


contract PolicyGroup is
	UsingConfig,
	UsingStorage,
	UsingValidator,
	IGroup,
	Killable
{
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function addGroup(address _addr) external {
		addressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);

		require(isGroup(_addr) == false, "already enabled");
		eternalStorage().setBool(getGroupKey(_addr), true);
	}

	function deleteGroup(address _addr) external {
		addressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);

		require(isGroup(_addr), "not enabled");
		return eternalStorage().setBool(getGroupKey(_addr), false);
	}

	function isGroup(address _addr) public view returns (bool) {
		return eternalStorage().getBool(getGroupKey(_addr));
	}
}

contract PolicyFactory is Pausable, UsingConfig, UsingValidator, Killable {
	event Create(address indexed _from, address _policy, address _innerPolicy);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function create(address _newPolicyAddress) external returns (address) {
		require(paused() == false, "You cannot use that");
		addressValidator().validateIllegalAddress(_newPolicyAddress);

		Policy policy = new Policy(address(config()), _newPolicyAddress);
		address policyAddress = address(policy);
		emit Create(msg.sender, policyAddress, _newPolicyAddress);
		if (config().policy() == address(0)) {
			config().setPolicy(policyAddress);
		} else {
			VoteTimes(config().voteTimes()).addVoteTime();
		}
		PolicyGroup policyGroup = PolicyGroup(config().policyGroup());
		policyGroup.addGroup(policyAddress);
		PolicySet policySet = PolicySet(config().policySet());
		policySet.addSet(policyAddress);
		return policyAddress;
	}

	function convergePolicy(address _currentPolicyAddress) external {
		addressValidator().validateGroup(msg.sender, config().policyGroup());

		config().setPolicy(_currentPolicyAddress);
		PolicySet policySet = PolicySet(config().policySet());
		PolicyGroup policyGroup = PolicyGroup(config().policyGroup());
		for (uint256 i = 0; i < policySet.count(); i++) {
			address policyAddress = policySet.get(i);
			if (policyAddress == _currentPolicyAddress) {
				continue;
			}
			Policy(policyAddress).kill();
			policyGroup.deleteGroup(policyAddress);
		}
		policySet.deleteAll();
		policySet.addSet(_currentPolicyAddress);
	}
}

contract Policy is Killable, UsingConfig, UsingValidator {
	using SafeMath for uint256;
	IPolicy private _policy;
	uint256 private _votingEndBlockNumber;

	constructor(address _config, address _innerPolicyAddress)
		public
		UsingConfig(_config)
	{
		addressValidator().validateAddress(
			msg.sender,
			config().policyFactory()
		);

		_policy = IPolicy(_innerPolicyAddress);
		setVotingEndBlockNumber();
	}

	function voting() public view returns (bool) {
		return block.number <= _votingEndBlockNumber;
	}

	function rewards(uint256 _lockups, uint256 _assets)
		external
		view
		returns (uint256)
	{
		return _policy.rewards(_lockups, _assets);
	}

	function holdersShare(uint256 _amount, uint256 _lockups)
		external
		view
		returns (uint256)
	{
		return _policy.holdersShare(_amount, _lockups);
	}

	function assetValue(uint256 _value, uint256 _lockups)
		external
		view
		returns (uint256)
	{
		return _policy.assetValue(_value, _lockups);
	}

	function authenticationFee(uint256 _assets, uint256 _propertyAssets)
		external
		view
		returns (uint256)
	{
		return _policy.authenticationFee(_assets, _propertyAssets);
	}

	function marketApproval(uint256 _agree, uint256 _opposite)
		external
		view
		returns (bool)
	{
		return _policy.marketApproval(_agree, _opposite);
	}

	function policyApproval(uint256 _agree, uint256 _opposite)
		external
		view
		returns (bool)
	{
		return _policy.policyApproval(_agree, _opposite);
	}

	function marketVotingBlocks() external view returns (uint256) {
		return _policy.marketVotingBlocks();
	}

	function policyVotingBlocks() external view returns (uint256) {
		return _policy.policyVotingBlocks();
	}

	function abstentionPenalty(uint256 _count) external view returns (uint256) {
		return _policy.abstentionPenalty(_count);
	}

	function lockUpBlocks() external view returns (uint256) {
		return _policy.lockUpBlocks();
	}

	function vote(address _property, bool _agree) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		require(config().policy() != address(this), "this policy is current");
		require(voting(), "voting deadline is over");
		VoteCounter voteCounter = VoteCounter(config().voteCounter());
		voteCounter.addVoteCount(msg.sender, _property, _agree);
		bool result = Policy(config().policy()).policyApproval(
			voteCounter.getAgreeCount(address(this)),
			voteCounter.getOppositeCount(address(this))
		);
		if (result == false) {
			return;
		}
		PolicyFactory(config().policyFactory()).convergePolicy(address(this));
		_votingEndBlockNumber = 0;
	}

	function setVotingEndBlockNumber() private {
		if (config().policy() == address(0)) {
			return;
		}
		uint256 tmp = Policy(config().policy()).policyVotingBlocks();
		_votingEndBlockNumber = block.number.add(tmp);
	}
}

contract Allocator is Pausable, UsingConfig, IAllocator, UsingValidator {
	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function calculateMaxRewardsPerBlock() public view returns (uint256) {
		require(paused() == false, "You cannot use that");
		uint256 totalAssets = MetricsGroup(config().metricsGroup())
			.totalIssuedMetrics();
		uint256 totalLockedUps = ILockup(config().lockup()).getAllValue();
		return Policy(config().policy()).rewards(totalLockedUps, totalAssets);
	}

	function beforeBalanceChange(
		address _property,
		address _from,
		address _to
	) external {
		require(paused() == false, "You cannot use that");
		addressValidator().validateGroup(msg.sender, config().propertyGroup());

		IWithdraw(config().withdraw()).beforeBalanceChange(
			_property,
			_from,
			_to
		);
	}
}

contract Property is ERC20, ERC20Detailed, UsingConfig, UsingValidator {
	using SafeMath for uint256;
	uint8 private constant _property_decimals = 18;
	uint256 private constant _supply = 10000000000000000000000000;
	address public author;

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
		addressValidator().validateAddress(
			msg.sender,
			config().propertyFactory()
		);

		author = _own;
		_mint(author, _supply);
	}

	function transfer(address _to, uint256 _value) public returns (bool) {
		addressValidator().validateIllegalAddress(_to);
		require(_value != 0, "illegal transfer value");

		Allocator(config().allocator()).beforeBalanceChange(
			address(this),
			msg.sender,
			_to
		);
		_transfer(msg.sender, _to, _value);
		return true;
	}

	function transferFrom(
		address _from,
		address _to,
		uint256 _value
	) public returns (bool) {
		addressValidator().validateIllegalAddress(_from);
		addressValidator().validateIllegalAddress(_to);
		require(_value != 0, "illegal transfer value");

		Allocator(config().allocator()).beforeBalanceChange(
			address(this),
			_from,
			_to
		);
		_transfer(_from, _to, _value);
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

	function withdraw(address _sender, uint256 _value) external {
		addressValidator().validateAddress(msg.sender, config().lockup());

		ERC20 devToken = ERC20(config().token());
		devToken.transfer(_sender, _value);
	}
}


contract LockupStorage is UsingStorage {
	using SafeMath for uint256;

	uint256 public constant basis = 100000000000000000000000000000000;

	//Last Block Number
	function setStorageLastBlockNumber(address _property, uint256 _value)
		internal
	{
		bytes32 key = getStorageLastBlockNumberKey(_property);
		eternalStorage().setUint(key, _value);
	}

	function getStorageLastBlockNumber(address _property)
		public
		view
		returns (uint256)
	{
		bytes32 key = getStorageLastBlockNumberKey(_property);
		return eternalStorage().getUint(key);
	}

	function getStorageLastBlockNumberKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_lastBlockNumber", _property));
	}

	//AllValue
	function setStorageAllValue(uint256 _value) internal {
		bytes32 key = getStorageAllValueKey();
		eternalStorage().setUint(key, _value);
	}

	function getStorageAllValue() public view returns (uint256) {
		bytes32 key = getStorageAllValueKey();
		return eternalStorage().getUint(key);
	}

	function getStorageAllValueKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_allValue"));
	}

	//Value
	function setStorageValue(
		address _property,
		address _sender,
		uint256 _value
	) internal {
		bytes32 key = getStorageValueKey(_property, _sender);
		eternalStorage().setUint(key, _value);
	}

	function getStorageValue(address _property, address _sender)
		public
		view
		returns (uint256)
	{
		bytes32 key = getStorageValueKey(_property, _sender);
		return eternalStorage().getUint(key);
	}

	function getStorageValueKey(address _property, address _sender)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_value", _property, _sender));
	}

	//PropertyValue
	function setStoragePropertyValue(address _property, uint256 _value)
		internal
	{
		bytes32 key = getStoragePropertyValueKey(_property);
		eternalStorage().setUint(key, _value);
	}

	function getStoragePropertyValue(address _property)
		public
		view
		returns (uint256)
	{
		bytes32 key = getStoragePropertyValueKey(_property);
		return eternalStorage().getUint(key);
	}

	function getStoragePropertyValueKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_propertyValue", _property));
	}

	//WithdrawalStatus
	function setStorageWithdrawalStatus(
		address _property,
		address _from,
		uint256 _value
	) internal {
		bytes32 key = getStorageWithdrawalStatusKey(_property, _from);
		eternalStorage().setUint(key, _value);
	}

	function getStorageWithdrawalStatus(address _property, address _from)
		public
		view
		returns (uint256)
	{
		bytes32 key = getStorageWithdrawalStatusKey(_property, _from);
		return eternalStorage().getUint(key);
	}

	function getStorageWithdrawalStatusKey(address _property, address _sender)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_withdrawalStatus", _property, _sender)
			);
	}

	//InterestPrice
	function setStorageInterestPrice(address _property, uint256 _value)
		internal
	{
		// The previously used function
		// This function is only used in testing
		eternalStorage().setUint(getStorageInterestPriceKey(_property), _value);
	}

	function getStorageInterestPrice(address _property)
		public
		view
		returns (uint256)
	{
		return eternalStorage().getUint(getStorageInterestPriceKey(_property));
	}

	function getStorageInterestPriceKey(address _property)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_interestTotals", _property));
	}

	//LastInterestPrice
	function setStorageLastInterestPrice(
		address _property,
		address _user,
		uint256 _value
	) internal {
		eternalStorage().setUint(
			getStorageLastInterestPriceKey(_property, _user),
			_value
		);
	}

	function getStorageLastInterestPrice(address _property, address _user)
		public
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getStorageLastInterestPriceKey(_property, _user)
			);
	}

	function getStorageLastInterestPriceKey(address _property, address _user)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_lastLastInterestPrice", _property, _user)
			);
	}

	//LastSameRewardsAmountAndBlock
	function setStorageLastSameRewardsAmountAndBlock(
		uint256 _amount,
		uint256 _block
	) internal {
		uint256 record = _amount.mul(basis).add(_block);
		eternalStorage().setUint(
			getStorageLastSameRewardsAmountAndBlockKey(),
			record
		);
	}

	function getStorageLastSameRewardsAmountAndBlock()
		public
		view
		returns (uint256 _amount, uint256 _block)
	{
		uint256 record = eternalStorage().getUint(
			getStorageLastSameRewardsAmountAndBlockKey()
		);
		uint256 amount = record.div(basis);
		uint256 blockNumber = record.sub(amount.mul(basis));
		return (amount, blockNumber);
	}

	function getStorageLastSameRewardsAmountAndBlockKey()
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_LastSameRewardsAmountAndBlock"));
	}

	//CumulativeGlobalRewards
	function setStorageCumulativeGlobalRewards(uint256 _value) internal {
		eternalStorage().setUint(
			getStorageCumulativeGlobalRewardsKey(),
			_value
		);
	}

	function getStorageCumulativeGlobalRewards() public view returns (uint256) {
		return eternalStorage().getUint(getStorageCumulativeGlobalRewardsKey());
	}

	function getStorageCumulativeGlobalRewardsKey()
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_cumulativeGlobalRewards"));
	}

	//LastCumulativeGlobalReward
	function setStorageLastCumulativeGlobalReward(
		address _property,
		address _user,
		uint256 _value
	) internal {
		eternalStorage().setUint(
			getStorageLastCumulativeGlobalRewardKey(_property, _user),
			_value
		);
	}

	function getStorageLastCumulativeGlobalReward(
		address _property,
		address _user
	) public view returns (uint256) {
		return
			eternalStorage().getUint(
				getStorageLastCumulativeGlobalRewardKey(_property, _user)
			);
	}

	function getStorageLastCumulativeGlobalRewardKey(
		address _property,
		address _user
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					"_LastCumulativeGlobalReward",
					_property,
					_user
				)
			);
	}

	//CumulativeLockedUpUnitAndBlock
	function setStorageCumulativeLockedUpUnitAndBlock(
		address _addr,
		uint256 _unit,
		uint256 _block
	) internal {
		uint256 record = _unit.mul(basis).add(_block);
		eternalStorage().setUint(
			getStorageCumulativeLockedUpUnitAndBlockKey(_addr),
			record
		);
	}

	function getStorageCumulativeLockedUpUnitAndBlock(address _addr)
		public
		view
		returns (uint256 _unit, uint256 _block)
	{
		uint256 record = eternalStorage().getUint(
			getStorageCumulativeLockedUpUnitAndBlockKey(_addr)
		);
		uint256 unit = record.div(basis);
		uint256 blockNumber = record.sub(unit.mul(basis));
		return (unit, blockNumber);
	}

	function getStorageCumulativeLockedUpUnitAndBlockKey(address _addr)
		private
		pure
		returns (bytes32)
	{
		return
			keccak256(
				abi.encodePacked("_cumulativeLockedUpUnitAndBlock", _addr)
			);
	}

	//CumulativeLockedUpValue
	function setStorageCumulativeLockedUpValue(address _addr, uint256 _value)
		internal
	{
		eternalStorage().setUint(
			getStorageCumulativeLockedUpValueKey(_addr),
			_value
		);
	}

	function getStorageCumulativeLockedUpValue(address _addr)
		public
		view
		returns (uint256)
	{
		return
			eternalStorage().getUint(
				getStorageCumulativeLockedUpValueKey(_addr)
			);
	}

	function getStorageCumulativeLockedUpValueKey(address _addr)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_cumulativeLockedUpValue", _addr));
	}

	//PendingWithdrawal
	function setStoragePendingInterestWithdrawal(
		address _property,
		address _user,
		uint256 _value
	) internal {
		eternalStorage().setUint(
			getStoragePendingInterestWithdrawalKey(_property, _user),
			_value
		);
	}

	function getStoragePendingInterestWithdrawal(
		address _property,
		address _user
	) public view returns (uint256) {
		return
			eternalStorage().getUint(
				getStoragePendingInterestWithdrawalKey(_property, _user)
			);
	}

	function getStoragePendingInterestWithdrawalKey(
		address _property,
		address _user
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked("_pendingInterestWithdrawal", _property, _user)
			);
	}

	//DIP4GenesisBlock
	function setStorageDIP4GenesisBlock(uint256 _block) internal {
		eternalStorage().setUint(getStorageDIP4GenesisBlockKey(), _block);
	}

	function getStorageDIP4GenesisBlock() public view returns (uint256) {
		return eternalStorage().getUint(getStorageDIP4GenesisBlockKey());
	}

	function getStorageDIP4GenesisBlockKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("dip4GenesisBlock"));
	}
}

contract Lockup is
	ILockup,
	Pausable,
	UsingConfig,
	UsingValidator,
	LockupStorage
{
	using SafeMath for uint256;
	using Decimals for uint256;
	event Lockedup(address _from, address _property, uint256 _value);

	// solium-disable-next-line no-empty-blocks
	constructor(address _config) public UsingConfig(_config) {}

	function lockup(
		address _from,
		address _property,
		uint256 _value
	) external {
		addressValidator().validateAddress(msg.sender, config().token());
		addressValidator().validateGroup(_property, config().propertyGroup());
		require(_value != 0, "illegal lockup value");

		bool isWaiting = getStorageWithdrawalStatus(_property, _from) != 0;
		require(isWaiting == false, "lockup is already canceled");
		if (getStorageLastBlockNumber(_property) == 0) {
			// Set the block that has been locked-up for the first time as the starting block.
			setStorageLastBlockNumber(_property, block.number);
		}
		updatePendingInterestWithdrawal(_property, _from);
		(, uint256 last) = _calculateWithdrawableInterestAmount(
			_property,
			_from
		);
		updateLastPriceForProperty(_property, _from, last);
		updateValues(true, _from, _property, _value);
		emit Lockedup(_from, _property, _value);
	}

	function cancel(address _property) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		require(hasValue(_property, msg.sender), "dev token is not locked");
		bool isWaiting = getStorageWithdrawalStatus(_property, msg.sender) != 0;
		require(isWaiting == false, "lockup is already canceled");
		uint256 blockNumber = Policy(config().policy()).lockUpBlocks();
		blockNumber = blockNumber.add(block.number);
		setStorageWithdrawalStatus(_property, msg.sender, blockNumber);
	}

	function withdraw(address _property) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		require(possible(_property, msg.sender), "waiting for release");
		uint256 lockedUpValue = getStorageValue(_property, msg.sender);
		require(lockedUpValue != 0, "dev token is not locked");
		updatePendingInterestWithdrawal(_property, msg.sender);
		Property(_property).withdraw(msg.sender, lockedUpValue);
		updateValues(false, msg.sender, _property, lockedUpValue);
		setStorageValue(_property, msg.sender, 0);
		setStorageWithdrawalStatus(_property, msg.sender, 0);
	}

	function getCumulativeLockedUpUnitAndBlock(address _property)
		private
		view
		returns (uint256 _unit, uint256 _block)
	{
		(
			uint256 unit,
			uint256 lastBlock
		) = getStorageCumulativeLockedUpUnitAndBlock(_property);
		if (lastBlock > 0) {
			return (unit, lastBlock);
		}
		// When lastBlock is 0, CumulativeLockedUpUnitAndBlock is not saved yet so failback to AllValue or PropertyValue.
		unit = _property == address(0)
			? getStorageAllValue()
			: getStoragePropertyValue(_property);
		// Assign lastBlock as DIP4GenesisBlock because when AllValue or PropertyValue is not 0, already locked-up when started DIP4.
		lastBlock = getStorageDIP4GenesisBlock();
		return (unit, lastBlock);
	}

	function getCumulativeLockedUp(address _property)
		public
		view
		returns (
			uint256 _value,
			uint256 _unit,
			uint256 _block
		)
	{
		(uint256 unit, uint256 lastBlock) = getCumulativeLockedUpUnitAndBlock(
			_property
		);
		uint256 lastValue = getStorageCumulativeLockedUpValue(_property);
		return (
			lastValue.add(unit.mul(block.number.sub(lastBlock))),
			unit,
			lastBlock
		);
	}

	function getCumulativeLockedUpAll()
		public
		view
		returns (
			uint256 _value,
			uint256 _unit,
			uint256 _block
		)
	{
		return getCumulativeLockedUp(address(0));
	}

	function updateCumulativeLockedUp(
		bool _addition,
		address _property,
		uint256 _unit
	) private {
		address zero = address(0);
		(uint256 lastValue, uint256 lastUnit, ) = getCumulativeLockedUp(
			_property
		);
		(uint256 lastValueAll, uint256 lastUnitAll, ) = getCumulativeLockedUp(
			zero
		);
		setStorageCumulativeLockedUpValue(
			_property,
			_addition ? lastValue.add(_unit) : lastValue.sub(_unit)
		);
		setStorageCumulativeLockedUpValue(
			zero,
			_addition ? lastValueAll.add(_unit) : lastValueAll.sub(_unit)
		);
		setStorageCumulativeLockedUpUnitAndBlock(
			_property,
			_addition ? lastUnit.add(_unit) : lastUnit.sub(_unit),
			block.number
		);
		setStorageCumulativeLockedUpUnitAndBlock(
			zero,
			_addition ? lastUnitAll.add(_unit) : lastUnitAll.sub(_unit),
			block.number
		);
	}

	function update() public {
		(uint256 _nextRewards, uint256 _amount) = dry();
		setStorageCumulativeGlobalRewards(_nextRewards);
		setStorageLastSameRewardsAmountAndBlock(_amount, block.number);
	}

	function updateLastPriceForProperty(
		address _property,
		address _user,
		uint256 _lastInterest
	) private {
		setStorageLastCumulativeGlobalReward(_property, _user, _lastInterest);
		setStorageLastBlockNumber(_property, block.number);
	}

	function validateTargetPeriod(address _property) private {
		(uint256 begin, uint256 end) = term(_property);
		uint256 blocks = end.sub(begin);
		require(
			blocks == 0 ||
				IVoteTimes(config().voteTimes()).validateTargetPeriod(
					_property,
					begin,
					end
				),
			"now abstention penalty"
		);
	}

	function term(address _property)
		private
		view
		returns (uint256 begin, uint256 end)
	{
		return (getStorageLastBlockNumber(_property), block.number);
	}

	function dry()
		private
		view
		returns (uint256 _nextRewards, uint256 _amount)
	{
		uint256 rewardsAmount = IAllocator(config().allocator())
			.calculateMaxRewardsPerBlock();
		(
			uint256 lastAmount,
			uint256 lastBlock
		) = getStorageLastSameRewardsAmountAndBlock();
		uint256 lastMaxRewards = lastAmount == rewardsAmount
			? rewardsAmount
			: lastAmount;

		uint256 blocks = lastBlock > 0 ? block.number.sub(lastBlock) : 0;
		uint256 additionalRewards = lastMaxRewards.mul(blocks);
		uint256 nextRewards = getStorageCumulativeGlobalRewards().add(
			additionalRewards
		);
		return (nextRewards, rewardsAmount);
	}

	function difference(address _property, uint256 _lastReward)
		public
		view
		returns (
			uint256 _reward,
			uint256 _holdersAmount,
			uint256 _holdersPrice,
			uint256 _interestAmount,
			uint256 _interestPrice
		)
	{
		(uint256 rewards, ) = dry();
		(uint256 valuePerProperty, , ) = getCumulativeLockedUp(_property);
		(uint256 valueAll, , ) = getCumulativeLockedUpAll();
		uint256 propertyRewards = rewards.sub(_lastReward).mul(
			valuePerProperty.mulBasis().outOf(valueAll)
		);
		uint256 lockedUpPerProperty = getStoragePropertyValue(_property);
		uint256 totalSupply = ERC20Mintable(_property).totalSupply();
		uint256 holders = Policy(config().policy()).holdersShare(
			propertyRewards,
			lockedUpPerProperty
		);
		uint256 interest = propertyRewards.sub(holders);
		return (
			rewards,
			holders,
			holders.div(totalSupply),
			interest,
			lockedUpPerProperty > 0 ? interest.div(lockedUpPerProperty) : 0
		);
	}

	function next(address _property)
		public
		view
		returns (
			uint256 _holders,
			uint256 _interest,
			uint256 _holdersPrice,
			uint256 _interestPrice
		)
	{
		(uint256 nextRewards, ) = dry();
		(uint256 valuePerProperty, , ) = getCumulativeLockedUp(_property);
		(uint256 valueAll, , ) = getCumulativeLockedUpAll();
		uint256 share = valuePerProperty.mulBasis().outOf(valueAll);
		uint256 propertyRewards = nextRewards.mul(share);
		uint256 lockedUp = getStoragePropertyValue(_property);
		uint256 holders = Policy(config().policy()).holdersShare(
			propertyRewards,
			lockedUp
		);
		uint256 interest = propertyRewards.sub(holders);
		uint256 holdersPrice = holders.div(
			ERC20Mintable(_property).totalSupply()
		);
		uint256 interestPrice = lockedUp > 0 ? interest.div(lockedUp) : 0;
		return (holders, interest, holdersPrice, interestPrice);
	}

	function _calculateInterestAmount(address _property, address _user)
		private
		view
		returns (uint256 _amount, uint256 _interest)
	{
		uint256 last = getStorageLastCumulativeGlobalReward(_property, _user);
		(uint256 nextReward, , , , uint256 price) = difference(_property, last);
		uint256 lockedUpPerAccount = getStorageValue(_property, _user);
		uint256 amount = price.mul(lockedUpPerAccount);
		uint256 result = amount > 0 ? amount.divBasis().divBasis() : 0;
		return (result, nextReward);
	}

	function _calculateWithdrawableInterestAmount(
		address _property,
		address _user
	) private view returns (uint256 _amount, uint256 _reward) {
		uint256 pending = getStoragePendingInterestWithdrawal(_property, _user);
		uint256 legacy = __legacyWithdrawableInterestAmount(_property, _user);
		(uint256 amount, uint256 reward) = _calculateInterestAmount(
			_property,
			_user
		);
		uint256 withdrawableAmount = amount
			.add(pending) // solium-disable-next-line indentation
			.add(legacy);
		return (withdrawableAmount, reward);
	}

	function calculateWithdrawableInterestAmount(
		address _property,
		address _user
	) public view returns (uint256) {
		(uint256 amount, ) = _calculateWithdrawableInterestAmount(
			_property,
			_user
		);
		return amount;
	}

	function withdrawInterest(address _property) external {
		addressValidator().validateGroup(_property, config().propertyGroup());

		validateTargetPeriod(_property);
		(uint256 value, uint256 last) = _calculateWithdrawableInterestAmount(
			_property,
			msg.sender
		);
		require(value > 0, "your interest amount is 0");
		setStoragePendingInterestWithdrawal(_property, msg.sender, 0);
		ERC20Mintable erc20 = ERC20Mintable(config().token());
		updateLastPriceForProperty(_property, msg.sender, last);
		__updateLegacyWithdrawableInterestAmount(_property, msg.sender);
		require(erc20.mint(msg.sender, value), "dev mint failed");
		update();
	}

	function updateValues(
		bool _addition,
		address _account,
		address _property,
		uint256 _value
	) private {
		if (_addition) {
			updateCumulativeLockedUp(true, _property, _value);
			addAllValue(_value);
			addPropertyValue(_property, _value);
			addValue(_property, _account, _value);
		} else {
			updateCumulativeLockedUp(false, _property, _value);
			subAllValue(_value);
			subPropertyValue(_property, _value);
		}
		update();
	}

	function getAllValue() external view returns (uint256) {
		return getStorageAllValue();
	}

	function addAllValue(uint256 _value) private {
		uint256 value = getStorageAllValue();
		value = value.add(_value);
		setStorageAllValue(value);
	}

	function subAllValue(uint256 _value) private {
		uint256 value = getStorageAllValue();
		value = value.sub(_value);
		setStorageAllValue(value);
	}

	function getValue(address _property, address _sender)
		external
		view
		returns (uint256)
	{
		return getStorageValue(_property, _sender);
	}

	function addValue(
		address _property,
		address _sender,
		uint256 _value
	) private {
		uint256 value = getStorageValue(_property, _sender);
		value = value.add(_value);
		setStorageValue(_property, _sender, value);
	}

	function hasValue(address _property, address _sender)
		private
		view
		returns (bool)
	{
		uint256 value = getStorageValue(_property, _sender);
		return value != 0;
	}

	function getPropertyValue(address _property)
		external
		view
		returns (uint256)
	{
		return getStoragePropertyValue(_property);
	}

	function addPropertyValue(address _property, uint256 _value) private {
		uint256 value = getStoragePropertyValue(_property);
		value = value.add(_value);
		setStoragePropertyValue(_property, value);
	}

	function subPropertyValue(address _property, uint256 _value) private {
		uint256 value = getStoragePropertyValue(_property);
		uint256 nextValue = value.sub(_value);
		setStoragePropertyValue(_property, nextValue);
	}

	function updatePendingInterestWithdrawal(address _property, address _user)
		private
	{
		(uint256 withdrawableAmount, ) = _calculateWithdrawableInterestAmount(
			_property,
			_user
		);
		setStoragePendingInterestWithdrawal(
			_property,
			_user,
			withdrawableAmount
		);
		__updateLegacyWithdrawableInterestAmount(_property, _user);
	}

	function possible(address _property, address _from)
		private
		view
		returns (bool)
	{
		uint256 blockNumber = getStorageWithdrawalStatus(_property, _from);
		if (blockNumber == 0) {
			return false;
		}
		if (blockNumber <= block.number) {
			return true;
		} else {
			if (Policy(config().policy()).lockUpBlocks() == 1) {
				return true;
			}
		}
		return false;
	}

	function __legacyWithdrawableInterestAmount(
		address _property,
		address _user
	) private view returns (uint256) {
		uint256 _last = getStorageLastInterestPrice(_property, _user);
		uint256 price = getStorageInterestPrice(_property);
		uint256 priceGap = price.sub(_last);
		uint256 lockedUpValue = getStorageValue(_property, _user);
		uint256 value = priceGap.mul(lockedUpValue);
		return value.divBasis();
	}

	function __updateLegacyWithdrawableInterestAmount(
		address _property,
		address _user
	) private {
		uint256 interestPrice = getStorageInterestPrice(_property);
		setStorageLastInterestPrice(_property, _user, interestPrice);
	}

	function setDIP4GenesisBlock(uint256 _block) external onlyPauser {
		setStorageDIP4GenesisBlock(_block);
	}
}
