![Dev Protocol](https://raw.githubusercontent.com/dev-protocol/protocol/main/public/asset/logo.png)

[![CI Status](https://github.com/dev-protocol/protocol/workflows/Node/badge.svg)](https://github.com/dev-protocol/protocol/actions)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# Dev Protocol

This repository is the place to develop smart contracts for Dev Protocol.

- Whitepaper: https://github.com/dev-protocol/protocol/blob/main/docs/WHITEPAPER.md
- ホワイトペーパー(日本語): https://github.com/dev-protocol/protocol/blob/main/docs/WHITEPAPER.JA.md

## How to use

### install

First, install this repository as an npm package.

```bash
> npm i -D @devprotocol/protocol
```

### import

You can use the Dev Protocol interface by importing it from a Solidity file.

```
import {IAddressConfig} from "@devprotocol/protocol/contracts/interface/IAddressConfig.sol";
import {IPropertyGroup} from "@devprotocol/protocol/contracts/interface/IPropertyGroup.sol";

contract TestContract {
	function validatePropertyAddress(address _property) external view {
		IAddressConfig addressConfig = IAddressConfig(0x1D415aa39D647834786EB9B5a333A50e9935b796);
		IPropertyGroup propertyGroup = IPropertyGroup(addressConfig.propertyGroup());
		require(propertyGroup.isGroup(_property), "not property address");
	}
}
```

This is an example of logic that uses the PropertyGroup contract feature of the Dev Protocol to validate if it is a Property address.

The available interfaces can be found in "node_modules/@devprotocol/protocol/contracts/interface/".

AddressConfig holds the addresses of the contracts used in the Dev Protocol.

```
AddressConfig address
mainnet：0x1D415aa39D647834786EB9B5a333A50e9935b796
Ropsten：0xD6D07f1c048bDF2B3d5d9B6c25eD1FC5348D0A70
```

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

If you use Visual Studio Code, we recommend that you install the following plug-ins:

```
EditorConfig
vscode-eslint
solidity
```
