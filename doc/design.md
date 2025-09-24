# Next.jsベタープラクティス

## 前提

以下のライブラリを組み合わせて開発する

- Prisma
- Zod

## レイヤー方針

データを中心としたレイヤーは主に2階層にする

- Repository
- Service ( or UserCase )

また、データ操作 ( Mutation / DataFetch ) を行うのは以下の2つ

- MutationはServer Actions
- DataFetchはServer Component
  - UIとしてClientにせざるをえないケースではClient ComponentからDataFetchも例外で認める
  - 例：無限スクロール・続きを読む・並び替え

### Repository

- DB操作はRepository層を作る
  - Repository層ではDBや外部APIなどを直接操作する
  - RepositoryはDTOの役割も担っているため、SELECTのフィールドは必要最低限なものを明示的に指定
  - 関数を増やすのではなく汎用的なインターフェイスとする
  - また関連テーブルがあり、利用ケースとして結合したほうが良ければRepositoryでするのはOK
    - 例：ブログ記事のカテゴリ情報は、原則一緒に利用するのでarticleRepo().find()ではカテゴリをJOINして返す
- Prismaの自動生成された型は利用せず、明示的にモデルの型定義をする
  - 背景としては、DTOの役割も兼ねているため自動生成だと都度Omitする必要があり手間

- RepositoryではPrismaのトランザクションオブジェクトを受け取り、それを利用する
  - Repository自身ではトランザクション管理はしない
  - トランザクションはServiceの責務

- Repositoryは操作対象リソース単位のファイルとする
  - 例：userRepo.ts / articleRepo.ts

- 関数名は list / find / create / update / delete をベースとする
- 効率を上げるために一括処理用の bulkCreate / bulkUpdate / bulkDelete などを作るのはOK
  - ただし、findById / findByEmail など関数が増え続けるような用途の狭い関数を作るのは禁止
  - なるべく汎用性の高い関数として設計をする
    - 例外として複雑度が上がるようであれば適宜関数を分割すること


### Service

- ビジネスロジックはService層を作る
  - Service層ではDBトランザクションとビジネスロジックを表現（凝集度を高める）
  - Service層から必要なRepositoryを呼び出す
- Serviceは関数単位のファイルとする
  - 例：createUserService.ts / deleteArticleService.ts
  - また、ファイル名・関数名の最後にはServiceというSuffixを加える

- 関数名はユースケースとして分かりやすい命名にする（長すぎるのは駄目）

### Mutation: ServerActions

- ミューテーションはServerActionsを利用する
  - ServerActionsでは認証認可・データバリデーション（パース）・Service呼び出し、レスポンスを行う
  - ServerActionsから直接Repositoryは呼ばない
- ServerActionsではビジネスロジックは記述しない
  - ビジネスロジックはServiceに任せる

- ServerActionsは、MVCでいうところのControllerのような立ち位置で考える
  - ユーザからの入力を受け取り、必要なデータクレンジングをし、処理を呼び出し、レスポンスを返す

- ServerActionsの引数は原則FormDataで統一する
  - `useActionState` と組み合わせて使うこと

- ServerActionsをFormの `action` で呼び出す `<Form action={action}>` 
  - Formの `onSubmit` は利用禁止


### Data Fetch: Server Component

- ページコンポーネントはServerComponentとして動かし必要な情報はバックエンド側で取得する
- ClientComponentからRouteHandlerをfetchして呼び出すのは原則禁止（例外あり）

## Component

### ディレクトリ構成・ファイル名

- Co-locationの考え方を尊重する
  - 使うものは近い場所に配置する
  - Server Actionsは利用しているページの `_actions` ディレクトリに配置する
  - 部品コンポーネントは利用しているページの `_components` ディレクトリに配置する
  - もし、複数の画面で利用するようなケースがあれば、トップディレクトリ `src/app/` に配置する
  - このルールはRepositoryとServiceは該当しない（この2つはトップディレクトリ配置）
- ファイル名は関数名と同じにする
  - つまりcamelCaseで作成する（例：createUser.ts）
  - コンポーネントの場合はUpperCamelCaseとなる（例：UserList.tsx）

### Layout / Page Component

- PropsはNext.js v15.5から提供されたPage Props Helperを利用する
  - SearchParamsに関してはZodでスキーマ定義し、必ずパースしてから利用する
- Page Componentは必ずServer Componentにする
  - もしClientにする必要があれば別コンポーネントに切り出す

## TypeScript

### コードの書き方

- `let` は極力使わない
  - もし `if-else` などで代入する値が違う場合は、処理を関数に切り出して `let` ではなく `const` にする
- 型推論に頼らず、関数の返り値の型はなるべく明示する