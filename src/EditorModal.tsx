import { useEffect, useRef, useState, type FormEvent } from "react";
import { X, Trash2 } from "lucide-react";
import { localDate, type Event, type Task, type Routine } from "./domain";
export type Editor = {
  kind: "event" | "task" | "routine";
  item?: Event | Task | Routine;
};
const weekdays = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
export default function EditorModal({
  editor,
  day,
  onClose,
  onSave,
  onDelete,
}: {
  editor: Editor;
  day: string;
  onClose: () => void;
  onSave: (item: Event | Task | Routine) => void;
  onDelete?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const item = editor.item;
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(
    item && "description" in item ? item.description : "",
  );
  const [date, setDate] = useState(
    item && "date" in item ? item.date : item && "due" in item ? item.due : day,
  );
  const [time, setTime] = useState(
    item && "time" in item ? item.time : "09:00",
  );
  const [end, setEnd] = useState(item && "end" in item ? item.end : "10:00");
  const [repeat, setRepeat] = useState(
    item && "repeat" in item ? item.repeat : "none",
  );
  const [frequency, setFrequency] = useState<"daily" | "weekly">(
    item && "frequency" in item ? item.frequency : "daily",
  );
  const [days, setDays] = useState<number[]>(
    item && "days" in item ? item.days : [localDate(day).getDay()],
  );
  const [validation, setValidation] = useState("");
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setValidation("Bir başlık yazın.");
      return;
    }
    if (editor.kind === "event" && end <= time) {
      setValidation("Bitiş saati başlangıçtan sonra olmalı.");
      return;
    }
    if (editor.kind === "routine" && frequency === "weekly" && !days.length) {
      setValidation("En az bir gün seçin.");
      return;
    }
    const id = item?.id || crypto.randomUUID();
    if (editor.kind === "event")
      onSave({ id, title: title.trim(), description, date, time, end, repeat });
    else if (editor.kind === "task")
      onSave({
        id,
        title: title.trim(),
        description,
        due: date,
        done: item && "done" in item ? item.done : false,
      });
    else
      onSave({
        id,
        title: title.trim(),
        frequency,
        days,
        completions: item && "completions" in item ? item.completions : [],
      });
  }
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <form onSubmit={submit}>
        <div className="section-title">
          <h2>
            {item?.id
              ? "Düzenle"
              : editor.kind === "event"
                ? "Yeni etkinlik"
                : editor.kind === "task"
                  ? "Yeni görev"
                  : "Yeni rutin"}
          </h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Kapat"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>
        <label>
          Başlık
          <input
            autoFocus
            required
            maxLength={160}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Aklında ne var?"
          />
        </label>
        {editor.kind !== "routine" && (
          <>
            <label>
              Açıklama <span>isteğe bağlı</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label>
              {editor.kind === "task" ? "Son tarih (isteğe bağlı)" : "Tarih"}
              <input
                type="date"
                value={date}
                required={editor.kind === "event"}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </>
        )}
        {editor.kind === "event" && (
          <>
            <div className="form-columns">
              <label>
                Başlangıç
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </label>
              <label>
                Bitiş
                <input
                  type="time"
                  required
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
            </div>
            <label>
              Tekrar
              <select
                aria-label="Tekrar"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as Event["repeat"])}
              >
                <option value="none">Tekrarlanmaz</option>
                <option value="daily">Her gün</option>
                <option value="weekly">Her hafta aynı gün</option>
              </select>
            </label>
            {item?.id && repeat !== "none" && (
              <small>Tüm tekrarlar birlikte düzenlenir.</small>
            )}
          </>
        )}
        {editor.kind === "routine" && (
          <>
            <label>
              Sıklık
              <select
                aria-label="Sıklık"
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as Routine["frequency"])
                }
              >
                <option value="daily">Her gün</option>
                <option value="weekly">Haftanın belirli günleri</option>
              </select>
            </label>
            {frequency === "weekly" && (
              <div className="day-picker">
                {[1, 2, 3, 4, 5, 6, 0].map((i) => (
                  <button
                    type="button"
                    key={i}
                    aria-pressed={days.includes(i)}
                    className={days.includes(i) ? "selected" : ""}
                    onClick={() =>
                      setDays(
                        days.includes(i)
                          ? days.filter((x) => x !== i)
                          : [...days, i],
                      )
                    }
                  >
                    {weekdays[i]}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        {validation && (
          <p className="error" role="alert">
            {validation}
          </p>
        )}
        <div className="modal-actions">
          {onDelete && (
            <button className="danger-button" type="button" onClick={onDelete}>
              <Trash2 size={15} /> Sil
            </button>
          )}
          <button type="button" className="subtle-button" onClick={onClose}>
            Vazgeç
          </button>
          <button className="primary" type="submit">
            Kaydet
          </button>
        </div>
      </form>
    </dialog>
  );
}
