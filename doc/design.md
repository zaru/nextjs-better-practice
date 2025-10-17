# Next.js BetterPractice ガイドライン

## 目的

本ガイドラインは、Next.jsを使ったシステム開発において、以下を実現することを目的とする。

- 開発チーム内での実装方針の統一
- 保守性・可読性の維持
- 現実的な利益を得られるバランスの追求
- アプリケーションコードの実装に集中できる環境の提供

完全で完璧な設計を追求するのではなく、実用性と開発効率を重視した方針を採用する。

## ライブラリ

### 必須ライブラリ

- **Prisma**（またはDrizzle）
- **Zod**（またはValibot）

### 推奨ライブラリ

| カテゴリ          | ライブラリ                                         |
| ----------------- |-----------------------------------------------|
| UI                | React Aria Component, Storybook, Tailwind CSS |
| 認証              | Better Auth もしくは Auth0                        |
| Worker            | BullMQ                                        |
| テスト            | Vitest, MSW                                   |
| Linter/Formatter  | Biome, SecretLint                             |
| その他            | dotenvx, T3-Env, pino + next-logger, Sentry   |

### ライブラリ選定方針

依存ライブラリの数を最小限に抑え、保守コストとセキュリティリスクを低減すること。

- シンプルな機能は自前実装を優先する
- 複雑な機能で再発明コストが高い場合のみライブラリを採用する
  - 例：高機能UIライブラリ、認証基盤など

## アーキテクチャ方針

### 基本設計方針

本プロジェクトでは、データ中心の2層アーキテクチャを採用する。

- **Repository層**: データベース操作・外部API呼び出し
- **Service層**: ビジネスロジック・トランザクション管理

DDDやClean Architecture由来のアーキテクチャは目指さず、実利性の高い要素があれば取り入れる。

### データ操作の責務

データ操作（Mutation/DataFetch）は以下のレイヤーで実施すること。

| 操作種別       | 実施場所           | 備考                                                      |
| -------------- | ------------------ |---------------------------------------------------------|
| Mutation       | Server Actions     | フォームSubmitなどの状態変更                                       |
| Data Fetch     | Server Component   | 画面表示に必要なデータ取得                                           |
| Data Fetch例外 | Client Component   | 無限スクロール、並び替えなど、UI要件でClient化が必須の場合のみRoute HandlerでAPIを構築 |


### レイヤー構成図

![レイヤー構成図](layer.png)

### ディレクトリ構成

Colocationの原則に従い、画面単位で関連ファイルを配置すること。

```
src
├── components          # 全画面共通コンポーネント
│   └── Card.tsx
├── repositories        # Repository層（トップレベル配置）
│   └── tagRepo.ts
├── services           # Service層（トップレベル配置）
│   └── tag
│       └── createTagService.ts
└── app
    └── tag            # /tag ページ
        ├── _actions       # Server Actions
        │   └── createTag.ts
        ├── _components    # ページ専用コンポーネント
        │   └── CreateTagForm.tsx
        └── page.tsx       # ページコンポーネント
```

### Repository層

#### 責務

Repository層は、データベース操作と外部API呼び出しを担当する。DTOの役割も兼ねるため、取得フィールドは必要最低限を明示的に指定すること。

#### 型定義パターン

Prismaの自動生成型を直接使用せず、必要なフィールドを明示的に定義すること。

```typescript
// 必要なフィールドを明示的に指定
const tagSelect = {
  id: true,
  name: true,
} satisfies Prisma.TagSelect;

// selectから型を生成
type Tag = Prisma.TagGetPayload<{ select: typeof tagSelect }>;
```

#### ファイル・関数命名規則

| 項目       | 規則                                      | 例                          |
| ---------- | ----------------------------------------- |----------------------------|
| ファイル名 | リソース単位で作成                        | `userRepo.ts`              |
| 関数名基本 | `list`, `count`, `find`, `create`, `update`, `delete` | `userRepo().find()`        |
| 一括操作   | `bulk`プレフィックスを付与可              | `bulkCreate`, `bulkUpdate` |

