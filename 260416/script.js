const courseCode = document.getElementById("course-code");
const courseTitle = document.getElementById("course-title");
const courseSubtitle = document.getElementById("course-subtitle");
const courseDossier = document.getElementById("course-dossier");
const courseAbstract = document.getElementById("course-abstract");
const courseOutcomes = document.getElementById("course-outcomes");
const quickNav = document.getElementById("quick-nav");
const roadmapGrid = document.getElementById("roadmap-grid");
const pipelineGrid = document.getElementById("pipeline-grid");
const atlasGrid = document.getElementById("atlas-grid");
const chaptersRoot = document.getElementById("chapters");
const checklistRoot = document.getElementById("global-checklist");
const glossaryRoot = document.getElementById("glossary");
const seminarQuestionsRoot = document.getElementById("seminar-questions");
const assignmentsRoot = document.getElementById("assignments");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function appendRichText(node, text) {
  const parts = text.split(/`([^`]+)`/g);
  parts.forEach((part, index) => {
    if (!part) return;
    if (index % 2 === 1) {
      const code = document.createElement("code");
      code.textContent = part;
      node.append(code);
    } else {
      node.append(document.createTextNode(part));
    }
  });
}

function listFromItems(items, itemClass) {
  const list = el("ul", `${itemClass}-list`);
  items.forEach((item) => {
    const row = el("li", itemClass);
    appendRichText(row, item);
    list.append(row);
  });
  return list;
}

function renderCourse() {
  document.title = bookData.course.title;
  courseCode.textContent = bookData.course.code;
  courseTitle.textContent = bookData.course.title;
  courseSubtitle.textContent = bookData.course.subtitle;

  const dossierTitle = el("p", "panel-eyebrow", "Course Dossier");
  const dossierList = el("div", "dossier-list");
  bookData.course.dossier.forEach((item) => {
    const row = el("div", "dossier-row");
    row.append(el("span", "dossier-label", item.label), el("strong", "dossier-value", item.value));
    dossierList.append(row);
  });
  courseDossier.append(dossierTitle, dossierList);

  const abstractTitle = el("h3", "panel-title", "문서 초록");
  const abstractBody = el("p", "panel-body");
  appendRichText(abstractBody, bookData.course.abstract);
  const methodTitle = el("h4", "mini-title", "정리 방식");
  const methodList = listFromItems(bookData.course.method, "mini-item");
  courseAbstract.append(abstractTitle, abstractBody, methodTitle, methodList);

  const outcomeTitle = el("h3", "panel-title", "학습 성과");
  const outcomeList = listFromItems(bookData.course.outcomes, "mini-item");
  const audienceTitle = el("h4", "mini-title", "권장 독자");
  const audienceList = listFromItems(bookData.course.audience, "mini-item");
  courseOutcomes.append(outcomeTitle, outcomeList, audienceTitle, audienceList);
}

function renderQuickNav() {
  bookData.chapters.forEach((chapter) => {
    const link = el("a", "quick-link");
    link.href = `#${chapter.id}`;
    link.dataset.target = chapter.id;
    link.append(
      el("span", "quick-link-no", chapter.displayNo),
      el("strong", "quick-link-title", chapter.title),
      el("span", "quick-link-code", chapter.code)
    );
    quickNav.append(link);
  });
}

function renderRoadmap() {
  bookData.roadmap.filter((item) => item.description).forEach((item, index) => {
    const card = el("article", "syllabus-card panel");
    card.append(
      el("p", "panel-eyebrow", `Module ${index + 1}`),
      el("h3", "syllabus-title", item.title),
      el("p", "syllabus-code", item.code)
    );
    const desc = el("p", "panel-body");
    appendRichText(desc, item.description);
    card.append(desc);
    roadmapGrid.append(card);
  });
}

function renderPipeline() {
  bookData.pipeline.forEach((item, index) => {
    const card = el("article", "pipeline-card");
    card.append(
      el("span", "pipeline-index", `${index + 1}`),
      el("h3", "pipeline-title", item.title)
    );
    const detail = el("p", "pipeline-body");
    appendRichText(detail, item.detail);
    card.append(detail);
    pipelineGrid.append(card);
  });
}

