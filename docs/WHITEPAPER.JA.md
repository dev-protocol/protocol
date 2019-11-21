# Dev Protocol ホワイトペーパー

Version: **`2.1.0`**

_このホワイトペーパーは更新される可能性があります。更新時、バージョン番号は[セマンティックバージョニング](https://semver.org/)にしたがって増加します。_

Dev Protocol は、オンチェーンガバナンスであらゆる資産を自律分散的に最適化して取引可能にするミドルウェアプロトコルです。

# Dev Protocol が目指す世界

経済活動は、多くの活動の上に成り立っている。それらの活動が将来にむけて成長のための投資をするには利益が必要です。Dev は今まで正当な経済的評価を受けていなかったあらゆる活動を公平に評価し、P2P での取引と報酬分配によって自律分散的に持続性を実現するテクノロジーです。

## 概要

個人は活動を通じて価値を生み出している。Dev Protocol は活動が生み出す価値を”資産化”して P2P で取引するマーケット、ロックアップ、マーケット報酬の分配という特徴を持つ。活動が資産化されると、以下のことが実現される。

- 活動が生み出した価値に応じてマーケット報酬を得る
- 資産に対して第三者からのロックアップ（金銭的応援）を受ける
- ロックアップのインセンティブとして対価を提供する
- 共同活動者との資産の共有およびマーケット報酬分配が可能になる

ロックアップはインフレーションメカニズムを活用した新たな金銭取引の手段であり、ロックアップによってユーザーは活動の持続性を担保され、利用者は実質費用ゼロで対価を受ける。これは今までフリーに公開されていた全ての資産に対して利益を与える仕組みであり、これまで法定通貨で発生していた寄付活動を上回るロックアップ総額を Dev Protocol は目指している。

Dev Protocol はガバナンスの指針となる政策の策定をコミュニティに移譲し、状況に合わせてアップデートする。ユーザーはプロトコル上で自由に政策を提案することが出来る。政策を有効化するためには、資産保有者たちの投票による承認が必要となる。

インフレーションレートの決定などに関わる[初期の政策](./POLICY.md) の策定は進行中。

## マーケットについて

マーケットは、個人の活動をブロックチェーン上に証明し、公平に評価する社会フェアネスとして機能する。マーケットは活動の評価指標毎に作られ、新たなマーケットの開設はコミュニティが提案出来る。

### 資産化

前提として、Dev Protocol ではユーザーの活動の所有権はユーザーに帰属するものとして証明する。これは既存の Web プラットフォームにおいて、ユーザーデータをプラットフォームが保有するモデルとは異なり、資産の所有と活用を分けるものである。資産の活用は、アプリケーションレイヤーによって無数に生み出される。

#### 資産化の方法

ユーザーは Dev Protocol 上で活動のオーナーシップを表明できる外部アカウントを認証することで、マーケット上に“資産”として定義され、資産の所有者であることが証明される。資産の認証時に、ユーザーは政策によって定められた手数料を DEV で支払い、支払われた手数料は自動的にバーンされる。ユーザーは複数の資産を認証することが出来、複数のマーケットに接続することが出来る。認証出来る資産数の上限は政策によって定められる。

### 評価

資産の所有者は、マーケット報酬の受け取りのために任意のタイミングで資産価値の評価を受ける。資産価値の評価指標はマーケット毎に定められる。

### 収益, マーケット報酬, インフレーション, デフレーション

資産の所有者は、自身の資産の価値に応じてマーケット報酬を受け取る。所有する資産がロックアップを受けると、そのロックアップ総額に基づいてマーケット報酬が加算される。

プロトコル上での DEV の流れをライフサイクルとして概観すると以下の様になる。
ユーザーはどちらのパターンにもなり得るが、ここでは簡略的に資産の所有者を“活動者”、それを利用する第三者を “利用者” と表記する。

1. DEV は活動者によって新規発行されインフレーションする。
2. 利用者は活動者に対して DEV をロックアップする。
3. 活動者は自身へのロックアップが増えるほど、より多くの DEV を新規発行できる。
4. 活動者は利用者にロックアップの対価としてユーティリティを提供する。
5. 利用者はロックアップを解除すると、ロックアップ額に加えて活動者が新規発行で得た DEV の一部が引き出し可能になる。

DEV のインフレーションレートは政策に基づいて総量が( 動的または静的に )決定する。この決定に関わる[初期の政策](./POLICY.md) の策定は進行中。プロトコルによって DEV は新規発行, 焼却, ロックアップされ、需給を反映してボラタイルする。

### 共同活動者との権利共有

資産の所有者は、初期状態で 100%の所有権を保有する。100%の所有権を持つことは、マーケット報酬の全額を受け取る権利と等価である。保有する所有権の一部を転送することによって、共同活動者など複数人での所有を可能にする。所有権保有者は、保有率に応じてマーケット報酬の一部を受け取る。これは所有権を表す Property Contract が ERC20 に準拠していることで実現する。

## ロックアップ

Dev Protocol では、あらゆる資産との取引を可能にする新たな決済システムとしてロックアップを用いる。ロックアップとは、資産に対する一時的な DEV の預け入れによって、マーケット報酬を増額する仕組みをさす。支払者はロックアップの対価として活動者からユーティリティを受け、活動者はロックアップ期間中に増額されたマーケット報酬を受け取る。支払者がそのユーティリティを必要とする間はロックアップが継続され、DEV の希少価値を高める。ユーザーはロックアップを受けることで活動の持続性が担保される。

### 決済フロー

1. DEV を資産に対して一定期間ロックアップすることで、支払者は何らかの対価を受ける。
2. ロックアップされた DEV 保有量に応じて、資産に対するマーケット報酬( インフレーション )額が加算される。支払者によるロックアップ期間が長いほど、活動者はより多くのマーケット報酬額が約束される。
3. ロックアップ期間終了後は、資産にロックアップされた DEV は解放され、支払者が引き出し可能な状態となる。支払者がロックアップを解除すると、活動者が新規に得た DEV の一部を利子として受け取る。

## ガバナンス

Dev Protocol はユーザーが互いの利害関係を侵さずに全員が利益を受け入れるために、多くのインセンティブをビルトインしている。これらインセンティブの相互作用には決定的理論が存在せず、ステークホルダーを含んだコミュニティによる恒常的な改善提案が期待される。Dev Protocol では不確実性のある指標を Policy( 政策 ) として外部から受け入れる。

現在、[初期の政策](./POLICY.md) の策定が進行中である。

## アプリケーションレイヤー

ユーザーは自身の DEV をある活動者にロックアップすることで、その対象活動者から何らかの対価を得る。対価は権利や労務といった形で支払われる。（原始的には、ロックアップをした利用者が活動者に直接連絡をして対価を要求することも可能だが、）一連の取引を自動執行するのがアプリケーションレイヤーである。アプリケーションレイヤーは利用者のロックアップを活動者にリレーし、活動者からの対価を利用者にリレーする。アプリケーションレイヤーを構築するモチベーションは各々の意思に依るが、想定されうるモチベーションは以下が挙げられる。

- 自己保有する DEV の価値向上
- 活動者の資産( Property )の一部を譲り受けることで報酬の一部を受け取る
- 利用者からの手数料徴取

# メカニズム

Dev Protocol は以下の 10 個のコントラクトによって構成される。

- Market
- Market Factory
- Property
- Property Factory
- Metrics
- Lockup
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

## Lockup

Lockup Contract はユーザーが Property Contract に対して行なうロックアップを管理する。

### lock

ユーザーが Property Contract に対して自身の DEV をロックアップする。ロックアップ対象とする Property Contract のアドレスと、DEV の数量を指定することで、Lockup Contract が DEV をロックアップする。ロックアップした DEV は `cancel` 関数を実行してから一定期間経過後に引き出すことができる。ロックアップは `cancel` 関数が実行されるまでのあいだ何度でも追加できる。

ユーザーは DEV をロックアップすることで、その対象の Property Contract オーナーから何らかのユーティリティを受け入れる。そのユーティリティを必要とする間はロックアップが継続され、DEV の希少価値を高める。

### cancel

ユーザーが Property Contract に対してロックアップしている DEV を解除する。解除が要請されてから一定期間はロックアップが継続する。その期間は Policy Contract によって定められたブロック数で決定する。

### withdraw

ユーザーが Property Contract に対してロックアップしている DEV を引き出す。`cancel` 関数によって解除が要請されていないと引き出すことはできない。また、解除要請によって設定されたブロック高に到達するまでは引き出すことはできない。

解除要請によって設定されたブロック高に到達していている場合、ユーザーが Property Contract に対してロックアップしていた DEV の全額をユーザーに転送する。

## Allocator

Allocator Contract はマーケット報酬の決定のためのいくつかの役割を持つ。

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

Policy Contract は誰でも自由に提案できる。ただし、有効化するためには既存の資産保有者( Property Contract オーナー )たちの投票によって承認される必要がある。Property Contract の被ロックアップ数と `totals` の合計値を票数とし、提案された Policy Contract の`vote` を実行することによって投票は完了する。
基本的に資産保有者によって行われることを期待するが、ロックアップ実行者が自らのロックアップ数を票数として投票することもできる。この場合はロックアップ対象の Property Contract アドレスを指定して行なう。

新しい Policy Contract が有効化条件を満たすだけの賛成票を得られるとただちに有効化され、古い Policy Contract は消滅する。現在、[初期の政策](./POLICY.md) の策定が進行中である。

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

新しい Policy Contract の有効化可否。提案された Policy Contract の `vote` の中で現行のの Policy Contract の `policyApproval` が呼び出され、以下の変数から 新規 Policy Contract の有効化を決定する。

- 賛成票数
- 反対票数

### marketVotingBlocks

新しい Market Contract が提案されてから投票を終了するまでのブロック数。投票を終了すると、Market Contract は否決される。

### policyVotingBlocks

新しい Policy Contract が提案されてから投票を終了するまでのブロック数。投票を終了すると、Policy Contract は否決される。

### abstentionPenalty

Property Contract オーナーが Market Contract 及び Policy Contract への投票を棄権した場合のペナルティ。ペナルティはマーケット報酬の計算対象外期間( ブロック数 )を設けることで罰則とする。Allocator Contract の `allocate` の中で呼び出され、以下の変数からペナルティを決定する。

- 棄権回数

計算対象外期間を算出し返却する。対象外期間の開始ブロックは `allocate` の前回実行ブロックとする。計算対象外期間中は `allocate` の実行が失敗し、期間経過後も期間中の資産価値は考慮されない。

棄権回数の算出のために、Market Contract 及び Policy Contract の投票受付期間中に投票しなかった Property Contract を記録している。

### lockUpBlocks

ロックアップの解除申請後の継続ブロック数。
ユーザーは Property Contract に対してロックアップしている DEV を解除することができるが、解除が要請されてから指定されたブロック数だけロックアップが継続する。

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
