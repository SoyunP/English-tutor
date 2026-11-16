/* 레슨 탭 화면: window.LESSON_DATA (preview-lesson5~8.js) 를 읽어서 그린다. */
(function () {
  const CIRCLED = ["①", "②", "③", "④", "⑤"];
  const ORDER = ["l5", "l6", "l7", "l8"];
  const DATA = window.LESSON_DATA || {};
  const ids = ORDER.filter((id) => DATA[id]);

  let currentId = localStorage.getItem("englishlab.currentLesson");
  if (!DATA[currentId]) currentId = ids[0];

  let paragraphs = [];
  let quiz = { answers: {}, reasons: {}, submitted: false };
  let wq = null;
  let vocabRegex = null;
  let showKo = localStorage.getItem("englishlab.showKo") === "1";
  let blankMode = false;
  let writeMode = false;
  let writeDrafts = {};
  let writeIndex = {};
  const STOP_WORDS = new Set(
    "a an the and or but to of in on at for with from by as is are was were be am do did does it its they them their we our you your he she his her i my this that these those not so if when than then also too can will just into over about up out".split(
      " "
    )
  );

  function toggleKo() {
    if (writeMode) {
      writeMode = false;
      renderPassage();
      return;
    }
    showKo = !showKo;
    if (!showKo) blankMode = false;
    localStorage.setItem("englishlab.showKo", showKo ? "1" : "0");
    renderPassage();
  }

  function toggleBlank() {
    if (writeMode) writeMode = false;
    blankMode = !blankMode;
    if (blankMode) {
      showKo = true;
      localStorage.setItem("englishlab.showKo", "1");
    }
    renderPassage();
  }

  function canWrite() {
    const no = Number(cur().lessonNo);
    return (no === 5 || no === 6 || no === 7) && paragraphs.some((p) => (p.koSents || []).some(Boolean));
  }

  function toggleWrite() {
    if (!canWrite()) return;
    writeMode = !writeMode;
    if (writeMode) blankMode = false;
    renderPassage();
  }

  const writeKey = () => cur().storageKey + ".enko.v1";

  function loadWrite() {
    try {
      writeDrafts = JSON.parse(localStorage.getItem(writeKey()) || "{}") || {};
    } catch (_) {
      writeDrafts = {};
    }
  }

  function saveWrite() {
    localStorage.setItem(writeKey(), JSON.stringify(writeDrafts));
  }

  /* 본문 문장과 한국말 해석을 같은 순서로 짝짓는다. */
  function rebuildWriteIndex() {
    writeIndex = {};
    let n = 0;
    paragraphs.forEach((p, pi) => {
      let si = 0;
      splitBlocks(p.en).forEach((block) => {
        block.sentences.forEach((s) => {
          const idx = si++;
          n += 1;
          writeIndex[pi + "-" + idx] = {
            n,
            pi,
            en: s,
            ko: (p.koSents || [])[idx] || "",
            speaker: block.speaker,
            title: p.title,
          };
        });
      });
    });
  }

  function canonEn(s) {
    const alias = { kg: "kilogram", kgs: "kilogram", kilogram: "kilogram", kilograms: "kilogram", liter: "liter", liters: "liter", litre: "liter", litres: "liter" };
    const fixed = {
      "i'm": "i am",
      "you're": "you are",
      "we're": "we are",
      "they're": "they are",
      "he's": "he is",
      "she's": "she is",
      "it's": "it is",
      "that's": "that is",
      "there's": "there is",
      "let's": "let us",
      "can't": "can not",
      "won't": "will not",
      cannot: "can not",
    };
    return String(s || "")
      .replace(/\[[^\]]*\]/g, " ")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, " ")
      .replace(/(\d),(\d)/g, "$1$2")
      .replace(/-/g, " ")
      .replace(/[^a-z0-9'\s\uac00-\ud7a3]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .flatMap((tok) => {
        const mapped = fixed[tok] || (tok.endsWith("n't") ? tok.slice(0, -3) + " not" : tok);
        return mapped.split(" ").map((w) => alias[w] || w);
      })
      .join(" ");
  }

  function tokenDistance(a, b) {
    const ta = a ? a.split(" ") : [];
    const tb = b ? b.split(" ") : [];
    const rows = ta.length + 1;
    const cols = tb.length + 1;
    const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
    for (let i = 0; i < rows; i++) dp[i][0] = i;
    for (let j = 0; j < cols; j++) dp[0][j] = j;
    for (let i = 1; i < rows; i++) {
      for (let j = 1; j < cols; j++) {
        const cost = ta[i - 1] === tb[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[ta.length][tb.length];
  }

  function gradeText(typed, answer) {
    const got = canonEn(typed);
    const want = canonEn(answer);
    if (!got) return "";
    if (got === want) return "ok";
    const dist = tokenDistance(got, want);
    const denom = Math.max(got.split(" ").length, want.split(" ").length, 1);
    return 1 - dist / denom >= 0.84 ? "close" : "ng";
  }

  function writeStats() {
    const keys = Object.keys(writeIndex);
    let ok = 0;
    let close = 0;
    keys.forEach((k) => {
      const d = writeDrafts[k];
      if (!d) return;
      if (d.status === "ok") ok += 1;
      else if (d.status === "close") close += 1;
    });
    return { total: keys.length, ok, close };
  }

  function scoreText() {
    const s = writeStats();
    return `맞음 ${s.ok} / ${s.total}문장${s.close ? ` · 거의 ${s.close}` : ""}`;
  }

  function feedbackHtml(item, draft) {
    if (!draft || (!draft.status && !draft.revealed)) return "";
    const showModel = draft.revealed || draft.status === "ok" || draft.status === "close";
    let html = "";
    if (draft.status === "close" && draft.text) {
      html += `<p class="write-mine"><span class="mini-label">내가 쓴 문장</span> ${esc(draft.text)}</p>`;
    }
    if (showModel) {
      html += `<p class="write-model"><span class="mini-label">본문</span> ${highlightVocab(item.en)}</p>`;
    } else if (draft.status === "ng") {
      html += `<p class="muted" style="margin:0">아직 본문과 달라요. 고친 뒤 다시 확인하거나 정답을 열어 보세요.</p>`;
    }
    return html;
  }

  function paintWriteCard(key) {
    const card = document.querySelector(`.write-card[data-key="${key}"]`);
    const item = writeIndex[key];
    if (!card || !item) return;
    const draft = writeDrafts[key] || {};
    card.dataset.status = draft.status || "";
    const badge = card.querySelector(".write-badge");
    badge.className = "write-badge" + (draft.status ? " " + draft.status : "");
    badge.textContent = draft.status === "ok" ? "맞았어요" : draft.status === "close" ? "거의 맞아요" : draft.status === "ng" ? "다시 확인해 보세요" : "";
    const reveal = card.querySelector(".write-reveal");
    if (reveal) reveal.textContent = draft.revealed ? "정답 숨기기" : "정답 보기";
    const box = card.querySelector(".write-feedback");
    if (box) box.innerHTML = feedbackHtml(item, draft);
  }

  function paintWriteScore() {
    const el = document.getElementById("write-score");
    if (el) el.textContent = scoreText();
  }

  function readWriteText(key) {
    const el = document.querySelector(`.write-input[data-key="${key}"]`);
    if (!writeDrafts[key]) writeDrafts[key] = {};
    if (el) writeDrafts[key].text = el.value;
    return writeDrafts[key].text || "";
  }

  function gradeWrite(key, keepFocus) {
    const item = writeIndex[key];
    if (!item) return;
    const text = readWriteText(key);
    if (!String(text).trim()) {
      writeDrafts[key].status = "";
      saveWrite();
      paintWriteCard(key);
      paintWriteScore();
      return;
    }
    writeDrafts[key].status = gradeText(text, item.en);
    saveWrite();
    paintWriteCard(key);
    paintWriteScore();
    if (!keepFocus && writeDrafts[key].status === "ok") {
      const keys = Object.keys(writeIndex);
      const nextKey = keys.slice(keys.indexOf(key) + 1).find((k) => {
        const node = document.querySelector(`.write-input[data-key="${k}"]`);
        return node && !node.value.trim();
      });
      const next = nextKey && document.querySelector(`.write-input[data-key="${nextKey}"]`);
      if (next) next.focus();
    }
  }

  function toggleReveal(key) {
    const item = writeIndex[key];
    if (!item) return;
    if (!writeDrafts[key]) writeDrafts[key] = {};
    readWriteText(key);
    writeDrafts[key].revealed = !writeDrafts[key].revealed;
    saveWrite();
    paintWriteCard(key);
  }

  function checkAllWrite() {
    Object.keys(writeIndex).forEach((key) => {
      if (!readWriteText(key).trim()) return;
      gradeWrite(key, true);
    });
  }

  function clearWrite() {
    const hasText = Object.keys(writeIndex).some((key) => readWriteText(key).trim());
    if (hasText && !window.confirm("적은 영어를 모두 지울까요?")) return;
    writeDrafts = {};
    saveWrite();
    renderPassage();
  }

  function renderWriteSheet() {
    rebuildWriteIndex();
    const d = cur();
    const cast = d.cast ? `<div class="book-cast">${d.cast.map((c) => `<span>${esc(c)}</span>`).join("")}</div>` : "";
    let lastPi = -1;
    const cards = Object.keys(writeIndex)
      .map((key) => {
        const it = writeIndex[key];
        const draft = writeDrafts[key] || {};
        const head = it.pi !== lastPi ? ((lastPi = it.pi), `<h3 class="write-para">${esc(it.title)}</h3>`) : "";
        const status = draft.status || "";
        const badge = status === "ok" ? "맞았어요" : status === "close" ? "거의 맞아요" : status === "ng" ? "다시 확인해 보세요" : "";
        return `${head}
          <div class="write-card" data-key="${key}" data-status="${status}">
            <p class="write-ko">${it.speaker ? `<span class="write-speaker">${esc(it.speaker)}</span>` : ""}<sup class="sn">${it.n}</sup>${esc(it.ko || "이 문장의 해석이 없어요.")}</p>
            <textarea class="write-input" data-key="${key}" rows="2" placeholder="이 한국말을 영어로 써 보세요">${esc(draft.text || "")}</textarea>
            <div class="write-actions">
              <button type="button" class="btn write-check" style="height:34px" data-key="${key}">확인</button>
              <button type="button" class="btn outline write-reveal" style="height:34px" data-key="${key}">${draft.revealed ? "정답 숨기기" : "정답 보기"}</button>
              <span class="write-badge ${status}">${badge}</span>
            </div>
            <div class="write-feedback">${feedbackHtml(it, draft)}</div>
          </div>`;
      })
      .join("");
    return `${cast}
      <div class="write-bar">
        <p class="write-score" id="write-score">${scoreText()}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button type="button" class="btn write-check-all" style="height:34px">모두 확인</button>
          <button type="button" class="btn outline write-clear" style="height:34px">입력 지우기</button>
        </div>
      </div>
      <div class="write-sheet">${cards}</div>`;
  }

  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function isVocabToken(word) {
    if (!vocabRegex) return false;
    const w = word.toLowerCase();
    vocabRegex.lastIndex = 0;
    const exact = vocabRegex.test(w);
    vocabRegex.lastIndex = 0;
    if (exact) return true;
    return cur().vocab.some((v) =>
      [v.word, ...(v.forms || [])].some((form) => {
        const head = String(form).toLowerCase().split(/\s+/)[0];
        return head.length >= 4 && (w.startsWith(head) || (w.length >= 4 && head.startsWith(w)));
      })
    );
  }

  function seededSample(arr, count, seed) {
    const a = arr.slice();
    let h = seed || 1;
    const rand = () => {
      h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
      return h / 4294967296;
    };
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    const chosen = a.slice(0, count);
    if (chosen.length === 2 && Math.abs(chosen[1].i - chosen[0].i) <= 2) {
      const alt = a.slice(count).find((w) => Math.abs(w.i - chosen[0].i) > 2);
      if (alt) chosen[1] = alt;
    }
    return chosen;
  }

  /* 문장에서 단어 1~2개를 빈칸으로. 본문 단어를 우선하고, 없으면 내용어를 고른다. */
  function blankedSentence(sentence) {
    const tokens = sentence.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*|\s+|[^A-Za-z\s]+/g) || [sentence];
    const words = [];
    tokens.forEach((tok, i) => {
      if (/^[A-Za-z]/.test(tok)) words.push({ i, tok });
    });
    const content = words.filter((w) => !STOP_WORDS.has(w.tok.toLowerCase()));
    const vocabWords = content.filter((w) => isVocabToken(w.tok));
    const base = content.length ? content : words;
    const count = Math.min(base.length, words.length >= 4 ? 2 : 1);
    const preferred = vocabWords.length ? vocabWords : base;
    const picked =
      preferred.length >= count
        ? seededSample(preferred, count, hashStr(sentence))
        : preferred.concat(seededSample(base.filter((w) => !preferred.some((p) => p.i === w.i)), count - preferred.length, hashStr(sentence)));
    const hide = new Set(picked.map((w) => w.i));
    return tokens
      .map((tok, i) => {
        if (!hide.has(i)) return highlightVocab(tok);
        const width = Math.max(2.4, tok.length * 0.62);
        return `<button type="button" class="word-blank" style="width:${width}em" data-answer="${esc(tok)}" aria-label="가려진 단어"></button>`;
      })
      .join("");
  }

  const cur = () => DATA[currentId];

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* Only allows <u> from trusted seed strings. */
  function richText(s) {
    return esc(s).replace(/&lt;u&gt;/g, "<u>").replace(/&lt;\/u&gt;/g, "</u>").replace(/\n/g, "<br/>");
  }

  function plain(s) {
    return String(s).replace(/<\/?u>/g, "");
  }

  function normalize(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, " ")
      .replace(/[.!?]+$/, "")
      .replace(/[.!?]+"$/, '"')
      .trim();
  }

  /* 본문 → 블록 배열 { speaker, sentences }. "Reporter: ..." 형태면 speaker를 분리한다. */
  function splitBlocks(text) {
    return String(text || "")
      .split(/\n\s*\n|\n/)
      .map((b) => b.trim())
      .filter(Boolean)
      .map((b) => {
        const m = b.match(/^([A-Z][A-Za-z]{1,20}):\s+(.*)$/);
        const body = m ? m[2] : b;
        return {
          speaker: m ? m[1] : "",
          sentences: body.split(/(?<=[.!?][”"’']?)\s+(?=[A-Z"“‘(])/).map((x) => x.trim()).filter(Boolean),
        };
      });
  }

  function splitSentences(text) {
    return splitBlocks(text).flatMap((b) => b.sentences);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---------- 저장 ---------- */

  const quizKey = () => cur().storageKey + ".comprehension.v1";

  function loadQuiz() {
    try {
      const q = JSON.parse(localStorage.getItem(quizKey()) || "null");
      if (q && q.answers) return q;
    } catch (_) {}
    return { answers: {}, reasons: {}, submitted: false };
  }

  function saveQuiz() {
    localStorage.setItem(quizKey(), JSON.stringify(quiz));
  }

  function buildVocabRegex() {
    const terms = cur()
      .vocab.flatMap((v) => [v.word, ...(v.forms || [])])
      .sort((a, b) => b.length - a.length)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    vocabRegex = new RegExp("\\b(" + terms.join("|") + ")\\b", "gi");
  }

  function highlightVocab(sentence) {
    return esc(sentence).replace(vocabRegex, '<mark class="vocab">$1</mark>');
  }

  /* ---------- 헤더 / 레슨 선택 ---------- */

  function renderHeader() {
    const d = cur();
    document.getElementById("lesson-kicker").textContent = `Lesson ${d.lessonNo} · ${d.lessonTitle} · Topic 3`;
    document.getElementById("lesson-title").textContent = d.title;
    document.getElementById("lesson-subtitle").textContent = d.titleKo;
    document.getElementById("lesson-picker").innerHTML = ids
      .map((id) => {
        const x = DATA[id];
        return `<button type="button" class="lesson-pill ${id === currentId ? "active" : ""}" onclick="L5.selectLesson('${id}')">
          <span class="pill-no">Lesson ${x.lessonNo}</span><span class="pill-title">${esc(x.title)}</span>
        </button>`;
      })
      .join("");
  }

  function selectLesson(id) {
    if (!DATA[id]) return;
    currentId = id;
    localStorage.setItem("englishlab.currentLesson", id);
    init();
    showSub("passage");
  }

  /* ---------- 본문 ---------- */

  function renderPassage() {
    const d = cur();
    if (writeMode && !canWrite()) writeMode = false;
    const writing = writeMode && canWrite();
    const glossOn = !writing && (showKo || blankMode);
    const hasText = paragraphs.some((p) => String(p.en || "").trim());
    let n = 0;
    const body = hasText
      ? paragraphs
          .map((p, pi) => {
            let si = 0;
            const blocks = splitBlocks(p.en)
              .map((block) => {
                const sents = block.sentences
                  .map((s) => {
                    const idx = si++;
                    n += 1;
                    const sent = `<span class="sent" data-p="${pi}" data-s="${idx}" tabindex="0"><sup class="sn">${n}</sup>${blankMode ? blankedSentence(s) : highlightVocab(s)}</span>`;
                    if (!glossOn) return sent;
                    const gloss = (p.koSents || [])[idx];
                    return `<span class="sent-pair">${sent}${gloss ? `<span class="sent-gloss">${esc(gloss)}</span>` : ""}</span>`;
                  })
                  .join(glossOn ? "" : " ");
                const glossed = glossOn ? " glossed" : "";
                return block.speaker
                  ? `<p class="book-para dialog${glossed}"><span class="speaker">${esc(block.speaker)}:</span> <span class="dialog-lines">${sents}</span></p>`
                  : `<p class="book-para${glossed}">${sents}</p>`;
              })
              .join("");
            const cast = pi === 0 && d.cast ? `<div class="book-cast">${d.cast.map((c) => `<span>${esc(c)}</span>`).join("")}</div>` : "";
            return blocks + cast;
          })
          .join("")
      : `<p class="book-empty">본문이 아직 없어요. 본문을 보내 주시면 여기에 들어가요.</p>`;

    const checks =
      hasText && d.bigQuestion
        ? `<div class="book-check">
            ${
              d.bigQuestion
                ? `<div class="big-q"><span class="big-q-tag">Big Question</span> ${esc(d.bigQuestion.q)}
                    <details><summary>예시 답안 보기</summary><p>${esc(d.bigQuestion.example)}</p></details></div>`
                : ""
            }
          </div>`
        : "";

    const hint = writing
      ? "한국말만 보고 같은 뜻의 영어 문장을 써 보세요. 확인을 누르면 본문과 비교해요."
      : blankMode
        ? "아래 한국말을 보고 가려진 영어를 떠올려 보세요. 빈칸을 누르면 답이 나와요."
        : `문장이나 <mark class="vocab">초록색 단어</mark>를 누르면 옆에 설명이 나와요.`;

    document.getElementById("l5-passage").innerHTML = `
      <div class="passage-toolbar">
        <p class="muted" style="margin:0">${hint}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn ${!writing && showKo ? "" : "outline"}" type="button" style="height:36px" onclick="L5.toggleKo()">${!writing && showKo ? "해석 숨기기" : "해석 보기"}</button>
          <button class="btn ${blankMode ? "" : "outline"}" type="button" style="height:36px" onclick="L5.toggleBlank()">${blankMode ? "빈칸 끄기" : "빈칸 연습"}</button>
          ${canWrite() ? `<button class="btn ${writing ? "" : "outline"}" type="button" style="height:36px" onclick="L5.toggleWrite()">${writing ? "영작 끄기" : "영작 연습"}</button>` : ""}
          <button class="btn outline" type="button" style="height:36px" onclick="L5.openOverview()">문법 · 단어 보기</button>
        </div>
      </div>
      <article class="book-page${writing ? " write-page" : ""}">
        <span class="book-tag">Topic 3</span>
        <h2 class="book-title">${esc(d.title)}</h2>
        ${writing ? renderWriteSheet() : body + checks}
      </article>`;
  }

  /* ---------- 옆 슬라이드 패널 ---------- */

  function textKey(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[^a-z0-9' -]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function findVocab(term) {
    const t = term.toLowerCase();
    return cur().vocab.find((v) => v.word.toLowerCase() === t || (v.forms || []).some((f) => f.toLowerCase() === t));
  }

  function vocabInSentence(sentence) {
    const seen = new Set();
    return (sentence.match(vocabRegex) || [])
      .map(findVocab)
      .filter((v) => v && !seen.has(v.word) && seen.add(v.word));
  }

  function grammarForSentence(sentence) {
    const key = textKey(sentence);
    return cur().grammar.filter((g) =>
      g.inText.some((frag) => {
        const pieces = frag.split("...").map(textKey).filter(Boolean);
        return pieces.length && pieces.every((piece) => key.includes(piece));
      })
    );
  }

  function analysisForSentence(sentence) {
    const key = textKey(sentence);
    return cur().analysis.filter((a) => {
      const aKey = textKey(a.parts.map((x) => x[0]).join(" "));
      return aKey && key.includes(aKey);
    });
  }

  function allSentences() {
    return paragraphs.flatMap((p, pi) => splitSentences(p.en).map((s, si) => ({ s, pi, si })));
  }

  function grammarCard(g, open) {
    return `
      <details class="grammar-card drawer-block" ${open ? "open" : ""}>
        <summary>${esc(g.title)}</summary>
        <p style="font-size:14px;line-height:1.7">${esc(g.body)}</p>
        ${
          g.examples.length
            ? g.examples.map((e) => `<div class="ex-box"><div class="ok">O ${esc(e.ok)}</div>${e.ng ? `<div class="ng">X ${esc(e.ng)}</div>` : ""}</div>`).join("")
            : ""
        }
        <p class="tip">${esc(g.tip)}</p>
      </details>`;
  }

  function analysisCard(a) {
    return `
      <div class="drawer-block">
        <div class="parse-row">${a.parts
          .map(([t, r]) => `<div class="parse-chunk"><div class="parse-text">${esc(t)}</div><div class="parse-role">${esc(r)}</div></div>`)
          .join("")}</div>
        <p style="font-size:14px;margin:10px 0 4px">${esc(a.ko)}</p>
        <p class="tip" style="margin:0">${esc(a.note)}</p>
      </div>`;
  }

  function wordChips(list) {
    return `<div class="chips">${list
      .map((v) => `<button type="button" class="chip chip-btn" data-word="${esc(v.word)}">${esc(v.word)} <span class="muted">${esc(v.ko)}</span></button>`)
      .join("")}</div>`;
  }

  function openDrawer(html) {
    document.getElementById("drawer-body").innerHTML = html;
    document.getElementById("drawer").classList.add("open");
    document.getElementById("drawer").setAttribute("aria-hidden", "false");
    document.getElementById("drawer-backdrop").classList.add("open");
    document.getElementById("drawer-body").scrollTop = 0;
  }

  function closeDrawer() {
    document.getElementById("drawer").classList.remove("open");
    document.getElementById("drawer").setAttribute("aria-hidden", "true");
    document.getElementById("drawer-backdrop").classList.remove("open");
    document.querySelectorAll(".sent.selected").forEach((el) => el.classList.remove("selected"));
  }

  function openSentence(pi, si) {
    const sentence = splitSentences(paragraphs[pi].en)[si];
    if (!sentence) return;
    document.querySelectorAll(".sent.selected").forEach((el) => el.classList.remove("selected"));
    const row = document.querySelector(`.sent[data-p="${pi}"][data-s="${si}"]`);
    if (row) row.classList.add("selected");

    const analyses = analysisForSentence(sentence);
    const grammars = grammarForSentence(sentence);
    const words = vocabInSentence(sentence);

    openDrawer(`
      <p class="mini-label" style="margin-top:0">${paragraphs.slice(0, pi).reduce((n, p) => n + splitSentences(p.en).length, 0) + si + 1}번 문장</p>
      <p class="drawer-sentence">${highlightVocab(sentence)}</p>
      ${analyses.length ? `<h3 class="drawer-h">문장 분석</h3>${analyses.map(analysisCard).join("")}` : ""}
      ${grammars.length ? `<h3 class="drawer-h">이 문장의 문법</h3>${grammars.map((g) => grammarCard(g, true)).join("")}` : ""}
      ${words.length ? `<h3 class="drawer-h">이 문장의 단어</h3>${wordChips(words)}` : ""}
      ${!analyses.length && !grammars.length && !words.length ? `<p class="muted">이 문장에는 따로 정리된 문법·단어가 없어요.</p>` : ""}
    `);
  }

  function openWord(term) {
    const v = findVocab(term);
    if (!v) return;
    const inText = allSentences().filter(({ s }) => new RegExp("\\b(" + [v.word, ...(v.forms || [])].map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\b", "i").test(s));
    openDrawer(`
      <p class="mini-label" style="margin-top:0">단어</p>
      <div style="display:flex;align-items:center;gap:10px">
        <p class="drawer-word">${esc(v.word)}</p>
        <button type="button" class="btn outline" style="height:34px;padding:0 12px" onclick="L5.speak('${esc(v.word).replace(/'/g, "\\'")}')">🔊 듣기</button>
      </div>
      <p class="muted" style="margin:0 0 8px">${esc(v.pos)}</p>
      <p class="drawer-meaning">${esc(v.ko)}</p>
      <div class="drawer-block">
        <p style="margin:0 0 4px">${esc(v.ex)}</p>
        <p class="muted" style="margin:0">${esc(v.exKo)}</p>
      </div>
      ${
        inText.length
          ? `<h3 class="drawer-h">본문 속 문장</h3>${inText
              .map(({ s, pi, si }) => `<button type="button" class="drawer-sent-link" data-p="${pi}" data-s="${si}">${highlightVocab(s)}</button>`)
              .join("")}`
          : ""
      }
    `);
  }

  function openOverview() {
    const d = cur();
    openDrawer(`
      <p class="mini-label" style="margin-top:0">Lesson ${d.lessonNo} · ${esc(d.title)}</p>
      <h3 class="drawer-h" style="margin-top:0">문단 요약</h3>
      ${d.paragraphs
        .filter((p) => p.summaryKo)
        .map((p) => `<div class="drawer-block"><p class="mini-label" style="margin-top:0">${esc(p.title)}</p><p style="margin:0;font-size:14px;line-height:1.7">${esc(p.summaryKo)}</p></div>`)
        .join("")}
      <h3 class="drawer-h">문법 포인트</h3>
      ${d.grammar.map((g) => grammarCard(g, false)).join("")}
      <h3 class="drawer-h">문장 분석</h3>
      ${d.analysis.map(analysisCard).join("")}
      <h3 class="drawer-h">단어 (${d.vocab.length}개)</h3>
      ${wordChips(d.vocab)}
      <button class="btn" type="button" style="margin-top:16px;width:100%" onclick="L5.closeDrawer();L5.showSub('quiz')">이 단어로 시험 보기</button>
    `);
  }

  function speak(word) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function bindPassageClicks() {
    const root = document.getElementById("l5-passage");
    root.addEventListener("input", (e) => {
      const input = e.target.closest(".write-input");
      if (!input) return;
      const key = input.dataset.key;
      if (!writeDrafts[key]) writeDrafts[key] = {};
      writeDrafts[key].text = input.value;
      if (writeDrafts[key].status) {
        writeDrafts[key].status = "";
        paintWriteCard(key);
        paintWriteScore();
      }
      saveWrite();
    });
    root.addEventListener("click", (e) => {
      const checkBtn = e.target.closest(".write-check");
      if (checkBtn) {
        gradeWrite(checkBtn.dataset.key);
        return;
      }
      const revealBtn = e.target.closest(".write-reveal");
      if (revealBtn) {
        toggleReveal(revealBtn.dataset.key);
        return;
      }
      if (e.target.closest(".write-check-all")) {
        checkAllWrite();
        return;
      }
      if (e.target.closest(".write-clear")) {
        clearWrite();
        return;
      }
      const blank = e.target.closest(".word-blank");
      if (blank) {
        e.preventDefault();
        e.stopPropagation();
        if (!blank.classList.contains("revealed")) {
          blank.classList.add("revealed");
          blank.style.width = "";
          blank.innerHTML = highlightVocab(blank.dataset.answer);
          blank.setAttribute("aria-label", blank.dataset.answer);
        }
        return;
      }
      const mark = e.target.closest("mark.vocab");
      if (mark && (mark.closest(".sent") || mark.closest(".write-feedback"))) {
        e.stopPropagation();
        openWord(mark.textContent);
        return;
      }
      const row = e.target.closest(".sent");
      if (row) openSentence(Number(row.dataset.p), Number(row.dataset.s));
    });
    root.addEventListener("keydown", (e) => {
      const writing = e.target.closest(".write-input");
      if (writing && e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        gradeWrite(writing.dataset.key);
        return;
      }
      if (e.target.closest(".word-blank") || writing) return;
      const row = e.target.closest(".sent");
      if (row && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        openSentence(Number(row.dataset.p), Number(row.dataset.s));
      }
    });

    const body = document.getElementById("drawer-body");
    body.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-word]");
      if (chip) return openWord(chip.dataset.word);
      const mark = e.target.closest("mark.vocab");
      if (mark && !e.target.closest(".drawer-sent-link")) return openWord(mark.textContent);
      const link = e.target.closest(".drawer-sent-link");
      if (link) openSentence(Number(link.dataset.p), Number(link.dataset.s));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrawer();
    });
  }

  /* ---------- 수업 이해 체크 (5문제) ---------- */

  const checkKey = () => cur().storageKey + ".understanding.v1";

  function loadChecks() {
    try {
      return JSON.parse(localStorage.getItem(checkKey()) || "{}") || {};
    } catch (_) {
      return {};
    }
  }

  function renderUnderstanding() {
    const root = document.getElementById("l5-check");
    const items = cur().understanding || [];
    const saved = loadChecks();
    const doneCount = items.filter((_, i) => saved[i] && saved[i].checked).length;

    root.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <p class="desc" style="margin:0">본문을 읽고 수업 내용을 잘 이해했는지 확인해요. 영어로 짧게 답을 쓰고 <strong>확인</strong>을 누르세요. (${doneCount} / ${items.length} 완료)</p>
      </div>
      ${items
        .map((it, i) => {
          const s = saved[i] || {};
          const ok = s.checked && window.gradeUnderstanding(it, s.answer);
          return `
          <div class="card q-card ${s.checked ? (ok ? "q-ok" : "q-ng") : ""}" style="margin-bottom:14px">
            <p class="q-title">Q${i + 1}. ${esc(it.q)}
              ${s.checked ? `<span class="result-badge ${ok ? "ok" : "ng"}">${ok ? "잘했어요" : "다시 확인"}</span>` : ""}</p>
            <input class="l5-short" data-check="${i}" value="${esc(s.answer || "")}" placeholder="영어로 답을 쓰세요." />
            <div style="display:flex;gap:8px;margin-top:10px">
              <button class="btn" type="button" style="height:38px" onclick="L5.checkAnswer(${i})">확인</button>
            </div>
            ${
              s.checked
                ? `<div class="feedback ${ok ? "ok" : "ng"}">
                    <p><strong>모범 답안:</strong> ${esc(it.model)}</p>
                    <p>${esc(it.ko)}</p>
                    ${ok ? "" : `<p class="muted" style="margin:0">핵심 단어가 빠졌는지 본문을 다시 보고 고쳐서 다시 확인해 보세요.</p>`}
                  </div>`
                : ""
            }
          </div>`;
        })
        .join("")}`;
  }

  function checkAnswer(i) {
    const input = document.querySelector(`[data-check="${i}"]`);
    const saved = loadChecks();
    saved[i] = { answer: input ? input.value : "", checked: true };
    localStorage.setItem(checkKey(), JSON.stringify(saved));
    renderUnderstanding();
  }

  /* ---------- 본문 이해 문제 ---------- */

  function isCorrect(q) {
    const a = quiz.answers[q.id];
    if (q.type === "short") return q.accepted.some((x) => normalize(x) === normalize(a));
    return a === q.answer;
  }

  function renderComprehension() {
    const root = document.getElementById("l5-comp");
    const qs = cur().questions;
    const total = qs.reduce((s, q) => s + q.points, 0);
    const earned = qs.reduce((s, q) => s + (quiz.submitted && isCorrect(q) ? q.points : 0), 0);
    const correctCount = qs.filter((q) => quiz.submitted && isCorrect(q)).length;

    root.innerHTML = `
      ${
        quiz.submitted
          ? `<div class="card score-card" style="margin-bottom:16px">
              <div><div class="stat-label">점수</div><div class="stat-value">${Math.round((earned / total) * 100)}점</div></div>
              <div><div class="stat-label">맞은 문제</div><div class="stat-value">${correctCount} / ${qs.length}</div></div>
              <button class="btn outline" type="button" onclick="L5.resetQuiz()">다시 풀기</button>
            </div>`
          : `<div class="card" style="margin-bottom:16px"><p class="desc" style="margin:0">모든 문제에 답과 「왜 그렇게 생각하나요?」를 쓴 뒤 <strong>제출하기</strong>를 누르세요. 쓰는 내용은 자동 저장돼요.</p></div>`
      }
      ${qs.map((q, i) => renderQuestion(q, i)).join("")}
      ${quiz.submitted ? "" : `<div id="l5-comp-missing"></div><button class="btn" type="button" style="margin-top:8px" onclick="L5.submitQuiz()">제출하기</button>`}`;

    root.querySelectorAll("[data-opt]").forEach((el) => {
      el.addEventListener("click", () => {
        if (quiz.submitted) return;
        quiz.answers[el.dataset.q] = Number(el.dataset.opt);
        saveQuiz();
        el.parentElement.querySelectorAll("[data-opt]").forEach((o) => o.classList.remove("selected"));
        el.classList.add("selected");
      });
    });
    root.querySelectorAll("[data-short]").forEach((el) => {
      el.addEventListener("input", () => {
        quiz.answers[el.dataset.short] = el.value;
        saveQuiz();
      });
    });
    root.querySelectorAll("[data-reason]").forEach((el) => {
      el.addEventListener("input", () => {
        quiz.reasons[el.dataset.reason] = el.value;
        saveQuiz();
      });
    });
  }

  function renderQuestion(q, i) {
    const a = quiz.answers[q.id];
    const reason = quiz.reasons[q.id] || "";
    const done = quiz.submitted;
    const ok = done && isCorrect(q);

    const answerUi =
      q.type === "short"
        ? `<input class="l5-short" data-short="${q.id}" value="${esc(a || "")}" ${done ? "disabled" : ""} placeholder="답을 영어로 쓰세요." />`
        : `<div>${q.options
            .map(
              (opt, idx) => `
          <div class="option ${a === idx ? "selected" : ""} ${done && idx === q.answer ? "is-answer" : ""}" data-q="${q.id}" data-opt="${idx}">
            <strong>${CIRCLED[idx]}</strong> <span>${richText(opt)}</span>
          </div>`
            )
            .join("")}</div>`;

    const myAnswerText = q.type === "short" ? a || "(미응답)" : a == null ? "(미응답)" : `${CIRCLED[a]} ${plain(q.options[a])}`;
    const correctText = q.type === "short" ? q.modelAnswer : `${CIRCLED[q.answer]} ${plain(q.options[q.answer])}`;

    return `
      <div class="card q-card ${done ? (ok ? "q-ok" : "q-ng") : ""}" id="l5-${q.id}" style="margin-bottom:16px">
        <p class="q-title">${i + 1}. ${esc(q.prompt)} <span class="muted">[${q.points}점]</span>
          ${done ? `<span class="result-badge ${ok ? "ok" : "ng"}">${ok ? "정답" : "오답"}</span>` : ""}</p>
        ${q.quote ? `<div class="passage">${richText(q.quote)}</div>` : ""}
        ${answerUi}
        <label for="r-${q.id}">왜 그렇게 생각하나요?</label>
        <textarea id="r-${q.id}" data-reason="${q.id}" ${done ? "disabled" : ""} placeholder="이 답을 선택한 이유를 자유롭게 설명해 보세요.">${esc(reason)}</textarea>
        <p class="help">정답이라고 생각한 이유나 문법적 근거를 적어보세요.</p>
        ${
          done
            ? `<div class="feedback ${ok ? "ok" : "ng"}">
                <div class="fb-grid">
                  <div><p class="mini-label">내가 선택한 답</p><p>${esc(myAnswerText)}</p></div>
                  <div><p class="mini-label">내가 생각한 이유</p><p>${esc(reason)}</p></div>
                </div>
                <p><strong>정답:</strong> ${esc(correctText)}</p>
                <p><strong>${ok ? "해설" : "왜 틀렸을까요?"}</strong> ${esc(q.explain)}</p>
              </div>`
            : ""
        }
      </div>`;
  }

  function submitQuiz() {
    const missing = cur()
      .questions.map((q, i) => {
        const a = quiz.answers[q.id];
        const noAnswer = q.type === "short" ? !String(a || "").trim() : a == null;
        const noReason = !String(quiz.reasons[q.id] || "").trim();
        return noAnswer || noReason ? { i, q, noAnswer, noReason } : null;
      })
      .filter(Boolean);

    if (missing.length) {
      document.getElementById("l5-comp-missing").innerHTML = `
        <div class="card missing-card">
          <strong>아직 끝나지 않은 문제가 있어요</strong>
          <ul>${missing
            .map(
              (m) =>
                `<li><a href="#l5-${m.q.id}">${m.i + 1}번</a> — ${[m.noAnswer ? "답 없음" : "", m.noReason ? "이유 없음" : ""].filter(Boolean).join(", ")}</li>`
            )
            .join("")}</ul>
        </div>`;
      return;
    }
    if (!confirm("제출하면 답과 이유를 고칠 수 없어요. 제출할까요?")) return;
    quiz.submitted = true;
    saveQuiz();
    renderComprehension();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetQuiz() {
    if (!confirm("답과 이유를 모두 지우고 다시 풀까요?")) return;
    quiz = { answers: {}, reasons: {}, submitted: false };
    saveQuiz();
    renderComprehension();
  }

  /* ---------- 단어 시험 ---------- */

  function startWordQuiz(mode, onlyWords) {
    const vocab = cur().vocab;
    const pool = shuffle(onlyWords && onlyWords.length ? onlyWords : vocab);
    const items = pool.slice(0, Math.min(10, pool.length)).map((w) => {
      if (mode === "en2ko") {
        const distractors = shuffle(vocab.filter((x) => x.word !== w.word)).slice(0, 4).map((x) => x.ko);
        return { w, options: shuffle([w.ko, ...distractors]) };
      }
      return { w };
    });
    wq = { mode, items, idx: 0, results: [] };
    renderWordQuiz();
  }

  function renderWordQuiz() {
    const root = document.getElementById("l5-quiz");
    const vocab = cur().vocab;

    if (!wq) {
      root.innerHTML = `
        <div class="card">
          <h2>단어 시험</h2>
          <p class="desc">이 본문에서 나온 단어 ${vocab.length}개 중 10개가 무작위로 나와요.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn" type="button" onclick="L5.startWordQuiz('en2ko')">영어 → 뜻 고르기</button>
            <button class="btn outline" type="button" onclick="L5.startWordQuiz('ko2en')">뜻 → 영어 쓰기</button>
          </div>
        </div>`;
      return;
    }

    if (wq.idx >= wq.items.length) {
      const right = wq.results.filter((r) => r.ok).length;
      const wrong = wq.results.filter((r) => !r.ok);
      root.innerHTML = `
        <div class="card score-card" style="margin-bottom:16px">
          <div><div class="stat-label">단어 시험 결과</div><div class="stat-value">${right} / ${wq.items.length}</div></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${wrong.length ? `<button class="btn" type="button" onclick="L5.retryWrong()">틀린 단어만 다시</button>` : ""}
            <button class="btn outline" type="button" onclick="L5.startWordQuiz('${wq.mode}')">새로 10문제</button>
            <button class="btn outline" type="button" onclick="L5.quizHome()">처음으로</button>
          </div>
        </div>
        <div class="card">
          ${wq.results
            .map(
              (r) => `
            <div class="word-row">
              <div class="word-en">${esc(r.w.word)}</div>
              <div class="word-pos"><span class="result-badge ${r.ok ? "ok" : "ng"}">${r.ok ? "정답" : "오답"}</span></div>
              <div>
                <div class="word-ko">${esc(r.w.ko)}</div>
                ${r.ok ? "" : `<div class="word-ex">내 답: ${esc(r.given || "(미응답)")}</div>`}
              </div>
            </div>`
            )
            .join("")}
        </div>`;
      return;
    }

    const item = wq.items[wq.idx];
    const head = `<p class="muted" style="text-align:center">${wq.idx + 1} / ${wq.items.length}</p>`;
    root.dataset.locked = "0";

    if (wq.mode === "en2ko") {
      root.innerHTML = `
        <div class="card" style="max-width:520px;margin:0 auto">
          ${head}
          <p class="flash-word" style="text-align:center;margin:8px 0 4px">${esc(item.w.word)}</p>
          <p class="muted" style="text-align:center;margin:0 0 16px">${esc(item.w.pos)} · 알맞은 뜻을 고르시오.</p>
          ${item.options.map((o, i) => `<div class="option" data-wopt="${i}"><strong>${CIRCLED[i]}</strong> <span>${esc(o)}</span></div>`).join("")}
          <div id="wq-feedback"></div>
        </div>`;
      root.querySelectorAll("[data-wopt]").forEach((el) => {
        el.addEventListener("click", () => {
          if (root.dataset.locked === "1") return;
          root.dataset.locked = "1";
          const chosen = item.options[Number(el.dataset.wopt)];
          const ok = chosen === item.w.ko;
          el.classList.add(ok ? "is-answer" : "is-wrong");
          root.querySelectorAll("[data-wopt]").forEach((o) => {
            if (item.options[Number(o.dataset.wopt)] === item.w.ko) o.classList.add("is-answer");
          });
          wq.results.push({ w: item.w, ok, given: chosen });
          showWordFeedback(ok, item.w);
        });
      });
    } else {
      root.innerHTML = `
        <div class="card" style="max-width:520px;margin:0 auto">
          ${head}
          <p style="text-align:center;font-size:22px;font-weight:600;margin:8px 0 4px">${esc(item.w.ko)}</p>
          <p class="muted" style="text-align:center;margin:0 0 16px">${esc(item.w.pos)} · 알맞은 영어 단어를 쓰시오.</p>
          <input id="wq-input" class="l5-short" placeholder="영어로 입력 후 Enter" autocomplete="off" />
          <button class="btn" type="button" style="margin-top:10px;width:100%" id="wq-check">확인</button>
          <div id="wq-feedback"></div>
        </div>`;
      const input = document.getElementById("wq-input");
      const check = () => {
        if (root.dataset.locked === "1") return;
        root.dataset.locked = "1";
        const given = input.value;
        const ok = normalize(given) === normalize(item.w.word);
        input.disabled = true;
        wq.results.push({ w: item.w, ok, given });
        showWordFeedback(ok, item.w);
      };
      document.getElementById("wq-check").addEventListener("click", check);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
      });
      input.focus();
    }
  }

  function showWordFeedback(ok, w) {
    document.getElementById("wq-feedback").innerHTML = `
      <div class="feedback ${ok ? "ok" : "ng"}" style="margin-top:12px">
        <p><strong>${ok ? "정답!" : "오답"}</strong> ${esc(w.word)} — ${esc(w.ko)}</p>
        <p class="muted" style="margin:0">${esc(w.ex)}<br/>${esc(w.exKo)}</p>
      </div>
      <button class="btn" type="button" style="margin-top:10px;width:100%" id="wq-next">다음</button>`;
    const next = document.getElementById("wq-next");
    next.addEventListener("click", () => {
      wq.idx += 1;
      renderWordQuiz();
    });
    next.focus();
  }

  function retryWrong() {
    startWordQuiz(
      wq.mode,
      wq.results.filter((r) => !r.ok).map((r) => r.w)
    );
  }

  function quizHome() {
    wq = null;
    renderWordQuiz();
  }

  /* ---------- 하위 탭 ---------- */

  function showSub(name) {
    document.querySelectorAll("[data-l5-sub]").forEach((b) => b.classList.toggle("active", b.dataset.l5Sub === name));
    document.querySelectorAll(".l5-sub").forEach((p) => p.classList.toggle("active", p.id === "l5-" + name));
    const learn = document.getElementById("learn");
    if (learn && !learn.classList.contains("active") && typeof window.showPanel === "function") window.showPanel("learn");
  }

  function init() {
    paragraphs = cur().paragraphs;
    loadWrite();
    quiz = loadQuiz();
    wq = null;
    buildVocabRegex();
    closeDrawer();
    renderHeader();
    renderPassage();
    renderUnderstanding();
    renderComprehension();
    renderWordQuiz();
  }

  window.L5 = {
    showSub,
    selectLesson,
    checkAnswer,
    toggleKo,
    toggleBlank,
    toggleWrite,
    openOverview,
    closeDrawer,
    speak,
    submitQuiz,
    resetQuiz,
    startWordQuiz,
    retryWrong,
    quizHome,
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (!ids.length) return;
    bindPassageClicks();
    init();
  });
})();
