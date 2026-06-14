import { FormEvent, useEffect, useMemo, useState } from "react";

type Medium = "Threads" | "Substack" | "note" | "X" | "生配信" | "その他";
type Tension = "なし" | "少し" | "かなり";
type Revisit = "はい" | "どちらともいえない" | "いいえ";
type View = "list" | "form" | "detail" | "dashboard";

type InteractionLog = {
  id: string;
  date: string;
  name: string;
  medium: Medium;
  exchangeType: string;
  talkedAbout: string;
  memorableExchange: string;
  impression: string;
  learned: string;
  discovered: string;
  happyMoment: string;
  tension: Tension;
  revisit: Revisit;
  memo: string;
  createdAt: string;
};

type InteractionForm = Omit<InteractionLog, "id" | "createdAt">;

const STORAGE_KEY = "koryu-log-labo-entries";

const media: Medium[] = ["Threads", "Substack", "note", "X", "生配信", "その他"];
const tensions: Tension[] = ["なし", "少し", "かなり"];
const revisits: Revisit[] = ["はい", "どちらともいえない", "いいえ"];

const today = new Date().toISOString().slice(0, 10);

const emptyForm: InteractionForm = {
  date: today,
  name: "",
  medium: "Threads",
  exchangeType: "",
  talkedAbout: "",
  memorableExchange: "",
  impression: "",
  learned: "",
  discovered: "",
  happyMoment: "",
  tension: "なし",
  revisit: "どちらともいえない",
  memo: "",
};

const sampleEntries: InteractionLog[] = [
  {
    id: "sample-threads",
    date: today,
    name: "朝のコメントの人",
    medium: "Threads",
    exchangeType: "投稿へのコメントから短いやり取り",
    talkedAbout: "最近続けている発信と、気軽に残す記録について",
    memorableExchange: "短い返信だったけれど、こちらの言葉をちゃんと読んでくれた感じがした。",
    impression: "距離が近すぎないやさしさが心地よかった",
    learned: "小さな反応でも、続ける力になる",
    discovered: "同じテーマを見ている人が少しずつ増えている",
    happyMoment: "自分の投稿に自然な言葉で返してもらえたこと",
    tension: "少し",
    revisit: "はい",
    memo: "次に見かけたら、こちらからも軽く反応してみたい。",
    createdAt: new Date().toISOString(),
  },
];