#### 設計原則

1. **汎用性を重視**: `updateName`, `updateDescription`のような用途限定関数は作成しない
   - 例外：listByStatusのような頻出クエリは許可（ただし過剰な関数増加は避ける）
2. **JOIN戦略**: 関連テーブルを常に使用する場合はRepository層でJOINする
   - 例：記事取得時にカテゴリ情報も必ずJOINする
3. **トランザクション管理**: Prismaトランザクションオブジェクトを引数で受け取る
   - Repository自身ではトランザクション管理しない（Serviceの責務）
4. **生SQL使用**: `$queryRaw`の使用は許可
   - 返り値は必ずZodでパースすること
   - 実データを使用したテストを必ず作成すること
   - PrismaのTypedSQLは今は利用しない
     - デプロイ時に実DBへの接続が必要になりデプロイフローが煩雑になるため 

### Service層

#### 責務

Service層は、ビジネスロジックとトランザクション管理を担当する。複数のRepository呼び出しを組み合わせ、ドメイン固有のルールを実装すること。

#### ファイル・関数命名規則

| 項目       | 規則                                   | 例                          |
| ---------- | -------------------------------------- | --------------------------- |
| ファイル名 | 関数単位で作成、`Service`サフィックス | `createUserService.ts`      |
| 関数名     | ユースケースを表現、`Service`サフィックス | `createUserService()`       |

関数名は簡潔かつユースケースが明確に分かる命名にすること。

#### ビジネスロジックの定義

本アーキテクチャにおけるビジネスロジックとは、以下を指す。

1. **複数Repositoryの協調**: 複数のRepository呼び出しを組み合わせた処理
2. **ドメインルールの実装**: ドメイン固有の制約・計算・判定ロジック
3. **トランザクション境界**: 一連の操作をトランザクションとして管理

**ビジネスロジックの例:**
- ユーザー作成時に初期設定データを同時登録
- 注文確定時に在庫減算と配送依頼を同時実行
- 記事公開時に通知送信とタイムライン更新

**ビジネスロジックでない例:**
- 一連の手続きの中で、単一テーブルへのCRUD操作を抜き出したもの（Repository層の責務）
  - 単一テーブルへの操作だけだったとしても、それがビジネスロジックの塊ならService層
  - 例えばタグを生成するRepositoryを、ただ呼び出すだけのServiceでもOK
- リクエストのバリデーション（Server Actionsの責務）
- 認証・認可チェック（Server Actionsの責務）

### Server Actions（Mutation）

#### 責務

Server Actionsは、MVCのControllerに相当する（これは独自解釈でありNext.js公式の考えではないです）。以下の処理フローを実装すること。

1. 認証・認可チェック
2. データバリデーション（パース）
3. Service呼び出し
4. レスポンス返却
5. 必要に応じて`revalidatePath`でキャッシュ更新

**禁止事項:**
- Server ActionsからRepositoryを直接呼び出す
- Server Actions内にビジネスロジックを記述する

#### 引数と呼び出し方法

| 用途               | 引数       | 呼び出し方法                   | Hook使用           |
| ------------------ | ---------- |--------------------------|------------------|
| フォームSubmit     | `FormData` | `<form action={action}>` | `useActionState` |
| 単純なアクション（いいねボタン等） | 任意の値   | `onClick` など             | `useTransition`   |

**禁止事項:**
- フォームの`onSubmit`での呼び出し

#### ファイル・関数命名規則

| 項目       | 規則                     | 例                             |
| ---------- | ------------------------ |-------------------------------|
| ファイル名 | 関数単位、関数名と同一   | `createUser.ts`               |
| 関数名     | アクション内容を表現     | `async function createUser()` |


### Server Component（Data Fetch）

#### 基本原則

データ取得は原則、最上位のPageComponentでService関数を呼び出すこと。取得したデータはPropsで子コンポーネントに渡す。

ただし、コンポーネントを分割した先でデータ取得しても構わない。コンポーネントの凝集度を上げるために、各コンポーネント自身が必要な情報を取得する設計は良い。

