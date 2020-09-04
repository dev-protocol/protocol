# Dev Protocol Whitepaper

Version: **`3.1.1`**

_There is a possibility that this white paper will be updated. When there is an update, the version number will increase according to [Semantic Versioning](https://semver.org/)._

Dev Protocol is a middleware protocol that optimizes various properties for autonomous distribution and enables trading through on-chain governance.

# The World that Dev Protocol Aims for

Economic activities are built on top of many real world activities. These activities need investments to realize future growth and profit. Dev Protocol is a decentralized technology that fairly evaluates various activities that have not received an economic evaluation and realizes their autonomous distribution and sustainability through P2P trading and reward distribution.

## Overview

Individuals produce value through activities. Dev Protocol offers market, staking, and reward distribution features to capitalize the value produced by these activities and trade it through P2P. When activities are capitalized, the following is achieved.

- Market rewards are obtained based on the value produced by the activities
- The property undergoes Staking (financial support) by third parties
- Providing value as an incentive for Staking
- Sharing properties with joint activity participants and distributing market rewards

Staking is a new form of trading money that uses the inflation mechanism. Through staking, the sustainability of users’ activities is secured, and users receive value at zero financial cost. This is a mechanism that provides profit for all properties that had previously been released for free or through other indirect monetization mechanisms. Dev Protocol aims for a total value staked that surpasses donation activities that have been taking place through legal tender.

Dev Protocol transfers the formulation of its policy, which serves as the guiding principle for its governance, to the community so that it can be updated depending on the circumstances. Users can freely propose a new policy through the protocol. In order for a policy to take effect, approval must be granted through a vote of property holders. A policy can be related to a decision on the inflation rate and other aspects of the ecosystem. The current policy is [here](./POLICY.md).

## Market

The market serves to provide assuring identity by certifying an individual’s activity on the blockchain. A market is created for each authentication target, and the community can propose the opening of new markets.

## Capitalization

As a premise, ownership of a user’s activities is certified to belong to the user in Dev Protocol. This differs from the model employed in existing web platforms, in which the platform owns the user data, and separates the ownership and utilization of properties. A property can be used infinitely through the application layer built on top of Dev protocol.

## Capitalization Method

By authenticating an external account that expresses ownership of the activity on Dev Protocol, users can define their activity as a “property” on the market and certify that they are the owner of the property. When authenticating a property, the user pays a commission in DEV that has been defined by the policy, and the commission that has been paid is instantly burned. Users can authenticate multiple properties and connect them to multiple markets. The maximum number of properties that can be authenticated is defined by the policy.

## Profit, Market Reward, Inflation, Deflation

An owner of a property receives a market reward based on the value of the property. If staking is done on a property that a user owns, a market reward will be added based on the total value staked.

The flow of DEV in the protocol can be summarized through the following lifecycle. For simplicity, the owner of a property is listed as an “activity participant,” and a third party who receives some form of utility is listed as a “user,” although a user can be classified as both.

1. DEV is newly issued by an activity participant and undergoes inflation.
2. A user stakes the DEV for the activity participant.
3. The more staking that a property receives, the more DEV this activity participant can newly issue.
4. As consideration for staking, the activity participant provides the user with utility.
5. When the user cancels staking, the user is able to withdraw the staking amount, as well as a portion of the DEV that the activity participant obtained through the offering.

The total amount of rewards is determined (dynamically or statically) based on the policy regarding the inflation rate for DEV. The initial policy is [here](./POLICY.md). Through the protocol, DEV is newly issued, burned, staked, and fluctuates based on demand.

## Shared Rights with Joint Activity Participants

The owner of a property initially owns 100% of the ownership rights. Owning 100% of the ownership rights is equivalent to the right to receive all of the market rewards. It is possible for multiple people, such as joint activity participants, to own the ownership rights by transferring a portion of the ownership rights. Ownership rights holders can receive a portion of market rewards based on the ownership ratio. This is realized by the fact that the Property Contract that represents ownership rights conforms to ERC20 standard.

## Staking

Staking is used in Dev Protocol as a new payment system that enables trading of various properties. Staking is a mechanism that increases market rewards through the temporary deposit of DEV toward a property. As consideration for staking, the payer receives utility from the activity participant, and the activity participant receives the market rewards that have increased during the staking period. Staking continues while the payer needs this utility, increasing the scarcity value of DEV. By receiving staking, activity participant secure the sustainability of their activity.

### Payment Flow

1. By staking DEV in a property over a specific period of time, the payer receives some sort of consideration.
2. Based on the amount of DEV staked, a market reward (inflation) amount is added for the property. The longer the staking period by the payer, the more market rewards are promised to the activity participant.
3. As interest, the user receives a portion of the DEV that is newly acquired by the activity participant. The amount that can be received at this time is determined by the amount that the user has staked in comparison with the total amount staked.
4. When the staking period ends, the DEV staked in the property is released, and the user can withdraw it.

## Governance

Many incentives are built into Dev Protocol so that all users can receive profit without encroaching on each other’s interests. There is no decisive theory on the interaction of these incentives, and our hope is for the community, including stakeholders, to constantly propose improvements. In Dev Protocol, indices with uncertainty are accepted from external sources as part of the policy. And, the initial policy is [here](./POLICY.md).

## Application Layer

By staking their DEV toward an activity participant, users receive some sort of consideration from this activity participant. The consideration is paid in the form of rights or labor. (Although it is possible for the staking user to contact the activity participant and request consideration in a direct manner) The application layer automatically executes a series of trades. The application layer relays the user’s staking to the activity participant and relays the activity participant’s consideration to the user. The motivation to build out an application layer depends on each individual’s intentions, but below are possible motivations.

- Increase the value of DEV owned
- Receive a portion of the rewards by inheriting a portion of the activity participant’s Property
- Collect commission from the user

# Token Distribution

The Dev Protocol plans a token distribution of the core token "DEV."

The following graph shows the latest allocation plan.

![Token Distribution](https://devprtcl.com/image/token-distribution.svg)

See [the Medium post](https://medium.com/devprtcl/dev-token-allocation-update-e1d7dd424087) for more information on token distribution.

# Mechanism

Dev Protocol is comprised of the following 13 main contracts.

- Market
- Market Factory
- Property
- Property Factory
- Metrics
- Policy
- Policy Factory
- Lockup
- Allocator
- Policy
- Policy Factory
- Address Config
- DEV

Synoptic Chart of Contracts:
![Overview](https://i.imgur.com/5JwNQ3o.png)

## Market

The Market Contract represents a specific group of properties. The properties handled by Dev Protocol can be defined through the `authenticate` function.

Anybody can freely propose a Market Contract. However, in order for it to take effect, it must be approved through a vote of existing Property Contract owners. The number of votes will be the sum of the count staked in the Property Contract and the `totals`. Generally, votes are expected to be carried out by property owners, but stake executors can use their own count of stakes as the number of votes in order to vote. In this case, the address of the Property Contract subject to staking will be assigned.

The `authenticate` function authenticates the executor of the function as the owner of the property. For example, a GitHub repository is assigned, and the fact that the executor is the owner of this GitHub repository is authenticated. Therefore, it should not be possible for anybody other than the owner of the Property Contract to execute the `authenticate` function. This function is called directly by a user, and it is expected for `authenticatedCallback` to be called for a successful authentication. When executing the `authenticate` function, a commission defined by the Policy Contract is paid in DEV, and the commission paid is automatically burned.

## Market Factory

The Market Factory Contract generates a new Market Contract.

The generation of a Market Contract is carried out by executing the `create` function. The `create` function receives the address for the Property Contract with the next interface and generates a new Market Contract.

```solidity
contract IMarketBehavior {
	string public schema;

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5,
		address market
	) public returns (address);

	function getId(address _metrics) external view returns (string memory);
}

```

When you implement the `authenticate` function, please verify the caller.Create a function to set the associatedMarket.

```solidity
	function authenticate(
		address _prop,
		string memory _args1,
		string memory,
		string memory,
		string memory,
		string memory,
		// solium-disable-next-line no-trailing-whitespace
		address market,
		address
	) public returns (bool) {
		require(msg.sender == address(0) || msg.sender == associatedMarket, "Invalid sender");
		・
		・
		・
		・
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

The `getId` function receives an argument as a Metrics contract address and returns the authenticated asset name. For example, that return value is like `dev-protocol/dev-kit-js`.

The Market Factory Contract creates a new Market Contract that has the proxy method and other elements for the contract. There are 3 proxy methods, which are `authenticate`, `schema`, and `getId`. The `authenticatedCallback` function, which receives the successful authentication, and the vote function, which accepts votes, are also added.

## Property

The Property Contract represents the user’s property group. This is a token that conforms to ERC20 and can be transferred to any email address.

Each Property Contract(Token) holder will receive market rewards based on the balance of the Property Contract(Token) that they own. Calculating the market rewards is the responsibility of the Allocator Contract, whereas receiving the market rewards is the responsibility of the Withdraw Contract. The Property Contract is a pure ERC20.

The `transfer` function for the Property Contract requests the Allocator Contract to adjust the amount that can be withdrawn, since the amount of market rewards that can be withdrawn varies based on changes to the balance.

A Property Contract in its initial state is not assuring assets.

In order for a Property to be associated with an asset, a Market Contract must be associated with the Property Contract. The association is established by the `authenticatedCallback` function for the Market Contract. Multiple Market Contracts can be associated with a Property Contract. 1 Property Contract can represent a specific assets group or a Property Contract can be created for each asset.

## Property Factory

The Property Factory Contract generates a new Property Contract.

The generation of a Property Contract is carried out by executing the `create` function. The `name` and `symbol` are specified as an argument. For ease of comparison of Property Contracts, `totalSupply` is fixed as `10000000`(in Solidity, it's `10000000000000000000000000`), and `decimals` is fixed as `18`.

## Metrics

The Metrics Contract represents the association between Property Contracts and Market Contracts.

When `authenticatedCallback` of the Market Contract is called, a Metrics Contract that retains the addresses of the Property Contract and Market Contract is generated.
`authenticatedCallback` for the Market Contract returns the address for the Metrics Contract. By creating a map that brings the addresses for the Market Contract and Metrics Contract together, it is possible to retain the context for the authentication. The context for the authentication can be used when calculating the market rewards.

## Lockup

The Lockup Contract manages staking in Property Contracts.

### lockup

When a user stakes their own DEV in a Property Contract. This function can only be executed from the `deposit` function for DEV.

By assigning the address of the Property Contract to stake in and the quantity of DEV, the Lockup Contract stakes the DEV. The DEV that has been staked can be withdrawn after a certain amount of time has passed after executing the `cancel` function. Stakes can be added as many times as desired until the `cancel` function is executed.

By staking DEV, users can receive some sort of utility from the owner of the corresponding Property Contract. Staking continues until the utility is needed, increasing the scarcity value of DEV.

A cumulative total reward amount at a time of staking (accumulation of the return value of the `calculateMaxRewardsPerBlock` function of the Allocator Contract according to the elapsed block) is recorded and used for the withdrawal reward calculation.

An amount of remuneration is determined by a staking ratio of a Property Contract. Therefore, the Lockup Contract also records a cumulative staking amount of a Property contract (cumulative staking amount according to elapsed block), and a total cumulative staking amount (all cumulative staking amount according to elapsed block).

A total reward allocation is determined from a ratio of a cumulative staking amount of a Property and a cumulative total staking amount.

The following variables are used to calculate a reward amount for a staking user.

- `r`: Cumulative total reward amount(accumulation of a return value of the `calculateMaxRewardsPerBlock` function of the Allocator Contract according to elapsed block)
- `p`: Cumulative staking amount(cumulative staking amount according to elapsed block)
- `t`: Total cumulative staking amount(all cumulative staking amount according to elapsed block)
- `l`: `r` at a time of staking
- `Policy.holdersShare`: Reward rate function receive by a Property Contract holder

The calculation formula is as follows.

```
total interest = (p / t * (r -l)) - Policy.holdersShare(p / t * (r -l))
```

That withdrawable interest amount is calculated by dividing its result by a staking amount for a Property Contract and multiplying by a staking amount by a staking person.

When a staking person gets a reward, a value of `l` overrides with the latest value. In this way, a withdrawable interest amount does not exceed the maximum amount that one person can withdraw. This is exemplified below. `p` and `t` are not considered for simplicity.

1. Alice is staking 500 DEV for the first time when the `r` is 100. When `r` reaches 500, the withdrawable interest amount is `(500-100) × 500 = 200000`.
2. `r` becomes 520, and Alice withdraws again. The withdrawable interest amount is `(520-500) × 500 = 10000`.

Alice withdraws it twice and earns `200000 + 10000 = 210000`. If Alice didn't make the first withdrawal, Alice's withdrawable interest amount is `(520-100) × 500 = 210000` now. From this, it is clear that the withdrawable interest amount does not change regardless of the timing of withdrawal.

This formula holds only when the staking amount of a staking person is constant. Therefore, it is necessary to update `l` when executing the `withdraw` function of the Lockup Contract.

### cancel

The DEV that the user has staked in the Property Contract is released. Staking continues for a certain amount of time after the release has been requested. This period is determined by the number of blocks defined in the Policy Contract.

### withdraw

The DEV that the user has staked in the Property Contract is withdrawn. Withdrawal is not possible unless a release has been requested through the `cancel` function. Additionally, withdrawal is not possible until the number of blocks that has been set by the release request is reached.

If the block count that has been set by the release request is reached, the full amount of DEV that the user staked in the Property Contract is transferred to the user.

## Allocator

The Allocator Contract plays several roles to determine market rewards.

### calculateMaxRewardsPerBlock

Calculate and return a value per block of a total reward given to all users.

Take a total staking amount of DEV at a time of a calculation and a total number of authenticated assets. This function acts as a proxy for the `rewards` function of Policy Contract. Correlation between arguments and return values is defined by [Policy](./POLICY.md#rewards).

## Withdraw

The Winthdraw Contract plays several roles for managing the amount of market rewards that can be withdrawn.

### withdraw

Withdraws the market rewards for the Property Contract. The executor withdraws the amount that can be withdrawn when it is called.

An amount of remuneration is determined by a staking ratio of a Property Contract. Therefore, the Withdraw Contract queries to the Lockup Contract a cumulative staking amount of property contract (cumulative staking amount according to elapsed block), and a total cumulative staking amount (all cumulative staking amount according to elapsed block), and calculate a withdrawable amount.

A total reward allocation is determined from a ratio of a cumulative staking amounts of a Property and a cumulative total staking amounts.

The following variables are used to calculate a reward amount for a Property holder.

- `r`: Cumulative total reward amount(accumulation of a return value of the `calculateMaxRewardsPerBlock` function of the Allocator Contract according to elapsed block)
- `p`: Cumulative staking amount(cumulative staking amount according to elapsed block)
- `t`: Total cumulative staking amount(all cumulative staking amount according to elapsed block)
- `l`: `r` at a time of last withdrawal
- `Policy.holdersShare`: Reward rate function receive by a Property Contract holder

The calculation formula is as follows.

```
total reward = Policy.holdersShare(p / t * (r -l)
```

That withdrawable amount is calculated by dividing its result by a `totalSupply` for a Property Contract and multiplying by a balance of a user.

When a Property holder gets a reward, a value of `l` overrides with the latest value. In this way, a withdrawable amount does not exceed the maximum amount that one person can withdraw. This is exemplified below. `p` and `t` are not considered for simplicity.

1. Alice has 500 tokens of a Property Contract. When `r` reaches 100, the withdrawal amount is `(100-0) × 500 = 50000`.
2. `r` becomes 120 and Alice withdraws again. The withdrawal amount is `(120-100) × 500 = 10000`.

Alice withdraws it twice and earns `50000 + 10000 = 60000`. If Alice didn't make the first withdrawal, Alice's withdrawable amount is `(120 - 0) × 500 = 60000` now. From this, it is clear that the withdrawable amount does not change regardless of the timing of withdrawal.

This formula holds only when the balance of a Property holder is constant. Therefore, it is necessary to update `l` when executing the `transfer` function of a Property Contract.

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
- Twitter: https://twitter.com/devprtcl
- Blog: https://medium.com/devtoken
- Web site: https://devprtcl.com
