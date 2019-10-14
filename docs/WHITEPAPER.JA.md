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

Property Contractの集金機能のRelayerに公開することで、Relayerと呼ばれます。たとえば、送金と同時にメッセージを送信したり、Property Contract所有者から誓約を取得したりすることができます。

これらの理由から、 `pay（）`関数の実行はコントラクトアカウントに制限されるべきです。

## Allocator Contract

Allocator Contractの役割は、分布の計算とトークンの引き出しです。Allocator Contractは、インターネット資産のインデックス値を使用して、Property Contractに配布するDev Tokenの数を計算します。そして、各ユーザーからのリクエストによってトークンを引き出します。

### Allocator Contractの実行

Allocator Contractには、事前に設定されている変数 `mintPerBlock`が含まれており、この値は1日に発行される数を表します。そして、「totalAllocation」の値は、割り当ての総数を示します。前の実行日はコントラクト自身に記録され、前の実行から次の実行の前日までの期間がターゲット期間として定義されます。対象期間は1日より長くする必要があります。

配布のための資金は「mintPerBlock」に目標期間の長さを掛けて計算されます。

### 配布計算

配布数の計算は、Allocator Contractの `allocate（）`関数によって行われます。

Property Contractの分布計算では、次の変数を使用します。

- `p` = 指定された期間のターゲットメトリックのインデックス値
- `t` = 指定期間
- `l` = ターゲットメトリックの最後のインデックス値（ブロックごと）
- `d` = ブロックごとの合計インデックス値
- `m` = ブロックあたりのミント量
- `s` = ターゲット市場の発行済み指標シェア

基本的な考え方は、合計インデックス値（ブロックごと）と各インデックス値の比率（ブロックごと）によって決まります。計算が実行されるたびに、合計インデックス値が上書きされ、次の計算に使用されます。

方程式は次のとおりです。

```
配布数 = (p / t) / (d - l + (p / t)) * m * s * t
```

この計算の後、「d」は「（d-l +（p / t）」の値によって上書きされます。

Allocator Contractは、配布されるトークンの数に応じて、Property ContractのDev Tokenを作成します。このため、Allocator Contractには、Dev Tokenを増やす権限も必要です。


### 配布されたTokenの受け取り

Dev Tokenは、ユーザーアカウントがAllocator Contractの「withdraw（）」関数を呼び出したときに受け取ることができます。

Allocator Contractは、各プロパティの配布トークンの合計数を「合計」として、配布トークンの合計値を「価格」として記録します。

```sol
mapping(address => uint) totals;
mapping(address => uint) prices;
```

ユーザーアカウントが `withdraw()` 関数を呼び出すと、ユーザーは `price` にProperty Contractのユーザーの残高を乗じた数のDev Tokenを受け取ることができます。このときの `price` 変数は、Property Contractのユーザーアカウントにマッピングされ、同じアカウントが次回 `withdraw()` 関数を呼び出すときに値から差し引かれます。このようにして、引き出し金額は、一人が引き出すことができる最大金額を超えません。


#### 価格計算

Allocator Contractの `increment()` 関数は、Allocator Contracで指定された評価を `total` と `price` に追加します。


```sol
function increment(address _property, uint _value) internal {
    totals[_property] += _value;
    prices[_property] += total / ERC20(_property).totalSupply();
}
```


#### トークンの引き出し
Allocator Contractの `withdraw()` 関数は、ユーザーのアカウントに、受信できる限り多くのDev Tokenを預け入れます。このトランザクションの処理料金は、 `oraclize_getPrice（" URL "）`の値に相当するETHの量です。これは通常少量です。この処理料金はAllocator Contractに振り込まれ、次の配布の計算に使用されます。

`withdraw（）`を実行した後の `prices [_property]`の値は各ユーザーアカウントにマッピングされ、次に `withdraw（）`が呼び出されたときに引き出し額から差し引かれます。`prices [_property]`の値は常に追加されます。そのため、 `prices [_property]` の以前の値を減算することは、以前の実行から受け取った値を現在まで引き出すことと同じです。

```sol
struct WithdrawalLimit {
    uint total;
    uint balance;
}
mapping(address => mapping(address => uint)) internal lastWithdrawalPrices;
mapping(address => mapping(address => uint)) internal pendingWithdrawals;
mapping(address => mapping(address => WithdrawalLimit)) internal withdrawalLimits;

function withdraw(address _property) public payable {
    uint _value = calculateWithdrawableAmount(_property, msg.sender);
    uint value = _value + pendingWithdrawals[_property][msg.sender];
    ERC20(token).mint(msg.sender, value);
    lastWithdrawalPrices[_property][msg.sender] = price;
    pendingWithdrawals[_property][msg.sender] = 0;
}

function calculateWithdrawableAmount(address _property, address _user)
    private
    view
    returns (uint)
{
    uint _last = lastWithdrawalPrices[_property][_user];
    WithdrawalLimit memory _limit = withdrawalLimits[_property][_user];
    uint priceGap = price - _last;
    uint balance = ERC20(_property).balanceOf(_user);
    if (_limit.total == total) {
        balance = _limit.balance;
    }
    uint value = priceGap * balance;
    return value;
}
```

