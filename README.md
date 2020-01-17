![Dev Protocol](https://raw.githubusercontent.com/dev-protocol/repository-token/master/public/asset/logo.png)

[![CI Status](https://github.com/dev-protocol/protocol/workflows/Node/badge.svg)](https://github.com/dev-protocol/protocol/actions)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# Dev Protocol

This repository is the place to develop smart contracts for Dev Protocol.

- Whitepaper: https://github.com/dev-protocol/protocol/blob/master/docs/WHITEPAPER.md
- ホワイトペーパー(日本語): https://github.com/dev-protocol/protocol/blob/master/docs/WHITEPAPER.JA.md

## How to use

### Deploy a mock to your local network

First, install this repository as an npm package.

```bash
> npm i -D @dev-protocol/protocol
```

Prepare a local network using [Ganache](https://www.trufflesuite.com/ganache), etc.

Finally, run the following command to deploy a mock.

```bash
> dev-protocol mock --host 127.0.0.1 --port 7545
```

## How to contribute:

Read the [contributing guide](https://github.com/dev-protocol/protocol/blob/master/.github/CONTRIBUTING.md), and create PR when you have time. 🧚✨

## How to setup

Executing the following command will compile each contract.

```
git clone https://github.com/dev-protocol/protocol.git
cd protocol
npm i
npm run generate
```

run the following command to test each contract.

```
npm test
```

create a `.env` file like following, and run the command to deploy a mock. ( Beforehand, please prepare a local network using [Ganache](https://www.trufflesuite.com/ganache), etc. )

```
# .env
ETHEREUM_MOCK_HOST=127.0.0.1
ETHEREUM_MOCK_PORT=7545
```

```
npm run deploy mock
```

If you use Visual Studio Code, we recommend that you install the following plug-ins:

```
EditorConfig
vscode-eslint
solidity
```