function App() {
  const [entries, setEntries] = useState<InteractionLog[]>(() => loadEntries());
  const [form, setForm] = useState<InteractionForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const selectedEntry = entries.find((entry) => entry.id === selectedId) ?? null;

  const filteredEntries = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return entries;

    return entries.filter((entry) =>
      [entry.name, entry.medium, entry.memo].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [entries, query]);

  const dashboard = useMemo(() => buildDashboard(entries), [entries]);
  const isEditing = editingId !== null;

  function startNewEntry() {
    setEditingId(null);
    setSelectedId(null);
    setForm({ ...emptyForm, date: today });
    setView("form");
  }

  function startEditEntry(entry: InteractionLog) {
    const { id: _id, createdAt: _createdAt, ...editableValues } = entry;
    setEditingId(entry.id);
    setSelectedId(entry.id);
    setForm(editableValues);
    setView("form");
  }

  function submitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId) {
      setEntries((current) =>
        current.map((entry) => (entry.id === editingId ? { ...entry, ...form } : entry)),
      );
      setSelectedId(editingId);
      setEditingId(null);
      setView("detail");
      return;
    }

    const nextEntry: InteractionLog = {
      ...form,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setEntries((current) => [nextEntry, ...current]);
    setSelectedId(nextEntry.id);
    setForm({ ...emptyForm, date: today });
    setView("detail");
  }

  function cancelForm() {
    setForm({ ...emptyForm, date: today });
    setEditingId(null);
    setView(selectedId ? "detail" : "list");
  }

  function openDetail(id: string) {
    setSelectedId(id);
    setEditingId(null);
    setView("detail");
  }

  function deleteEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    setSelectedId(null);
    setEditingId(null);
    setView("list");
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">交流ログLabo</p>
          <h1>人とのつながりの変化を記録する交流ノート</h1>
          <p className="hero-text">
            Threads、Substack、生配信、noteなどで出会った人とのやり取りを、気持ちごと残しておけます。
          </p>
        </div>
        <div className="hero-note">
          <span>今月</span>
          <strong>{dashboard.thisMonthCount}件</strong>
          <small>ゆっくり積み重ね中</small>
        </div>
      </header>

      <nav className="tabs" aria-label="画面切り替え">
        <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
          一覧
        </button>
        <button className={view === "form" && !isEditing ? "active" : ""} onClick={startNewEntry}>
          記録する
        </button>
        <button
          className={view === "dashboard" ? "active" : ""}
          onClick={() => setView("dashboard")}
        >
          ダッシュボード
        </button>
      </nav>

      {view === "list" && (
        <section className="content-grid">
          <div className="panel list-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Log</p>
                <h2>交流一覧</h2>
              </div>
              <button className="primary-button" onClick={startNewEntry}>
                新しく記録
              </button>
            </div>

            <label className="search-box">
              <span>検索</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="名前・媒体・メモで検索"
              />
            </label>

            <div className="entry-list">
              {filteredEntries.map((entry) => (
                <article className="entry-card" key={entry.id}>
                  <button className="entry-main" onClick={() => openDetail(entry.id)}>
                    <span className="entry-date">{formatDate(entry.date)}</span>
                    <strong>{entry.name || "名前未入力"}</strong>
                    <span className="medium-pill">{entry.medium}</span>
                    <span className={`revisit revisit-${entry.revisit}`}>
                      また見たい: {entry.revisit}
                    </span>
                    <p>{shorten(entry.impression || entry.memo || "印象メモはまだありません。")}</p>
                  </button>
                  <div className="entry-actions">
                    <button className="ghost-button small-button" onClick={() => startEditEntry(entry)}>
                      編集
                    </button>
                  </div>
                </article>
              ))}
              {filteredEntries.length === 0 && (
                <p className="empty-state">条件に合う交流ログはありません。</p>
              )}
            </div>
          </div>

          <aside className="side-panel">
            <h2>今日の小さな観察</h2>
            <p>
              「また話したい」と思った理由や、少し緊張した場面を残しておくと、あとで関係の変化が見えやすくなります。
            </p>
            <dl>
              <div>
                <dt>記録数</dt>
                <dd>{entries.length}件</dd>
              </div>
              <div>
                <dt>また見に行きたい</dt>
                <dd>{dashboard.wantToRevisitCount}人</dd>
              </div>
            </dl>
          </aside>
        </section>
      )}

      {view === "form" && (
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{isEditing ? "Edit note" : "New note"}</p>
              <h2>{isEditing ? "交流を編集する" : "交流を記録する"}</h2>
            </div>
          </div>

          <form className="log-form" onSubmit={submitEntry}>
            <div className="form-row">
              <label>
                日付
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                  required
                />
              </label>
              <label>
                名前
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="ニックネームでもOK"
                  required
                />
              </label>
              <label>
                媒体
                <select
                  value={form.medium}
                  onChange={(event) => setForm({ ...form, medium: event.target.value as Medium })}
                >
                  {media.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <Field
              label="どのような交流だったか"
              value={form.exchangeType}
              onChange={(value) => setForm({ ...form, exchangeType: value })}
            />
            <Field
              label="何を話したか"
              value={form.talkedAbout}
              onChange={(value) => setForm({ ...form, talkedAbout: value })}
            />
            <Field
              label="コメント内容や印象的なやり取り"
              value={form.memorableExchange}
              onChange={(value) => setForm({ ...form, memorableExchange: value })}
            />
            <Field
              label="印象に残ったこと"
              value={form.impression}
              onChange={(value) => setForm({ ...form, impression: value })}
            />
            <Field
              label="学んだこと"
              value={form.learned}
              onChange={(value) => setForm({ ...form, learned: value })}
            />
            <Field
              label="新しく知ったこと"
              value={form.discovered}
              onChange={(value) => setForm({ ...form, discovered: value })}
            />
            <Field
              label="嬉しかったこと"
              value={form.happyMoment}
              onChange={(value) => setForm({ ...form, happyMoment: value })}
            />

            <div className="form-row compact">
              <label>
                緊張度
                <select
                  value={form.tension}
                  onChange={(event) => setForm({ ...form, tension: event.target.value as Tension })}
                >
                  {tensions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                また見に行きたいか
                <select
                  value={form.revisit}
                  onChange={(event) => setForm({ ...form, revisit: event.target.value as Revisit })}
                >
                  {revisits.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <Field
              label="メモ"
              value={form.memo}
              rows={5}
              onChange={(value) => setForm({ ...form, memo: value })}
            />

            <div className="form-actions">
              <button type="button" className="ghost-button" onClick={cancelForm}>
                戻る
              </button>
              <button className="primary-button" type="submit">
                {isEditing ? "更新する" : "保存する"}
              </button>
            </div>
          </form>
        </section>
      )}

      {view === "detail" && selectedEntry && (
        <section className="panel detail-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Detail</p>
              <h2>{selectedEntry.name}</h2>
            </div>
            <div className="detail-actions">
              <button className="ghost-button" onClick={() => startEditEntry(selectedEntry)}>
                編集
              </button>
              <button className="ghost-button" onClick={() => setView("list")}>
                一覧へ
              </button>
            </div>
          </div>

          <div className="detail-meta">
            <span>{formatDate(selectedEntry.date)}</span>
            <span>{selectedEntry.medium}</span>
            <span>緊張度: {selectedEntry.tension}</span>
            <span>また見たい: {selectedEntry.revisit}</span>
          </div>

          <div className="detail-grid">
            <DetailBlock title="どのような交流だったか" value={selectedEntry.exchangeType} />
            <DetailBlock title="何を話したか" value={selectedEntry.talkedAbout} />
            <DetailBlock title="コメント内容や印象的なやり取り" value={selectedEntry.memorableExchange} />
            <DetailBlock title="印象に残ったこと" value={selectedEntry.impression} />
            <DetailBlock title="学んだこと" value={selectedEntry.learned} />
            <DetailBlock title="新しく知ったこと" value={selectedEntry.discovered} />
            <DetailBlock title="嬉しかったこと" value={selectedEntry.happyMoment} />
            <DetailBlock title="メモ" value={selectedEntry.memo} wide />
          </div>

          <button className="danger-button" onClick={() => deleteEntry(selectedEntry.id)}>
            この記録を削除
          </button>
        </section>
      )}

      {view === "dashboard" && (
        <section className="dashboard">
          <div className="metric-grid">
            <MetricCard label="今月の交流件数" value={`${dashboard.thisMonthCount}件`} />
            <MetricCard label="また見に行きたい人数" value={`${dashboard.wantToRevisitCount}人`} />
            <MetricCard label="総記録数" value={`${entries.length}件`} />
          </div>

          <div className="chart-grid">
            <SummaryChart title="媒体別交流件数" data={dashboard.byMedium} />
            <SummaryChart title="緊張度の集計" data={dashboard.byTension} />
          </div>
        </section>
      )}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function DetailBlock({ title, value, wide = false }: { title: string; value: string; wide?: boolean }) {
  return (
    <article className={wide ? "detail-block wide" : "detail-block"}>
      <h3>{title}</h3>
      <p>{value || "未入力"}</p>
    </article>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function SummaryChart({ title, data }: { title: string; data: Record<string, number> }) {
  const max = Math.max(1, ...Object.values(data));

  return (
    <article className="panel chart-panel">
      <h2>{title}</h2>
      <div className="bar-list">
        {Object.entries(data).map(([label, count]) => (
          <div className="bar-row" key={label}>
            <span>{label}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function loadEntries(): InteractionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sampleEntries;
    const parsed = JSON.parse(raw) as InteractionLog[];
    return Array.isArray(parsed) ? parsed : sampleEntries;
  } catch {
    return sampleEntries;
  }
}

function buildDashboard(entries: InteractionLog[]) {
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return {
    thisMonthCount: entries.filter((entry) => entry.date.startsWith(monthPrefix)).length,
    wantToRevisitCount: entries.filter((entry) => entry.revisit === "はい").length,
    byMedium: countBy(media, entries, "medium"),
    byTension: countBy(tensions, entries, "tension"),
  };
}

function countBy<T extends string>(
  labels: T[],
  entries: InteractionLog[],
  key: "medium" | "tension",
): Record<T, number> {
  return labels.reduce(
    (summary, label) => {
      summary[label] = entries.filter((entry) => entry[key] === label).length;
      return summary;
    },
    {} as Record<T, number>,
  );
}

function formatDate(value: string) {
  if (!value) return "日付未入力";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function shorten(value: string) {
  return value.length > 54 ? `${value.slice(0, 54)}...` : value;
}

export default App;
