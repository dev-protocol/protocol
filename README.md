![Dev Protocol](https://raw.githubusercontent.com/dev-protocol/protocol/main/public/asset/logo.png)

[![CI Status](https://github.com/dev-protocol/protocol/workflows/Node/badge.svg)](https://github.com/dev-protocol/protocol/actions)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# Dev Protocol

This repository is the place to develop smart contracts for Dev Protocol.

- Whitepaper: https://github.com/dev-protocol/protocol/blob/main/docs/WHITEPAPER.md
- ホワイトペーパー(日本語): https://github.com/dev-protocol/protocol/blob/main/docs/WHITEPAPER.JA.md

## How to contribute:

Read the [contributing guide](https://github.com/dev-protocol/protocol/blob/main/.github/CONTRIBUTING.md), and create PR when you have time. 🧚✨

## How to setup

Executing the following command will compile each contract.

```
git clone https://github.com/dev-protocol/protocol.git
cd protocol
yarn
yarn generate
```

run the following command to test each contract.

```
yarn test
```

create a `.env` file like following, and run the command to deploy a mock. ( Beforehand, please prepare a local network using [Ganache](https://www.trufflesuite.com/ganache), etc. )

```
# .env
ETHEREUM_MOCK_HOST=127.0.0.1
ETHEREUM_MOCK_PORT=7545
```

```
yarn deploy mock
```

If you use Visual Studio Code, we recommend that you install the following plug-ins:

```
EditorConfig
vscode-eslint
solidity
```

## How to publish the first policy

First, deploy this protocol:

```bash
yarn deploy <network>
```

Then, calling `PolicyFactory.create` using Truffle console:

```bash
npx truffle console --network <network>
# Truffle console is launched
> Promise.all([PolicyFactory.deployed(), TheFirstPolicy.deployed()]).then(([factory, policy]) => factory.create(policy.address))
```