この計算は、ユーザーアカウントの残高が修正された場合にのみ完了します。したがって、残高を変更する前に、`lastWithdrawalPrices` と`pendingWithdrawals` を更新する必要があります。また、残高が変更されると、受取人に引き出し限度額が設定されます。この引き出し制限は、 `total [_property]`が同じ場合にのみ適用されます。 `price [_property]`のように、 `total [_property]`の値は常に追加されます。残高が変更されたときにその受取人の引き出し限度額を作成すると、引き出し可能な金額は最後の分配時の残高によって決定されます。

これは、Property Contractの `transfer（）`関数の実装がどのように見えるかです。

```sol
// Property Contract (ERC-20)
function transfer(address to, uint256 value) public returns (bool) {
    Allocator(allocatorAddress).beforeBalanceChange(
        address(this),
        msg.sender,
        to
    );
    _transfer(msg.sender, to, value);
    return true;
}
```

```sol
// Allocator Contract
function beforeBalanceChange(address _token, address _from, address _to) public {
    lastWithdrawalPrices[_token][_from] = prices[_token];
    lastWithdrawalPrices[_token][_to] = prices[_token];
    pendingWithdrawals[_token][_from] += calculateWithdrawableAmount(_token, _from);
    WithdrawalLimit memory _limit = withdrawalLimits[_token][_to];
    if (_limit.total != totals[_token]) {
        withdrawalLimits[_token][_to] = WithdrawalLimit(
            totals[_token],
            ERC20(_token).balanceOf(_to)
        );
    }
}
```

「beforeBalanceChange」関数はアカウントの引き出し可能な金額に影響するため、これは各Property Contractに制限されるべきです。

## Market Contract

Market Contractは、Market Factory Contractによって作成されます。Market Contractは、インターネット資産の指標を管理します。Market Contractは、財産の真正性とその評価を保証します。誰でも自由にMarket Contractを作成できますが、投票で承認されたもののみが有効になります。

### Marketの作成

Market Factory Contractの `createMarket（）`関数は新しいMarket Contractを作成します。

この関数は、Market Contractの動作を定義するコントラクトアドレスを受け取ります。

新しいMarket Contractは、Dev Token所有者の投票により有効になります。

投票者が送信したDev Tokenの数によって、1つの投票の重要性が決まります。投票は常に「はい」を意味し、投票しないことは「いいえ」を意味します。投票ごとに開発トークンはバーンされます。投票総数がDev Tokenの合計供給量の10％に達すると、Market Contractが有効になります。

### Contract の動作

コントラクトには、2つのパブリック関数、 `authenticate（）`と `calculate（）`が必要です。

Market Contractは、Property Contractの所有権を認証するために `authenticate（）`関数を呼び出します。それは、インターネット資産にマップされたProperty Contractの所有者を認証し、Market Contract.の `authenticatedCallback（）` を呼び出すことが期待されます。

Allocator Contractは `calculate（）`関数を呼び出して、Property Contractへの新しい配布数を計算します。それは、インターネットアセットにマップされたProperty Contractのメトリックを取得し、Allocator Contractの `calculatedCallback（）`を呼び出すことを期待しています。


このコントラクトのインターフェイスは次のようになります。

```sol
contract Behavior {
	string public schema;

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5
	) public returns (bool);

	function calculate(address _prop, uint256 _start, uint256 _end)
		public
		returns (bool);
}
```

`authenticate（）`関数は、ターゲットのProperty Contractアドレスに加えて、最大5つの引数を取ることができます。`schema`をJSON文字列として配列として定義して、各引数の意味を示す必要があります。

たとえば、次のようになります。

```sol
string public schema = "['Your asset identity', 'Read-only token' 'More something']";
```

Market Contract'の `authenticate（）`関数は、常に2番目の引数を一意のIDとして扱います。したがって、既存の値を入力することはできません。

次のスキーマは正しい例です。

```sol
string public schema = "['Your GitHub repository(e.g. your-name/repos)', 'Read-only token']";
```

そして、次のスキーマは間違った例です。

```sol
string public schema = "['Read-only token', 'Your GitHub repository(e.g. your-name/repos)']";
```

### 所有者の認証

Market Contractの「authenticate（）」関数は所有者を認証し、新しいMetrics Contractを作成します。

この機能は、Property Contractが接続するMarket Contractの管理に関与するため、Property Contractの所有者が実行する必要があります。

## Metrics Contract

Metrics Contractは、Property ContractをMarket Contractに関連付けるsmart contractです。

Market Contract には、1つのProperty Contractのアドレスと、認証のためにMarket Contractで使用される情報が含まれています。

インターネット資産の所有者は、Metrics ContractアドレスをAllocator Contractに渡す対応するインデックスの評価を取得できます。

Metrics Contractは、Market Contractによって認証された後に作成されます。

## State Contract

State Contractは、Dev Protocolの状態を永続的にすることを目的とするsmart contractです。

このcontractは、複数のcontractのクロスオーバー値を管理するために使用されます。また、この状態の更新を制御するいくつかのゲッター/セッター関数が含まれています。

## Develop Dev Protocol

Dev ProtocolはOSSです。誰でもその開発に参加できます。


- GitHub: https://github.com/dev-protocol/protocol
- Discord: https://discord.gg/VwJp4KM
- Spectrum: https://spectrum.chat/devtoken
- Twitter: https://twitter.com/devtoken_rocks
- Blog: https://medium.com/devtoken
- Web site: https://devtoken.rocks