#### 例外的なパターン

ネストが深いコンポーネントで、ClientComponent境界に切り替わりデータ取得が必要な場合の対応。

- モーダルを開いたタイミングで最新のデータを取得したいケースなど
    - モーダルのケースであれば、Next.jsのParallel Routeを活用しても良い

| 状況                           | 対応方法          |
| ------------------------------ |---------------| 
| Client Componentでのデータ取得 | `fetch` などで処理 |

## エラーハンドリング

### 例外処理方針

エラー発生時は例外をスローし、呼び出し側でハンドリングすること。Result型は使用しない。

| レイヤー        | エラー時の動作        | 備考                           |
| --------------- | --------------------- | ------------------------ |
| Repository      | 例外をスロー          | エラーの詳細を例外に含める     |
| Service         | 例外をスロー          | ビジネスロジックエラーも例外化 |
| Server Actions  | `try...catch`で捕捉   | 適切なエラーメッセージを返却   |
| Server Component| `try...catch`で捕捉   | エラー画面への遷移など         |

- Result型で良い設計が構築できそうであればそうする（未定）

## コンポーネント設計

### ディレクトリ構成・ファイル命名

#### Colocationの原則

画面単位で関連ファイルを同一ディレクトリに配置すること。

| ファイル種別    | 配置場所               | 例外                                  |
| --------------- | ---------------------- | ------------------------------------- |
| Server Actions  | `_actions/`            | -                                     |
| ページ専用コンポーネント | `_components/`         | 複数画面共通の場合は`src/components/` |
| Repository      | `src/repositories/`    | 常にトップレベル配置                  |
| Service         | `src/services/`        | 常にトップレベル配置                  |

#### ファイル命名規則

| ファイル種別      | 命名規則          | 例               |
| ----------------- | ----------------- | ---------------- |
| 関数              | camelCase         | `createUser.ts`  |
| コンポーネント    | UpperCamelCase    | `UserList.tsx`   |

ファイル名は必ず関数名・コンポーネント名と一致させること。

#### コンポーネント分割方針

再レンダリング範囲を最小化するため、コンポーネントは小さく分割すること。ただし、保守性を損なわない意味のある単位を保つこと。

### Layout / Page Component

#### Props定義

Next.js v15.5のPage Props Helperを使用すること。SearchParamsはZodスキーマで定義し、パース後に使用すること。

```typescript
import { SearchParams } from 'next/dist/server/request/search-params';
import { z } from 'zod';

const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  sort: z.enum(['asc', 'desc']).default('asc'),
});

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = searchParamsSchema.parse(await searchParams);
  // ...
}
```

#### Server Component原則

Page Componentは必ずServer Componentとすること。Client化が必要な場合は、該当部分のみを別コンポーネントに切り出すこと。

### Client Component

#### 状態管理方針

クライアント側の状態管理は最小限にすること。状態管理ライブラリは導入しない。

| Hook            | 使用方針                 |
| --------------- |----------------------|
| `useState`      | 本当に必要か検討する / 必要なら使用可 |
| `useEffect`     | 本当に必要か検討する / 必要なら使用可 |
| `useRef`        | 本当に必要か検討する / 必要なら使用可 |

多くの場合、これらのHookを使わずに実装できる。複雑な状態管理は開発効率を低下させるため、必要性を慎重に判断すること。

### レイアウトコンポーネントパターン

#### 基本パターン

複数のサブコンポーネントで構成されるレイアウトは、ドット記法で階層を表現すること。

```tsx
<Card>
  <Card.Header>タイトル</Card.Header>
  <Card.Content>本文</Card.Content>
</Card>
```

#### 実装方法

TypeScriptのNamespace機能を使用し、IDEのコード移動サポートを活用すること。

```typescript
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

export namespace Card {
  export function Header({ children }: { children: React.ReactNode }) {
    return <div className="card-header">{children}</div>;
  }

  export function Content({ children }: { children: React.ReactNode }) {
    return <div className="card-content">{children}</div>;
  }
}
```

