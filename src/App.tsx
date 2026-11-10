import EditorModal, { type Editor } from "./EditorModal";
import { useEffect, useState } from "react";
import {
  Sun,
  CalendarDays,
  CheckCheck,
  Repeat2,
  BookOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Check,
  Pencil,
  Trash2,
  Clock3,
  Flame,
  Leaf,
} from "lucide-react";
import {
  dateKey,
  localDate,
  shift,
  occurs,
  scheduled,
  streak,
  initialData,
  type Data,
  type Event,
  type Task,
  type Routine,
} from "./domain";
import { repository } from "./storage";
const pages = [
  { name: "Bugün", icon: Sun },
  { name: "Takvim", icon: CalendarDays },
  { name: "Görevler", icon: CheckCheck },
  { name: "Rutinler", icon: Repeat2 },
  { name: "Günlük", icon: BookOpen },
];
const weekdays = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const prayers = ["Sabah", "Öğle", "İkindi", "Akşam", "Yatsı"];
const fmt = (day: string, options: Intl.DateTimeFormatOptions) =>
  localDate(day).toLocaleDateString("tr-TR", options);
export default function App() {
  const [load] = useState(() => {
    try {
      return { data: repository.load(), error: "" };
    } catch {
      return {
        data: initialData(),
        error:
          "Yerel veriler okunamadı. Kayıtlı verilerin üzerine yazılmaması için kayıt durduruldu.",
      };
    }
  });
  const [data, setData] = useState<Data>(load.data);
  const [error, setError] = useState(load.error);
  const [saved, setSaved] = useState(false);
  const [page, setPage] = useState("Bugün");
  const [day, setDay] = useState(dateKey());
  const [now, setNow] = useState(new Date());
  const today = dateKey(now);
  const [view, setView] = useState("Ay");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [quick, setQuick] = useState(false);
  const [filter, setFilter] = useState("Tümü");
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (load.error) return;
    setSaved(false);
    try {
      repository.save(data);
      setError("");
      setSaved(true);
    } catch {
      setError(
        "Veriler kaydedilemedi. Tarayıcının depolama iznini veya boş alanını kontrol edin.",
      );
    }
  }, [data, load.error]);
  const update = (fn: (d: Data) => Data) => setData(fn);
  const events = (key: string) =>
    data.events
      .filter((e) => occurs(e, key))
      .sort((a, b) => a.time.localeCompare(b.time));
  const todayEvents = events(today);
  const tasks = data.tasks.filter(
    (t) => t.due === today || (!t.done && !!t.due && t.due < today),
  );
  const routines = data.routines.filter((r) => scheduled(r, today));
  const next = todayEvents.find((e) => new Date(`${today}T${e.time}`) > now);
  const mins = next
    ? Math.ceil(
        (new Date(`${today}T${next.time}`).getTime() - now.getTime()) / 60000,
      )
    : 0;
  const toggleTask = (id: string) =>
    update((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  const toggleRoutine = (id: string) =>
    update((d) => ({
      ...d,
      routines: d.routines.map((r) =>
        r.id === id
          ? {
              ...r,
              completions: r.completions.includes(today)
                ? r.completions.filter((x) => x !== today)
                : [...r.completions, today],
            }
          : r,
      ),
    }));
  const remove = (kind: Editor["kind"], id: string) => {
    if (
      !window.confirm(
        "Bu kaydı silmek istiyor musunuz? Tekrarlayan etkinliklerin tüm tekrarları silinir.",
      )
    )
      return;
    update((d) => ({
      ...d,
      ...(kind === "event"
        ? { events: d.events.filter((e) => e.id !== id) }
        : kind === "task"
          ? { tasks: d.tasks.filter((t) => t.id !== id) }
          : { routines: d.routines.filter((r) => r.id !== id) }),
    }));
  };
  function taskRow(t: Task) {
    return (
      <div className="task-row" key={t.id}>
        <button
          className={"check " + (t.done ? "checked" : "")}
          aria-label={`${t.title} ${t.done ? "tamamlanmadı" : "tamamlandı"} işaretle`}
          onClick={() => toggleTask(t.id)}
        >
          {t.done && <Check size={13} />}
        </button>
        <div className="grow">
          <span className={t.done ? "done" : ""}>{t.title}</span>
          {t.description && page === "Görevler" && (
            <small>{t.description}</small>
          )}
          {t.due && (
            <small className={t.due < today && !t.done ? "overdue" : ""}>
              {t.due === today
                ? "Bugün"
                : fmt(t.due, { day: "numeric", month: "long" })}
            </small>
          )}
        </div>
        <button
          className="icon-btn row-action"
          aria-label={`${t.title} düzenle`}
          onClick={() => setEditor({ kind: "task", item: t })}
        >
          <Pencil size={14} />
        </button>
        {page === "Görevler" && (
          <button
            className="icon-btn"
            aria-label={`${t.title} sil`}
            onClick={() => remove("task", t.id)}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    );
  }
  function eventRow(e: Event) {
    return (
      <button
        key={e.id}
        className="event-row"
        onClick={() => setEditor({ kind: "event", item: e })}
      >
        <span className="event-time">
          {e.time}
          <small>{e.end}</small>
        </span>
        <span className="event-line" />
        <span className="grow">
          <strong>{e.title}</strong>
          <small>
            {e.repeat !== "none"
              ? e.repeat === "daily"
                ? "Her gün"
                : "Her hafta"
              : e.description || "Kişisel zaman"}
          </small>
        </span>
        <ArrowUpRight size={15} />
      </button>
    );
  }
  function routineRow(r: Routine) {
    const done = r.completions.includes(today);
    return (
      <div className="routine-row" key={r.id}>
        <button
          className={"routine-symbol " + (done ? "complete" : "")}
          aria-label={`${r.title} ${done ? "tamamlanmadı" : "tamamlandı"} işaretle`}
          onClick={() => toggleRoutine(r.id)}
        >
          {done ? <Check size={19} /> : <Leaf size={19} />}
        </button>
        <div className="grow">
          <strong>{r.title}</strong>
          <small>
            {r.frequency === "daily"
              ? "Her gün"
              : r.days.map((i) => weekdays[i]).join(", ")}{" "}
            · <Flame size={11} /> {streak(r, today)} gün
          </small>
        </div>
        {page === "Rutinler" ? (
          <>
            <button
              className="icon-btn"
              aria-label={`${r.title} düzenle`}
              onClick={() => setEditor({ kind: "routine", item: r })}
            >
              <Pencil size={15} />
            </button>
            <button
              className="icon-btn"
              aria-label={`${r.title} sil`}
              onClick={() => remove("routine", r.id)}
            >
              <Trash2 size={15} />
            </button>
          </>
        ) : (
          <span className={"status " + (done ? "green" : "")}>
            {done ? "Tamamlandı" : "Sıra sende"}
          </span>
        )}
      </div>
    );
  }
  const empty = (text: string) => <p className="empty">{text}</p>;
  function navigate(delta: number) {
    let d = localDate(day);
    if (view === "Yıl") d.setFullYear(d.getFullYear() + delta);
    else if (view === "Ay")
      d = new Date(d.getFullYear(), d.getMonth() + delta, 1, 12);
    else d.setDate(d.getDate() + delta * (view === "Hafta" ? 7 : 1));
    setDay(dateKey(d));
  }
  const weekStart = shift(day, -((localDate(day).getDay() + 6) % 7));
  const monthGrid = (key: string, compact = false) => {
    const d = localDate(key);
    const first = dateKey(new Date(d.getFullYear(), d.getMonth(), 1, 12));
    const start = shift(first, -((localDate(first).getDay() + 6) % 7));
    return (
      <div className={"month-grid " + (compact ? "compact" : "")}>
        {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((w) => (
          <div className="weekday" key={w}>
            {w}
          </div>
        ))}
        {Array.from({ length: 42 }, (_, i) => {
          const k = shift(start, i);
          const es = events(k);
          return (
            <button
              className={
                "day-cell " +
                (k === today ? "is-today " : "") +
                (k === day ? "selected " : "") +
                (localDate(k).getMonth() !== d.getMonth() ? "muted" : "")
              }
              key={k}
              onClick={() => {
                setDay(k);
                if (compact) setView("Gün");
              }}
            >
              <span>{localDate(k).getDate()}</span>
              {!compact &&
                es.slice(0, 2).map((e) => (
                  <small key={e.id}>
                    {e.time} {e.title}
                  </small>
                ))}
              {!compact && es.length > 2 && (
                <small>+{es.length - 2} etkinlik</small>
              )}
              {compact && es.length > 0 && <i />}
            </button>
          );
        })}
      </div>
    );
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            setPage("Bugün");
          }}
        >
          <span className="brand-mark">
            <Sun size={22} />
          </span>
          GÜN<span className="brand-dot">•</span>
        </a>
        <div className="workspace-label">KİŞİSEL ALANIN</div>
        <nav>
          {pages.map((p) => (
            <button
              key={p.name}
              className={page === p.name ? "active" : ""}
              onClick={() => {
                setPage(p.name);
                setQuick(false);
              }}
            >
              <p.icon size={19} />
              <span>{p.name}</span>
              {p.name === "Bugün" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="little-sun">
            <Sun size={24} />
          </div>
          <p>Her gün, yeni bir başlangıç.</p>
          <small>Kendi ritminde ilerle.</small>
        </div>
        <div className="profile">
          <span>G</span>
          <div>
            Kişisel alan<small>Yalnızca bu cihazda</small>
          </div>
          <span className="online-dot" />
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            <span className="mobile-brand">
              GÜN <Sun size={16} />
            </span>
            <span className="breadcrumb">
              Kişisel alan <ChevronRight size={13} /> <b>{page}</b>
            </span>
          </div>
          <span className="top-date">
            {fmt(today, { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <button
            className="primary compact-button"
            onClick={() => setQuick(!quick)}
          >
            <Plus size={16} />
            <span>Yeni kayıt</span>
          </button>
          {quick && (
            <div className="quick-menu">
              {[
                ["event", "Etkinlik"],
                ["task", "Görev"],
                ["routine", "Rutin"],
              ].map(([kind, label]) => (
                <button
                  key={kind}
                  onClick={() => {
                    setEditor({ kind: kind as Editor["kind"] });
                    setQuick(false);
                  }}
                >
                  <Plus size={15} />
                  {label} ekle
                </button>
              ))}
            </div>
          )}
        </header>
        <main>
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {page === "Bugün" ? "GÜNÜN SENİNLE BAŞLAR" : "KENDİ RİTMİNDE"}
              </div>
              <h1>
                {page === "Bugün"
                  ? "Bugün, güzel bir gün."
                  : page === "Takvim"
                    ? "Zamanına yer aç."
                    : page === "Görevler"
                      ? "Bir adım daha."
                      : page === "Rutinler"
                        ? "Küçük adımlar, iyi alışkanlıklar."
                        : "Kendine birkaç satır."}
              </h1>
              <p>
                {page === "Bugün"
                  ? `${fmt(today, { day: "numeric", month: "long" })}, ${fmt(today, { weekday: "long" })} · Acele etmeden, birer birer.`
                  : page === "Takvim"
                    ? "Planların bir arada, zihnin biraz daha özgür."
                    : page === "Görevler"
                      ? "Aklındakileri buraya bırak. Gerisini sırayla halledersin."
                      : page === "Rutinler"
                        ? "Her tekrar, kendine verdiğin küçük bir söz."
                        : "Günün nasıl geçti? Burada yalnızca sen varsın."}
              </p>
            </div>
            <span className="heading-sun">
              <Sun size={35} strokeWidth={1.2} />
            </span>
          </div>
          {page === "Bugün" && (
            <>
              <div className="overview-grid">
                <section className="next-card">
                  <div className="eyebrow">
                    <span className="live-dot" /> SIRADAKİ ETKİNLİK
                  </div>
                  <h2>{next?.title || "Kendine zaman ayır."}</h2>
                  <p>
                    <Clock3 size={15} />
                    {next
                      ? `${next.time} – ${next.end}`
                      : "Bugün yaklaşan bir etkinliğin yok."}
                  </p>
                  <div className="next-bottom">
                    <span>
                      {next
                        ? `${mins >= 60 ? `${Math.floor(mins / 60)} sa ` : ""}${mins % 60} dk sonra`
                        : "Günün geri kalanı senin"}
                    </span>
                    <button
                      aria-label="Takvimi aç"
                      onClick={() => setPage("Takvim")}
                    >
                      <ArrowUpRight size={19} />
                    </button>
                  </div>
                  <div className="card-orbit" />
                </section>
                <section className="summary-card">
                  <span className="eyebrow">BUGÜNÜN KÜÇÜK ADIMLARI</span>
                  <div className="summary-numbers">
                    <strong>
                      {tasks.filter((t) => t.done).length}
                      <span> / {tasks.length}</span>
                    </strong>
                    <CheckCheck size={27} strokeWidth={1.4} />
                  </div>
                  <p>görev tamamlandı</p>
                  <div className="progress-track">
                    <span
                      style={{
                        width: `${tasks.length ? (tasks.filter((t) => t.done).length / tasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <small>Her tamamlanan iş, biraz daha hafiflik.</small>
                </section>
              </div>
              <div className="today-columns">
                <div>
                  <section className="panel">
                    <div className="section-title">
                      <h2>
                        Günün akışı <span>{todayEvents.length}</span>
                      </h2>
                      <button
                        onClick={() => setEditor({ kind: "event" })}
                        aria-label="Etkinlik ekle"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {todayEvents.length
                      ? todayEvents.map(eventRow)
                      : empty(
                          "Bugün için bir plan yok. Biraz boşluk da güzeldir.",
                        )}
                    <button
                      className="text-link"
                      onClick={() => {
                        setPage("Takvim");
                        setDay(today);
                      }}
                    >
                      Takvime git <ArrowUpRight size={13} />
                    </button>
                  </section>
                  <section className="prayer-panel">
                    <div className="section-title">
                      <h2>Günün beş vakti</h2>
                      <span>{(data.prayers[today] || []).length}/5</span>
                    </div>
                    <div className="prayers">
                      {prayers.map((p, i) => (
                        <button
                          key={p}
                          className={
                            (data.prayers[today] || []).includes(p)
                              ? "prayed"
                              : ""
                          }
                          aria-pressed={(data.prayers[today] || []).includes(p)}
                          onClick={() =>
                            update((d) => {
                              const list = d.prayers[today] || [];
                              return {
                                ...d,
                                prayers: {
                                  ...d.prayers,
                                  [today]: list.includes(p)
                                    ? list.filter((v) => v !== p)
                                    : [...list, p],
                                },
                              };
                            })
                          }
                        >
                          <span>
                            {(data.prayers[today] || []).includes(p) ? (
                              <Check size={19} />
                            ) : (
                              <Sun
                                size={17}
                                strokeWidth={1.3}
                                style={{ transform: `rotate(${i * 30}deg)` }}
                              />
                            )}
                          </span>
                          {p}
                        </button>
                      ))}
                    </div>
                    <small>Güne kısa bir durak, kendine bir hatırlatma.</small>
                  </section>
                </div>
                <div>
                  <section className="panel">
                    <div className="section-title">
                      <h2>
                        Yapılacaklar{" "}
                        <span>{tasks.filter((t) => !t.done).length}</span>
                      </h2>
                      <button
                        aria-label="Görev ekle"
                        onClick={() => setEditor({ kind: "task" })}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {tasks.length
                      ? tasks.map(taskRow)
                      : empty("Bugünün görevleri tamam. Yeni bir nefes al.")}
                    <button
                      className="text-link"
                      onClick={() => setPage("Görevler")}
                    >
                      Tüm görevler <ArrowUpRight size={13} />
                    </button>
                  </section>
                  <section className="panel">
                    <div className="section-title">
                      <h2>Rutinlerin</h2>
                      <Repeat2 size={17} />
                    </div>
                    {routines.length
                      ? routines.map(routineRow)
                      : empty("Bugün için bir rutin yok.")}
                    <button
                      className="text-link"
                      onClick={() => setPage("Rutinler")}
                    >
                      Rutinlerine göz at <ArrowUpRight size={13} />
                    </button>
                  </section>
                  <button
                    className="journal-prompt"
                    onClick={() => {
                      setDay(today);
                      setPage("Günlük");
                    }}
                  >
                    <BookOpen size={21} />
                    <div>
                      <strong>Bugünden geriye ne kalsın?</strong>
                      <small>Günlüğüne birkaç satır bırak.</small>
                    </div>
                    <ArrowUpRight size={17} />
                  </button>
                </div>
              </div>
              <div className="day-footer">
                <span /> Bugün her şeye yetişmek zorunda değilsin. <span />
              </div>
            </>
          )}
          {page === "Takvim" && (
            <>
              <div className="calendar-toolbar">
                <div className="calendar-nav">
                  <button
                    className="icon-btn"
                    aria-label="Önceki dönem"
                    onClick={() => navigate(-1)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h2>
                    {fmt(
                      day,
                      view === "Gün"
                        ? { day: "numeric", month: "long", year: "numeric" }
                        : view === "Yıl"
                          ? { year: "numeric" }
                          : { month: "long", year: "numeric" },
                    )}
                  </h2>
                  <button
                    className="icon-btn"
                    aria-label="Sonraki dönem"
                    onClick={() => navigate(1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    className="subtle-button"
                    onClick={() => setDay(today)}
                  >
                    Bugün
                  </button>
                </div>
                <div className="segmented">
                  {["Gün", "Hafta", "Ay", "Yıl"].map((v) => (
                    <button
                      className={view === v ? "selected" : ""}
                      onClick={() => setView(v)}
                      key={v}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              {view === "Ay" && (
                <section className="calendar-panel">{monthGrid(day)}</section>
              )}
              {view === "Yıl" && (
                <div className="year-grid">
                  {Array.from({ length: 12 }, (_, i) => {
                    const key = dateKey(
                      new Date(localDate(day).getFullYear(), i, 1, 12),
                    );
                    return (
                      <section className="panel mini-month" key={i}>
                        <h3>{fmt(key, { month: "long" })}</h3>
                        {monthGrid(key, true)}
                      </section>
                    );
                  })}
                </div>
              )}
              {(view === "Hafta" || view === "Gün") && (
                <div className="schedule-scroll">
                  <div
                    className={"schedule " + (view === "Gün" ? "single" : "")}
                  >
                    <div className="schedule-head">
                      <span>Saat</span>
                      {Array.from(
                        { length: view === "Gün" ? 1 : 7 },
                        (_, i) => {
                          const k = view === "Gün" ? day : shift(weekStart, i);
                          return (
                            <strong
                              key={k}
                              className={k === today ? "green" : ""}
                            >
                              {fmt(k, { weekday: "short", day: "numeric" })}
                            </strong>
                          );
                        },
                      )}
                    </div>
                    <div className="schedule-body">
                      <div className="hour-labels">
                        {Array.from({ length: 24 }, (_, i) => (
                          <span key={i}>{String(i).padStart(2, "0")}:00</span>
                        ))}
                      </div>
                      {Array.from(
                        { length: view === "Gün" ? 1 : 7 },
                        (_, i) => {
                          const k = view === "Gün" ? day : shift(weekStart, i);
                          return (
                            <div className="schedule-day" key={k}>
                              {Array.from({ length: 24 }, (_, h) => (
                                <button
                                  aria-label={`${k} ${h}:00 etkinlik ekle`}
                                  className="hour-slot"
                                  key={h}
                                  onClick={() => {
                                    setDay(k);
                                    setEditor({
                                      kind: "event",
                                      item: {
                                        id: "",
                                        title: "",
                                        date: k,
                                        time: `${String(h).padStart(2, "0")}:00`,
                                        end: `${String(Math.min(h + 1, 23)).padStart(2, "0")}:30`,
                                        description: "",
                                        repeat: "none",
                                      },
                                    });
                                  }}
                                />
                              ))}
                              {events(k).map((e) => {
                                const [h, m] = e.time.split(":").map(Number);
                                const [eh, em] = e.end.split(":").map(Number);
                                return (
                                  <button
                                    key={e.id}
                                    className="schedule-event"
                                    style={{
                                      top: (h + m / 60) * 60,
                                      height: Math.max(
                                        28,
                                        (eh + em / 60 - h - m / 60) * 60,
                                      ),
                                    }}
                                    onClick={() =>
                                      setEditor({ kind: "event", item: e })
                                    }
                                  >
                                    <b>{e.title}</b>
                                    <small>
                                      {e.time}–{e.end}
                                    </small>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>
              )}
              {view === "Ay" && (
                <section className="panel selected-events">
                  <div className="section-title">
                    <h2>
                      {fmt(day, {
                        day: "numeric",
                        month: "long",
                        weekday: "long",
                      })}
                    </h2>
                    <button onClick={() => setEditor({ kind: "event" })}>
                      <Plus size={17} /> Etkinlik
                    </button>
                  </div>
                  {events(day).length
                    ? events(day).map(eventRow)
                    : empty("Bu gün için henüz bir etkinlik yok.")}
                </section>
              )}
            </>
          )}
          {page === "Görevler" && (
            <section className="panel full-panel">
              <div className="list-toolbar">
                <div className="segmented">
                  {["Tümü", "Bekleyen", "Tamamlanan"].map((f) => (
                    <button
                      key={f}
                      className={f === filter ? "selected" : ""}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button
                  className="primary"
                  onClick={() => setEditor({ kind: "task" })}
                >
                  <Plus size={16} /> Görev ekle
                </button>
              </div>
              {data.tasks
                .filter(
                  (t) =>
                    filter === "Tümü" ||
                    (filter === "Tamamlanan" ? t.done : !t.done),
                )
                .map(taskRow)}
              {!data.tasks.filter(
                (t) =>
                  filter === "Tümü" ||
                  (filter === "Tamamlanan" ? t.done : !t.done),
              ).length && empty("Burada henüz bir görev yok.")}
            </section>
          )}
          {page === "Rutinler" && (
            <section className="panel full-panel">
              <div className="section-title">
                <h2>İyi gelen alışkanlıkların</h2>
                <button
                  className="primary"
                  onClick={() => setEditor({ kind: "routine" })}
                >
                  <Plus size={16} /> Rutin ekle
                </button>
              </div>
              {data.routines.map(routineRow)}
              {!data.routines.length && empty("Küçük bir alışkanlıkla başla.")}
              <p className="routine-note">
                Tamamlama işaretleri bugün için kaydedilir. Devamlılık,
                planlanan günlerdeki ardışık tamamlamalarını gösterir.
              </p>
            </section>
          )}
          {page === "Günlük" && (
            <section className="panel journal-editor">
              <div className="journal-toolbar">
                <label className="date-label">
                  <CalendarDays size={16} />
                  <input
                    aria-label="Günlük tarihi"
                    type="date"
                    value={day}
                    required
                    onChange={(e) => e.target.value && setDay(e.target.value)}
                  />
                </label>
                <span className={error ? "overdue" : "green"}>
                  {error
                    ? "Kaydedilemedi"
                    : saved
                      ? "✓ Kaydedildi"
                      : "Kaydediliyor…"}
                </span>
              </div>
              <p className="eyebrow">
                {fmt(day, { weekday: "long" }).toLocaleUpperCase("tr-TR")}
              </p>
              <input
                aria-label="Günlük başlığı"
                className="journal-title"
                placeholder="Bugünün başlığı…"
                value={data.journals[day]?.title || ""}
                onChange={(e) =>
                  update((d) => ({
                    ...d,
                    journals: {
                      ...d.journals,
                      [day]: {
                        text: d.journals[day]?.text || "",
                        title: e.target.value,
                      },
                    },
                  }))
                }
              />
              <textarea
                aria-label="Günlük metni"
                placeholder="Aklından geçenler, iyi gelenler, hatırlamak istediklerin…"
                value={data.journals[day]?.text || ""}
                onChange={(e) =>
                  update((d) => ({
                    ...d,
                    journals: {
                      ...d.journals,
                      [day]: {
                        title: d.journals[day]?.title || "",
                        text: e.target.value,
                      },
                    },
                  }))
                }
              />
              <div className="journal-foot">
                Sadece senin için. Otomatik olarak bu tarayıcıya kaydedilir.
              </div>
            </section>
          )}
        </main>
        <footer className="app-footer">
          <span>
            GÜN <span>·</span> Hayatına biraz alan.
          </span>
          <span>
            <span className="online-dot" /> Verilerin bu cihazda saklanır
          </span>
        </footer>
      </div>
      <nav className="bottom-nav">
        {pages.map((p) => (
          <button
            className={page === p.name ? "active" : ""}
            key={p.name}
            onClick={() => setPage(p.name)}
          >
            <p.icon size={20} />
            <span>{p.name}</span>
          </button>
        ))}
      </nav>
      {editor && (
        <EditorModal
          editor={editor}
          day={page === "Bugün" ? today : day}
          onClose={() => setEditor(null)}
          onDelete={
            editor.item?.id
              ? () => {
                  remove(editor.kind, editor.item!.id);
                  setEditor(null);
                }
              : undefined
          }
          onSave={(item) => {
            update((d) => {
              if (editor.kind === "event") {
                const x = item as Event;
                return {
                  ...d,
                  events: [...d.events.filter((e) => e.id !== x.id), x],
                };
              }
              if (editor.kind === "task") {
                const x = item as Task;
                return {
                  ...d,
                  tasks: [...d.tasks.filter((e) => e.id !== x.id), x],
                };
              }
              const x = item as Routine;
              return {
                ...d,
                routines: [...d.routines.filter((e) => e.id !== x.id), x],
              };
            });
            setEditor(null);
          }}
        />
      )}
    </div>
  );
}
