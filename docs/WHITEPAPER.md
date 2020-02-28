# Dev Protocol Whitepaper

Version: **`2.1.6`**

_There is a possibility that this white paper will be updated. When there is an update, the version number will increase according to [Semantic Versioning](https://semver.org/)._

Dev Protocol is a middleware protocol that optimizes various properties for autonomous distribution and enables trading through on-chain governance.

# The World that Dev Protocol Aims for

Economic activities are built on top of many activities. Profit is necessary for these activities to involve investment for future growth. Dev is a technology that fairly evaluates various activities that have not received a proper economic evaluation and realizes their autonomous distribution and sustainability through P2P trading and reward distribution

## Overview

Individuals produce value through activities. Dev Protocol possesses market, staking, and market reward distribution features to capitalize the value produced by these activities and trade it through P2P. When activities are capitalized, the following is achieved.

- Market rewards are obtained based on the value produced by the activities
- The property undergoes Staking (financial support) by third parties
- Providing value as an incentive for Staking
- Sharing properties with joint activity participants and distributing market rewards

Staking is a new form of trading money that uses the inflation mechanism. Through staking, the sustainability of users’ activities is secured, and users receive value at zero real cost. This is a mechanism that provides profit for all properties that had previously been released for free. Dev Protocol aims for a total value staked that surpasses donation activities that have been taking place through legal tender.

Dev Protocol transfers the formulation of its policy, which serves as the guiding principle for its governance, to the community so that it can be updated depending on the circumstances. Users can freely propose a new policy through the protocol. In order for a policy to take effect, approval must be granted through a vote of property holders. A policy is related to a decision on the inflation rate and more. The initial policy is [here](./POLICY.md).

## Market

The market serves to provide social fairness by certifying an individual’s activity on the blockchain and evaluating it fairly. A market is created for each evaluation index for activities, and the community can propose the opening of a new market.

## Capitalization

As a premise, ownership of a user’s activities is certified to belong to the user in Dev Protocol. This differs from the model employed in existing web platforms, in which the platform owns the user data, and separates the ownership and utilization of properties. Uses of a property can be produced infinitely through the application layer.

## Capitalization Method

By authenticating an external account that expresses ownership of the activity on Dev Protocol, users can define their activity as a “property” on the market and certify that they are the owner of the property. When authenticating a property, the user pays a commission in DEV that has been defined by the policy, and the commission that has been paid is automatically burned. Users can authenticate multiple properties and connect them to multiple markets. The maximum number of properties that can be authenticated is defined by the policy.

## Evaluation

An owner of a property can request the evaluation of the property at any time in order to receive market rewards. The evaluation index for the evaluation of properties is defined for each market.

## Profit, Market Reward, Inflation, Deflation

An owner of a property receives a market reward based on the value of the property. If staking is done on a property that a user owns, a market reward will be added based on the total value staked.

The flow of DEV in the protocol can be summarized as a lifecycle as follows. For simplicity, the owner of a property is listed as an “activity participant,” and a third party who uses it is listed as a “user,” although a user can be classified as both.

1. DEV is newly issued by an activity participant and undergoes inflation.
2. A user stakes the DEV for the activity participant.
3. The more staking that an activity participant receives, the more DEV this activity participant can newly issue.
4. As consideration for staking, the activity participant provides the user with utility.
5. When the user cancels staking, the activity participant is able to withdraw the staking amount, as well as a portion of the DEV that the activity participant obtained through the offering.

The total amount is decided (dynamically or statically) based on the policy regarding the inflation rate for DEV. The initial policy is [here](./POLICY.md). Through the protocol, DEV is newly issued, burned, staked, and fluctuates based on demand.

## Shared Rights with Joint Activity Participants

The owner of a property initially owns 100% of the ownership rights. Owning 100% of the ownership rights is equivalent to the right to receive all of the market rewards. It is possible for multiple people, such as joint activity participants, to own the ownership rights by transferring a portion of the ownership rights. Ownership rights holders can receive a portion of market rewards based on the ownership ratio. This is realized by the fact that the Property Contract that represents ownership rights conforms to ERC20.

## Staking

Staking is used in Dev Protocol as a new payment system that enables trading of various properties. Staking is a mechanism that increases market rewards through the temporary deposit of DEV toward a property. As consideration for staking, the payer receives utility from the activity participant, and the activity participant receives the market rewards that have increased during the staking period. Staking continues while the payer needs this utility, increasing the scarcity value of DEV. By receiving staking, users secure the sustainability of their activity.

### Payment Flow

1. By staking DEV in a property over a specific period of time, the payer receives some sort of consideration.
2. According to the inventory of DEV staked, the market reward (inflation) amount for the property is added. The longer the staking period by the payer, the more market rewards are promised to the activity participant.
3. As interest, the payer receives a portion of the DEV that is newly acquired by the activity participant. The amount that can be received at this time is determined by the amount that the payer has staked in comparison with the total amount staked.
4. When the staking period ends, the DEV staked in the property is released, and the payer can withdraw it.

## Governance

Many incentives are built into Dev Protocol so that all users can receive profit without encroaching on each other’s interests. There is no decisive theory on the interaction of these incentives, and our hope is for the community, including stakeholders, to constantly propose improvements. In Dev Protocol, indices with uncertainty are accepted from external sources as part of the policy. And, the initial policy is [here](<(./POLICY.md)>).

## Application Layer

By staking their DEV toward an activity participant, users receive some sort of consideration from this activity participant. The consideration is paid in the form of rights or labor. (Although it is possible for the staking user to directly contact the activity participant and request consideration in a primitive manner,) The application layer automatically executes a series of trades. The application layer relays the user’s staking to the activity participant and relays the activity participant’s consideration to the user. The motivation to build out an application layer depends on each individual’s intentions, but below are possible motivations.

- Increase the value of DEV owned
- Receive a portion of the rewards by inheriting a portion of the activity participant’s Property
- Collect commission from the user

# Mechanism

Dev Protocol is comprised of the following 20 contracts.

- Market
- Market Factory
- Market Group
- Property
- Property Factory
- Property Group
- Metrics
- Metrics Group
- IPolicy
- Policy
- Policy Factory
- Vote Counter
- Vote Times
- Lockup
- Allocator
- Policy
- Policy Factory
- Address Config
- Using Config
- DEV

Synoptic Chart of Contracts:
![Overview](https://i.imgur.com/5JwNQ3o.png)

## Market

The Market Contract represents a specific group of properties. The properties handled by Dev Protocol can be defined through the 2 interfaces of the `authenticate` function, which authenticates properties, and the `calculate` function, which evaluates property values.

Anybody can freely propose a Market Contract. However, in order for it to take effect, it must be approved through a vote of existing Property Contract owners. The number of votes will be the sum of the count staked in the Property Contract and the `totals`. Generally, votes are expected to be carried out by property owners, but stake executors can use their own count of stakes as the number of votes in order to vote. In this case, the address of the Property Contract subject to staking will be assigned.

The `cauthenticate` function expresses the property to be authenticated and authenticates whether the executor is the owner of the property. For example, 1 GitHub repository is assigned, and the fact that the executor is the owner of this GitHub repository is authenticated. Therefore, it should not be possible for anybody other than the owner of the Property Contract to execute the `authenticate` function. This function is called directly by a user, and it is expected for `authenticatedCallback` to be called for a successful authentication. When executing the `authenticate` function, a commission defined by the Policy Contract is paid in DEV, and the commission paid is automatically burned.

The `calculate` function calculates the property value to decide the market rewards. It is expected that this function will be called from the Allocator Contract, but it can also be called directly by a user. However, it produces no effect unless it is called from the Allocator Contract. There is no need to validate the context when executing, as this is all carried out by the Allocator Contract. The results of the calculation are reported to the Allocator Contract by calling the `calculatedCallback` in the Allocator Contract.

`authenticate` defines what a single Market Contract handles as a property, and `calculate` defines how it is evaluated.

## Market Factory

The Market Factory Contract generates a new Market Contract.

The generation of a Market Contract is carried out by executing the `create` function. The `create` function receives the address for the contract with the next interface and generates a new Market Contract.

```solidity
contract IMarket {
	string public schema;

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5
	) public returns (bool);

	function calculate(address _metrics, uint256 _start, uint256 _end)
		external
		returns (bool);
}
```

The `schema` is an array-type JSON character string that explains the significance of the arguments that the `authenticate` function receives for authentication. The maximum for these arguments is 5, in addition to the address of the Property Contract. An example is presented below.

```solidity
string public schema = "['Your asset identity', 'Read-only token', 'More something']";
```

The `authenticate` function always handles the 2nd argument as the unique ID. Accordingly, values that cannot secure uniqueness should not be assigned. The following schema is an incorrect example.

```solidity
string public schema = "['Read-only token', 'Your GitHub repository(e.g. your-name/repos)']";
```

And the following schema is a correct example.

```solidity
string public schema = "['Your GitHub repository(e.g. your-name/repos)', 'Read-only token']";
```

The Market Factory Contract creates a new Market Contract that has the proxy method and other elements for the contract. There are 2 proxy methods, which are authenticate and calculate. The authenticatedCallback function, which receives the successful authentication, and the vote function, which accepts votes, are also added.

## Property

The Property Contract represents the user’s property group. This is a token that conforms to ERC20 and can be transferred to any email address.

Each Property Contract(Token) holder will receive market rewards based on the balance of the Property Contract(Token) that they own. Calculating the market rewards is the responsibility of the Allocator Contract, receiving the market rewards is the responsibility of the Withdraw Contract, and the Property Contract is a generally pure ERC20.

The `transfer` function for the Property Contract requests the Allocator Contract to adjust the amount that can be withdrawn, since the amount of market rewards that can be withdrawn varies based on changes to the balance.

A Property Contract in its initial state cannot receive market rewards. Since market rewards are determined based on staking and property value, a property must be associated in order to receive market rewards.

In order for a property to be associated with a Property Contract, a Market Contract must be associated with the Property Contract. The association is established by the `authenticatedCallback` function for the Market Contract. Multiple Market Contracts can be associated with a Property Contract. 1 Property Contract can represent a specific property group or a Property Contract can be created for each property.

## Property Factory

The Property Factory Contract generates a new Property Contract.

The generation of a Property Contract is carried out by executing the `create` function. The `name` and `symbol` are specified as an argument. For ease of comparison of Property Contracts, `totalSupply` is fixed as `10000000`, and `decimals` is fixed as `18`.

## Metrics

The Metrics Contract represents the association between Property Contracts and Market Contracts.

When `authenticatedCallback` for the Market Contract is called, a Metrics Contract that retains the addresses for the Property Contract and Market Contract is generated.
`authenticatedCallback` for the Market Contract returns the address for the Metrics Contract. By creating a map that brings the addresses for the Market Contract and Metrics Contract together, it is possible to retain the context for the authentication. The context for the authentication can be used when calculating the market rewards.

## Lockup

The Lockup Contract manages staking in Property Contracts.

### lockup

When a user stakes their own DEV in a Property Contract. This function can only be executed from the `deposit` function for DEV.

By assigning the address of the Property Contract to stake in and the quantity of DEV, the Lockup Contract stakes the DEV. The DEV that has been staked can be withdrawn after a certain amount of time has passed after executing the `cancel` function. Stakes can be added as many times as desired until the `cancel` function is executed.

By staking DEV, users can receive some sort of utility from the owner of the corresponding Property Contract. Staking continues until this utility is needed, increasing the scarcity value of DEV.

### cancel

The DEV that the user has staked in the Property Contract is released. Staking continues for a certain amount of time after the release has been requested. This period is determined by the number of blocks defined in the Policy Contract.

### withdraw

The DEV that the user has staked in the Property Contract is withdrawn. Withdrawal is not possible unless a release has been requested through the `cancel` function. Additionally, withdrawal is not possible until the number of blocks that has been set by the release request is reached.

If the block count that has been set by the release request is reached, the full amount of DEV that the user staked in the Property Contract is transferred to the user.

## Allocator

The Allocator Contract plays several roles to determine market rewards.

### allocate

The market rewards for the Property Contract are calculated and added to the amount that can be withdrawn. The address for the Metrics Contract is received as an argument. The following variables are used to determine market rewards.

- `t`= The period (number of blocks) since the `allocate` function was last executed
- `a`= The number obtained by taking the property value that is obtained by calling the `calculate` function for the Market Contract that is associated by the Metrics Contract and dividing it by `t`
- `l`= The number of stakes for the Property Contract that is associated by the Metrics Contract
- `v`= The total property value (for each blocks) decided by the Policy Contract based on `a` and `l`
- `p` = The previous `v`
- `d` = The sum of total property values (for each block) for Market Contracts associated by the Metrics Contract
- `m` = The total rewards (for each block) calculated by the Policy Contract
- `s` = The share of issued Metrics for the Market Contract associated by the Metrics Contract

The basic idea is that it is decided by the sum of the total property values (for each block) and the ratio of each total property value (for each block). Each time a calculation is executed, the sum of the total property values is overridden and used for the next calculation.

The formula is as follows.

```
distributions = v / (d - p + v) * m * s * t
```

After this calculation, `d` is overridden by the value of `(d - p + v)`.

## Withdraw

The Winthdraw Contract plays several roles for managing the amount of market rewards that can be withdrawn.

### withdraw

Withdraws the market rewards for the Property Contract. The executor withdraws the amount that can be withdrawn when it is called.

The Allocator Contract sets the sum of the market rewards for the Property Contract as `totals` and sets the cumulative price of the market rewards as `prices` and records them. If the Property Contract has been staked in, `lockTotals` and [lockPrices are also recorded as values for the stake executor. The shares of market rewards between the Property Contract(Token) holder and the stake executor are defined by the Policy Contract.

```solidity
mapping(address => uint) totals;
mapping(address => uint) prices;
mapping(address => uint) lockTotals;
mapping(address => uint) lockPrices;
```

When a user calls the `withdraw` function, the number of DEV that the user receives is `price` multiplied by the user’s balance for the Property Contract.

Updates for `totals` and `prices` are carried out by the `increment` function for the Allocator Contract.

```solidity
function increment(address _property, uint _value) internal {
	totals[_property] += _value;
	prices[_property] += _value / ERC20(_token).totalSupply();
}
```

`totals` is the cumulative sum of market rewards, and `prices` is the cumulative sum of market rewards that can be withdrawn for 1 Property Contract(Token).

`prices` is mapped for each user account for the Property Contract and is subtracted from the value when the same user calls the `withdraw` function next. In this manner, the amount that can be withdrawn will not exceed the maximum amount that an individual can withdraw. This is illustrated below.

1. Alice, who owns 500 Property Contracts, withdraws for the first time when `prices` is 100. The amount that can be withdrawn is `(100 - 0) × 500 = 50000`.
2. Alice withdraws again when `prices` becomes 120. The amount that can be withdrawn is `(120 - 100) × 500 = 10000`.

As a result of withdrawing 2 separate times, Alice obtains a total of `50000 + 10000 = 60000`. Hypothetically, if she had not withdrawn the 1st time, the amount would have been `120 × 500 = 60000`, demonstrating how the amount that can be withdrawn is the same.

This formula is only valid when the user’s balance is consistent. Therefore, when executing the `transfer` function for the Property Contract, the Allocator Contract must be notified, and there is a need to adjust the amounts that can be withdrawn by the sender and the recipient.

## Policy

The Policy Contract represents the policy of Dev Protocol. Dev Protocol assigns the formulation of uncertain indices to the community and updates the indices based on the circumstances.

Anybody can freely propose a Policy Contract. However, in order for it to take effect, it must be approved through a vote of the existing Property Contract owners. The number of votes will be the sum of the count staked in the Property Contract and the `totals`. The vote is completed by executing `vote` for the Policy Contract. Generally, votes are expected to be carried out by property owners, but stake executors can use their own count of stakes as the number of votes in order to vote. In this case, the address of the Property Contract subject to staking will be assigned.

As soon as the new Policy Contract receives enough affirmative votes to meet the conditions to take effect, it will take effect, and the old Policy Contract will ceases to exist. Currently, formulation of the initial policy is in progress.

The following indices are decided by the Policy Contract.

### rewards

The total value of market rewards for the block. It is called when calculating market rewards in the Allocator Contract, and the total value of market rewards is calculated using the following variables.

- Total Stakes in the Property
- Total Count of Properties (Total Metrics Contracts)

### holdersShare

The share of market rewards received by the Property Contract(Token) holder. It is called when calculating market rewards in the Allocator Contract, and the share of market rewards received by the Property Contract(Token) holder is calculated using the following variables.

- Value of Market Rewards
- Count of Stakes

The share received by the stake executor is the excess portion of the Holders Share.

### assetValue

The property value. It is called when calculating the market rewards in the Allocator Contract, and the property value is calculated using the following variables.

- Total Stakes in the Property
- Property Evaluation Based on the Market Contract

### authenticationFee

The commission for authenticating a property. It is called within `authenticatedCallback` for the Market Contract, and the commission for authenticating a property is decided based on the following variables.

- Total Count of Properties (Total Metrcis Contracts)
- Total Current Stakes in the Property Contract

### marketApproval

Whether or not a new Market Contract takes effect. It is called within vote for the Market Contract, and whether the new Market Contract takes effect is decided based on the following variables.

- Affirmative Votes
- Negative Votes

### policyApproval

Whether or not a new Policy Contract takes effect. Within `vote` for the proposed Policy Contract, `policyApproval` for the current Policy Contract is called, and whether the new Policy Contract takes effect is decided based on the following variables.

- Affirmative Votes
- Negative Votes

### marketVotingBlocks

The number of blocks between the proposal of a new Market Contract and the end of voting. Once voting ends, the Market Contract will be rejected.

### policyVotingBlocks

The number of blocks between the proposal of a new Policy Contract and the end of voting. Once voting ends, the Policy Contract will be rejected.

### abstentionPenalty

The penalty that is applied when the owner of a Property Contract abstains from voting for a Market Contract or Policy Contract. The penalty is levied by instituting a period (block count) that is excluded from the calculation of market rewards. It is called within `allocate` for the Allocator Contract, and the penalty is decided using the following variable.

- Abstention Count

The period that is excluded from the calculation is calculated and returned. The starting block for the exclusion period is the block from the previous execution of `allocate`. During the period that is excluded from the calculation, execution of `allocate` will fail, and property value during the period will not be considered even after the end of the period.

In order to calculate the abstention count, the Property Contracts for which voting did not take place for the Market Contract and Policy Contract vote acceptance periods are recorded.

### lockUpBlocks

The number of continuous blocks after the request to cancel Staking. Users can cancel the DEV that they have staked in a Property Contract, but staking will continue for a specified number of blocks after the cancellation is requested.

## Policy Factory

The Policy Factory Contract generates a new Policy Contract.

The generation of a Policy Contract is carried out by executing a `create` function. The `create` function obtains the address of the Policy Contract and adds the `vote` function that accepts votes to generate a new Policy Contract.

## State

The State Contract is a contract that makes the state of the other contracts persistent. Its responsibility is to exclusively maintain the state and getter method without waiting for implementation.

## DEV

DEV is the ERC20 token that serves as the key currency for Dev Protocol.

https://etherscan.io/token/0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26

## Develop Dev Protocol

Dev Protocol is OSS, and anybody can participate in its development.

- GitHub: https://github.com/dev-protocol/protocol
- Discord: https://discord.gg/VwJp4KM
- Spectrum: https://spectrum.chat/devtoken
- Twitter: https://twitter.com/devtoken_rocks
- Blog: https://medium.com/devtoken
- Web site: https://devtoken.rocks
