# Dev Protocol Whitepaper

Version: **`3.4.0`**

_There is a possibility that this white paper will be updated. When there is an update, the version number will increase according to [Semantic Versioning](https://semver.org/)._

Dev Protocol is a middleware protocol that optimizes various properties for autonomous distribution and enables trading through on-chain governance.

# The World that Dev Protocol Aims for

Economic activities are built on top of many real world activities. These activities need investments to realize future growth and profit. Dev Protocol is a decentralized technology that fairly evaluates various activities that have not received an economic evaluation and realizes their autonomous distribution and sustainability through P2P trading and reward distribution.

## Overview

Individuals produce value through activities. Dev Protocol offers market, staking, and reward distribution features for tokenizing these activities and trading them through P2P. When activities are tokenized, the following is achieved.

- Market rewards are obtained based on the staked
- A tokenized activity undergoes Staking (financial support) by third parties
- Providing value as an incentive for Staking
- Sharing properties with joint activity participants and distributing market rewards

Staking is a new form of trading money that uses the inflation mechanism. Through staking, the sustainability of users’ activities is secured, and users receive value at zero financial cost. This is a mechanism that provides profit for all properties that had previously been released for free or through other indirect monetization mechanisms. Dev Protocol aims for a total value staked that surpasses donation activities that have been taking place through legal tender.

Dev Protocol transfers the formulation of its policy, which serves as the guiding principle for its governance, to the community so that it can be updated depending on the circumstances. Users can freely propose a new policy through the protocol. In order for a policy to take effect, approval must be granted through a vote of staking users(a.k.a. stakers). A policy can be related to a decision on the inflation rate and other aspects of the ecosystem. The current policy is [here](./POLICY.md).

## Market

The market serves to provide assuring identity by certifying an individual’s activity on the blockchain. A market is created for each authentication target, and the community can propose the opening of new markets.

## Tokenization

As a premise, ownership of a user’s activities is certified to belong to the user in Dev Protocol. This differs from the model employed in existing web platforms, in which the platform owns the user data, and separates the ownership and utilization of properties. A property can be used infinitely through the application layer built on top of Dev protocol.

## Tokenization Method

By authenticating an external account that expresses ownership of the activity on Dev Protocol, users can define their activity as a “property” on the market and certify that they are the owner of the property. When authenticating a property, the user pays a commission in DEV that has been defined by the policy, and the commission that has been paid is instantly burned. Users can authenticate multiple properties and connect them to multiple markets.

## Profit, Market Reward, Inflation, Deflation

An owner of a Property receives a market reward based on the total staked of the property.

The flow of DEV in the protocol can be summarized through the following lifecycle. For simplicity, the owner of a Property is listed as an “activity participant,” and a third party who receives some form of utility is listed as a “user,” although a user can be classified as both.

1. DEV is newly minted by an activity participant and undergoes inflation.
2. A user stakes the DEV for the activity participant.
3. The more staking that a Property collectes, the more DEV this activity participant can newly mint.
4. As a perk for staking, the activity participant can provide the user with utility optionally.
5. When the user cancels staking, the user is able to withdraw the staking amount, as well as a portion of the DEV that the activity participant obtained through the offering.

The total amount of rewards is determined (dynamically or statically) based on the policy regarding the inflation rate for DEV. The current policy is [here](./POLICY.md). Through the protocol, DEV is newly issued, burned, staked, and fluctuates based on demand.

## Shared Rights with Joint Activity Participants

The owner of a Property initially owns 100% of the ownership rights. Owning 100% of the ownership rights is equivalent to the right to receive all of the market rewards. It is possible for multiple people, such as joint activity participants, to own the ownership rights by transferring a portion of the ownership rights. Ownership rights holders can receive a portion of market rewards based on the ownership ratio. This is realized by the fact that the Property Contract that represents ownership rights conforms to ERC20 standard.

## Treasury

Property ownership is by default 100% owned by the Property owner. However, the percentage specified by Policy will be sent to Treasury Contract. The current policy is [here](./POLICY.md). Treasury Contract earns/accumulates a portion of the market rewards earned from a Property by holding a portion of the Property tokenized over the protocol. Treasury Contract accumulates Properties and DEV, which are used as financial resources for the community.

## Staking

Staking is used in Dev Protocol as a new supporting system that enables trading of various Properties. Staking is a mechanism that increases market rewards through the temporary deposit of DEV toward a property. As consideration for staking, the payer receives utility from the activity participant, and the activity participant receives the market rewards that have increased during the staking period. Staking continues while the payer needs this utility, increasing the scarcity value of DEV. By receiving staking, activity participant secure the sustainability of their activity.

### Supporting Flow

1. By staking DEV in a Property over a specific period of time, the supporter receives some sort of perk optionally.
2. Based on the amount of DEV staked, a market reward (inflation) amount is added for the property. The longer the staking period by the payer, the more market rewards are promised to the activity participant.
3. As interest, the supporter receives a portion of the DEV that is newly acquired by the activity participant. The amount that can be received at this time is determined by the amount that the user has staked in comparison with the total amount staked.
4. When the staking period ends, the DEV staked in the property is released, and the user can withdraw it.

## Governance

Many incentives are built into Dev Protocol so that all users can receive profit without encroaching on each other’s interests. There is no decisive theory on the interaction of these incentives, and our hope is for the community, including stakeholders, to constantly propose improvements. In Dev Protocol, indices with uncertainty are accepted from external sources as part of the policy. And, the current policy is [here](./POLICY.md).

## Application Layer

By staking their DEV toward an activity participant, users receive some sort of perk from this activity participant. (Although it is possible for the staking user to contact the activity participant and request perk in a direct manner) The application layer automatically executes a series of trades. The application layer relays the user’s staking to the activity participant and relays the activity participant’s perk to the user. The motivation to build out an application layer depends on each individual’s intentions, but below are possible motivations.

- Increase the value of DEV owned
- Receive a portion of the rewards by inheriting a portion of the activity participant’s Property
- Collect commission from the user

If a staking user gets some staking perk, those perks will be provided via the application layers.

# Mechanism

Dev Protocol is comprised of the following 14 main contracts.

- Market Contract
- Market Factory Contract
- Property Contract
- Property Factory Contract
- Metrics Contract
- Policy Contract
- Policy Factory Contract
- Lockup Contract
- Allocator Contract
- Policy Contract
- Policy Factory Contract
- Address Config Contract
- Treasury Contract
- Dev Contract

Synoptic Chart of Contracts:
![Overview](https://i.imgur.com/5JwNQ3o.png)

## Market Contract

The Market Contract represents a specific group of properties. The properties handled by Dev Protocol can be defined through the `authenticate` function.

Anybody can freely propose a Market Contract. However, in order for it to take effect, it must be approved through a vote of existing Property Contract owners. The number of votes will be the sum of the count staked in the Property Contract and the `totals`. Generally, votes are expected to be carried out by property owners, but stake executors can use their own count of stakes as the number of votes in order to vote. In this case, the address of the Property Contract subject to staking will be assigned.

The `authenticate` function authenticates the executor of the function as the owner of the property. For example, a GitHub repository is assigned, and the fact that the executor is the owner of this GitHub repository is authenticated. Therefore, it should not be possible for anybody other than the owner of the Property Contract to execute the `authenticate` function. This function is called directly by a user, and it is expected for `authenticatedCallback` to be called for a successful authentication. When executing the `authenticate` function, a commission defined by the Policy Contract is paid in DEV, and the commission paid is automatically burned.

## Market Factory Contract

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

When you implement the `authenticate` function, strongly recommended to verify the sender is associated with the Market Contract. To verify, please create a function to set the associated Market Contract address.

```solidity
function authenticate(
	address _prop,
	string memory _args1,
	string memory,
	string memory,
	string memory,
	string memory,
	address market,
	address
) public returns (bool) {
	require(msg.sender == associatedMarket, 'Invalid sender');
	// Unique authentication method
}

```

The `schema` is an array-type JSON character string that explains the significance of the arguments that the `authenticate` function receives for authentication. The maximum for these arguments is 5, in addition to the address of the Property Contract. An example is presented below.

```solidity
string public schema = '["Your asset identity", "Read-only token", "More something"]';
```

The `authenticate` function always handles the 2nd argument as the unique ID. Accordingly, values that cannot secure uniqueness should not be assigned. The following schema is an incorrect example.

```solidity
string public schema = '["Read-only token", "Your GitHub repository(e.g. your-name/repos)"]';
```

And the following schema is a correct example.

```solidity
string public schema = '["Your GitHub repository(e.g. your-name/repos)", "Read-only token"]';
```

The `getId` function receives an argument as a Metrics contract address and returns the authenticated asset name. For example, that return value is like `dev-protocol/dev-kit-js`.

The Market Factory Contract creates a new Market Contract that has the proxy method and other elements for the contract. There are 3 proxy methods, which are `authenticate`, `schema`, and `getId`. The `authenticatedCallback` function, which receives the successful authentication, and the vote function, which accepts votes, are also added.

## Property Contract

The Property Contract represents the user’s property group. This is a token that conforms to ERC20 and can be transferred to any email address.

Each Property Contract(Token) holder will receive market rewards based on the balance of the Property Contract(Token) that they own. Calculating the market rewards is the responsibility of the Allocator Contract, whereas receiving the market rewards is the responsibility of the Withdraw Contract. The Property Contract is a pure ERC20.

The `transfer` function for the Property Contract requests the Allocator Contract to adjust the amount that can be withdrawn, since the amount of market rewards that can be withdrawn varies based on changes to the balance.

A Property Contract in its initial state is not assuring assets (e.g., GitHub repositories).

In order for a Property to be associated with an asset, a Market Contract must be associated with the Property Contract. The association is established by the `authenticatedCallback` function for the Market Contract. Multiple Market Contracts can be associated with a Property Contract. 1 Property Contract can represent a specific assets group or a Property Contract can be created for each asset.

## Property Factory Contract

The Property Factory Contract generates a new Property Contract.

The generation of a Property Contract is carried out by executing the `create` function. The `name` and `symbol` are specified as an argument. For ease of comparison of Property Contracts, `totalSupply` is fixed as `10000000`(in Solidity, it's `10000000000000000000000000`), and `decimals` is fixed as `18`.

When the Property Factory Contract generates a new Property Contract, a portion of the total supply will be allocated to the Treasury Contract.

Tokens assigned to the Treasury Contract will be used by the Dev Protocol developers team for more flexible use case development or returned to the Property Contract creator.

The allocation share to the Treasury Contract is determined by the Policy Contract's `shareOfTreasury` function. Besides, the Treasury Contract's address is determined by the `treasury` function of the Policy Contract.

Users who do not yet have a Property Contract will want to create a Property Contract and authenticate with a Market Contract at the same time. To do this, the Property Factory Contract exposes the `createAndAuthenticate` method. The `createAndAuthenticate` method creates a Property Contract and consistently uses that Property Contract to authenticate with a Market Contract.

## Metrics Contract

The Metrics Contract represents the association between Property Contracts and Market Contracts.

When `authenticatedCallback` of the Market Contract is called, a Metrics Contract that retains the addresses of the Property Contract and Market Contract is generated.

`authenticatedCallback` for the Market Contract returns the address for the Metrics Contract. By creating a map that brings the addresses for the Market Contract and Metrics Contract together, it is possible to retain the authentication context.

## Lockup Contract

The Lockup Contract manages staking in Property Contracts.

### lockup

When a user stakes their own DEV in a Property Contract. This function can only be executed from the `deposit` function for DEV.

Bypassing the Property Contract address to stake in and the amount of DEV, the Lockup Contract stakes the DEV. Stakes can be added as many times as desired.

By staking DEV, users can receive some utility from the corresponding Property Contract owner. Staking continues until the utility is needed, increasing the scarcity value of DEV.

A cumulative total reward amount at a time of staking (accumulation of the return value of the `calculateMaxRewardsPerBlock` function of the Allocator Contract according to the elapsed block) is recorded and used for the withdrawal reward calculation.

An amount of reward is the same regardless of the Property Contract of the staking destination, but it changes all as the staking ratio changes. Therefore, the Lockup Contract keeps track of the "cumulative sum of the per-staking remuneration" and updates the value every time staking is added or removed.

The following variables are used to calculate a reward amount for a staking user.

- `r`: Cumulative total reward amount(accumulation of a return value of the `calculateMaxRewardsPerBlock` function of the Allocator Contract according to elapsed block)
- `t`: Total staked amount
- `s`: User's staked amount
- `Policy.holdersShare`: Reward rate function receive by a Property Contract holder

The calculation formula is as follows.

```
total_interest = s(r / t - Policy.holdersShare(r / t, t))
```

The `r / t` in the above formula shows the "cumulative sum of the per-staking remuneration."

The amount of interest that can be withdrawn per user can be calculated by subtracting the value of `total_interest` when the user's last staking or withdrawal from the latest `total_interest`.

When a staking person gets a reward, a value of `total_interest` per user overrides with the latest value. In this way, a withdrawable interest amount does not exceed the maximum amount that one person can withdraw. This is exemplified below. `r`, `t` and `s` are not considered for simplicity.

1. Alice is staking 500 DEV for the first time when the `total_interest` is 100. When `total_interest` reaches 500, the withdrawable interest amount is `(500-100) × 500 = 200000`.
2. `total_interest` becomes 520, and Alice withdraws again. The withdrawable interest amount is `(520-500) × 500 = 10000`.

Alice withdraws it twice and earns `200000 + 10000 = 210000`. If Alice did not make the first withdrawal, Alice's withdrawable interest amount is `(520-100) × 500 = 210000` now. From this, it is clear that the withdrawable interest amount does not change regardless of withdrawal timing.

This formula holds only when the staking amount of a staking person is constant. Therefore, it is necessary to update `total_interest` and snapshots the withdrawable interest amount when executing the `withdraw` function of the Lockup Contract.

### withdraw

All or part of the DEV that the user has staked in the Property Contract and the full amount of interest that can be withdrawn will be withdrawn.

## Allocator Contract

The Allocator Contract plays several roles in determining market rewards.

### calculateMaxRewardsPerBlock

Calculate and return a value per block of a total reward given to all users.

Take a total staking amount of DEV at a time of a calculation and a total number of authenticated assets. This function acts as a proxy for the `rewards` function of Policy Contract. Correlation between arguments and return values is defined by [Policy](./POLICY.md#rewards).

## Withdraw Contract

The Winthdraw Contract plays several roles for managing the amount of market rewards that can be withdrawn.

### withdraw

Withdraws the market rewards for the Property Contract. The executor withdraws the amount that can be withdrawn when it is called.

An amount of remuneration is determined by a staking ratio of a Property Contract. Therefore, the Withdraw Contract queries to the Lockup Contract a cumulative holder's reward amount for Property Contract (cumulative holder's reward amount according to elapsed block) and calculate a withdrawable amount.

The following variables are used to calculate a reward amount for a Property holder.

- `r`: Cumulative total reward amount(accumulation of a return value of the `calculateMaxRewardsPerBlock` function of the Allocator Contract according to elapsed block)
- `t`: Total staked amount
- `s`: Property Contract's staked amount
- `ts`: Total supply of the Property Contract
- `b`: Balance of the Property Contract for the user
- `Policy.holdersShare`: Reward rate function receive by a Property Contract holder

The calculation formula is as follows.

```
total_reward = b(s(Policy.holdersShare(r / t, t)) / ts)
```

The amount of reward that can be withdrawn per Property Contract holder can be calculated by subtracting the value of `Policy.holdersShare(r / t, t)` when the user's last withdrawal from the latest `Policy.holdersShare(r / t, t)` and multiply the `b`.

In this way, a withdrawable reward amount does not exceed the maximum amount that one person can withdraw. This is exemplified below. `Policy.holdersShare(r / t, t)` are assigned as `i` for simplicity.

1. Alice has 500 tokens of a Property Contract. When `i` reaches 100, the withdrawal amount is `(100-0) × 500 = 50000`.
2. `i` becomes 120 and Alice withdraws again. The withdrawal amount is `(120-100) × 500 = 10000`.

Alice withdraws it twice and earns `50000 + 10000 = 60000`. If Alice didn't make the first withdrawal, Alice's withdrawable amount is `(120 - 0) × 500 = 60000` now. From this, it is clear that the withdrawable amount does not change regardless of the timing of withdrawal.

This formula holds only when the balance of a Property holder is constant. Therefore, it is necessary to update `i` when executing the `transfer` function of a Property Contract.

## Policy Contract

The Policy Contract represents the policy of Dev Protocol. Dev Protocol assigns the formulation of uncertain indices to the community and updates the indices based on the circumstances.

Anybody can freely propose a Policy Contract. However, for it to take effect, it must be approved through a vote of staking users. The number of votes will be the staking amount for each Property Contract per user. The vote is completed by executing `vote` for the Policy Contract.

As soon as the new Policy Contract receives enough affirmative votes to meet the conditions, it will take effect, and the old Policy Contract will cease to exist.

The Policy Contract decides the following indices.

### rewards

The total value of market rewards for the block. It is called when calculating market rewards in the Allocator Contract, and the total value of market rewards is calculated using the following variables.

- Total Stakes in the Property
- Total Count of Properties (Total Metrics Contracts)

### holdersShare

The share of market rewards received by the Property Contract(Token) holder. It is called when calculating market rewards in the Allocator Contract, and the share of market rewards received by the Property Contract(Token) holder is calculated using the following variables.

- Value of Market Rewards
- Count of Stakes

The share received by the stake executor is the excess portion of the Holders Share.

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

### shareOfTreasury

The share of total supply of newly issued Property Contracts received by the Treasury Contract. Within `constructor` for the Property Contract, `shareOfTreasury` for the current Policy Contract is called, and the share sent to the Treasury Contract takes effect is decided based on the following variables.

- Total supply of the Property Contract

### treasury

The contract address of the current Treasury Contract.

## Policy Factory Contract

The Policy Factory Contract generates a new Policy Contract.

The generation of a Policy Contract is carried out by executing a `create` function. The `create` function gets the address of the Policy Contract created by a user and allows the `vote` function to accept votes.

## Lockup Storage Contract, Market Group Contract, Policy Group Contract, Property Group Contract, Vote Counter Storage Contract, Withdraw Storage Contract

Those Contracts are a contract that makes the state of the other contracts persistent. Its responsibility is to exclusively maintain the state and getter method without waiting for implementation.

## DEV

DEV is the ERC20 token that serves as the key currency for Dev Protocol.

https://etherscan.io/token/0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26

## Develop Dev Protocol

Dev Protocol is OSS, and anybody can participate in its development.

- GitHub: https://github.com/dev-protocol/protocol
- Discord: https://discord.gg/VwJp4KM
- Twitter: https://twitter.com/devprtcl
- Blog: https://medium.com/devprtcl
- Web site: https://devprotocol.xyz
