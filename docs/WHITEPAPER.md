# Dev Protocol Whitepaper

Version: **`1.2.1`**

_This whitepaper may be updated. When updating, the version number is incremented according to [Semantic Versioning](https://semver.org/)._

## Introduction

Dev Protocol is a protocol that treats various Internet assets to like securities. For example, It can monetize OSS without changing its licensing or code and solves the issue of sustainability in OSS.

Dev Protocol is made up of Property Contracts, Allocator Contracts, State Contract, and the Market Contract. The Property Contract is an ERC-20 token, which is paired with a piece of Internet asset. After the index value of the property has been comparatively evaluated by the Allocator Contract, the Property Contract uses this evaluation to distribute Dev Tokens to holders of the Property Contract. The State Contract serves to maintain each state.

This piece uses simplified pseudo code to explain concepts.

## Overview

The core of Dev Protocol is made up of an exchangeable Property Contract (Property Token) attached to a particular piece of Internet asset, and the Dev Tokens distributed to the holders of that contract.

Dev Protocol is ERC-20 compliant and can be bought and sold freely. Owner of this protocol does not charge any transaction processing fees.

Dev Property Token holders have the right to receive Dev Tokens. The number of Dev Tokens distributed to an individual is determined by the number of Property Token they possess. The total number they receive will be determined by the rating of the Internet asset mapped to their Dev Protocols.

Dev Protocol allows anyone to add markets for the Internet asset.

The market created by a Market Contract and is available once it is certified by the votes of the Dev Token holders.

![Overview](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/Overview.png)

### Life Cycle

The life cycle of Dev Protocol begins when a create a Market Contract.

Market Contract allows Internet asset owners to valuation their property.

Users can create Property Contracts that are not associated with any Market Contract. Property Contract can connect with all Market Contracts. Connection requires identity verification. They own 100% of those tokens. This balance will change when they transfer them to others.

The Property Contracts are ERC-20 compliant so that you can transfer them at will. In the future, we hope to create a decentralized exchange where you can list Property contracts when you issue them.

By connecting various Market Contracts to Property Contract, there can build assets freely. For example, an asset representing an owner itself or an asset representing a project.

![Create Market](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/CreateMarket.png)

![Create Property](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/CreateProperty.png)

![Authenticate](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/Authenticate.png)

When Allocator Contract's `allocate` function is called, Property Contracts become able to receive Dev Tokens. Its Allocator Contract evaluates the asset with reference to the specified Metrics Contract. Property Contract holders can withdraw Dev Tokens depending on their current balance.

The number of Dev Tokens received depends on the index value of the Internet asset. Property Contract holders can then trade their Dev Tokens on the exchanges.

![Allocate](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/Allocate.png)

Property Contract can also receive third-party payments.

Payments can receive payments freely from an external contract called Relayer.

![Payment](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/Payment.png)

## Property Contract

The Property Contract is a smart contract created by the Property Factory Contract's `createProperty()` function. The Property Contract token is ERC-20 compliant and can be transferred to any address.

Every Property Contract holder will receive Dev Tokens. The number received for each Property Contract will be evaluated/decided by the Allocator Contract.

### Creating Property Contract

The Property Factory Contract's `createProperty()` function creates a new Property Contract.

To make it easy for developers to register, and to make it easier to calculate the value, `totalSupply` and `decimals` must be fixed.

### Support to Property

Property Contract supports backers.

Call the Property Contact's `pay()` function and send a Dev Token to the Property Contract. The Dev Token sent is burned and the increase withdrawable amount of Property Contract holders.

### Total Payment Value ≒ Next Total Allocated Value

Each time a payment is added, the total allocate value for all Property Contracts is updated.

The total payments and the total distribution are not equal because the payment acceleration is taken into account as a factor.

The following pseudo-code figure the logic to update the variable `mintPerBlock` used for the next total allocate value.

```sol
uint initialPaymentBlock;
uint lastPaymentBlock;
uint totalPaymentValue;
uint mintPerBlock;

function updateAllocateValue(uint _value) internal {
	totalPaymentValue += _value;
	uint totalPaymentValuePerBlock = totalPaymentValue / (block.number - initialPaymentBlock);
	uint lastPaymentPerBlock = _value / (block.number - lastPaymentBlock);
	uint acceleration = lastPaymentPerBlock / totalPaymentValuePerBlock;
	lastPaymentBlock = block.number;
	mintPerBlock = totalPaymentValuePerBlock * acceleration;
}
```

### Payment Relayer

Calling a Property Contract's `pay()` function is restricted to third-party contracts.

The third-party contract is called Payment Relayer.

By opening the Property Contract's money collection function to Relayer, users can enjoy the benefits provided by Relayer. It could, for example, be the ability to send a message at the same time as a money transfer, get a pledge from the Property Contract owner, etc.

For these reasons, the execution of the `pay()` functions should be limited to the contract account on Ethereum.

## Allocator Contract

The Allocator Contract role is calculating distributions and withdrawing tokens. Allocator Contracts use the index value of Internet asset to calculate how many Dev Tokens to distribute to the Property Contract. And, withdrawing tokens by requests from each user.

### Running Allocator Contract

The Allocator Contract contains the variable `mintPerBlock`, which is set beforehand, and this value represents how many will be issued per day. And, the value of `totalAllocation` indicates the total number of allocations. The previous date of execution is recorded in the self contract, and the period between the previous execution and the day before the next one is defined as the target period. The target period must be longer than one day.

The number of new issues that will create the funding for the distribution is calculated as `mintPerBlock` multiplied by the length of the target period.

### Calculating Distributions

The calculation of the number of distributions is through by the Allocator Contracts `allocate()` function.

The Property Contract's distribution calculation uses the following variables.

- `p` = The index value of the target metrics in a specified period
- `t` = Specified period
- `l` = Last index value(per block) for the target metrics
- `d` = Total index value per block
- `m` = Mint volume per block
- `s` = Issued metrics share of the target market

The basic idea is determined by the total index value(per block) and the ratio of each index value(per block). Every time a calculation is performed, the total index value is overridden and used for the next calculation.

The equation is as follows.

```
distributions = (p / t) / (d - l + (p / t)) * m * s * t
```

After this calculation, `d` is overridden by the value of`(d - l + (p / t)`.

The Allocator Contract mints Dev Tokens for the Property Contract according to the number of tokens to be distributed. For this reason, the Allocator Contract should also have permission to mint Dev Tokens.

### Receiving Distributed Tokens

Dev Tokens can be received when the user account invokes the Allocator Contract's `withdraw()` function.

The Allocator Contract records the total number of distributed tokens as `totals`, and the total value of distributed tokens as `prices`, each Property.

```sol
mapping(address => uint) totals;
mapping(address => uint) prices;
```

When the user account invokes the `withdraw()` function, the user can receive a number of Dev Tokens equal to `price` multiplied by the user's balance in the Property Contract. The `price` variable at this time is mapped to the user account in the Property Contract, and it will be deducted from the value the next time the same account invokes the `withdraw()` function. In this way, the amount withdrawn will not exceed the maximum amount that can be withdrawn by one person.

#### Calculating Price

The Allocator Contract's `increment()` function adds the rating given by the Allocator Contract to `total` and `price`.

```sol
function increment(address _property, uint _value) internal {
    totals[_property] += _value;
    prices[_property] += total / ERC20(_property).totalSupply();
}
```

#### Withdrawing Tokens

The Allocator Contract's `withdraw()` function will deposit into the user's account as many Dev Tokens as they can receive. The processing fee for this transaction is a quantity of ETH equivalent to the value of `oraclize_getPrice("URL")`. This is usually a small amount. This processing fee is deposited into the Allocator Contract and will be used for the calculation of the next distribution.

The value of `prices[_property]` after executing `withdraw()` will be mapped in each user account, and subtracted from withdrawing amount the next time `withdraw()` is called. The value of `prices[_property]` is constantly added to. For that reason, subtracting the previous value of `prices[_property]` is the same as withdrawing the value received from the previous execution until the present.

```sol
struct WithdrawalLimit {
    uint total;
    uint balance;
}
mapping(address => mapping(address => uint)) internal lastWithdrawalPrices;
mapping(address => mapping(address => uint)) internal pendingWithdrawals;
mapping(address => mapping(address => WithdrawalLimit)) internal withdrawalLimits;

function withdraw(address _property) public payable {
    uint _value = calculateWithdrawableAmount(_property, msg.sender);
    uint value = _value + pendingWithdrawals[_property][msg.sender];
    ERC20(token).mint(msg.sender, value);
    lastWithdrawalPrices[_property][msg.sender] = price;
    pendingWithdrawals[_property][msg.sender] = 0;
}

function calculateWithdrawableAmount(address _property, address _user)
    private
    view
    returns (uint)
{
    uint _last = lastWithdrawalPrices[_property][_user];
    WithdrawalLimit memory _limit = withdrawalLimits[_property][_user];
    uint priceGap = price - _last;
    uint balance = ERC20(_property).balanceOf(_user);
    if (_limit.total == total) {
        balance = _limit.balance;
    }
    uint value = priceGap * balance;
    return value;
}
```

This calculation is only completed when the user account's balance is fixed. Hence, before the balance is changed, `lastWithdrawalPrices` and `pendingWithdrawals` must be updated. Also, when the balance is changed, a withdrawal limit will be set for the recipient. This withdrawal limit only applies while `total[_property]` is the same. Like `price[_property]`, the value of `total[_property]` is constantly added to. Creating a withdrawal limit for that recipient when the balance is changed means that the amount that can be withdrawn is determined by the balance at the time of last distribution.

This is what the implementation of Property Contract's `transfer()` function looks like.

```sol
// Property Contract (ERC-20)
function transfer(address to, uint256 value) public returns (bool) {
    Allocator(allocatorAddress).beforeBalanceChange(
        address(this),
        msg.sender,
        to
    );
    _transfer(msg.sender, to, value);
    return true;
}
```

```sol
// Allocator Contract
function beforeBalanceChange(address _token, address _from, address _to) public {
    lastWithdrawalPrices[_token][_from] = prices[_token];
    lastWithdrawalPrices[_token][_to] = prices[_token];
    pendingWithdrawals[_token][_from] += calculateWithdrawableAmount(_token, _from);
    WithdrawalLimit memory _limit = withdrawalLimits[_token][_to];
    if (_limit.total != totals[_token]) {
        withdrawalLimits[_token][_to] = WithdrawalLimit(
            totals[_token],
            ERC20(_token).balanceOf(_to)
        );
    }
}
```

`beforeBalanceChange` function affects the withdrawable amount in the account, so this invokes ability should be restricted to each Property Contract.

## Market Contract

Market Contract is created by Market Factory Contract. Market Contract manages indicators of Internet assets. Market Contract guarantees the authenticity of the property and its valuation. Everyone is free to create Market Contract, but only those approved by a vote are enabled.

### Creating Market

The Market Factory Contract's `createMarket()` function creates a new Market Contract.

This function takes a contract address that defines Market Contract's behavior.

The new Market Contract will be activated upon a vote by the Dev Token owner.

The number of Dev Tokens sent by the voter determines the importance of one vote. Voting always means "Yes," not to vote means "No." Burn Dev Token by each voting. When the total number of votes reaches 10% of the total Dev Token total supply, the Market Contract becomes enabled.

### Contract as a behavior

A contract as a behavior requires two public functions, `authenticate()` and `calculate()`.

The Market Contract calls `authenticate()` function to authentication ownership to the Property Contract. It authentication the owner of the Property Contract mapped Internet asset and expected to call the `authenticatedCallback()` of the Market Contract.

The Allocator Contract calls `calculate()` function to calculate the number of new distributions to the Property Contract. It gets the metrics of the Property Contract mapped Internet asset and expect to call the `calculatedCallback()`of the Allocator Contract.

The interface of this contract looks like this:

```sol
contract Behavior {
	string public schema;

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5
	) public returns (bool);

	function calculate(address _prop, uint256 _start, uint256 _end)
		public
		returns (bool);
}
```

`authenticate()` function can take up to five arguments in addition to the target Property Contract address. Need to define `schema` as a JSON string as an array to indicate what each argument should mean.

It looks like this, for example:

```sol
string public schema = "['Your asset identity', 'Read-only token' 'More something']";
```

Market Contract's `authenticate()` function always treats the second argument as a unique ID. So, you cannot enter an existing value.

The following schema is the correct example:

```sol
string public schema = "['Your GitHub repository(e.g. your-name/repos)', 'Read-only token']";
```

Then, the following schema is the incorrect example:

```sol
string public schema = "['Read-only token', 'Your GitHub repository(e.g. your-name/repos)']";
```

### Authenticate Owner

The Market Contract's `authenticate()` function authenticate owner and create a new Metrics Contract.

This function should be executed by the owner of the Property Contract, as it is involved in managing the Market Contract to which the Property Contract connects.

## Metrics Contract

Metrics Contract is a smart contract to associate a Property Contract with a Market Contract.

The Market Contract contains the address of one Property Contract and the information used by the Market Contract for authentication.

The owner of the Internet assets can obtain the evaluation of the corresponding index passing the Metrics Contract address to the Allocator Contract.

Metrics Contract is created after being certified by Market Contract.

## State Contract

The State Contract is a smart contract whose purpose is to make the state of the Dev Protocols permanent.

This contract is used to manage values of crossover the multiple contracts. It also includes several getter/setter functions to control this state updating.

## Develop Dev Protocol

Dev Protocol is OSS. Anyone can participate in its development.

- GitHub: https://github.com/dev-protocol/protocol
- Discord: https://discord.gg/VwJp4KM
- Spectrum: https://spectrum.chat/devtoken
- Twitter: https://twitter.com/devtoken_rocks
- Blog: https://medium.com/devtoken
- Web site: https://devtoken.rocks