function renderAtlas() {
  bookData.sourceAtlas.forEach((item) => {
    const card = el("article", "atlas-card panel");
    card.append(
      el("p", "panel-eyebrow", item.chapter),
      el("h3", "atlas-title", item.title)
    );

    const file = el("p", "atlas-file");
    appendRichText(file, item.file);
    const role = el("p", "panel-body");
    appendRichText(role, item.role);
    const points = listFromItems(item.points, "atlas-item");

    card.append(file, role, points);
    atlasGrid.append(card);
  });
}

function renderLectureSections(sections) {
  const wrapper = el("div", "lecture-stack");
  sections.forEach((section) => {
    const article = el("article", "lecture-section");
    const header = el("div", "lecture-header");
    header.append(el("h4", "lecture-title", section.title), el("p", "lecture-source", section.source));

    const body = el("p", "lecture-body");
    appendRichText(body, section.body);

    const list = el("ul", "lecture-points");
    section.bullets.forEach((bullet) => {
      const item = el("li", "lecture-point");
      appendRichText(item, bullet);
      list.append(item);
    });

    article.append(header, body, list);
    wrapper.append(article);
  });
  return wrapper;
}

function renderSourceStudies(studies) {
  const grid = el("div", "source-grid");
  studies.forEach((study) => {
    const card = el("article", "source-card");
    const top = el("div", "source-top");
    top.append(
      el("p", "panel-eyebrow", study.label),
      el("h4", "source-title", study.title)
    );

    const meta = el("div", "source-meta");
    meta.append(
      el("span", "source-chip", study.file),
      el("span", "source-chip", study.lines)
    );

    const summary = el("p", "source-summary");
    appendRichText(summary, study.summary);

    const thesis = el("p", "source-thesis");
    appendRichText(thesis, study.thesis);

    const pre = el("pre", "source-pre");
    const code = el("code");
    code.textContent = study.snippet;
    pre.append(code);

    card.append(top, meta, summary, thesis, pre);
    grid.append(card);
  });
  return grid;
}

function renderFigures(figures) {
  const grid = el("div", "figure-grid");
  figures.forEach((figure) => {
    const button = el("button", "figure-card");
    button.type = "button";
    button.dataset.src = figure.src;
    button.dataset.alt = figure.alt;
    button.dataset.caption = `${figure.title} | ${figure.time} | ${figure.caption}`;

    const image = document.createElement("img");
    image.src = figure.src;
    image.alt = figure.alt;
    image.loading = "lazy";

    const meta = el("div", "figure-meta");
    meta.append(el("p", "figure-time", figure.time), el("h5", "figure-title", figure.title));
    const caption = el("p", "figure-caption");
    appendRichText(caption, figure.caption);
    meta.append(caption);

    button.append(image, meta);
    grid.append(button);
  });
  return grid;
}

function renderReferenceChips(items) {
  const wrap = el("div", "reference-wrap");
  items.forEach((item) => {
    const chip = el("span", "reference-chip");
    appendRichText(chip, item);
    wrap.append(chip);
  });
  return wrap;
}

function renderStudyCard(title, items) {
  const card = el("section", "study-card panel");
  card.append(el("h3", "panel-title", title), listFromItems(items, "study-item"));
  return card;
}

