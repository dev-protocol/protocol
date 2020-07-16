# 説明

このフォルダは Etherscan のコントラクト情報を登録するための Solidity 結合ファイル(以下結合ファイル)が配置されている。

# ツール

結合ファイルは[truffle-flattener](https://www.npmjs.com/package/truffle-flattener)を使って作成する。

## 準備

```
npm install truffle-flattener -g
```


## 実行手順

必要に応じて下記コマンドを実行してください。

```
cd protocol
truffle-flattener contracts/src/allocator/Allocator.sol > flattened/allocator/Allocator.flattened.sol
truffle-flattener contracts/src/common/config/AddressConfig.sol > flattened/common/config/AddressConfig.flattened.sol
truffle-flattener contracts/src/dev/Dev.sol > flattened/dev/Dev.flattened.sol
truffle-flattener contracts/src/dev/DevMigration.sol > flattened/dev/DevMigration.flattened.sol
truffle-flattener contracts/src/lockup/Lockup.sol > flattened/lockup/Lockup.flattened.sol
truffle-flattener contracts/src/market/MarketFactory.sol > flattened/market/MarketFactory.flattened.sol
truffle-flattener contracts/src/market/MarketGroup.sol > flattened/market/MarketGroup.flattened.sol
truffle-flattener contracts/src/metrics/MetricsFactory.sol > flattened/metrics/MetricsFactory.flattened.sol
truffle-flattener contracts/src/metrics/MetricsGroup.sol > flattened/metrics/MetricsGroup.flattened.sol
truffle-flattener contracts/src/policy/PolicyFactory.sol > flattened/policy/PolicyFactory.flattened.sol
truffle-flattener contracts/src/policy/PolicyGroup.sol > flattened/policy/PolicyGroup.flattened.sol
truffle-flattener contracts/src/policy/PolicySet.sol > flattened/policy/PolicySet.flattened.sol
truffle-flattener contracts/src/property/PropertyFactory.sol > flattened/property/PropertyFactory.flattened.sol
truffle-flattener contracts/src/property/PropertyGroup.sol > flattened/property/PropertyGroup.flattened.sol
truffle-flattener contracts/src/vote/VoteCounter.sol > flattened/vote/VoteCounter.flattened.sol
truffle-flattener contracts/src/withdraw/Withdraw.sol > flattened/withdraw/Withdraw.flattened.sol
```

# Etherscan 登録

(注：画面 UI、Version 番号、アドレス等は予告なく変更される場合があります)

コントラクトアドレスの設定画面で、

```
Compiler Type->Solidity(Single File)
Compiler Version->0.5.17
License Type->MPL-2.0
```

を選択する。

登録画面で、

```
Optimization->yes
Enter the Solidity Contract Code below->作成した結合ファイルの中身を貼り付け
Constructor Arguments-> コンストラクタ引数作成サイト(https://abi.hashex.org/#)等を利用して作成、貼り付け
Contract Library Address->Allocator、Lockup、WithdrawなどDecimalsを利用している場合、名前に「Decimals」、アドレスに「0xeB2fEE1cFB535Da04054bcEa7a1a4Bcb52265925」を設定する
```
