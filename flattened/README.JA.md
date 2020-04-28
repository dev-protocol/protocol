# 説明

このフォルダは Etherscan のコントラクト情報を登録するための Solidity 結合ファイル(以下結合ファイル)が配置されている。

# ツール

結合ファイルは[Solidity Flattener](https://github.com/bokkypoobah/SolidityFlattener)を使って作成する。

[truffle-flattener](https://www.npmjs.com/package/truffle-flattener)というツールも存在するが、このツールを使って結合ファイルを作成したところ、循環参照エラーが発生したので、Solidity Flattener を使っている

## 準備

[Solidity Flattener インストール手順](https://github.com/bokkypoobah/SolidityFlattener#installation)を参考にして pl ファイルを配置し、権限設定を行う

## 実行手順

```
cd ~/frame00/protpcol
solidityFlattener.pl --mainsol=src/metrics/MetricsGroup.sol --outputsol=flattened/metrics/MetricsGroup.flattened.sol --verbose
```

--verbose オプションをつけると詳細なログがでてくるので、おすすめ。
Solidity Flattener が Solidity 推奨の import 記述形式に対応していないため。エラーがでたところを順に修正していくこととなる。

```
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Killable} from "contracts/src/common/lifecycle/Killable.sol";
↓
import "../../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../common/lifecycle/Killable.sol";
```

下記のスクリプトを実行すれば、一気に修正可能。sol ファイルが修正されるので、コミットしてしまわないように注意

```
cd flattened
python flattener.py
```

# Etherscan 登録

(注：画面 UI、Version 番号、アドレス等は予告なく変更される場合があります)

コントラクトアドレスの設定画面で、

```
Compiler Type->Solidity(Single File)
Compiler Version->0.5.16
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
