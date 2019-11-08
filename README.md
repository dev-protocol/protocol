![Dev Protocol](https://raw.githubusercontent.com/dev-protocol/repository-token/master/public/asset/logo.png)

[![Build Status](https://travis-ci.org/dev-protocol/protocol.svg?branch=master)](https://travis-ci.org/dev-protocol/protocol)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# Dev Protocol

This repository is the place to develop smart contracts for Dev Protocol.

- Whitepaper: https://github.com/dev-protocol/protocol/blob/master/docs/WHITEPAPER.md
- ホワイトペーパー(日本語): https://github.com/dev-protocol/protocol/blob/master/docs/WHITEPAPER.JA.md

## Dev Challenge

The developer reward program for this project is taking place. [Check the details.](https://github.com/dev-protocol/protocol/blob/master/docs/DEV_CHALLENGE.md)

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

After compilation, run the following command to test each contract.

```
npm test
```

If you use Visual Studio Code, we recommend that you install the following plug-ins:

```
EditorConfig
vscode-eslint
solidity
```