#### renderPropsについて

renderPropsパターンは許可するが、多用は避けること。基本はコンポーネント分割を優先する。

```tsx
// ❌ 避けるべきパターン
<Card
  title={<div>タイトル</div>}
  content={<div>本文</div>}
/>

// ✅ 推奨パターン
<Card>
  <Card.Header>タイトル</Card.Header>
  <Card.Content>本文</Card.Content>
</Card>
```

### スタイリング方針

#### 基本原則

スタイリングは共通UIコンポーネントに集約すること。

| 状況                     | 対応方法                           |
| ------------------------ | ---------------------------------- |
| 類似デザインの存在       | デザイナーと相談し統一する         |
| ページ固有のデザイン     | その場でスタイリング可能           |
| 共通UIの拡張             | 原則禁止（外部からのスタイル拡張は制御不能になる） |

#### 共通UIコンポーネントの設計

共通UIコンポーネントは拡張に対して閉じた設計とすること。外部から自由にスタイルを変更できる仕組みは避ける。

## 認証・認可

### チェック実施場所

認証・認可は複数のレイヤーで実施し、多層防御を実現すること。

| レイヤー          | 必須/任意 | 実施内容                     | 備考                       |
| ----------------- | --------- | ---------------------------- | -------------------------- |
| Page Component    | **必須**  | 認証・認可チェック           | Layout単独での制御は禁止   |
| Server Actions    | **必須**  | 認証・認可チェック           | -                          |
| Route Handler     | **必須**  | 認証・認可チェック           | -                          |
| Middleware        | 任意      | ログイン状態確認             | 補助的な位置付け           |

**重要:** Layoutでのセッション情報取得は許可するが、Layout単独での認可制御は禁止。必ずPageComponentでもチェックすること。

### 共通関数の提供

認証・認可ロジックの分散を防ぐため、汎用的な共通関数を提供すること。

```typescript
// 参考実装
// 認証済み確認
function requireLogin(): Promise<Session>

// 操作権限チェック
function hasPermission(params: {
  resource: string;
  action: string;
  session: Session;
}): Promise<boolean>
```

### Service層での認可について

認可チェックはEndpoint（Server Actions、Route Handler）で実施することを推奨する。

**理由:**
- Service層はバッチ処理などシステム間連携でも使用される
- ユーザーコンテキストを持たない呼び出しに対応しやすい
- Endpoint層で認可を管理する方が汎用性が高い

ドメイン的には認可は不変条件であり、Service層での実装も自然だが、現時点ではEndpoint層での管理を採用する。

## Next.js / React ベストプラクティス

### Client ComponentのPropsに余計なデータを渡さない

- Client ComponentのPropsはHTMLソースコード上に出力される
  - コンポーネント内部で使っていなくても問答無用で出力される
- セキュリティに悪影響がある
  - 秘匿情報がPropsに含まれていた場合、情報漏洩してしまう
- パフォーマンスに悪影響がある
  - Client Componentは原則SSRされるので、PropsのPayloadに加え、レンダリング済みのHTMLも配信される
  - つまりPropsが二重のデータとして配信されることになるので、無駄なネットワークと読み込み処理が発生する

#### 対策

- Propsには本当に必要なデータのみ渡す
  - DTO層を設けて、必要なデータだけを抽出する（この設計例だとRepositoryで定義しておく）
- Client Componentにする必要がなければしない
  - Client ComponentのChildrenにServer Componentを渡すテクニックなどを活用
  - e.g. `<ClientComponent><ServerComponent props={Data} /></ClientComponent>`
- Client Componentの表示の仕方を工夫する
  - いきなり全データを表示するのではなく、無限スクロールやページングなど遅延読込できる仕様にする 

### Parallel Routes / Intercept Routes

高度なルーティング機能だが、使用は慎重に判断すること。

#### メリット

- Parallel Routes: コンポーネントのネスト構造に依存せず、Server Componentとして独立させられる
  - モーダルなど複雑なUIで特に有効

