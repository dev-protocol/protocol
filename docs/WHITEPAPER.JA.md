# Dev Protocol ホワイトペーパー

Version: **`1.2.1`**

_このホワイトペーパーは更新される可能性があります。更新時、バージョン番号は[セマンティックバージョニング](https://semver.org/)にしたがって増加します。_


## はじめに

Dev Protocol は様々なインターネット資産を証券のように扱うためのプロトコルです。例えばライセンスやコードを変更せずにOSSを収益化し、OSSの持続可能性の問題を解決できます。

Dev Protocol は Property Contracts、Allocator Contracts、State Contract、Market Contractで構成されています。
Property ContractはERC-20トークンであり、インターネット上での資産となっています。
Allocator Contractによって指標が比較、評価された後、Property Contractがその評価を使用して、Dev Tokenを所有者に配布します。
State Contractはそれぞれのステータスのメンテナンスします。

このドキュメントは概念を説明するために単純化された擬似コードを使用しています。


## 概要

Dev Protocolのコアは、特定のインターネット資産に接続されたProperty Contract (Property Token)と、そのコントラクトの所有者に配布されるDev Tokenによって構成されます。

Dev ProtocolはERC-20に準拠しており、自由に売買できます。Dev Protocolの所有者はトランザクション手数料を請求しません。

Dev Protocolの所有者はDev tokenを受け取る権利があります。個人に配布されるDev tokenの数は所有するProperty Tokenの数によってきまります。受け取る合計数はDev Protocolにマッピングされたインターネット資産の評価によって決まります。

Dev Protocolにより、誰でもインターネット資産の市場を追加できます。

Market Contractによって作成された市場は、Dev Token保有者の投票によって認証されると利用可能になります、

![Overview](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/Overview.png)


### ライフサイクル

Dev ProtocolのライフサイクルはMarket Contractを作成するときに始まります。

Market Contractは インターネット資産の所有者が彼らの中身を評価することを許可します。

ユーザはMarket Contractに関連していないProperty Contractを作成することができます。Property Contractは全てのMarket Contractに接続できます。接続には本人確認が必要です。Property ContractはそのためのTokenを100%所有しています。Tokenを転送すると残高が変更されます。、

Property ContractはERC-20に準拠しているため、自由に譲渡できます。将来的にはProperty contractを発行するときに一覧表示できる分散型の取引所を作成したいと考慮しています。

様々なMarket ContractをProperty Contractに接続することにより、所有者自体を表す資産だったり、プロジェクトを表す資産だったり、資産を自由に構築できます。

![Create Market](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/CreateMarket.png)

![Create Property](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/CreateProperty.png)

![Authenticate](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/Authenticate.png)

Allocator Contractの「allocate」関数が呼び出されると、Property ContractはDev tokenを受信できるようになります。そのAllocator Contractは指定されたMetrics Contractを参照して資産を評価します。Property Contract所有者は現在の残高に応じてDev Tokenを引き出すことができます。

受信したDev Tokenの数はインターネット資産のインデックス値によって異なります。Property Contract保持者は取引所でDev Tokenを交換できます。

![Allocate](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/Allocate.png)

Property Contractはサードパーティの支払いも受け取ることができます。

支払いは、Relayerと呼ばれる外部契約から支払いを自由に受け取ることができます。

![Payment](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/Payment.png)

## Property Contract

Property Contractは、Property Factory Contractの `createProperty（）`関数によって作成されたスマートコントラクトです。Property Contract TokenはERC-20に準拠しており、任意のアドレスに転送できます。

全てのProperty ContractホルダーはDev Tokenを受け取ります。それぞれのProperty Contractから受け取るDev Tokenの数はAllocator Contractによって評価/決定されます。

### Property Contractの作成

Property Factory Contractの `createProperty（）`関数は新しいProperty Contractを作成します。

開発者が登録しやすくし、計算しやすくするには`totalSupply` と `decimals` を修正する必要があります。

### Propertyのサポート

Property Contract は支援者をサポートします。

Property Contactの `pay（）`関数を呼び出し、Property ContactにDev Tokenを送信します。送信されたDev Tokenはバーンされ、Property Contractホルダーの引き出し可能な額が増加します。


### 合計支払額 ≒ 次回合計割り当て値

支払いされるたびに、全てのProperty Contractの合計割り当て値が更新されます。

支払い加速度が要員として考慮されるため、合計支払いと合計分配は等しくありません、

次の擬似コードは、次の合計割り当て値に使用される変数 `mintPerBlock`を更新するロジックを示しています。

```sol
uint initialPaymentBlock;
uint lastPaymentBlock;
uint totalPaymentValue;
uint mintPerBlock;

function updateAllocateValue(uint _value) internal {
	totalPaymentValue += _value;
	uint totalPaymentValuePerBlock = totalPaymentValue / (block.number - initialPaymentBlock);
	uint lastPaymentPerBlock = _value / (block.number - lastPaymentBlock);
	uint acceleration = lastPaymentPerBlock / totalPaymentValuePerBlock;
	lastPaymentBlock = block.number;
	mintPerBlock = totalPaymentValuePerBlock * acceleration;
}
```

### Payment Relayer

Property Contractの `pay（）`関数の呼び出しは、サードパーティのコントラクトに制限されています。

そのサードパーティのコントラクトをPayment Relayerと呼ばれます。

By opening the Property Contract's money collection function to Relayer, users can enjoy the benefits provided by Relayer. It could, for example, be the ability to send a message at the same time as a money transfer, get a pledge from the Property Contract owner, etc.

For these reasons, the execution of the `pay()` functions should be limited to the contract account on Ethreum.
