# Dev Protocol ホワイトペーパー

Version: **`1.2.1`**

_このホワイトペーパーは更新される可能性があります。更新時、バージョン番号は[セマンティックバージョニング](https://semver.org/)にしたがって増加します。_

## はじめに

Dev Protocol は様々なインターネット資産を証券のように扱うためのプロトコルです。例えばライセンスやコードを変更せずに OSS を収益化し、OSS の持続可能性の問題を解決できます。

Dev Protocol は Property Contracts、Allocator Contracts、State Contract、Market Contract で構成されています。
Property Contract は ERC-20 トークンであり、インターネット上での資産となっています。
Allocator Contract によって指標が比較、評価された後、Property Contract がその評価を使用して、Dev Token を所有者に配布します。
State Contract はそれぞれのステータスのメンテナンスします。

このドキュメントは概念を説明するために単純化された擬似コードを使用しています。

## 概要

Dev Protocol のコアは、特定のインターネット資産に接続された Property Contract (Property Token)と、そのコントラクトの所有者に配布される Dev Token によって構成されます。

Dev Protocol は ERC-20 に準拠しており、自由に売買できます。Dev Protocol の所有者はトランザクション手数料を請求しません。

Dev Property Token の所有者は Dev Token を受け取る権利があります。個人に配布される Dev Token の数は所有する Property Token の数によってきまります。受け取る合計数は Dev Protocol にマッピングされたインターネット資産の評価によって決まります。

Dev Protocol により、誰でもインターネット資産の市場を追加できます。

Market Contract によって作成された市場は、Dev Token 保有者の投票によって認証されると利用可能になります、

![Overview](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/Overview.png)

### ライフサイクル

Dev Protocol のライフサイクルは Market Contract を作成するときに始まります。

Market Contract は インターネット資産の所有者が彼らの中身を評価することを許可します。

ユーザは Market Contract に関連していない Property Contract を作成することができます。Property Contract は全ての Market Contract に接続できます。接続には本人確認が必要です。Property Contract はそのための Token を 100%所有しています。Token を転送すると残高が変更されます。

Property Contract は ERC-20 に準拠しているため、自由に譲渡できます。将来的には Property Contract を発行するときに一覧表示できる分散型の取引所を作成したいと考慮しています。

様々な Market Contract を Property Contract に接続することにより、所有者自体を表す資産だったり、プロジェクトを表す資産だったり、資産を自由に構築できます。

![Create Market](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/CreateMarket.png)

![Create Property](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/CreateProperty.png)

![Authenticate](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/Authenticate.png)

Allocator Contract の `allocate` 関数が呼び出されると、Property Contract は Dev Token を受信できるようになります。その Allocator Contract は指定された Metrics Contract を参照して資産を評価します。Property Contract 所有者は現在の残高に応じて Dev Token を引き出すことができます。

受信した Dev Token の数はインターネット資産のインデックス値によって異なります。Property Contract 保持者は取引所で Dev Token を交換できます。

![Allocate](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/Allocate.png)

Property Contract はサードパーティの支払いも受け取ることができます。

支払いは、Relayer と呼ばれる外部契約から支払いを自由に受け取ることができます。

![Payment](https://raw.githubusercontent.com/dev-protocol/protocol/master/public/asset/whitepaper/Payment.png)

## Property Contract

Property Contract は、Property Factory Contract の `createProperty（）`関数によって作成されたスマートコントラクトです。Property Contract Token は ERC-20 に準拠しており、任意のアドレスに転送できます。

全ての Property Contract ホルダーは Dev Token を受け取ります。それぞれの Property Contract から受け取る Dev Token の数は Allocator Contract によって評価/決定されます。

### Property Contract の作成

Property Factory Contract の `createProperty（）`関数は新しい Property Contract を作成します。

開発者が登録しやすくし、計算しやすくするには`totalSupply` と `decimals` を修正する必要があります。

### Property のサポート

Property Contract は支援者をサポートします。

Property Contact の `pay（）`関数を呼び出し、Property Contact に Dev Token を送信します。送信された Dev Token はバーンされ、Property Contract ホルダーの引き出し可能な額が増加します。

### 合計支払額 ≒ 次回合計割り当て値

支払いされるたびに、全ての Property Contract の合計割り当て値が更新されます。

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

Property Contract の `pay（）`関数の呼び出しは、サードパーティのコントラクトに制限されています。

そのサードパーティのコントラクトを Payment Relayer と呼ばれます。

Property Contract の集金機能の Relayer に公開することで、Relayer と呼ばれます。たとえば、送金と同時にメッセージを送信したり、Property Contract 所有者から誓約を取得したりすることができます。

これらの理由から、 `pay（）`関数の実行はコントラクトアカウントに制限されるべきです。

## Allocator Contract

Allocator Contract の役割は、分布の計算とトークンの引き出しです。Allocator Contract は、インターネット資産のインデックス値を使用して、Property Contract に配布する Dev Token の数を計算します。そして、各ユーザーからのリクエストによってトークンを引き出します。

### Allocator Contract の実行

Allocator Contract には、事前に設定されている変数 `mintPerBlock`が含まれており、この値は 1 日に発行される数を表します。そして、「totalAllocation」の値は、割り当ての総数を示します。前の実行日はコントラクト自身に記録され、前の実行から次の実行の前日までの期間がターゲット期間として定義されます。対象期間は 1 日より長くする必要があります。

配布のための資金は「mintPerBlock」に目標期間の長さを掛けて計算されます。

### 配布計算

配布数の計算は、Allocator Contract の `allocate（）`関数によって行われます。

Property Contract の分布計算では、次の変数を使用します。

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

Allocator Contract は、配布されるトークンの数に応じて、Property Contract の Dev Token を作成します。このため、Allocator Contract には、Dev Token を増やす権限も必要です。

### 配布された Token の受け取り

Dev Token は、ユーザーアカウントが Allocator Contract の「withdraw（）」関数を呼び出したときに受け取ることができます。

Allocator Contract は、各プロパティの配布トークンの合計数を「合計」として、配布トークンの合計値を「価格」として記録します。

```sol
mapping(address => uint) totals;
mapping(address => uint) prices;
```

ユーザーアカウントが `withdraw()` 関数を呼び出すと、ユーザーは `price` に Property Contract のユーザーの残高を乗じた数の Dev Token を受け取ることができます。このときの `price` 変数は、Property Contract のユーザーアカウントにマッピングされ、同じアカウントが次回 `withdraw()` 関数を呼び出すときに値から差し引かれます。このようにして、引き出し金額は、一人が引き出すことができる最大金額を超えません。

#### 価格計算

Allocator Contract の `increment()` 関数は、Allocator Contrac で指定された評価を `total` と `price` に追加します。

```sol
function increment(address _property, uint _value) internal {
    totals[_property] += _value;
    prices[_property] += _value.div(ERC20(_token).totalSupply());
}
```

#### トークンの引き出し

Allocator Contract の `withdraw()` 関数は、ユーザーのアカウントに、受信できる限り多くの Dev Token を預け入れます。このトランザクションの処理料金は、 `oraclize_getPrice（" URL "）`の値に相当する ETH の量です。これは通常少量です。この処理料金は Allocator Contract に振り込まれ、次の配布の計算に使用されます。

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

これは、Property Contract の `transfer（）`関数の実装がどのように見えるかです。

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

「beforeBalanceChange」関数はアカウントの引き出し可能な金額に影響するため、これは各 Property Contract に制限されるべきです。

## Market Contract

Market Contract は、Market Factory Contract によって作成されます。Market Contract は、インターネット資産の指標を管理します。Market Contract は、財産の真正性とその評価を保証します。誰でも自由に Market Contract を作成できますが、投票で承認されたもののみが有効になります。

### Market の作成

Market Factory Contract の `createMarket（）`関数は新しい Market Contract を作成します。

この関数は、Market Contract の動作を定義するコントラクトアドレスを受け取ります。

新しい Market Contract は、Dev Token 所有者の投票により有効になります。

投票者が送信した Dev Token の数によって、1 つの投票の重要性が決まります。投票は常に「はい」を意味し、投票しないことは「いいえ」を意味します。投票ごとに開発トークンはバーンされます。投票総数が Dev Token の合計供給量の 10％に達すると、Market Contract が有効になります。

### Contract の動作

コントラクトには、2 つのパブリック関数、 `authenticate（）`と `calculate（）`が必要です。

Market Contract は、Property Contract の所有権を認証するために `authenticate（）`関数を呼び出します。それは、インターネット資産にマップされた Property Contract の所有者を認証し、Market Contract.の `authenticatedCallback（）` を呼び出すことが期待されます。

Allocator Contract は `calculate（）`関数を呼び出して、Property Contract への新しい配布数を計算します。それは、インターネットアセットにマップされた Property Contract のメトリックを取得し、Allocator Contract の `calculatedCallback（）`を呼び出すことを期待しています。

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

`authenticate（）`関数は、ターゲットの Property Contract アドレスに加えて、最大 5 つの引数を取ることができます。`schema`を JSON 文字列として配列として定義して、各引数の意味を示す必要があります。

たとえば、次のようになります。

```sol
string public schema = "['Your asset identity', 'Read-only token' 'More something']";
```

Market Contract'の `authenticate（）`関数は、常に 2 番目の引数を一意の ID として扱います。したがって、既存の値を入力することはできません。

次のスキーマは正しい例です。

```sol
string public schema = "['Your GitHub repository(e.g. your-name/repos)', 'Read-only token']";
```

そして、次のスキーマは間違った例です。

```sol
string public schema = "['Read-only token', 'Your GitHub repository(e.g. your-name/repos)']";
```

### 所有者の認証

Market Contract の「authenticate（）」関数は所有者を認証し、新しい Metrics Contract を作成します。

この機能は、Property Contract が接続する Market Contract の管理に関与するため、Property Contract の所有者が実行する必要があります。

## Metrics Contract

Metrics Contract は、Property Contract を Market Contract に関連付ける smart contract です。

Market Contract には、1 つの Property Contract のアドレスと、認証のために Market Contract で使用される情報が含まれています。

インターネット資産の所有者は、Metrics Contract アドレスを Allocator Contract に渡す対応するインデックスの評価を取得できます。

Metrics Contract は、Market Contract によって認証された後に作成されます。

## State Contract

State Contract は、Dev Protocol の状態を永続的にすることを目的とする smart contract です。

この contract は、複数の contract のクロスオーバー値を管理するために使用されます。また、この状態の更新を制御するいくつかのゲッター/セッター関数が含まれています。

## Develop Dev Protocol

Dev Protocol は OSS です。誰でもその開発に参加できます。

- GitHub: https://github.com/dev-protocol/protocol
- Discord: https://discord.gg/VwJp4KM
- Spectrum: https://spectrum.chat/devtoken
- Twitter: https://twitter.com/devtoken_rocks
- Blog: https://medium.com/devtoken
- Web site: https://devtoken.rocks