#### デメリット

- ディレクトリ構造が複雑化
- `default.tsx`などの概念理解が困難
- チーム全体で理解する学習コストが高い

**推奨:** 効果が明確な場合のみ使用し、多用は避けること。

### useMemo / useCallback

- React Compilerが自動的に最適化するため、原則使用禁止とする
  - Next.js v16以降対応

#### 原則: 使用禁止

| 理由               | 説明                                         |
| ------------------ | -------------------------------------------- |
| 体感効果の低さ     | ほとんどのケースで体感パフォーマンスは変わらない |
| 複雑性の増加       | コードの可読性が下がる                       |

## Prisma

### $extendsの禁止

Prismaの`$extends`機能は使用しないこと。

| 項目       | 説明                                   |
| ---------- | -------------------------------------- |
| メリット   | モデルオブジェクト相当の表現が可能     |
| デメリット | 型推論の複雑化、PrismaClient管理の困難化 |
| 判断       | 本質的でない型パズルを避けるため禁止   |

## TypeScript コーディング規約

### 型定義方針

#### 型の明示

型推論に頼らず、型を明示的に記述すること。

| 対象           | 方針                                   | 例                                    |
| -------------- | -------------------------------------- | ------------------------------------- |
| 関数返り値     | **必須**                               | `function getUser(): User { ... }`    |
| 変数           | 明らかな場合は省略可                   | `const name = 'John'` ← 省略OK        |
| 複雑なオブジェクト | `satisfies`の使用を推奨              | `const config = { ... } satisfies Config` |

関数返り値の型明示は、意図しない型変更による不具合を防ぐため必須とする。

### 禁止パターン

#### classの禁止

`class`の使用は禁止する。

**理由:**
- 状態管理を誘発する
- ステートレスなWebアプリケーションでは有効性が限定的
- 関数ベースの設計を推奨

#### letの禁止

`let`の使用は禁止する。条件により異なる値を代入する場合は、関数に切り出して`const`で受ける。

```typescript
// ❌ 禁止
let value;
if (condition) {
  value = 'A';
} else {
  value = 'B';
}

// ✅ 推奨
const value = getValue(condition);

function getValue(condition: boolean): string {
  if (condition) {
    return 'A';
  }
  return 'B';
}
```

### Branded Typesについて

Branded Typesは採用しない。Prismaとの統一が困難なため、型安全性向上のメリットよりも複雑性増加のデメリットが大きいと判断する。

## テスト戦略

### 基本方針

**原則: モックは最小限にする**

実際のデータベースとデータを使用し、より実践的なテストを行うこと。

### レイヤー別テスト方針

#### Repository層

| 項目               | 方針                           |
| ------------------ | ------------------------------ |
| データベース       | 実際のDBを使用                 |
| 外部API            | MSWでモック                    |
| テスト重点         | クエリロジック、SQLの正確性    |

#### Service層

| 項目               | 方針                           |
| ------------------ | ------------------------------ |
| データベース       | 実際のDBを使用                 |
| Repository呼び出し | 実際の関数を呼び出す           |
| テスト重点         | ビジネスロジックの仕様表現、正常系・異常系 |
| テストケース範囲   | 主要シナリオに限定（細かすぎるケースは避ける） |

#### Server Actions

| 項目               | 方針                           |
| ------------------ | ------------------------------ |
| データベース       | 実際のDBを使用                 |
| テスト重点         | パラメータ検証、認証・認可、エラーハンドリング |
| テストケース範囲   | 主要シナリオに限定（細かすぎるケースは避ける） |

#### 通常のComponent

**現状:** テスト方針は検討中

E2Eテストでのカバーを検討しているが、E2Eテストケースの肥大化を避けたい。

#### 共通UIコンポーネント

| 項目                       | 方針                             |
| -------------------------- | -------------------------------- |
| Storybook                  | 提供必須                         |
| インタラクションテスト     | 複雑な場合のみ作成               |
| ビジュアルリグレッションテスト | 導入を推奨（デザイン変更の検知） |
