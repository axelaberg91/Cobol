/* Original code © 2026 axelaberg91. CC BY-NC 4.0; see LICENSE-original.md. */
"use strict";

(() => {
  const { chapters, puzzles, levels, variants } = window.GAME_CONTENT;
  const storageKey = "marias-mainframe-v1";
  const main = document.querySelector("#main");
  const modal = document.querySelector("#modal");
  let storageAvailable = true;
  const emptyProgress = () => ({ solved: [], current: 0, hints: {}, visits: [], difficulty: "normal", results: [] });
  let progress = emptyProgress();
  let selected = null;
  let feedback = null;
  let opener = null;
  let view = "home";

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.solved)) {
      progress.solved = [...new Set(saved.solved.filter(id => puzzles.some(p => p.id === id)))];
      progress.current = Number.isInteger(saved.current) && saved.current >= 0 && saved.current < puzzles.length ? saved.current : 0;
      progress.difficulty = levels.some(level => level.id === saved.difficulty) ? saved.difficulty : "normal";
      const validKeys = new Set(levels.flatMap(level => puzzles.map(p => `${level.id}:${p.id}`)));
      progress.results = Array.isArray(saved.results) ? [...new Set(saved.results.filter(key => validKeys.has(key)))] : progress.solved.map(id => `normal:${id}`);
      for (const p of puzzles) {
        for (const level of levels) {
          const key = `${level.id}:${p.id}`;
          const count = saved.hints?.[key] ?? (level.id === "normal" ? saved.hints?.[p.id] : undefined);
          if (Number.isInteger(count) && count >= 0 && count <= 3) progress.hints[key] = count;
        }
      }
      progress.visits = Array.isArray(saved.visits) ? saved.visits.filter(id => chapters.some(c => c.id === id)) : [];
    }
  } catch (error) { storageAvailable = error instanceof SyntaxError; }

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); }
    catch { storageAvailable = false; }
    const warning = document.querySelector("#save-warning");
    if (!storageAvailable && !warning) {
      const notice = document.createElement("p");
      notice.id = "save-warning";
      notice.className = "save-warning";
      notice.setAttribute("role", "status");
      notice.textContent = "Webbläsaren kan inte spara just nu. Framstegen finns kvar så länge sidan är öppen.";
      document.querySelector(".site-header").after(notice);
    }
  }
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const done = p => progress.solved.includes(p.id);
  const puzzleAt = index => ({ ...puzzles[index], ...(variants[progress.difficulty]?.[puzzles[index].id] || {}) });
  const puzzleKey = p => `${progress.difficulty}:${p.id}`;
  const doneAtLevel = p => progress.results.includes(puzzleKey(p));
  const firstUnsolved = () => puzzles.findIndex(p => !done(p));
  const chapterPuzzles = id => puzzles.filter(p => p.chapter === id);
  const scrollBehavior = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
  const chapterDone = id => chapterPuzzles(id).every(done);
  const unlocked = index => index === 0 || chapterDone(chapters[index - 1].id);
  const arrow = '<span aria-hidden="true">↗</span>';
  const icons = {
    terminal: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="6" width="30" height="23" rx="2"/><path d="m11 13 5 5-5 5m10 0h7M13 35h14m-7-6v6"/></svg>',
    tire: '<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="20" rx="13" ry="17"/><ellipse cx="20" cy="20" rx="5" ry="10"/><path d="m10 9 5 3m-8 6 6 1m-5 9 6-2m15-16-5 3m8 6-6 1m5 9-6-2"/></svg>',
    paper: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M9 4h22v32H9zM14 12h12m-12 6h12m-12 6h8m-8 6h12"/></svg>'
  };

  function headerLabel(text, extra = "") { return `<div class="eyebrow"><span class="tiny-square"></span>${text}${extra}</div>`; }
  function difficultySelector() {
    return `<div class="difficulty-picker"><div class="difficulty-heading"><span>SVÅRIGHETSGRAD</span><span>BYT NÄR DU VILL</span></div><div class="difficulty-options" role="group" aria-label="Svårighetsgrad">${levels.map(level => `<button data-action="difficulty" data-level="${level.id}" aria-pressed="${progress.difficulty === level.id}">${level.label}</button>`).join("")}</div><p>${levels.find(level => level.id === progress.difficulty).description}</p></div>`;
  }
  function navigate(nextView, focus = true) {
    view = nextView;
    if (nextView === "home") renderHome();
    if (nextView === "chapters") renderChapters();
    if (nextView === "game") renderGame();
    if (nextView === "complete") renderComplete();
    if (focus) { window.scrollTo({ top: 0, behavior: "instant" }); main.focus({ preventScroll: true }); }
    save();
  }

  function renderHome() {
    const finished = progress.solved.length === puzzles.length;
    const started = progress.solved.length > 0 || progress.visits.length > 0;
    main.innerHTML = `<section class="hero">
      <div class="hero-title">${headerLabel("ETT ÄVENTYR TILL DIG, MARIA")}<h1>MARIAS<br>STORDATOR<span class="cursor" aria-hidden="true">_</span></h1><div class="hero-company"><span></span>TP–DATA<span></span></div></div>
      <div class="hero-copy"><h2>Välkommen tillbaka, Maria.</h2>
        <p class="hero-lead">Kaffet är varmt. Dagens körningar väntar.</p>
        <p class="hero-description">Från TP-data till Trenton. En liten resa tillbaka till koden, kontoret och allt det där som sitter kvar i fingrarna.</p>
        ${difficultySelector()}
        <button class="button primary hero-cta" data-action="${finished ? "complete" : "continue"}">${finished ? "Visa din slutrapport" : started ? "Fortsätt arbetspasset" : "Börja arbetspasset"}${arrow}</button>
        <div class="hero-meta"><span>15 uppdrag · 3 nivåer</span><span>Ingen tidspress</span><span>Gratis ledtrådar</span></div>
      </div>
      <div class="hero-visual"><div class="photo-corner corner-top"></div><div class="photo-corner corner-bottom"></div><img class="office-art" src="assets/office.png" alt="Illustrerat retrokontor med en grön terminal, traktorpapper och kaffe." width="1536" height="1024"><div class="visual-label"><span><span class="tiny-square"></span> TERMINAL 01</span><span>OPERATÖR: MARIA</span></div><span class="desk-sticker">En körning i taget.<br><strong>Precis som förr.</strong></span></div>
    </section>
    <section class="journey-section" aria-labelledby="journey-title"><div class="section-heading"><div>${headerLabel("DIN RESA GENOM KODEN")}<h2 id="journey-title">Tre kapitel. Ett välbekant språk.</h2></div><button class="text-button" data-action="chapters">Visa arbetskön <span aria-hidden="true">→</span></button></div><div class="chapter-grid">${chapters.map(chapterCard).join("")}</div></section>
    <section class="archive-section"><article class="archive-paper"><div class="archive-year">1985</div><div><span class="archive-kicker">EN SIDA UR ARKIVET</span><h2>TP-data och datautbildningen.</h2><p>Personer från TP-Data medverkade som lärare vid datautbildning på PLM:s koncernkontor.</p><a href="https://lagen.nu/sou/1985:50" target="_blank" rel="noopener noreferrer">SOU 1985:50, bilaga 1, s. 185 ↗</a></div></article><div class="archive-aside"><span aria-hidden="true">☕</span><h2>COBOL, kaffe<br>och kontrollsummor.</h2><p>En körning i taget.<br>Precis som förr.</p></div></section>
    <section class="note-strip"><span class="note-symbol" aria-hidden="true">✳</span><p><strong>Lite rostig? Det hör till.</strong> ADB-handboken finns alltid nära. Ledtrådar kostar ingenting, och du kan ta en paus precis när du vill.</p><button data-action="handbook" class="text-button">Öppna handboken ${arrow}</button></section>`;
  }

  function chapterCard(c, index) {
    const count = chapterPuzzles(c.id).filter(done).length;
    const isOpen = unlocked(index);
    return `<button class="chapter-card ${c.color} ${!isOpen ? "locked" : ""}" data-action="chapter" data-chapter="${c.id}" ${!isOpen ? 'disabled aria-disabled="true"' : ""}><div class="card-top"><span class="chapter-number">KAPITEL ${c.number}</span><span class="chapter-icon">${icons[c.icon]}</span></div><span class="chapter-location">${c.location}</span><h3>${c.title}</h3><p>${c.description}</p><div class="card-bottom"><span>${chapterDone(c.id) ? "✓ Avklarat · Spela igen" : isOpen ? count ? `${count} av ${chapterPuzzles(c.id).length} klara` : c.label : `Öppnas efter kapitel ${chapters[index - 1].number}`}</span><span aria-hidden="true">${isOpen ? "↗" : "○"}</span></div></button>`;
  }
  function renderChapters() {
    main.innerHTML = `<section class="workspace-heading"><button class="back-link" data-action="home">← Till skrivbordet</button>${headerLabel("ARBETSKÖ / MARIA")}<h1>Dagens körningar.</h1><p>Välj ett kapitel. Dina godkända uppdrag finns kvar när du kommer tillbaka.</p><div class="overall-progress"><span>${progress.solved.length} AV ${puzzles.length} UPPDRAG KLARA</span><progress value="${progress.solved.length}" max="${puzzles.length}"></progress></div></section><div class="chapter-grid queue-grid">${chapters.map(chapterCard).join("")}</div>`;
  }

  function startPuzzle(index) {
    if (!Number.isInteger(index) || index < 0 || index >= puzzles.length) return;
    const c = chapters.findIndex(chapter => chapter.id === puzzles[index].chapter);
    if (!unlocked(c)) return;
    progress.current = index;
    selected = null;
    feedback = null;
    navigate("game");
    if (!progress.visits.includes(chapters[c].id)) {
      progress.visits.push(chapters[c].id);
      save();
      chapterIntro(chapters[c]);
    }
  }

  function renderGame() {
    const p = puzzleAt(progress.current);
    const c = chapters.find(chapter => chapter.id === p.chapter);
    const group = chapterPuzzles(c.id);
    const position = group.findIndex(job => job.id === p.id);
    const hintCount = progress.hints[puzzleKey(p)] || 0;
    main.innerHTML = `<div class="game-top"><button class="back-link" data-action="chapters">← Arbetskön</button><span class="game-chapter">${c.location} <span>/</span> KAPITEL ${c.number}</span><button class="text-button" data-action="handbook">ADB-handboken ${arrow}</button></div>
    <section class="game-layout"><aside class="game-sidebar">${headerLabel("KAPITEL " + c.number)}<h2>${c.title}</h2><p>${c.period}</p><ol class="job-list">${group.map((job, i) => `<li class="${job.id === p.id ? "active" : ""} ${done(job) ? "solved" : ""}"><button data-action="puzzle" data-index="${puzzles.indexOf(job)}" ${i > 0 && !done(group[i - 1]) && !done(job) ? "disabled" : ""} ${job.id === p.id ? 'aria-current="step"' : ""}><span class="job-indicator">${done(job) ? "✓" : String(i + 1).padStart(2, "0")}</span><span>${job.tag.split(" · ").pop()}</span></button></li>`).join("")}</ol><div class="sidebar-note">${icons.paper}<p>Ingen brådska.<br>En rad i taget räcker.</p></div></aside>
    <div class="puzzle-panel"><div class="terminal-heading"><span>DAGENS KÖRNING</span><span aria-hidden="true">● ● ●</span></div>${difficultySelector()}<div class="puzzle-meta"><span>${p.tag}</span><span>UPPDRAG ${String(position + 1).padStart(2, "0")} / ${String(group.length).padStart(2, "0")}</span></div><div class="mobile-progress" aria-label="${position + 1} av ${group.length}">${group.map(job => `<span class="${doneAtLevel(job) ? "done" : ""} ${job.id === p.id ? "current" : ""}"></span>`).join("")}</div><h1>${p.title}</h1><p class="puzzle-story">${p.story}</p>
    <div class="code-window"><div class="code-toolbar"><span><i></i> PROGRAMUTDRAG</span><span>COBOL</span></div><div class="data-label">WORKING-STORAGE SECTION.</div><pre class="declarations"><code>${escape(p.declarations)}</code></pre><div class="data-label procedure-label">PROCEDURE DIVISION.</div><pre class="program-code"><code>${p.code.split("\n").map((line, i) => `<span class="code-line"><span class="line-number" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><span>${escape(line)}</span></span>`).join("")}</code></pre></div>
    <fieldset class="answers" ${feedback?.correct ? "disabled" : ""}><legend>${p.question}</legend>${p.answers.map((answer, i) => `<label class="answer ${selected === i ? "selected" : ""} ${feedback?.correct && i === p.correct ? "correct" : ""}"><input type="radio" name="answer" value="${i}" ${selected === i ? "checked" : ""}><span class="answer-marker" aria-hidden="true">${feedback?.correct && i === p.correct ? "✓" : String.fromCharCode(65 + i)}</span><span class="answer-text ${answer.includes(".") ? "code-answer" : ""}">${escape(answer)}</span></label>`).join("")}</fieldset>
    <div id="feedback" ${feedback ? 'tabindex="-1"' : ""}>${feedbackMarkup(p)}</div><div class="puzzle-actions">${feedback?.correct ? `<button class="button primary" data-action="next">${position === group.length - 1 ? progress.current === puzzles.length - 1 ? "Visa slutrapporten" : "Avsluta kapitlet" : "Nästa uppdrag"}<span aria-hidden="true">→</span></button>` : `<button class="button primary" data-action="check" ${selected === null ? "disabled" : ""}>Kontrollera svaret <span aria-hidden="true">↵</span></button>`}<button class="button hint-button" data-action="hint" ${hintCount >= 3 ? "disabled" : ""}>${hintCount ? hintCount >= 3 ? "Alla ledtrådar visas" : "En ledtråd till" : "Visa en ledtråd"}<span aria-hidden="true">${hintCount}/3</span></button></div>
    ${hintCount ? `<aside class="hint-panel" aria-labelledby="hint-heading"><div class="hint-heading"><h2 id="hint-heading">En liten påminnelse</h2><span>${hintCount} / 3</span></div><ol>${p.hints.slice(0, hintCount).map(hint => `<li>${hint}</li>`).join("")}</ol></aside>` : ""}<p class="save-label">${storageAvailable ? "✓ Framsteg sparas på den här enheten" : "Framsteg kan inte sparas i den här webbläsaren"}</p></div></section>`;
  }
  function feedbackMarkup(p) {
    if (!feedback) return "";
    return feedback.correct ? `<section class="feedback success" role="status"><span class="feedback-icon" aria-hidden="true">✓</span><div><h2>Körningen godkänd!</h2><p>${p.explanation}</p><p class="feedback-note">${p.note}</p></div></section>` : '<section class="feedback retry" role="status"><span class="feedback-icon" aria-hidden="true">↻</span><div><h2>Inte riktigt ännu.</h2><p>Följ värdena en rad i taget. Du kan prova igen eller ta en ledtråd.</p></div></section>';
  }
  function checkAnswer() {
    if (selected === null || feedback?.correct) return;
    const p = puzzleAt(progress.current);
    feedback = { correct: selected === p.correct };
    if (feedback.correct && !done(p)) progress.solved.push(p.id);
    if (feedback.correct && !doneAtLevel(p)) progress.results.push(puzzleKey(p));
    save(); renderGame();
    document.querySelector("#feedback").focus({ preventScroll: true });
    document.querySelector("#feedback").scrollIntoView({ behavior: scrollBehavior(), block: "nearest" });
  }
  function showHint() {
    const p = puzzleAt(progress.current);
    const count = progress.hints[puzzleKey(p)] || 0;
    if (count >= 3) return;
    progress.hints[puzzleKey(p)] = count + 1;
    save(); renderGame();
    document.querySelector("#announcer").textContent = `Ledtråd ${count + 1}: ${p.hints[count]}`;
    const target = document.querySelector(".hint-panel");
    target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: scrollBehavior(), block: "nearest" });
  }
  function nextPuzzle() {
    if (!feedback?.correct) return;
    const index = progress.current;
    const c = chapters.find(chapter => chapter.id === puzzles[index].chapter);
    if (index === puzzles.length - 1) { navigate("complete"); return; }
    if (puzzles[index + 1].chapter !== c.id) {
      navigate("chapters");
      const next = chapters.find(chapter => chapter.id === puzzles[index + 1].chapter);
      showModal("Kapitlet godkänt.", `<div class="stamp">KÖRNING KLAR ✓</div><p>Alla uppdrag i <strong>${c.title}</strong> är klara. Ta en kaffepaus, eller fortsätt till nästa kapitel.</p><div class="next-chapter-label">NÄSTA KAPITEL</div><h3>${next.title}</h3><button class="button primary" data-action="start-next" data-index="${index + 1}">Till nästa kapitel ${arrow}</button><button class="button secondary" data-action="close-modal">Paus vid skrivbordet</button>`);
    } else startPuzzle(index + 1);
  }

  function showModal(title, body) {
    if (!modal.open) opener = document.activeElement;
    document.querySelector("#modal-content").innerHTML = `<button class="modal-close icon-button" data-action="close-modal" aria-label="Stäng">×</button>${headerLabel("MARIAS STORDATOR")}<h2 id="modal-title">${title}</h2>${body}`;
    if (!modal.open) modal.showModal();
    modal.querySelector(".modal-close").focus();
  }
  function closeModal() { modal.close(); }
  modal.addEventListener("close", () => { if (opener?.isConnected) opener.focus(); else main.focus(); });
  modal.addEventListener("click", event => { if (event.target === modal) { const rect = modal.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeModal(); } });
  function chapterIntro(c) {
    showModal(c.title, `<div class="intro-location">${c.location}</div><p>${c.intro}</p>${c.id === "trenton" ? '<p class="historical-note">Maria vistades i Trenton enligt familjens berättelse. Kopplingen till Goodall är sannolik men inte oberoende bekräftad. Uppdragen är påhittade.</p>' : ""}<button class="button primary" data-action="close-modal">Till terminalen ${arrow}</button>`);
  }
  function handbook() {
    showModal("ADB-handboken", `<p>Du behöver inte minnas allt. Börja med ett värde och följ vad varje rad gör med det.</p><dl class="glossary"><div><dt>MOVE</dt><dd>Sätter ett värde i ett fält.</dd></div><div><dt>ADD / SUBTRACT</dt><dd>Lägger till eller drar bort. GIVING kan spara resultatet i ett separat fält.</dd></div><div><dt>MULTIPLY / COMPUTE</dt><dd>Multiplicerar eller beräknar ett uttryck.</dd></div><div><dt>IF / ELSE / END-IF</dt><dd>Väljer väg beroende på om ett villkor är sant eller falskt.</dd></div><div><dt>PERFORM</dt><dd>Upprepar instruktioner. UNTIL anger när upprepningen ska sluta.</dd></div><div><dt>PIC 9 / X / V</dt><dd>9 är en sifferposition, X en teckenposition och V ett underförstått decimaltecken.</dd></div><div><dt>ROUNDED</dt><dd>Avrundar ett beräknat resultat till resultatfältets precision.</dd></div><div><dt>Punkten</dt><dd>Avslutar en mening och kan avsluta öppna block. Läs den noga!</dd></div></dl><p class="historical-note">Koden visas som korta programutdrag. Databeskrivningar visas ovanför instruktionerna. Svenska decimaltecken används i svaren; koden använder punkt.</p><button class="button primary" data-action="close-modal">Tillbaka till spelet ${arrow}</button>`);
  }
  function about() {
    showModal("Ett spel till Maria.", `<p>En personlig hyllning till Maria och hennes tid som COBOL-programmerare på TP-data. Skapat av axelaberg91.</p><h3>Minnen och spelberättelse</h3><p>Marias arbete på TP-data, kopplingen till Trelleborg och vistelsen i Trenton kommer från familjens berättelse. Goodall-spåret är en slutsats utifrån orten och företagskopplingen. Vi har inte verifierat hennes uppdrag, datormodell eller Goodalls programmeringsspråk.</p><p>Kontoret, dialogen, siffrorna och alla arbetsuppdrag är påhittade. Spelet är ingen officiell produkt från TP-data, Trelleborg eller Goodall.</p><h3>Historiska källor</h3><ul class="source-list"><li><a href="https://lagen.nu/sou/1985:50" target="_blank" rel="noopener noreferrer">SOU 1985:50, bilaga 1, s. 185 ↗</a><span>Personer från TP-Data medverkade i datautbildning hos PLM. Detta belägger inte ägarförhållanden.</span></li><li><a href="https://www.trelleborg.com/en/about-us/history" target="_blank" rel="noopener noreferrer">Trelleborgs företagshistoria ↗</a><span>Koncernens utveckling under 1980–1995.</span></li><li><a href="https://www.sec.gov/news/digest/1985/dig101785.pdf" target="_blank" rel="noopener noreferrer">SEC News Digest, 17 oktober 1985 ↗</a><span>Trelleborgs förvärvsärende rörande Goodall Rubber.</span></li><li><a href="https://www.dol.gov/agencies/eta/tradeact/petitioners/petitions?page=1701&sort=company&sort_order=asc" target="_blank" rel="noopener noreferrer">U.S. Department of Labor ↗</a><span>Goodall Rubber i Trenton, 1984 och 1990.</span></li><li><a href="https://aisel.aisnet.org/jise/vol1/iss3/3/" target="_blank" rel="noopener noreferrer">COBOL: Still the Major Language…, 1989 ↗</a><span>COBOL:s roll i dåtidens affärssystem; ingen företagsspecifik bekräftelse.</span></li></ul><h3>Dina framsteg</h3><p>Sparas bara i den här webbläsaren. Ingen inloggning, inga analysverktyg och ingen överföring av dina svar.</p><p class="historical-note">Originalkod, text och illustration: © 2026 axelaberg91 · CC BY-NC 4.0. Repots ursprungliga GPL-3.0-licens bevaras separat.</p><button class="button secondary danger" data-action="reset-confirm">Börja om från början</button>`);
  }
  function renderComplete() {
    if (progress.solved.length !== puzzles.length) { navigate("chapters"); return; }
    main.innerHTML = `<section class="completion"><span class="completion-icon" aria-hidden="true">✓</span>${headerLabel("SLUTRAPPORT / OPERATÖR MARIA")}<h1>Alla körningar klara.<br><em>Snyggt jobbat, Maria.</em></h1><p>Från första lagerposten till sista kontrollsumman.<br>Programmerarminnet fanns där hela tiden.</p><div class="paper-report"><div class="report-heading">TP–DATA / KÖRNINGSRAPPORT</div>${chapters.map(c => `<div><span>${c.title}</span><strong>GODKÄND</strong></div>`).join("")}<div class="report-total"><span>15 AV 15 UPPDRAG</span><strong>FELLISTAN: TOM ✓</strong></div></div><p class="completion-signoff">Nu är du värd en kopp kaffe. ♥</p><button class="button primary" data-action="chapters">Till arbetskön ${arrow}</button><button class="text-button" data-action="home">Till skrivbordet</button></section>`;
  }

  document.addEventListener("change", event => {
    if (!event.target.matches('input[name="answer"]')) return;
    selected = Number(event.target.value);
    feedback = null;
    document.querySelectorAll(".answer").forEach(label => label.classList.toggle("selected", label.contains(event.target)));
    document.querySelector("#feedback").innerHTML = "";
    document.querySelector('[data-action="check"]').disabled = false;
  });
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    if (action === "difficulty") {
      if (!levels.some(level => level.id === button.dataset.level) || progress.difficulty === button.dataset.level) return;
      progress.difficulty = button.dataset.level;
      selected = null;
      feedback = null;
      navigate(view, false);
      document.querySelector(`[data-action="difficulty"][data-level="${progress.difficulty}"]`)?.focus({ preventScroll: true });
      document.querySelector("#announcer").textContent = `Svårighetsgrad: ${levels.find(level => level.id === progress.difficulty).label}. Dina klarade uppdrag finns kvar.`;
    }
    if (["home", "chapters", "complete"].includes(action)) navigate(action);
    if (action === "continue") startPuzzle(firstUnsolved() < 0 ? 0 : firstUnsolved());
    if (action === "chapter") {
      const c = chapters.find(chapter => chapter.id === button.dataset.chapter);
      const jobs = chapterPuzzles(c.id);
      startPuzzle(puzzles.indexOf(jobs.find(job => !done(job)) || jobs[0]));
    }
    if (action === "puzzle") {
      const index = Number(button.dataset.index);
      const group = chapterPuzzles(puzzles[index]?.chapter);
      const offset = group.indexOf(puzzles[index]);
      if (offset === 0 || done(group[offset - 1]) || done(puzzles[index])) startPuzzle(index);
    }
    if (action === "check") checkAnswer();
    if (action === "hint") showHint();
    if (action === "next") nextPuzzle();
    if (action === "handbook") handbook();
    if (action === "about") about();
    if (action === "close-modal") closeModal();
    if (action === "start-next") { closeModal(); startPuzzle(Number(button.dataset.index)); }
    if (action === "reset-confirm") showModal("Börja om från början?", '<p>Alla godkända uppdrag och visade ledtrådar på den här enheten raderas. Det går inte att ångra.</p><button class="button secondary" data-action="close-modal">Behåll mina framsteg</button><button class="button primary" data-action="reset">Ja, börja om</button>');
    if (action === "reset") { progress = emptyProgress(); selected = null; feedback = null; save(); closeModal(); navigate("home"); }
  });
  document.querySelector(".brand").addEventListener("click", event => { event.preventDefault(); navigate("home"); });
  navigate(view, false);
})();
