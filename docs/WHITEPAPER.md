# Dev Protocol Whitepaper

Version: **`1.0.0`**

_This whitepaper may be updated. When updating, the version number is incremented according to [Semantic Versioning](https://semver.org/)._

## Introduction

Dev Protocol is a protocol that treats various Internet assets to like securities. For example, It can monetize OSS without changing its licensing or code and solves the issue of sustainability in OSS.

Dev Protocol is made up of Property Contracts, Allocator Contracts, State Contract, and the Market Contract. The Property Contract is an ERC-20 token, which is paired with a piece of Internet asset. After the index value of the property has been comparatively evaluated by the Allocator Contract, the Property Contract uses this evaluation to distribute Dev Tokens to holders of the Property Contract. The State Contract serves to maintain each state.

This piece uses simplified pseudo code to explain concepts.

## Overview

The core of Dev Protocol is made up of an exchangeable Property Contract (Property Token) attached to a particular piece of Internet asset, and the Dev Tokens distributed to the holders of that contract.

Dev Protocol is ERC-20 compliant and can be bought and sold freely. Owner of this protocol does not charge any transaction processing fees.

Dev Protocol holders have the right to receive Dev Tokens. The number of Dev Tokens distributed to an individual is determined by the number of Property Token they possess. The total number they receive will be determined by the rating of the Internet asset mapped to their Dev Protocols.

Dev Protocol allows anyone to add markets for the Internet asset.

The market created by a Market Contract and is available once it is certified by the votes of the Dev Token holders.

![Overview](https://raw.githubusercontent.com/dev-protocol/repository-token/whitepaper-v1/public/asset/whitepaper/Overview.png)

### Life Cycle

The life cycle of Dev Protocol begins when a create a Market Contract.

Market Contract allows Internet asset owners to generate their own Property Contract.

When Internet asset owner issues a Property Contract mapped to their property, they own 100% of those tokens. This balance will change when they transfer them to others.

The Property Contracts are ERC-20 compliant, so you can transfer them at will. In the future, we hope to create a decentralized exchange where you can list Property contracts when you issue them.

![Create Market](https://raw.githubusercontent.com/dev-protocol/repository-token/whitepaper-v1/public/asset/whitepaper/CreateMarket.png)

![Create Property](https://raw.githubusercontent.com/dev-protocol/repository-token/whitepaper-v1/public/asset/whitepaper/CreateProperty.png)

When Allocator Contract's `allocate` function is called, Property Contracts become able to receive Dev Tokens. Property Contract holders can withdraw Dev Tokens depending on their current balance.

The number of Dev Tokens received depends on the index value of the Internet asset. Property Contract holders can then trade their Dev Tokens on the exchanges.

![Allocate](https://raw.githubusercontent.com/dev-protocol/repository-token/whitepaper-v1/public/asset/whitepaper/Allocate.png)

Property Contract can also accept third party investments and contributions.

Investments and contributions can be made free from an external contract called Relayer.

![Invest](https://raw.githubusercontent.com/dev-protocol/repository-token/whitepaper-v1/public/asset/whitepaper/Invest.png)

![Contribution](https://raw.githubusercontent.com/dev-protocol/repository-token/whitepaper-v1/public/asset/whitepaper/Contribution.png)

## Property Contract

The Property Contract is a smart contract created by the Market Contract's `createProperty()` function. Property Contracts are always created in a one-to-one relationship with owned Internet asset. The Property Contract token is ERC-20 compliant and can be transferred to any address.

Every Property Contract holder will receive Dev Tokens. The number received for each Property Contract will be evaluated/decided by the Allocator Contract.

### Creating Property Contract

The Market Contract's `createProperty()` function creates a new Property Contract.

To create a new Property Contract, it needs a property identity that expected ownership authentication. The owner of Property Contract is initially zero address, and the owner's authentication is performed asynchronously.

The state where the owner's authentication has not completed is called _unauthorized_.

**Note:** To make it easy for developers to register, and to make it easier to calculate the value, `totalSupply` and `decimals` must be fixed.

The relationship between the Property Contract address and the Internet asset is mapped by a State Contract.

### Authenticate Owner

The Market Contract's `authentication()` function authenticate owner and set owner address the Property Contract.

The balance held by the zero address in the Property Contract is transfer to the authorized account's address.

The function takes the information required to authenticate the owner as an argument. In most cases, this information read-only token.

### Investing in Property

Property Contract supports third-party investments.

Call the Property Contact's `increase` function and send a Dev Token to the Property Contract. The Dev Token sent is burned and receives the new-minted Property Contract as compensation.

The number of new Property Contract issuances is determined by the ratio to the cumulative number of received Dev Tokens in the Property Contract. The ratio is multiplied by the Property Contract's `totalSupply` to obtain the number of new issuances. In order to protect members of Internet asset, the composition of investors should be limited to a maximum of 50%.

Investors hold part of the Property Contract. In other words, the investor can receive part of Dev Token that Property Contract receives. Investing against a highly growing Property Contract means increasing your Dev Token.

However, it should be kept in mind that Internet assets do not inherently make a profit. This market is a minus-sum in the long run.

Invest in the Property Contract mean supporting the market for Internet assets.

Investors will be withdrawing Dev Token when their property turns positive and there will be watching the activity of next investors.

The Property Contract held by the investor can not be transferred to anyone; And, burn when withdrawn distributed Dev Token.

### Support to Property

Property Contract supports backers.

Call the Property Contact's `contribute()` function and send a Dev Token to the Property Contract. The Dev Token sent is burned and the increase withdrawable amount of Property Contract holders.

#### Canceling Contribution

Contributors can withdraw their contribution only if the Property Contract is unauthorized.

### Total Contribute Value ≒ Next Total Allocated Value

Each time a contribution is added or subtracted, the total allocate value for all Property Contracts is updated.

The total contribution and the total distribution are not equal because the contribute acceleration is taken into account as a factor.

The following pseudo-code figure the logic to update the variable `mintPerBlock` used for the next total allocate value.

```sol
uint initialContributionBlock;
uint prevContributionBlock;
uint totalContributions;
uint totalAllocation;
uint mintPerBlock;

function updateAllocateValue(uint _value) internal {
	totalContributions += _value;
	uint totalContributionsPerBlock = totalContributions / (block.number - initialContributionBlock);
	uint lastContributionPerBlock = _value / (block.number - prevContributionBlock);
	uint acceleration = lastContributionPerBlock / totalContributionsPerBlock;
	prevContributionBlock = block.number;
	totalAllocation += _value * acceleration;
	mintPerBlock = totalContributionsPerBlock * acceleration;
}
```

### Contribution Relayer/Invest Relayer

Calling a Property Contract's `contribute` or `increase` function is restricted to third-party contracts.

The third-party contract is called Contribution Relayer/Invest Relayer.

By opening the Property Contract's money collection function to Relayer, users can enjoy the benefits provided by Relayer. It could, for example, be the ability to send a message at the same time as a money transfer, get a pledge from the Property Contract owner, etc.

For these reasons, the execution of the `contribute` and `increase` functions should be limited to the contract account on Ethreum.

## Allocator Contract

The Allocator Contract role is calculating distributions and withdrawing tokens. Allocator Contracts use the index value of Internet asset to calculate how many Dev Tokens to distribute to the Property Contract. And, withdrawing tokens by requests from each user.

The distributes calculation requires access to information outside the blockchain, so Oraclize is used.

Oraclize requires ETH to use, so calculate function is a `payable` function.

### Running Allocator Contract

The Allocator Contract contains the variable `mintPerBlock`, which is set beforehand, and this value represents how many will be issued per day. And, the value of `totalAllocation` indicates the total number of allocations. The previous date of execution is recorded in the self contract, and the period between the previous execution and the day before the next one is defined as the target period. The target period must be longer than one day.

The number of new issues that will create the funding for the distribution is calculated as `mintPerBlock` multiplied by the length of the target period.

### Calculating Distributions

The calculation of the number of distributions is through by the Allocator Contracts `allocate()` function.

The Property Contract's distribution calculation uses the following variables.

- `p` = The index value of the target property in a specified period
- `t` = Specified period
- `l` = Last index value(per block) for the target property
- `d` = Total index value per block
- `m` = Mint volume per block

The basic idea is determined by the total index value(per block) and the ratio of each index value(per block). Every time a calculation is performed, the total index value is overridden and used for the next calculation.

The equation is as follows.

```
distributions = (p / t) / (d - l + (p / t)) * m * t
```

This calculated value should be subtracted from `totalAllocation`. It should be noted that if the calculated value exceeds `totalAllocation`, need to use `totalAllocation` as the calculated value.

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
function increment(address _repository, uint _value) internal {
    totals[_repository] += _value;
    prices[_repository] += total / ERC20(_repository).totalSupply();
}
```

#### Withdrawing Tokens

The Allocator Contract's `withdraw()` function will deposit into the user's account as many Dev Tokens as they can receive. The processing fee for this transaction is a quantity of ETH equivalent to the value of `oraclize_getPrice("URL")`. This is usually a small amount. This processing fee is deposited into the Allocator Contract and will be used for the calculation of the next distribution.

The value of `prices[_repository]` after executing `withdraw()` will be mapped in each user account, and subtracted from withdrawing amount the next time `withdraw()` is called. The value of `prices[_repository]` is constantly added to. For that reason, subtracting the previous value of `prices[_repository]` is the same as withdrawing the value received from the previous execution until the present.

```sol
struct WithdrawalLimit {
    uint total;
    uint balance;
}
mapping(address => mapping(address => uint)) internal lastWithdrawalPrices;
mapping(address => mapping(address => uint)) internal pendingWithdrawals;
mapping(address => mapping(address => WithdrawalLimit)) internal withdrawalLimits;

function withdraw(address _repository) public payable {
    uint _value = calculateWithdrawableAmount(_repository, msg.sender);
    uint value = _value + pendingWithdrawals[_repository][msg.sender];
    ERC20(token).mint(msg.sender, value);
    lastWithdrawalPrices[_repository][msg.sender] = price;
    pendingWithdrawals[_repository][msg.sender] = 0;
}

function calculateWithdrawableAmount(address _repository, address _user)
    private
    view
    returns (uint)
{
    uint _last = lastWithdrawalPrices[_repository][_user];
    WithdrawalLimit memory _limit = withdrawalLimits[_repository][_user];
    uint priceGap = price - _last;
    uint balance = ERC20(_repository).balanceOf(_user);
    if (_limit.total == total) {
        balance = _limit.balance;
    }
    uint value = priceGap * balance;
    return value;
}
```

This calculation is only completed when the user account's balance is fixed. Hence, before the balance is changed, `lastWithdrawalPrices` and `pendingWithdrawals` must be updated. Also, when the balance is changed, a withdrawal limit will be set for the recipient. This withdrawal limit only applies while `total[_repository]` is the same. Like `price[_repository]`, the value of `total[_repository]` is constantly added to. Creating a withdrawal limit for that recipient when the balance is changed means that the amount that can be withdrawn is determined by the balance at the time of last distribution.

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

The balance of the voter's Dev Token determines the importance of one vote. Voting chooses yes/no. When the total number of votes reaches 10% of the total Dev Token total supply, the Market Contract becomes effective if the number of positive votes exceeds the negative ones.

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

	function calculate(address _prop, uint _start, uint _end)
		public
		returns (bool);
}
```

`authenticate()` function can take up to five arguments in addition to the target Property Contract address. Need to define `schema` as a JSON string as an array to indicate what each argument should mean.

It looks like this, for example:

```sol
string public schema = "['read-only token', 'Your namespace', 'More something']";
```

## State Contract

The State Contract is a smart contract whose purpose is to make the state of the Dev Protocols permanent.

The Property Contract's address and the name of the property also and Allocator Contract's address is mapped on the State Contract. It also includes several getter/setter functions to control this mapping.

We can save a similar mapping without using the State Contract and just using the Property Factory Contract or the Allocator Contract. But the reason you have to use the State Contract is in the differences between life cycles.

When an upgrade for the Property Contract arises, there is a chance that multiple versions of the Property Contract will exist. Ideally, the Dev Protocols would maintain a single state even if multiple Property Contracts are in existence. That is why a State Contract is prepared.

### Operator

The only accounts that can change the state of the State Contract are accounts included in `operator`.

Only the Market Contract is included in `operator`. Whenever the Market Contract creates a new Property Contract, the State Contract is updated. The state of the State Contract affects the validation of a Property Contract when it is created, so this ability should be restricted to the Market Contract.

### Adding Property Contract Address

The State Contract's `addProperty()` function maps a Property Contract to a piece of property.

It takes the name of the property and the Property Contract address as arguments.

The State Contract must prevent property that has already been registered from being registered multiple times. This is because the state of the State Contract affects the calculation of Dev Tokens to be distributed.

For this reason, only the Market Contract can call `addProperty()`, and the property used in the Market Contract's authentication process should be used as a unique key.

## Develop Dev Protocol

Dev Protocol is OSS. Anyone can participate in its development.

- GitHub: https://github.com/dev-protocol/repository-token
- Discord: https://discord.gg/VwJp4KM
- Spectrum: https://spectrum.chat/devtoken
- Twitter: https://twitter.com/devtoken_rocks
- Blog: https://medium.com/devtoken
- Web site: https://devtoken.rocks