function renderChapters() {
  bookData.chapters.forEach((chapter) => {
    const article = el("article", "chapter panel");
    article.id = chapter.id;
    article.dataset.no = chapter.displayNo;

    const header = el("header", "chapter-header");
    header.append(
      el("p", "chapter-number", chapter.chapterNo),
      el("p", "chapter-code", chapter.code),
      el("h2", "chapter-title", chapter.title)
    );
    const strap = el("p", "chapter-strap");
    appendRichText(strap, chapter.strap);
    const duration = el("p", "chapter-duration", chapter.duration);
    header.append(strap, duration, renderReferenceChips(chapter.tags));

    const introGrid = el("div", "chapter-intro-grid");
    const intro = el("div", "chapter-intro panel-sub");
    intro.append(el("h3", "mini-title", "장 서론"));
    const introBody = el("p", "chapter-body");
    appendRichText(introBody, chapter.intro);
    intro.append(introBody);

    const thesis = el("div", "chapter-intro panel-sub thesis-box");
    thesis.append(el("h3", "mini-title", "강의 명제"));
    const thesisBody = el("p", "chapter-body");
    appendRichText(thesisBody, chapter.thesis);
    thesis.append(thesisBody);
    introGrid.append(intro, thesis);

    const goals = el("section", "chapter-block panel-sub");
    goals.append(el("h3", "panel-title", "학습 목표"), listFromItems(chapter.learningGoals, "study-item"));

    const lecture = el("section", "chapter-block panel-sub");
    lecture.append(el("h3", "panel-title", "강의 본문"), renderLectureSections(chapter.sections));

    const source = el("section", "chapter-block panel-sub");
    source.append(el("h3", "panel-title", "프로젝트 소스 세미나"), renderSourceStudies(chapter.sourceStudies));

    const figures = el("section", "chapter-block panel-sub");
    figures.append(el("h3", "panel-title", "대표 도판"), renderFigures(chapter.figures));

    const studyGrid = el("div", "chapter-study-grid");
    studyGrid.append(
      renderStudyCard("실습 체크", chapter.labTasks),
      renderStudyCard("막히기 쉬운 지점", chapter.pitfalls),
      renderStudyCard("복습 질문", chapter.reviewQuestions),
      renderStudyCard("한 장 요약", chapter.takeaway)
    );

    const refs = el("section", "chapter-block panel-sub refs-block");
    refs.append(el("h3", "panel-title", "핵심 소스 참조"), renderReferenceChips(chapter.references));

    article.append(header, introGrid, goals, lecture, source, figures, studyGrid, refs);
    chaptersRoot.append(article);
  });
}

function renderGlossary() {
  glossaryRoot.append(el("h3", "panel-title", "용어 부록"));
  const list = el("div", "glossary-list");
  bookData.glossary.forEach((entry) => {
    const item = el("article", "glossary-item");
    const title = el("h4", "glossary-term", entry.term);
    const desc = el("p", "glossary-description");
    appendRichText(desc, entry.description);
    item.append(title, desc);
    list.append(item);
  });
  glossaryRoot.append(list);
}

function renderAppendix() {
  checklistRoot.append(el("h3", "panel-title", "전체 체크리스트"));
  checklistRoot.append(listFromItems(bookData.checklist, "study-item"));

  seminarQuestionsRoot.append(el("h3", "panel-title", "세미나 질문"));
  seminarQuestionsRoot.append(listFromItems(bookData.seminarQuestions, "study-item"));

  assignmentsRoot.append(el("h3", "panel-title", "권장 과제"));
  assignmentsRoot.append(listFromItems(bookData.assignments, "study-item"));
}

function setupLightbox() {
  chaptersRoot.addEventListener("click", (event) => {
    const trigger = event.target.closest(".figure-card");
    if (!trigger) return;
    lightboxImage.src = trigger.dataset.src;
    lightboxImage.alt = trigger.dataset.alt;
    lightboxCaption.textContent = trigger.dataset.caption;
    lightbox.showModal();
  });

  lightboxClose.addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", (event) => {
    const rect = lightbox.getBoundingClientRect();
    const inside =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!inside) lightbox.close();
  });
}

function setupScrollSpy() {
  const links = [...quickNav.querySelectorAll(".quick-link")];
  const targets = bookData.chapters
    .map((chapter) => document.getElementById(chapter.id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("active", link.dataset.target === entry.target.id);
        });
      });
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: 0.08 }
  );

  targets.forEach((target) => observer.observe(target));
}

renderCourse();
renderQuickNav();
renderRoadmap();
renderPipeline();
renderAtlas();
renderChapters();
renderAppendix();
renderGlossary();
setupLightbox();
setupScrollSpy();
