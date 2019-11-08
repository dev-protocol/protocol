# Dev Protocol ホワイトペーパー

Version: **`2.0.0`**

_このホワイトペーパーは更新される可能性があります。更新時、バージョン番号は[セマンティックバージョニング](https://semver.org/)にしたがって増加します。_

# メカニズム

Dev Protocol は以下の 10 個のコントラクトによって構成される。

- Market
- Market Factory
- Property
- Property Factory
- Metrics
- Allocator
- Policy
- Policy Factory
- State
- DEV

コントラクトの概観図:

![Overview](https://i.imgur.com/5JwNQ3o.png)

## Market

Market Contract は特定の資産群を表す。資産の認証を行う `authenticate` 関数、資産価値の評価を行う `calculate` 関数の 2 つのインターフェイスによって、Dev Protocol で扱う資産を定義することができる。

Market Contract は誰でも自由に提案できる。ただし、有効化するためには既存の資産保有者( Property Contract オーナー )たちの投票によって承認される必要がある。Property Contract の被ロックアップ数と `totals` の合計値を票数とする。投票は基本的に資産保有者によって行われることを期待するが、ロックアップ実行者が自らのロックアップ数を票数として投票することもできる。この場合はロックアップ対象の Property Contract アドレスを指定する。

`authenticate` 関数は、認証する資産の表明と、実行者が資産の所有者であることを認証する。例えば、1 つの GitHub リポジトリを指定し実行者がその GitHub リポジトリの所有者であることを認証する。そのため `authenticate` 関数は Property Contract の所有者以外から実行できるべきではない。この関数はユーザーから直接呼び出され、認証成功の場合には `authenticatedCallback` を呼び出すことが期待されている。`authenticate` 関数の実行時には Policy Contract によって定められた手数料を DEV で支払い、支払われた手数料は自動的にバーンされる。

`calculate` 関数は、マーケット報酬の決定のために資産価値を算出する。この関数は Allocator Contract から呼び出されることを期待しているが、ユーザーからも直接呼び出すことができる。ただし Allocator Contract から呼び出さるとき以外はなんら効果をもたらさない。実行時のコンテキストをバリデーションする必要はなく、それらはすべて Allocator Contract によって行われる。算出結果は Allocator Contract の `calculatedCallback` を呼び出すことで Allocator Contract に通告する。

ひとつの Market Contract が 何を資産として 扱うかを `authenticate` が定義し、 どのように評価 するかを `calculate` が定義する。

## Market Factory

Market Factory Contract は新しい Market Contract を生成する。

Market Contract の生成は `createMarket` 関数を実行することで行われる。 `createMarket` 関数は次のインターフェイスを持つコントラクトのアドレスを受け取り、新たな Market Contract を生成する。

```solidity
contract IMarket {
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

`schema` は配列型の JSON 文字列で、 `authenticate` 関数が認証のために受け取る引数の意味を説明する。この引数は Property Contract のアドレスに加えて最大 5 つである。例えば以下のようになる。

```solidity
string public schema = "['Your asset identity', 'Read-only token', 'More something']";
```

`authenticate` 関数は、常に 2 番目の引数を一意の ID として扱う。したがって、一意性を担保できない値は指定すべきではない。次のスキーマは誤った例である。

```solidity
string public schema = "['Read-only token', 'Your GitHub repository(e.g. your-name/repos)']";
```

そして次のスキーマは正しい例である。

```solidity
string public schema = "['Your GitHub repository(e.g. your-name/repos)', 'Read-only token']";
```

Market Factory Contract はこのコントラクトへのプロキシメソッドなどを持つ Market Contract を新たに作成する。プロキシメソッドは `authenticate` と `calculate` の 2 つ。認証成功を受け取る `authenticatedCallback` 関数と、投票を受け付ける `vote` 関数も追加される。

## Property

Property Contract はユーザーの資産グループを表す。ERC20 に準拠したトークンであり、任意のアドレスに転送できる。

すべての Property Contract(Token) ホルダーは、自分の持つ Property Contract(Token) のバランスに応じてマーケット報酬を受け取る。マーケット報酬の計算や受け取りは Allocator Contract の責務であり、Property Contract は基本的にピュアな ERC20 となる。

Property Contract の `transfer` 関数は、バランスの変化に伴ってマーケット報酬の引出可能額を変更するため、Allocator Contract に引出可能額の調整を要請する。

初期状態の Property Contract はマーケット報酬を受け取ることができない。マーケット報酬はロックアップと資産価値に基づいて決まるため、マーケット報酬を受け取るには資産との関連付けが必須となる。

Property Contract が資産を表す状態となるためには、Property Contract と Market Contract の関連付けが必要となる。関連付けは Market Contract の `authenticate` 関数によって行われる。Property Contract には複数の Market Contract を関連付けできる。特定の資産グループを表す 1 つの Property Contract としたり、資産毎に Property Contract を作成してもよい。

## Property Factory

Property Factory Contract は新しい Property Contract を生成する。

Property Contract の生成は `createProperty` 関数を実行することで行われる。引数として `name` と `symbol` を指定する。Property Contract の比較容易性のために `totalSupply` は `10000000` に、 `decimals` は `18` に固定する。

## Metrics

Metrics Contract は Property Contract と Market Contract の関連を表す。

Market Contract の `authenticatedCallback` が呼び出されると、Property Contract と Market Contract のアドレスを保持した Metrics Contract が生成される。

Market Contract の `authenticatedCallback` は Metrics Contract のアドレスを返却する。Market Contract は Metrics Contract のアドレスをキーにしたマップを作ることで、認証時のコンテキストを保持しておくことが可能となる。認証時のコンテキストはマーケット報酬の計算時に使用できる。

## Allocator

Allocator Contract はマーケット報酬の決定のためのいくつかの役割を持つ。

### lock

ユーザーが Property Contract に対して自身の DEV をロックアップする。ロックアップした DEV は `cancel` 関数を実行してから一定期間経過後に引き出すことができる。ロックアップは `cancel` 関数が実行されるまでのあいだ何度でも追加できる。

ユーザーは DEV をロックアップすることで、その対象の Property Contract オーナーから何らかのユーティリティを受け入れる。そのユーティリティを必要とする間はロックアップが継続され、DEV の希少価値を高める。

### cancel

ユーザーが Property Contract に対してロックアップしている DEV を解除する。解除が要請されてから一定期間はロックアップが継続する。その期間は Policy Contract によって定められたブロック数で決定する。

### allocate

Property Contract のマーケット報酬を計算し引出可能額を増額する。引数として Metrics Contract のアドレスを受け取る。マーケット報酬の決定には以下の変数を用いる。

- `t` = `allocate` 関数が前回実行されてから今回までの期間( ブロック数 )
- `a` = Metrics Contract によって関連付けされている Market Contract の `calculate` 関数を呼び出すことで得られた資産価値を `t` で除算した数
- `l` = Metrics Contract によって関連付けされている Property Contract のロックアップ数
- `v` = `a` と `l` に基づいて Policy Contract が決定する総資産価値( ブロック毎 )
- `p` = 前回の `v`
- `d` = Metrics Contract によって関連付けされている Market Contract の合計総資産価値( ブロック毎 )
- `m` = Policy Contract によって算出された総報酬額( ブロック毎 )
- `s` = Metrics Contract によって関連付けされている Market Contract の発行済み Metrics 数のシェア

基本的な考え方は、合計総資産価値( ブロック毎 )と各総資産価値の比率( ブロック毎 )によって決まる。計算が実行されるたびに、合計総資産価値がオーバーライドされ、次の計算に使用される。

式は以下のとおり。

```
distributions = v / (d - p + v) * m * s * t
```

この計算の後、`d` は `(d - p + v)` の値によってオーバーライドされる。

### withdraw

Property Contract のマーケット報酬を引き出す。実行者は呼び出し時点の引出可能額全額を引き出す。

Allocator Contract は、Property Contract のマーケット報酬の合計数を `totals` として、マーケット報酬の累積価格を `prices` として記録する。Property Contract が被ロックアップされている場合、ロックアップ実行者向けの値として `lockTotals` と `lockPrices` も記録される。Property Contract(Token) のホルダーとロックアップ実行者のマーケット報酬のシェアは Policy Contract によって定められる。

```solidity
mapping(address => uint) totals;
mapping(address => uint) prices;
mapping(address => uint) lockTotals;
mapping(address => uint) lockPrices;
```

ユーザーが `withdraw` 関数を呼び出すと、ユーザーは `price` に Property Contract のユーザーの残高を乗じた数の DEV を受け取る。

`totals` と `prices` の更新は Allocator Contract の `increment` 関数によって行われる。

```solidity
function increment(address _property, uint _value) internal {
	totals[_property] += _value;
	prices[_property] += _value / ERC20(_token).totalSupply();
}
```

`totals` はマーケット報酬の累積和であり、 `prices` は Property Contract(Token) の 1 につき引出可能なマーケット報酬の累積和となる。

`prices` は Property Contract のユーザーアカウント毎にマッピングされ、同じユーザーが次回 `withdraw` 関数を呼び出すときに値から差し引かれる。このようにして、引出可能額は一人が引き出すことができる最大金額を超えない。このことを以下に例示する。

1. Property Contract を 500 保有している Alice は、`prices` が 100 のときにはじめて引き出す。引出可能額は `(100 - 0) × 500 = 50000` である。
2. `prices` が 120 になり、再び Alice は引き出す。引出可能額は `(120 - 100) × 500 = 10000` である。

Alice は 2 回に分けて引き出し、合計で `50000 + 10000 = 60000` を得た。仮に 1 回目の引き出しをしなかったなら、`120 × 500 = 60000` であり引出可能額は変わらない。

この式はユーザーのバランスが一定のときにのみ成立する。そのため Property Contract の `transfer` 関数実行時には Allocator Contract にその通告を行い、転送者と受領者の引出可能額を調整する必要がある。

## Policy

Policy Contract は Dev Protocol の政策を表す。Dev Protocol は不確実性のある指針の策定をコミュニティに移譲し、状況に合わせて指針をアップデートする。

Policy Contract は誰でも自由に提案できる。ただし、有効化するためには既存の資産保有者( Property Contract オーナー )たちの投票によって承認される必要がある。Property Contract の被ロックアップ数と `totals` の合計値を票数とする。投票は基本的に資産保有者によって行われることを期待するが、ロックアップ実行者が自らのロックアップ数を票数として投票することもできる。この場合はロックアップ対象の Property Contract アドレスを指定して行なう。

新しい Policy Contract が有効化条件を満たすだけの賛成票を得られるとただちに有効化され、古い Policy Contract は消滅する。

Policy Contract によって決定される指針は以下のとおり。

### rewards

ブロックあたり総マーケット報酬額。Allocator Contract でマーケット報酬の計算過程で呼び出され、以下の変数から総報酬額を計算する。

- 総ロックアップ数
- 総資産数( Metrics Contract 総数 )

### holdersShare

Property Contract(Token) ホルダーが受け取るマーケット報酬のシェア。Allocator Contract でマーケット報酬の計算過程で呼び出され、以下の変数から Property Contract(Token) ホルダーが受け取るシェアを計算する。

- マーケット報酬額
- 被ロックアップ数

ロックアップ実行者の受け取るシェアは Holders Share の余剰分となる。

### assetValue

資産価値。Allocator Contract でマーケット報酬の計算過程で呼び出され、以下の変数から資産価値を計算する。

- Market Contract による資産評価
- 被ロックアップ数

### authenticationFee

資産認証の手数料。Market Contract の `authenticatedCallback` の中で呼び出され、以下の変数から資産認証の手数料を計算する。

- 総資産数( Metrcis Contract 総数 )
- Property Contract に関連付けされた資産数

### marketApproval

新しい Market Contract の有効化可否。Market Contract の `vote` の中で呼び出され、以下の変数から Market Contract の有効化を決定する。

- 賛成票数
- 反対票数

### policyApproval

新しい Policy Contract の有効化可否。Policy Contract の `vote` の中で呼び出され、以下の変数から Policy Contract の有効化を決定する。

- 賛成票数
- 反対票数

### marketVotingBlocks

新しい Market Contract が提案されてから投票を終了するまでのブロック数。投票を終了すると、Market Contract は否決される。

### policyVotingBlocks

新しい Policy Contract が提案されてから投票を終了するまでのブロック数。投票を終了すると、Policy Contract は否決される。

### abstentionPenalty

Property Contract オーナーが Market Contract 及び Policy Contract への投票を棄権した場合のペナルティ。Allocator Contract の `allocate` の中で呼び出され、以下の変数からペナルティを決定する。

- 棄権回数

ペナルティはマーケット報酬の計算対象外期間( ブロック数 )を設けることで罰則とする。対象外期間の開始ブロックは `allocate` の前回実行ブロックとする。計算対象外期間中は `allocate` の実行が失敗し、期間経過後も期間中の資産価値は考慮されない。

棄権回数の算出のために、Market Contract 及び Policy Contract の投票受付期間中に投票しなかった Property Contract を記録する必要がある。そのための単純な方法として、State Contract に `pol`, `vot` という変数を追加する。 `pol` は整数型で新たな投票が開始するたびに 1 を加算する。`vot` は Property Contract のアドレスをキーとした整数のマップ型で、Property Contract オーナーによる投票のたびに 1 を加算する。Property Contract の生成時には `pol` の値を `vot[address]` に記録する。`pol` から `vot[address]` を差し引いた数が棄権数となる。Property Contract がペナルティを受けると `vot[address]` の値は再び `pol` と同期される。

## Policy Factory

Policy Factory Contract は新しい Policy Contract を生成する。

Policy Contract の生成は `createPolicy` 関数を実行することで行われる。 `createPolicy` 関数は Policy Contract のアドレスを受け取り、投票を受け付ける `vote` 関数を追加して新たな Policy Contract を生成する。

## State

State Contract は他のコントラクトの状態を永続化するためのコントラクト。実装を持たず、専ら状態の保持と getter メソッドを責務とする。

## DEV

DEV は Dev Protocol において基軸通貨となる ERC20 トークンである。

https://etherscan.io/token/0x98626e2c9231f03504273d55f397409defd4a093

## Develop Dev Protocol

Dev Protocol は OSS であり、誰でもその開発に参加できる。

- GitHub: https://github.com/dev-protocol/protocol
- Discord: https://discord.gg/VwJp4KM
- Spectrum: https://spectrum.chat/devtoken
- Twitter: https://twitter.com/devtoken_rocks
- Blog: https://medium.com/devtoken
- Web site: https://devtoken.rocks
