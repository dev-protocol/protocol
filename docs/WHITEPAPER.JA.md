# Dev Protocol ホワイトペーパー

Version: **`3.2.1`**

_このホワイトペーパーは更新される可能性があります。更新時、バージョン番号は[セマンティックバージョニング](https://semver.org/)にしたがって増加します。_

Dev Protocol は、オンチェーンガバナンスであらゆる資産を自律分散的に最適化して取引可能にするミドルウェアプロトコルです。

# Dev Protocol が目指す世界

経済活動は、多くの活動の上に成り立っている。それらの活動が将来にむけて成長のための投資をするには利益が必要です。Dev は今まで正当な経済的評価を受けていなかったあらゆる活動を公平に評価し、P2P での取引と報酬分配によって自律分散的に持続性を実現するテクノロジーです。

## 概要

個人は活動を通じて価値を生み出している。Dev Protocol は活動が生み出す価値を”資産化”して P2P で取引するマーケット、ステーキング、マーケット報酬の分配という特徴を持つ。活動が資産化されると、以下のことが実現される。

- 活動が生み出した価値に応じてマーケット報酬を得る
- 資産に対して第三者からのステーキング（金銭的応援）を受ける
- ステーキングのインセンティブとして対価を提供する
- 共同活動者との資産の共有およびマーケット報酬分配が可能になる

ステーキングはインフレーションメカニズムを活用した新たな金銭取引の手段であり、ステーキングによってユーザーは活動の持続性を担保され、利用者は実質費用ゼロで対価を受ける。これは今までフリーに公開されていた全ての資産に対して利益を与える仕組みであり、これまで法定通貨で発生していた寄付活動を上回るステーキング総額を Dev Protocol は目指している。

Dev Protocol はガバナンスの指針となる政策の策定をコミュニティに移譲し、状況に合わせてアップデートする。ユーザーはプロトコル上で自由に政策を提案することが出来る。政策を有効化するためには、資産保有者たちの投票による承認が必要となる。

政策はインフレーションレートの決定などに関わる。現在の政策は [ここ](./POLICY.md) にある。

## マーケットについて

マーケットは、個人の活動をブロックチェーン上に証明し、身元を保証する役割を果たす。マーケットは活動の評価指標毎に作られ、新たなマーケットの開設はコミュニティが提案出来る。

### 資産化

前提として、Dev Protocol ではユーザーの活動の所有権はユーザーに帰属するものとして証明する。これは既存の Web プラットフォームにおいて、ユーザーデータをプラットフォームが保有するモデルとは異なり、資産の所有と活用を分けるものである。資産の活用は、アプリケーションレイヤーによって無数に生み出される。

#### 資産化の方法

ユーザーは Dev Protocol 上で活動のオーナーシップを表明できる外部アカウントを認証することで、マーケット上に“資産”として定義され、資産の所有者であることが証明される。資産の認証時に、ユーザーは政策によって定められた手数料を DEV で支払い、支払われた手数料は自動的にバーンされる。ユーザーは複数の資産を認証することが出来、複数のマーケットに接続することが出来る。認証出来る資産数の上限は政策によって定められる。

### 収益, マーケット報酬, インフレーション, デフレーション

資産の所有者は、自身の資産の価値に応じてマーケット報酬を受け取る。所有する資産がステーキングを受けると、そのステーキング総額に基づいてマーケット報酬が加算される。

プロトコル上での DEV の流れをライフサイクルとして概観すると以下の様になる。
ユーザーはどちらのパターンにもなり得るが、ここでは簡略的に資産の所有者を“活動者”、それを利用する第三者を “利用者” と表記する。

1. DEV は活動者によって新規発行されインフレーションする。
2. 利用者は活動者に対して DEV をステーキングする。
3. 活動者は自身へのステーキングが増えるほど、より多くの DEV を新規発行できる。
4. 活動者は利用者にステーキングの対価としてユーティリティを提供する。
5. 利用者はステーキングを解除すると、ステーキング額に加えて活動者が新規発行で得た DEV の一部が引き出し可能になる。

DEV のインフレーションレートは政策に基づいて総量が( 動的または静的に )決定する。初期の政策は [ここ](./POLICY.md) に示す。プロトコルによって DEV は新規発行, 焼却, ステーキングされ、需給を反映してボラタイルする。

### 共同活動者との権利共有

資産の所有者は、初期状態で 100%の所有権を保有する。100%の所有権を持つことは、マーケット報酬の全額を受け取る権利と等価である。保有する所有権の一部を転送することによって、共同活動者など複数人での所有を可能にする。所有権保有者は、保有率に応じてマーケット報酬の一部を受け取る。これは所有権を表す Property Contract が ERC20 に準拠していることで実現する。

## ステーキング

Dev Protocol では、あらゆる資産との取引を可能にする新たな決済システムとしてステーキングを用いる。ステーキングとは、資産に対する一時的な DEV の預け入れによって、マーケット報酬を増額する仕組みをさす。支払者はステーキングの対価として活動者からユーティリティを受け、活動者はステーキング期間中に増額されたマーケット報酬を受け取る。支払者がそのユーティリティを必要とする間はステーキングが継続され、DEV の希少価値を高める。ユーザーはステーキングを受けることで活動の持続性が担保される。

### 決済フロー

1. DEV を資産に対して一定期間ステーキングすることで、支払者は何らかの対価を受ける。
2. ステーキングされた DEV 保有量に応じて、資産に対するマーケット報酬( インフレーション )額が加算される。支払者によるステーキング期間が長いほど、活動者はより多くのマーケット報酬額が約束される。
3. 支払者は活動者が新規に得た DEV の一部を利子として受け取る。このときの受け取り可能額はステーキング総額に対する自己のステーキング額の比で決まる。
4. ステーキング期間終了後は、資産にステーキングされた DEV は解放され、支払者が引き出し可能な状態となる。

## ガバナンス

Dev Protocol はユーザーが互いの利害関係を侵さずに全員が利益を受け入れるために、多くのインセンティブをビルトインしている。これらインセンティブの相互作用には決定的理論が存在せず、ステークホルダーを含んだコミュニティによる恒常的な改善提案が期待される。Dev Protocol では不確実性のある指標を Policy( 政策 ) として外部から受け入れる。

なお初期の政策は[ここ](./POLICY.md) を参照のこと。

## アプリケーションレイヤー

ユーザーは自身の DEV をある活動者にステーキングすることで、その対象活動者から何らかの対価を得る。対価は権利や労務といった形で支払われる。（原始的には、ステーキングをした利用者が活動者に直接連絡をして対価を要求することも可能だが、）一連の取引を自動執行するのがアプリケーションレイヤーである。アプリケーションレイヤーは利用者のステーキングを活動者にリレーし、活動者からの対価を利用者にリレーする。アプリケーションレイヤーを構築するモチベーションは各々の意思に依るが、想定されうるモチベーションは以下が挙げられる。

- 自己保有する DEV の価値向上
- 活動者の資産( Property )の一部を譲り受けることで報酬の一部を受け取る
- 利用者からの手数料徴取

# トークンディストリビューション

Dev Protocol は基軸トークン "DEV" のトークンディストリビューションを計画している。

次のグラフに最新のアロケーションを示す。

![Token Distribution](https://devprtcl.com/image/token-distribution.svg)

トークンディストリビューションに関する情報は [Medium ポスト](https://medium.com/devprtcl/dev-token-allocation-update-e1d7dd424087) を参照する。

# メカニズム

Dev Protocol は以下の 13 個の主なコントラクトによって構成される。

- Market
- Market Factory
- Property
- Property Factory
- Metrics
- Policy
- Policy Factory
- Lockup
- Allocator
- Policy
- Policy Factory
- Address Config
- DEV

コントラクトの概観図:

![Overview](https://i.imgur.com/5JwNQ3o.png)

## Market

Market Contract は特定の資産群を表す。資産の認証を行う `authenticate` 関数によって、Dev Protocol で扱う資産を定義することができる。

Market Contract は誰でも自由に提案できる。ただし、有効化するためには既存の資産保有者( Property Contract オーナー )たちの投票によって承認される必要がある。Property Contract の被ステーキング数と `totals` の合計値を票数とする。投票は基本的に資産保有者によって行われることを期待するが、ステーキング実行者が自己のステーキング数を票数として投票することもできる。この場合はステーキング対象の Property Contract アドレスを指定する。

`authenticate` 関数は、認証する資産の表明と、実行者が資産の所有者であることを認証する。例えば、1 つの GitHub リポジトリを指定し実行者がその GitHub リポジトリの所有者であることを認証する。そのため `authenticate` 関数は Property Contract の所有者以外から実行できるべきではない。この関数はユーザーから直接呼び出され、認証成功の場合には `authenticatedCallback` を呼び出すことが期待されている。`authenticate` 関数の実行時には Policy Contract によって定められた手数料を DEV で支払い、支払われた手数料は自動的にバーンされる。

## Market Factory

Market Factory Contract は新しい Market Contract を生成する。

Market Contract の生成は `create` 関数を実行することで行われる。 `create` 関数は次のインターフェイスを持つコントラクトのアドレスを受け取り、新たな Market Contract を生成する。

```solidity
contract IMarketBehavior {
	string public schema;

	function authenticate(
		address _prop,
		string memory _args1,
		string memory _args2,
		string memory _args3,
		string memory _args4,
		string memory _args5,
		address market
	) public returns (address);

	function getId(address _metrics) external view returns (string memory);
}
```

`authenticate` 関数を実装する際は呼び出し元が関連付けられた Market Contract であることを検証することを強くお勧めします。その検証のために、関連付けられた Market Contract のアドレスを設定する関数を作成してください。

```solidity
	function authenticate(
		address _prop,
		string memory _args1,
		string memory,
		string memory,
		string memory,
		string memory,
		// solium-disable-next-line no-trailing-whitespace
		address market,
		address
	) public returns (bool) {
		require(msg.sender == associatedMarket, "Invalid sender");
		・
		・
		・
		・
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

`getId` 関数は、Metrics Contract アドレスとして引数を受け取り、認証されたアセット名を返却する。たとえば、その戻り値は `dev-protocol/dev-kit-js` のようなものとなる。

Market Factory Contract はこのコントラクトへのプロキシメソッドなどを持つ Market Contract を新たに作成する。プロキシメソッドは `authenticate`、 `schema` と `getId` の 3 つ。認証成功を受け取る `authenticatedCallback` 関数と、投票を受け付ける `vote` 関数も追加される。

## Property

Property Contract はユーザーの資産グループを表す。ERC20 に準拠したトークンであり、任意のアドレスに転送できる。

すべての Property Contract(Token) ホルダーは、自分の持つ Property Contract(Token) のバランスに応じてマーケット報酬を受け取る。マーケット報酬の計算は Allocator Contract の責務、マーケット報酬の受け取りは Withdraw Contract の責務であり、Property Contract は基本的にピュアな ERC20 となる。

Property Contract の `transfer` 関数は、バランスの変化に伴ってマーケット報酬の引出可能額を変更するため、Allocator Contract に引出可能額の調整を要請する。

初期状態の Property Contract はある資産を保証していない。

Property Contract が資産を表す状態となるためには、Property Contract と Market Contract の関連付けが必要となる。関連付けは Market Contract の `authenticatedCallback` 関数によって行われる。Property Contract には複数の Market Contract を関連付けできる。特定の資産グループを表す 1 つの Property Contract としたり、資産毎に Property Contract を作成してもよい。

## Property Factory

Property Factory Contract は新しい Property Contract を生成する。

Property Contract の生成は `create` 関数を実行することで行われる。引数として `name` と `symbol` を指定する。Property Contract の比較容易性のために `totalSupply` は `10000000`(Solidity では `10000000000000000000000000`) に、 `decimals` は `18` に固定する。

## Metrics

Metrics Contract は Property Contract と Market Contract の関連を表す。

Market Contract の `authenticatedCallback` が呼び出されると、Property Contract と Market Contract のアドレスを保持した Metrics Contract が生成される。

Market Contract の `authenticatedCallback` は Metrics Contract のアドレスを返却する。Market Contract は Metrics Contract のアドレスをキーにしたマップを作ることで、認証時のコンテキストを保持しておくことが可能となる。認証時のコンテキストはマーケット報酬の計算時に使用できる。

## Lockup

Lockup Contract はユーザーが Property Contract に対して行なうステーキングを管理する。

### lockup

ユーザーが Property Contract に対して自身の DEV をステーキングする。この関数は DEV の `deposit` 関数からのみ実行可能である。

ステーキング対象とする Property Contract のアドレスと、DEV の数量を指定することで、Lockup Contract が DEV をステーキングする。ステーキングした DEV は `cancel` 関数を実行してから一定期間経過後に引き出すことができる。ステーキングは `cancel` 関数が実行されるまでのあいだ何度でも追加できる。

ユーザーは DEV をステーキングすることで、その対象の Property Contract オーナーから何らかのユーティリティを受け入れる。そのユーティリティを必要とする間はステーキングが継続され、DEV の希少価値を高める。

ステーキングした時点における累積的総報酬額( Allocator Contract の `calculateMaxRewardsPerBlock` 関数の返却値を経過ブロックに応じて累積した値 )を記録、引出可能な報酬計算に用いる。

報酬額は Property Contract が占めるステーキング比率によって決まるため、Lockup Contract は、Property Contract の累積的ステーキング数( ステーキング数を経過ブロックに応じて累積した値 )と、全体の累積的総ステーキング数( 総ステーキング数を経過ブロックに応じて累積した値 )も記録する。

Property の累積的ステーキング数と累積的総ステーキング数の比から総報酬額の割当が決定する。

ステーキング実行者の受け取る報酬額計算には、以下の変数が用いられる。

- `r`: 累積的総報酬額( Allocator Contract の `calculateMaxRewardsPerBlock` 関数の返却値を経過ブロックに応じて累積した値 )
- `p`: 累積的ステーキング数( ステーキング数を経過ブロックに応じて累積した値 )
- `t`: 累積的総ステーキング数( 総ステーキング数を経過ブロックに応じて累積した値 )
- `l`: ロックアップした時点における `r`
- `Policy.holdersShare`: Property Contract ホルダーが受け取る報酬率関数

計算式は次のようになる。

```
total interest = (p / t * (r -l)) - Policy.holdersShare(p / t * (r -l))
```

この結果を Property Contract に対するステーキング数で除算し、ステーキング実行者のステーキング数で積算することによって引出可能額を算出する。

ステーキング実行者が報酬を引き出すと `l` の値が最新値でオーバーライドされる。このようにして、引出可能額は一人が引き出すことができる最大金額を超えない。このことを以下に例示する。単純化するために `p` と `t` は勘案しない。

1. 500 DEV をステーキングしている Alice は、`r` が 100 のときにはじめてステーキングした。`r` が 500 になったときに引き出し、その報酬額は `(500 - 100) × 500 = 200000` である。
2. `r` が 520 になり、再び Alice は引き出す。引出可能額は `(520 - 500) × 500 = 10000` である。

Alice は 2 回に分けて引き出し、合計で `200000 + 10000 = 210000` を得た。仮に 1 回目の引き出しをしなかったなら、`(520 - 100) × 500 = 210000` であり引出可能額が変わらないことが分かる。

この式はステーキング実行者のステーキング数が一定のときにのみ成立する。そのため Lockup Contract の `withdraw` 関数実行時には `l` の更新が必要である。

### cancel

ユーザーが Property Contract に対してステーキングしている DEV を解除する。解除が要請されてから一定期間はステーキングが継続する。その期間は Policy Contract によって定められたブロック数で決定する。

### withdraw

ユーザーが Property Contract に対してステーキングしている DEV を引き出す。`cancel` 関数によって解除が要請されていないと引き出すことはできない。また、解除要請によって設定されたブロック高に到達するまでは引き出すことはできない。

解除要請によって設定されたブロック高に到達していている場合、ユーザーが Property Contract に対してステーキングしていた DEV の全額をユーザーに転送する。

## Allocator

Allocator Contract はマーケット報酬の決定のためのいくつかの役割を持つ。

### calculateMaxRewardsPerBlock

全ユーザーに対して与えられる総報酬額の 1 ブロックあたりの値を計算して返却する。

計算時点でロックアップされている DEV の総数と、認証済み資産の総数を取得し、Policy Contract の `rewards` 関数へのプロキシとして機能する。引数と返却値の相関は [政策](./POLICY.md#rewards) によって定められている。

## Withdraw

Winthdraw Contract はマーケット報酬の引出可能額を管理するためのいくつかの役割を持つ。

### withdraw

Property Contract のマーケット報酬を引き出す。実行者は呼び出し時点の引出可能額全額を引き出す。

報酬額は Property Contract が占めるステーキング比率によって決まるため、Lockup Contract に問い合わせて Property Contract の累積的ステーキング数( ステーキング数を経過ブロックに応じて累積した値 )と、全体の累積的総ステーキング数( 総ステーキング数を経過ブロックに応じて累積した値 )を取得し、引出可能額を計算する。

Property の累積的ステーキング数と累積的総ステーキング数の比から総報酬額の割当が決定する。

Property ホルダーの受け取る報酬額計算には、以下の変数が用いられる。

- `r`: 累積的総報酬額( Allocator Contract の `calculateMaxRewardsPerBlock` 関数の返却値を経過ブロックに応じて累積した値 )
- `p`: 累積的ステーキング数( ステーキング数を経過ブロックに応じて累積した値 )
- `t`: 累積的総ステーキング数( 総ステーキング数を経過ブロックに応じて累積した値 )
- `l`: 最後に引き出した時点における `r`
- `Policy.holdersShare`: Property Contract ホルダーが受け取る報酬率関数

計算式は次のようになる。

```
total market reward = Policy.holdersShare(p / t * (r -l))
```

この結果を Property Contract の `totalSupply` で除算し、ユーザーのバランスで積算することによって引出可能額を算出する。

ユーザーが報酬を引き出すと `l` の値が最新値でオーバーライドされる。このようにして、引出可能額は一人が引き出すことができる最大金額を超えない。このことを以下に例示する。単純化するために `p` と `t` は勘案しない。

1. Alice は Property Contract を 500 トークン保有している。`r` が 100 になったときに引き出し、その報酬額は `(100 - 0) × 500 = 50000` である。
2. `r` が 120 になり、再び Alice は引き出す。引出可能額は `(120 - 100) × 500 = 10000` である。

Alice は 2 回に分けて引き出し、合計で `50000 + 10000 = 60000` を得た。仮に 1 回目の引き出しをしなかったなら、`(120 - 0) × 500 = 60000` であり引出可能額が変わらないことが分かる。

この式はユーザーのバランスが一定のときにのみ成立する。そのため Property Contract の `transfer` 関数実行時には `l` の更新が必要である。

## Policy

Policy Contract は Dev Protocol の政策を表す。Dev Protocol は不確実性のある指針の策定をコミュニティに移譲し、状況に合わせて指針をアップデートする。

Policy Contract は誰でも自由に提案できる。ただし、有効化するためには既存の資産保有者( Property Contract オーナー )たちの投票によって承認される必要がある。Property Contract の被ステーキング数と `totals` の合計値を票数とし、提案された Policy Contract の`vote` を実行することによって投票は完了する。
基本的に資産保有者によって行われることを期待するが、ステーキング実行者が自らのステーキング数を票数として投票することもできる。この場合はステーキング対象の Property Contract アドレスを指定して行なう。

新しい Policy Contract が有効化条件を満たすだけの賛成票を得られるとただちに有効化され、古い Policy Contract は消滅する。現在、[初期の政策](./POLICY.md) の策定が進行中である。

Policy Contract によって決定される指針は以下のとおり。

### rewards

ブロックあたり総マーケット報酬額。Allocator Contract でマーケット報酬の計算過程で呼び出され、以下の変数から総報酬額を計算する。

- Property に紐づく総ステーキング数
- 総資産数( Metrics Contract 総数 )

### holdersShare

Property Contract(Token) ホルダーが受け取るマーケット報酬のシェア。Allocator Contract でマーケット報酬の計算過程で呼び出され、以下の変数から Property Contract(Token) ホルダーが受け取るシェアを計算する。

- マーケット報酬額
- 被ステーキング数

ステーキング実行者の受け取るシェアは Holders Share の余剰分となる。

### assetValue

資産価値。Allocator Contract でマーケット報酬の計算過程で呼び出され、以下の変数から資産価値を計算する。

- Property に紐づく総ステーキング数
- Market Contract による資産評価

### authenticationFee

資産認証の手数料。Market Contract の `authenticatedCallback` の中で呼び出され、以下の変数から資産認証の手数料を計算する。

- 総資産数( Metrcis Contract 総数 )
- Property Contract の現在のステーキング総数

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

ステーキングの解除申請後の継続ブロック数。
ユーザーは Property Contract に対してステーキングしている DEV を解除することができるが、解除が要請されてから指定されたブロック数だけステーキングが継続する。

## Policy Factory

Policy Factory Contract は新しい Policy Contract を生成する。

Policy Contract の生成は `create` 関数を実行することで行われる。 `create` 関数は Policy Contract のアドレスを受け取り、投票を受け付ける `vote` 関数を追加して新たな Policy Contract を生成する。

## State

State Contract は他のコントラクトの状態を永続化するためのコントラクト。実装を持たず、専ら状態の保持と getter メソッドを責務とする。

## DEV

DEV は Dev Protocol において基軸通貨となる ERC20 トークンである。

https://etherscan.io/token/0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26

## Develop Dev Protocol

Dev Protocol は OSS であり、誰でもその開発に参加できる。

- GitHub: https://github.com/dev-protocol/protocol
- Discord: https://discord.gg/VwJp4KM
- Spectrum: https://spectrum.chat/devtoken
- Twitter: https://twitter.com/devprtcl
- Blog: https://medium.com/devtoken
- Web site: https://devprtcl.com
