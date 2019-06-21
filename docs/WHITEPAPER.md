# Dev Repository Token Whitepaper

Version: **`0.2.0`**

_This whitepaper may be updated. When updating, the version number is incremented according to [Semantic Versioning](https://semver.org/)._

###### tags: `Dev`, `Dev Repository Token`

## Introduction

Dev Repository Token is a token that treats repositories of open source software (OSS) like securities. It can monetize OSS without changing its licensing or code, and solves the issue of sustainability in OSS.

Dev Repository Token is made up of Repository Contracts and that Factory Contract, Distributor Contracts and the State Contract. The Repository Contract is an ERC-20 token, which is paired with a piece of OSS. After the number of downloads of the OSS has been comparatively evaluated by the Distributor Contract, the Repository Contract uses this evaluation to distribute Dev Tokens to holders of the Repository Contract. The State Contract serves to maintain the relationship between the Repository Contract and the OSS.

By functioning like securities for OSS, Dev Repository Token creates an incentive for OSS developers to develop better OSS. The developers and companies that rely on a particular piece of OSS can purchase the Dev Repository Tokens for that software, which is effectively donating to the developers, but can also be expected to provide a financial return in future.

This piece uses simplified pseudo code to explain concepts.

## Overview

The core of Dev Repository Token is made up of an exchangeable Repository Contract (Repository Token) attached to a particular piece of OSS, and the Dev Tokens distributed to the holders of that contract.

Dev Repository Token is ERC-20 compliant, and can be bought and sold freely. Owner of this protocol does not charge any transaction processing fees.

Dev Repository Token holders have the right to receive Dev Tokens. The number of Dev Tokens distributed to an individual is determined by the number of Dev Repository Tokens they possess. The total number they receive will be determined by the rating of the OSS mapped to their Dev Repository Tokens.

Users in possession of Dev Repository Tokens for highly rated OSS will be given more. For OSS projects in the early stages of development, giving Dev Repository Tokens to contributors can provide motivation for more active project development.

![Overview](https://raw.githubusercontent.com/dev-protocol/repository-token/master/public/asset/whitepaper/Overview.png)

### Life Cycle

The life cycle of Dev Repository Contract begins when an OSS developer issues a Repository Contract.

When an OSS developer issues a Repository Contract mapped to their OSS, they own 100% of those tokens. This balance will change when they transfer them to others.

The Repository Contracts are ERC-20 compliant, so you can transfer them at will. In the future, we hope to create a decentralized exchange where you can list Repository contracts when you issue them.

![Create](https://raw.githubusercontent.com/dev-protocol/repository-token/master/public/asset/whitepaper/Create.png)

When a Distributor Contract is created, Repository Contracts become able to receive Dev Tokens. Repository Contract holders can withdraw Dev Tokens depending on their current balance.
When running distributions rates calculation by Distributor Contract, Repository Contracts holders become able to receive Dev Tokens. Repository Contract holders can withdraw Dev Tokens depending on their current balance.

The number of Dev Tokens received depends on the number of times the OSS has been downloaded. Repository Contract holders can then trade their Dev Tokens on the exchange.

![Distribute](https://raw.githubusercontent.com/dev-protocol/repository-token/master/public/asset/whitepaper/Distribute.png)

## Repository Contract

The Repository Contract is a smart contract created by the Repository Factory Contract's `createRepository()` function. Repository Contracts are always created in a one-to-one relationship with OSS. The Repository Contract token is ERC-20 compliant, and can be transferred to any address.

**Note:** At present, the only types of OSS that can be registered as Repository Contracts are those published as npm packages.

Every Repository Contract holder will receive Dev Tokens. The number received for each Repository Contract will be evaluated/decided by the Distributor Contract.

### Creating Repository Contract

The Repository Factory Contract's `createRepository()` function creates a new Repository Contract.

The function takes the remote repository URL, the npm package name, and the npm read-only token as arguments.

After someone is recognized as an npm package owner by the npm read-only token, an ERC-20 compliant Repository Contract is created with fixed variables `totalSupply` and `decimals`.

**Note:** To make it easy for developers to register, and to make it easier to calculate the value, `totalSupply` and `decimals` must be fixed.

The relationship between the Repository Contract address and the OSS is mapped by a State Contract.

## Distributor Contract

The Distributor Contract role is calculating distributions and withdrawing tokens. Distributor Contracts use the number of times the OSS has been downloaded to calculate how many Dev Tokens to distribute to the Repository Contract. And, withdrawing tokens by requests from each user.

The distributes calculation requires access to information outside the blockchain, so Oraclize is used.

Oraclize requires ETH to use, so calculate function is a `payable` function. Any ETH that was not used in the distribution calculation is returned to the function's sender (distributor) upon ended calculation. The processing fee for the Repository Contract's `withdraw()` function is deposited in the Distributor Contract. If the deposit is less than Oraclize's processing fee, additional ETH must be paid, but when the deposit is more than the processing fee, the distributor will take the surplus. This is a reward for the distributor performing the calculation.

### Running Distributor Contract

The Distributor Contract contains the variable `mintVolumePerDay`, which is set beforehand, and this value represents how many will be issued per day. The previous date of execution is recorded in the self contract, and the period between the previous execution and the day before the next one is defined as the target period. The target period must be longer than one day.

The number of new issues that will create the funding for the distribution is calculated as `mintVolumePerDay` multiplied by the length of the target period.

### Setting Mint Volume

The value of `mintVolumePerDay` is updated by executing the Distributor Factory Contract's `setMintVolumePerDay()` function.

```sol
function setMintVolumePerDay(uint _vol) public onlyOwner {
    mintVolumePerDay = _vol;
}
```

**Note:** This operation is carried out by the owner of the Distributor Contract, but in future, we believe that a decision under a governance model would be better.

### Calculating Distributions

The Distributor Contract calculates the number of Dev Tokens to be distributed as soon as it is created.

The Repository Contract's distribution calculation uses the following variables.

- `v` = Total number of new tokens to be issued
- `d` = Number of downloads of the npm package recorded in the target Repository Contract over a specified period
- `ad` = Sum of `d` values from every Repository Contract

The equation is as follows.

```
distributions = v * (d+b) / ad
```

The Distributor Contract mints Dev Tokens for the Repository Contract according to the number of tokens to be distributed. For this reason, the Distributor Contract should also have permission to mint Dev Tokens.

When ended this calculate, the calculation reward is transferred to the sender(distributor).

### Receiving Distributed Tokens

Dev Tokens can be received when the user account invokes the Distributor Contract's `withdraw()` function.

The Distributor Contract records the total number of distributed tokens as `totals`, and the total value of distributed tokens as `prices`, each Repository.

```sol
mapping(address => uint) totals;
mapping(address => uint) prices;
```

When the user account invokes the `withdraw()` function, the user can receive a number of Dev Tokens equal to `price` multiplied by the user's balance in the Repository Contract. The `price` variable at this time is mapped to the user account in the Repository Contract, and it will be deducted from the value the next time the same account invokes the `withdraw()` function. In this way, the amount withdrawn will not exceed the maximum amount that can be withdrawn by one person.

#### Calculating Price

The Distributor Contract's `increment()` function adds the rating given by the Distributor Contract to `total` and `price`.

```sol
function increment(address _repository, uint _value) internal {
    totals[_repository] += _value;
    prices[_repository] += total / ERC20(_repository).totalSupply();
}
```

#### Withdrawing Tokens

The Distributor Contract's `withdraw()` function will deposit into the user's account as many Dev Tokens as they can receive. The processing fee for this transaction is a quantity of ETH equivalent to the value of `oraclize_getPrice("URL")`. This is usually a small amount. This processing fee is deposited into the Distributor Contract and will be used for the calculation of the next distribution.

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
    DEPOSIT(); // Deposit a fee to this contract.
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

This is what the implementation of Repository Contract's `transfer()` function looks like.

```sol
// Repository Contract (ERC-20)
function transfer(address to, uint256 value) public returns (bool) {
    Distributor(distributor).beforeBalanceChange(
        address(this),
        msg.sender,
        to
    );
    _transfer(msg.sender, to, value);
    return true;
}
```

```sol
// Distributor Contract
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

`beforeBalanceChange` function affects the withdrawable amount in the account, so this invokes ability should be restricted to each Repository Contract.

## State Contract

The State Contract is a smart contract whose purpose is to make the state of the Dev Repository Tokens permanent.

The Repository Contract's address and the name of the OSS also and Distributor Contract's address is mapped on the State Contract. It also includes several getter/setter functions to control this mapping.

We can save a similar mapping without using the State Contract and just using the Repository Factory Contract or the Distributor Contract. But the reason you have to use the State Contract is in the differences between life cycles.

When an upgrade for the Repository Contract arises, there is a chance that multiple versions of the Repository Factory Contract will exist. Ideally, the Dev Repository Tokens would maintain a single state even if multiple Repository Factory Contracts are in existence. That is why a State Contract is prepared.

### Operator

The only accounts that can change the state of the State Contract are accounts included in `operator`.

Only the Repository Factory Contract is included in `operator`. Whenever the Repository Factory Contract creates a new Repository Contract, the State Contract is updated. The state of the State Contract affects the validation of a Repository Contract when it is created, so this ability should be restricted to the Repository Factory Contract.

### Adding Repository Contract Address

The State Contract's `addRepository()` function maps a Repository Contract to a piece of OSS.

It takes the name of the OSS and the Repository Contract address as arguments.

The State Contract must prevent OSS that has already been registered from being registered multiple times. This is because the state of the State Contract affects the calculation of Dev Tokens to be distributed.

For this reason, only the Repository Factory Contract can call `addRepository()`, and the property used in the Repository Factory Contract's authentication process should be used as a unique key.

## Develop Dev Repository Token

Dev Repository Token is OSS. Anyone can participate in its development.

GitHub: https://github.com/dev-protocol/repository-token
Discord: https://discord.gg/VwJp4KM
Spectrum: https://spectrum.chat/devtoken
Twitter: https://twitter.com/devtoken_rocks
Blog: https://medium.com/devtoken
Web site: https://devtoken.rocks
