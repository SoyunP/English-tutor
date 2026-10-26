/* 대시보드 + 매일 숙제 (단어 암기 + 본문 문제 믹스)
 * 숙제는 날짜로 정해지고, 처음 열 때 문제를 저장해 두어 이후 데이터가 바뀌어도 그날 숙제는 그대로 유지된다.
 */
(function () {
  const START = "2026-10-19";
  const DEFAULT_EXAM = "2026-12-10";
  const EXAM_KEY = "englishlab.examDate";
  const HW_KEY = (date) => "englishlab.hw.v1." + date;
  const LESSONS = ["l5", "l6", "l7", "l8"];
  const CIRCLED = ["①", "②", "③", "④", "⑤"];
  const DOW = ["일", "월", "화", "수", "목", "금", "토"];
  const DATA = () => window.LESSON_DATA || {};

  /* ---------- 공통 ---------- */

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function richText(s) {
    return esc(s).replace(/&lt;u&gt;/g, "<u>").replace(/&lt;\/u&gt;/g, "</u>").replace(/\n/g, "<br/>");
  }

  function plain(s) {
    return String(s).replace(/<\/?u>/g, "");
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[“”"]/g, "")
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  const escRe = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /* ---------- 날짜 (Asia/Seoul) ---------- */

  function today() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  }
  function parse(d) {
    const [y, m, dd] = d.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, dd));
  }
  const fmt = (dt) => dt.toISOString().slice(0, 10);
  function addDays(d, n) {
    const x = parse(d);
    x.setUTCDate(x.getUTCDate() + n);
    return fmt(x);
  }
  const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  const dow = (d) => parse(d).getUTCDay();
  function label(d) {
    const [, m, dd] = d.split("-").map(Number);
    return `${m}월 ${dd}일 (${DOW[dow(d)]})`;
  }
  function longLabel(d) {
    const [y, m, dd] = d.split("-").map(Number);
    return `${y}년 ${m}월 ${dd}일 (${DOW[dow(d)]})`;
  }

  const examDate = () => localStorage.getItem(EXAM_KEY) || DEFAULT_EXAM;

  function schedule() {
    const end = addDays(examDate(), -1);
    const n = diffDays(START, end);
    const out = [];
    for (let i = 0; i <= n; i++) out.push(addDays(START, i));
    return out;
  }

  function planFor(d) {
    const w = dow(d);
    if (w >= 1 && w <= 4) return { type: "lesson", lesson: LESSONS[w - 1] };
    if (w === 6) return { type: "vocab" };
    return { type: "mix" };
  }

  function planLabel(p) {
    if (p.type === "lesson") {
      const x = DATA()[p.lesson];
      return x ? `Lesson ${x.lessonNo} · ${x.title}` : "";
    }
    return p.type === "vocab" ? "단어 집중 · Lesson 5–8" : "종합 복습 · Lesson 5–8";
  }

  /* ---------- 랜덤 (날짜로 고정) ---------- */

  function hash(s) {
    let h = 2166136261;
    for (const c of s) {
      h ^= c.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, r) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const pick = (arr, r) => arr[Math.floor(r() * arr.length)];

  /* ---------- 레슨 자료 ---------- */

  function splitSentences(text) {
    return String(text || "")
      .split(/\n\s*\n|\n/)
      .map((b) => b.trim())
      .filter(Boolean)
      .flatMap((b) => {
        const m = b.match(/^([A-Z][A-Za-z]{1,20}):\s+(.*)$/);
        return (m ? m[2] : b).split(/(?<=[.!?][”"’']?)\s+(?=[A-Z"“‘(])/);
      })
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function vocabOf(id) {
    const extra = (window.PASSAGE_EXTRA_WORDS || {})[id] || [];
    const seen = new Set();
    return [...(DATA()[id] ? DATA()[id].vocab : []), ...extra].filter((v) => {
      const k = v.word.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  const isPlainWord = (w) => /^[a-z][a-z' -]*[a-z]$/i.test(w);
  const sentencesOf = (id) => (DATA()[id] ? DATA()[id].paragraphs.flatMap((p) => splitSentences(p.en)) : []);

  /* ---------- 문제 만들기 ---------- */

  function qEn2Ko(id, r, used) {
    const pool = vocabOf(id).filter((v) => !used.has(v.word));
    const v = pick(pool, r);
    used.add(v.word);
    const others = shuffle(vocabOf(id).filter((x) => x.ko !== v.ko), r).slice(0, 4).map((x) => x.ko);
    const options = shuffle([v.ko, ...others], r);
    return {
      kind: "mcq", tag: "단어 뜻", lesson: id,
      prompt: "다음 단어의 뜻으로 가장 알맞은 것은?",
      quote: `${v.word}  (${v.pos})`,
      options, answer: options.indexOf(v.ko),
      explain: `${v.word}는 '${v.ko}'라는 뜻이에요. 예) ${v.ex} — ${v.exKo}`,
    };
  }

  function qKo2En(id, r, used) {
    const pool = vocabOf(id).filter((v) => isPlainWord(v.word) && !used.has(v.word));
    const v = pick(pool, r);
    used.add(v.word);
    return {
      kind: "short", tag: "단어 쓰기", lesson: id,
      prompt: "다음 뜻을 가진 영어 단어(표현)를 쓰시오.",
      quote: `${v.ko}  (${v.pos})`,
      accepted: [v.word],
      answerText: v.word,
      explain: `정답은 ${v.word}예요. 예) ${v.ex} — ${v.exKo}`,
    };
  }

  function qFill(id, r, used) {
    const sents = sentencesOf(id).filter((s) => s.split(/\s+/).length <= 22);
    const cands = [];
    vocabOf(id)
      .filter((v) => isPlainWord(v.word) && !used.has(v.word))
      .forEach((v) => {
        const re = new RegExp("\\b(" + [v.word, ...(v.forms || [])].map(escRe).join("|") + ")\\b", "i");
        sents.forEach((s) => {
          const m = s.match(re);
          if (m) cands.push({ v, s, m: m[1], re });
        });
      });
    if (!cands.length) return qEn2Ko(id, r, used);
    const c = pick(cands, r);
    used.add(c.v.word);
    const others = shuffle(vocabOf(id).filter((x) => isPlainWord(x.word) && x.word !== c.v.word), r).slice(0, 4).map((x) => x.word);
    const options = shuffle([c.v.word, ...others], r);
    return {
      kind: "mcq", tag: "본문 빈칸", lesson: id,
      prompt: "본문 문장의 빈칸에 들어갈 단어로 알맞은 것은? (기본형으로 고르시오)",
      quote: c.s.replace(c.re, "______"),
      options, answer: options.indexOf(c.v.word),
      explain: `빈칸에는 ${c.m}이(가) 들어가요. 기본형은 ${c.v.word}, 뜻은 '${c.v.ko}'예요.\n본문: ${c.s}`,
    };
  }

  function qBank(id, r, used) {
    const pool = (DATA()[id] ? DATA()[id].questions : []).filter((q) => q.type !== "short" && !used.has(id + q.id));
    const q = pick(pool, r);
    used.add(id + q.id);
    return {
      kind: "mcq", tag: "본문 이해", lesson: id,
      prompt: q.prompt, quote: q.quote, options: q.options, answer: q.answer, explain: q.explain,
    };
  }

  function qOrder(id, r, used) {
    const cands = sentencesOf(id).filter((s) => {
      const n = s.split(/\s+/).length;
      return n >= 5 && n <= 10 && !/["“”]/.test(s) && !used.has(s);
    });
    if (!cands.length) return qEn2Ko(id, r, used);
    const s = pick(cands, r);
    used.add(s);
    const words = s.replace(/[.!?]+$/, "").split(/\s+/);
    let items = shuffle(words, r);
    if (items.join(" ") === words.join(" ")) items = items.slice().reverse();
    return {
      kind: "order", tag: "문장 배열", lesson: id,
      prompt: "주어진 단어를 바르게 배열하여 본문 문장을 완성하시오.",
      items, answerText: s,
      explain: `본문 문장: ${s}`,
    };
  }

  function qCheck(id, r, used) {
    const items = (DATA()[id] && DATA()[id].understanding) || [];
    const pool = items.filter((it) => !used.has(it.q));
    if (!pool.length) return qEn2Ko(id, r, used);
    const it = pick(pool, r);
    used.add(it.q);
    return {
      kind: "check", tag: "이해 체크", lesson: id,
      prompt: "다음 질문에 영어로 답하시오.",
      quote: it.q, item: it,
      answerText: it.model,
      explain: `모범 답안: ${it.model}\n${it.ko}`,
    };
  }

  const MAKERS = { en2ko: qEn2Ko, ko2en: qKo2En, fill: qFill, bank: qBank, order: qOrder, check: qCheck };

  function generate(date) {
    const r = rng(hash("englishlab-" + date));
    const plan = planFor(date);
    const used = new Set();
    const recipe =
      plan.type === "vocab"
        ? ["en2ko", "en2ko", "en2ko", "en2ko", "ko2en", "ko2en", "ko2en", "fill", "fill", "fill"]
        : ["en2ko", "en2ko", "ko2en", "fill", "fill", "bank", "bank", "bank", "order", "check"];
    return recipe.map((k) => {
      const id = plan.type === "lesson" ? plan.lesson : pick(LESSONS, r);
      return MAKERS[k](id, r, used);
    });
  }

  /* ---------- 저장 / 채점 ---------- */

  function load(date) {
    try {
      return JSON.parse(localStorage.getItem(HW_KEY(date)) || "null");
    } catch (_) {
      return null;
    }
  }
  function save(date, st) {
    localStorage.setItem(HW_KEY(date), JSON.stringify(st));
  }
  function getState(date) {
    let st = load(date);
    if (!st || !Array.isArray(st.questions)) {
      st = { questions: generate(date), answers: {}, reasons: {}, submitted: false };
      save(date, st);
    }
    return st;
  }

  function isCorrect(q, a) {
    if (q.kind === "mcq") return a === q.answer;
    if (q.kind === "short") return q.accepted.some((x) => norm(x) === norm(a));
    if (q.kind === "order") return norm(a) === norm(q.answerText);
    if (q.kind === "check") return window.gradeUnderstanding ? window.gradeUnderstanding(q.item, a) : false;
    return false;
  }

  const hasAnswer = (q, a) => (q.kind === "mcq" ? a != null : String(a || "").trim().length > 0);

  function status(date) {
    const st = load(date);
    const t = today();
    if (date > t) return { key: "upcoming", text: "예정" };
    if (st && st.submitted) return { key: "done", text: `완료 · ${st.score}점` };
    if (st && Object.keys(st.answers || {}).length) return { key: "progress", text: "진행 중" };
    if (date === t) return { key: "today", text: "오늘" };
    return { key: "late", text: "밀린 숙제" };
  }

  /* ---------- 대시보드 ---------- */

  function stats() {
    const t = today();
    const all = schedule();
    const opened = all.filter((d) => d <= t);
    const done = all.filter((d) => (load(d) || {}).submitted);
    let streak = 0;
    let d = (load(t) || {}).submitted ? t : addDays(t, -1);
    while (d >= START && (load(d) || {}).submitted) {
      streak += 1;
      d = addDays(d, -1);
    }
    const last = done.map((x) => ({ d: x, st: load(x) })).sort((a, b) => (b.st.submittedAt || "").localeCompare(a.st.submittedAt || ""))[0];
    return { t, all, opened, done, streak, last };
  }

  function renderDashboard() {
    const root = document.getElementById("dash-root");
    if (!root) return;
    const s = stats();
    const dday = diffDays(s.t, examDate());
    const pct = s.opened.length ? Math.round((s.done.length / s.opened.length) * 100) : 0;
    const totalPct = s.all.length ? Math.round((s.done.length / s.all.length) * 100) : 0;
    const todayPlan = planFor(s.t);
    const todayStatus = status(s.t);
    const inRange = s.all.includes(s.t);

    const monday = addDays(s.t, -((dow(s.t) + 6) % 7));
    const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i)).filter((d) => s.all.includes(d));

    root.innerHTML = `
      <div class="hero">
        <p class="muted">${longLabel(s.t)}</p>
        <h1>안녕하세요, 기은 님</h1>
        <p>${inRange ? `오늘의 숙제: ${esc(planLabel(todayPlan))}` : "오늘은 숙제가 없어요."}</p>
      </div>

      <div class="dash-top">
        <div class="card dday-card">
          <div class="stat-label">기말고사까지</div>
          <div class="dday-value">${dday > 0 ? `D-${dday}` : dday === 0 ? "D-DAY" : `D+${-dday}`}</div>
          <div class="muted">${label(examDate())}</div>
          <details class="exam-edit">
            <summary>시험 날짜 바꾸기</summary>
            <input type="date" value="${examDate()}" onchange="HW.setExam(this.value)" />
          </details>
        </div>
        <div class="card progress-card">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
            <div class="stat-label">숙제 완료</div>
            <div class="muted">지금까지 열린 숙제 기준</div>
          </div>
          <div class="progress-value">${s.done.length} <span>/ ${s.opened.length}</span></div>
          <div class="pbar"><div style="width:${pct}%"></div></div>
          <div class="muted" style="margin-top:10px">기말까지 전체 ${s.all.length}일 중 ${s.done.length}일 완료 (${totalPct}%)</div>
          <div class="pbar thin"><div style="width:${totalPct}%"></div></div>
        </div>
      </div>

      <div class="stats" style="grid-template-columns:repeat(3,1fr)">
        <div class="card"><div class="stat-label">연속 학습</div><div class="stat-value">${s.streak}일</div></div>
        <div class="card"><div class="stat-label">최근 숙제 점수</div><div class="stat-value">${s.last ? s.last.st.score + "점" : "—"}</div></div>
        <div class="card"><div class="stat-label">밀린 숙제</div><div class="stat-value">${s.opened.filter((d) => !(load(d) || {}).submitted && d < s.t).length}개</div></div>
      </div>

      ${
        inRange
          ? `<div class="card today-card">
              <div>
                <div class="stat-label">오늘의 숙제 · ${label(s.t)}</div>
                <div class="today-title">${esc(planLabel(todayPlan))}</div>
                <div class="muted">단어 + 본문 문제 10개 · <span class="hw-badge ${todayStatus.key}">${todayStatus.text}</span></div>
              </div>
              <button class="btn" type="button" onclick="HW.openFromDash('${s.t}')">${todayStatus.key === "done" ? "결과 보기" : "숙제 풀기"}</button>
            </div>`
          : ""
      }

      <h2 class="section-title" style="margin-top:28px">이번 주 숙제</h2>
      ${week.map((d) => dayRow(d, true)).join("")}
      <button class="btn outline" type="button" style="margin-top:4px" onclick="showPanel('hw')">전체 숙제 일정 보기</button>

      <div class="grid-2" style="margin-top:32px">
        <div class="card">
          <h2>레슨 (Lessons)</h2>
          <p class="desc">본문 읽기 → 이해 체크 5문제 → 본문 이해 문제 → 단어 시험</p>
          <button class="btn outline" type="button" onclick="showPanel('learn')">레슨 열기</button>
        </div>
        <div class="card">
          <h2>단어 (Words)</h2>
          <p class="desc">Lesson 5–8 본문 단어 + 중1 기본 단어 · 플래시카드 / 리스트</p>
          <button class="btn outline" type="button" onclick="showPanel('words')">단어 연습</button>
        </div>
      </div>`;
  }

  function dayRow(d, fromDash) {
    const st = status(d);
    const p = planFor(d);
    const action =
      st.key === "upcoming"
        ? `<span class="chip">잠김</span>`
        : `<button class="btn ${st.key === "done" ? "outline" : ""}" type="button" style="height:38px" onclick="HW.${fromDash ? "openFromDash" : "open"}('${d}')">${st.key === "done" ? "결과" : "풀기"}</button>`;
    return `
      <div class="card day ${d === today() ? "is-today" : ""}">
        <div>
          <strong>${label(d)}</strong> <span class="hw-badge ${st.key}">${st.text}</span>
          <p class="muted" style="margin:6px 0 0">${esc(planLabel(p))}</p>
        </div>
        ${action}
      </div>`;
  }

  /* ---------- 숙제 탭 ---------- */

  let openDate = null;

  function renderHomework() {
    const root = document.getElementById("hw-root");
    if (!root) return;
    if (openDate) return renderDay(root, openDate);

    const s = stats();
    const pct = s.opened.length ? Math.round((s.done.length / s.opened.length) * 100) : 0;
    const weeks = [];
    s.all.forEach((d) => {
      const monday = addDays(d, -((dow(d) + 6) % 7));
      let w = weeks.find((x) => x.monday === monday);
      if (!w) weeks.push((w = { monday, days: [] }));
      w.days.push(d);
    });

    root.innerHTML = `
      <p class="muted">매일 단어 암기 + 본문 문제 10개 · ${label(START)}부터 기말 전날까지</p>
      <h1 class="brand" style="font-size:32px;margin:4px 0 12px">숙제 (Homeworks)</h1>
      <div class="card" style="margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <strong>숙제 완료 ${s.done.length} / ${s.opened.length}</strong>
          <span class="muted">월 L5 · 화 L6 · 수 L7 · 목 L8 · 금 종합 · 토 단어 집중 · 일 종합</span>
        </div>
        <div class="pbar" style="margin-top:10px"><div style="width:${pct}%"></div></div>
      </div>
      ${weeks
        .map((w, i) => {
          const done = w.days.filter((d) => (load(d) || {}).submitted).length;
          const isCurrent = w.days.includes(s.t) || (i === 0 && s.t < START);
          return `
          <details class="week" ${isCurrent ? "open" : ""}>
            <summary><strong>${i + 1}주차</strong> <span class="muted">${label(w.days[0])} ~ ${label(w.days[w.days.length - 1])}</span>
              <span class="week-count">${done}/${w.days.length}</span></summary>
            ${w.days.map((d) => dayRow(d, false)).join("")}
          </details>`;
        })
        .join("")}`;
  }

  function renderDay(root, date) {
    const st = getState(date);
    const qs = st.questions;
    const done = st.submitted;
    const answered = qs.filter((q, i) => hasAnswer(q, st.answers[i]) && String(st.reasons[i] || "").trim()).length;

    root.innerHTML = `
      <button class="btn outline" type="button" style="height:36px;margin-bottom:12px" onclick="HW.back()">← 숙제 목록</button>
      <p class="muted" style="margin:0">${label(date)}</p>
      <h1 class="brand" style="font-size:28px;margin:4px 0 12px">${esc(planLabel(planFor(date)))}</h1>
      ${
        done
          ? `<div class="card score-card" style="margin-bottom:16px">
              <div><div class="stat-label">점수</div><div class="stat-value">${st.score}점</div></div>
              <div><div class="stat-label">맞은 문제</div><div class="stat-value">${st.correct} / ${qs.length}</div></div>
              <div class="muted">제출: ${new Date(st.submittedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</div>
            </div>`
          : `<div class="card" style="margin-bottom:16px">
              <p class="desc" style="margin:0">제한 시간은 없어요. 쓰는 내용은 자동 저장돼요. 모든 문제에 답과 「왜 그렇게 생각하나요?」를 쓰면 제출할 수 있어요.</p>
              <div class="pbar" style="margin-top:10px"><div style="width:${Math.round((answered / qs.length) * 100)}%"></div></div>
              <p class="muted" style="margin:6px 0 0">${answered} / ${qs.length} 완료</p>
            </div>`
      }
      ${qs.map((q, i) => renderQ(q, i, st)).join("")}
      ${done ? "" : `<div id="hw-missing"></div><button class="btn" type="button" onclick="HW.submit()">제출하기</button>`}`;

    root.querySelectorAll("[data-opt]").forEach((el) =>
      el.addEventListener("click", () => {
        if (st.submitted) return;
        const i = Number(el.dataset.q);
        st.answers[i] = Number(el.dataset.opt);
        save(date, st);
        el.parentElement.querySelectorAll("[data-opt]").forEach((o) => o.classList.remove("selected"));
        el.classList.add("selected");
      })
    );
    root.querySelectorAll("[data-ans]").forEach((el) =>
      el.addEventListener("input", () => {
        st.answers[Number(el.dataset.ans)] = el.value;
        save(date, st);
      })
    );
    root.querySelectorAll("[data-reason]").forEach((el) =>
      el.addEventListener("input", () => {
        st.reasons[Number(el.dataset.reason)] = el.value;
        save(date, st);
      })
    );
    root.querySelectorAll("[data-chip]").forEach((el) =>
      el.addEventListener("click", () => {
        if (st.submitted) return;
        const i = Number(el.dataset.q);
        const input = root.querySelector(`[data-ans="${i}"]`);
        input.value = (input.value.trim() + " " + el.dataset.chip).trim();
        st.answers[i] = input.value;
        save(date, st);
      })
    );
    root.querySelectorAll("[data-clear]").forEach((el) =>
      el.addEventListener("click", () => {
        if (st.submitted) return;
        const i = Number(el.dataset.clear);
        root.querySelector(`[data-ans="${i}"]`).value = "";
        st.answers[i] = "";
        save(date, st);
      })
    );
  }

  function renderQ(q, i, st) {
    const a = st.answers[i];
    const reason = st.reasons[i] || "";
    const done = st.submitted;
    const ok = done && st.results && st.results[i];
    const lessonNo = DATA()[q.lesson] ? DATA()[q.lesson].lessonNo : "";

    let body = "";
    if (q.kind === "mcq") {
      body = `<div>${q.options
        .map(
          (opt, idx) => `<div class="option ${a === idx ? "selected" : ""} ${done && idx === q.answer ? "is-answer" : ""}" data-q="${i}" data-opt="${idx}">
            <strong>${CIRCLED[idx]}</strong> <span>${richText(opt)}</span></div>`
        )
        .join("")}</div>`;
    } else if (q.kind === "order") {
      body = `
        <div class="chips" style="margin-bottom:8px">${q.items
          .map((w) => `<button type="button" class="chip chip-btn" data-q="${i}" data-chip="${esc(w)}" ${done ? "disabled" : ""}>${esc(w)}</button>`)
          .join("")}</div>
        <input class="l5-short" data-ans="${i}" value="${esc(a || "")}" ${done ? "disabled" : ""} placeholder="단어를 순서대로 누르거나 직접 쓰세요." />
        ${done ? "" : `<button type="button" class="btn outline" style="height:34px;margin-top:8px" data-clear="${i}">지우기</button>`}`;
    } else {
      body = `<input class="l5-short" data-ans="${i}" value="${esc(a || "")}" ${done ? "disabled" : ""} placeholder="영어로 쓰세요." />`;
    }

    const myText = q.kind === "mcq" ? (a == null ? "(미응답)" : `${CIRCLED[a]} ${plain(q.options[a])}`) : a || "(미응답)";
    const rightText = q.kind === "mcq" ? `${CIRCLED[q.answer]} ${plain(q.options[q.answer])}` : q.answerText;

    return `
      <div class="card q-card ${done ? (ok ? "q-ok" : "q-ng") : ""}" id="hw-q-${i}" style="margin-bottom:16px">
        <p class="mini-label" style="margin-top:0"><span class="word-tag">Lesson ${lessonNo}</span> <span class="word-tag tag-kind">${esc(q.tag)}</span></p>
        <p class="q-title">${i + 1}. ${esc(q.prompt)}
          ${done ? `<span class="result-badge ${ok ? "ok" : "ng"}">${ok ? "정답" : "오답"}</span>` : ""}</p>
        ${q.quote ? `<div class="passage">${richText(q.quote)}</div>` : ""}
        ${body}
        <label for="hw-r-${i}">왜 그렇게 생각하나요?</label>
        <textarea id="hw-r-${i}" data-reason="${i}" ${done ? "disabled" : ""} placeholder="이 답을 선택한 이유를 자유롭게 설명해 보세요.">${esc(reason)}</textarea>
        <p class="help">정답이라고 생각한 이유나 문법적 근거를 적어보세요.</p>
        ${
          done
            ? `<div class="feedback ${ok ? "ok" : "ng"}">
                <div class="fb-grid">
                  <div><p class="mini-label">내가 선택한 답</p><p>${esc(myText)}</p></div>
                  <div><p class="mini-label">내가 생각한 이유</p><p>${esc(reason)}</p></div>
                </div>
                <p><strong>정답:</strong> ${esc(rightText)}</p>
                <p style="white-space:pre-line"><strong>${ok ? "해설" : "왜 틀렸을까요?"}</strong> ${esc(q.explain)}</p>
              </div>`
            : ""
        }
      </div>`;
  }

  function submit() {
    const date = openDate;
    const st = getState(date);
    const missing = st.questions
      .map((q, i) => ({ i, noA: !hasAnswer(q, st.answers[i]), noR: !String(st.reasons[i] || "").trim() }))
      .filter((m) => m.noA || m.noR);
    if (missing.length) {
      document.getElementById("hw-missing").innerHTML = `
        <div class="card missing-card">
          <strong>아직 끝나지 않은 문제가 있어요</strong>
          <ul>${missing
            .map((m) => `<li><a href="#hw-q-${m.i}">${m.i + 1}번</a> — ${[m.noA ? "답 없음" : "", m.noR ? "이유 없음" : ""].filter(Boolean).join(", ")}</li>`)
            .join("")}</ul>
        </div>`;
      return;
    }
    if (!confirm("제출하면 답과 이유를 고칠 수 없어요. 제출할까요?")) return;
    st.results = st.questions.map((q, i) => isCorrect(q, st.answers[i]));
    st.correct = st.results.filter(Boolean).length;
    st.score = Math.round((st.correct / st.questions.length) * 100);
    st.submitted = true;
    st.submittedAt = new Date().toISOString();
    save(date, st);
    renderHomework();
    renderDashboard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function open(date) {
    if (date > today()) return;
    openDate = date;
    renderHomework();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openFromDash(date) {
    if (typeof window.showPanel === "function") window.showPanel("hw");
    open(date);
  }

  function back() {
    openDate = null;
    renderHomework();
    renderDashboard();
  }

  function setExam(v) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || v <= START) return;
    localStorage.setItem(EXAM_KEY, v);
    renderDashboard();
    renderHomework();
  }

  window.HW = { open, openFromDash, back, submit, setExam, render: () => (renderDashboard(), renderHomework()) };

  document.addEventListener("DOMContentLoaded", () => {
    renderDashboard();
    renderHomework();
  });
})();
