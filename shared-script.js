const courseCode = document.getElementById("course-code");
const courseTitle = document.getElementById("course-title");
const courseSubtitle = document.getElementById("course-subtitle");
const courseDossier = document.getElementById("course-dossier");
const documentInfo = document.getElementById("document-info");
const bookToc = document.getElementById("book-toc");
const courseGuide = document.getElementById("course-guide");
const chaptersRoot = document.getElementById("chapters");
const appendixRoot = document.getElementById("appendix-content");
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

function listFromItems(items, className) {
  const list = el("ul", className);
  items.forEach((item) => {
    const row = document.createElement("li");
    appendRichText(row, item);
    list.append(row);
  });
  return list;
}

function renderCover() {
  document.title = bookData.course.title;
  courseCode.textContent = bookData.course.code;
  courseTitle.textContent = bookData.course.title;
  courseSubtitle.textContent = bookData.course.subtitle;

  bookData.course.dossier.forEach((item) => {
    const row = el("div", "dossier-row");
    row.append(el("span", "dossier-label", item.label), el("strong", "dossier-value", item.value));
    courseDossier.append(row);
  });
}

function renderDocumentInfo() {
  const abstractBlock = el("article", "frontmatter-block");
  abstractBlock.append(el("h3", "document-title", "문서 초록"));
  const abstractBody = el("p", "document-body");
  appendRichText(abstractBody, bookData.course.abstract);
  abstractBlock.append(abstractBody);

  const methodBlock = el("article", "frontmatter-block");
  methodBlock.append(el("h3", "document-title", "정리 방식"));
  methodBlock.append(listFromItems(bookData.course.method, "frontmatter-list"));

  const outcomesBlock = el("article", "frontmatter-block");
  outcomesBlock.append(el("h3", "document-title", "학습 성과"));
  outcomesBlock.append(listFromItems(bookData.course.outcomes, "frontmatter-list"));

  const audienceBlock = el("article", "frontmatter-block");
  audienceBlock.append(el("h3", "document-title", "권장 독자"));
  audienceBlock.append(listFromItems(bookData.course.audience, "frontmatter-list"));

  documentInfo.append(abstractBlock, methodBlock, outcomesBlock, audienceBlock);
}

function renderToc() {
  const list = el("ol", "toc-list");

  const front = el("li", "toc-item");
  const frontCode = el("div", "toc-code", "Front Matter");
  const frontLink = el("a", "toc-link");
  frontLink.href = "#document-information";
  frontLink.append(
    el("strong", "toc-title", "문서 정보와 읽기 길잡이"),
    el("span", "toc-desc", "문서 초록, 정리 방식, 학습 성과, 강의 개요")
  );
  front.append(frontCode, frontLink);
  list.append(front);

  bookData.chapters.forEach((chapter) => {
    const item = el("li", "toc-item");
    const code = el("div", "toc-code", chapter.code);
    const link = el("a", "toc-link");
    link.href = `#${chapter.id}`;
    link.append(
      el("strong", "toc-title", chapter.title),
      el("span", "toc-desc", chapter.strap)
    );
    item.append(code, link);
    list.append(item);
  });

  const appendixItem = el("li", "toc-item");
  const appendixCode = el("div", "toc-code", "Appendix");
  const appendixLink = el("a", "toc-link");
  appendixLink.href = "#appendix";
  appendixLink.append(
    el("strong", "toc-title", "부록"),
    el("span", "toc-desc", "체크리스트, 세미나 질문, 과제, 용어 정리")
  );
  appendixItem.append(appendixCode, appendixLink);
  list.append(appendixItem);

  bookToc.append(list);
}

function renderGuide() {
  const roadmapBlock = el("article", "guide-block");
  roadmapBlock.append(el("h3", "guide-title", "하루 강의의 흐름"));
  const roadmapList = el("ol", "guide-flow");
  bookData.roadmap.forEach((item) => {
    const entry = el("li", "guide-flow-item");
    const title = el("h4", "guide-flow-title", item.title);
    const code = el("p", "guide-flow-code", item.code);
    const body = el("p", "guide-flow-body");
    appendRichText(body, item.description);
    entry.append(title, code, body);
    roadmapList.append(entry);
  });
  roadmapBlock.append(roadmapList);

  const pipelineBlock = el("article", "guide-block");
  pipelineBlock.append(el("h3", "guide-title", "런타임 흐름"));
  const pipelineList = el("ol", "guide-flow");
  bookData.pipeline.forEach((item) => {
    const entry = el("li", "guide-flow-item");
    const title = el("h4", "guide-flow-title", item.title);
    const body = el("p", "guide-flow-body");
    appendRichText(body, item.detail);
    entry.append(title, body);
    pipelineList.append(entry);
  });
  pipelineBlock.append(pipelineList);

  const sourceBlock = el("article", "guide-block");
  sourceBlock.append(el("h3", "guide-title", "관련 소스 지도"));
  const map = el("div", "source-map");
  bookData.sourceAtlas.forEach((item) => {
    const entry = el("article", "source-entry");
    const title = el("h4", "guide-flow-title", item.title);
    const meta = el("p", "source-meta", item.chapter);
    const file = el("p", "guide-flow-code");
    appendRichText(file, item.file);
    const role = el("p", "source-role");
    appendRichText(role, item.role);
    entry.append(title, meta, file, role, listFromItems(item.points, "source-points"));
    map.append(entry);
  });
  sourceBlock.append(map);

  courseGuide.append(roadmapBlock, pipelineBlock, sourceBlock);
}

function renderLectureSections(sections) {
  const wrapper = document.createDocumentFragment();
  sections.forEach((section) => {
    const article = el("article", "lecture-section");
    article.append(el("h4", "chapter-subtitle", section.title));

    const source = el("p", "lecture-source", section.source);
    const body = el("p", "lecture-body");
    appendRichText(body, section.body);
    article.append(source, body);

    if (section.bullets && section.bullets.length) {
      article.append(listFromItems(section.bullets, "chapter-list"));
    }

    wrapper.append(article);
  });
  return wrapper;
}

function renderSourceStudies(studies) {
  const wrap = el("div", "source-studies");
  studies.forEach((study) => {
    const article = el("article", "source-study");
    article.append(el("h4", "source-study-title", study.title));

    const meta = el("p", "source-meta", `${study.label} / ${study.file} / ${study.lines}`);
    const summary = el("p", "source-summary");
    appendRichText(summary, study.summary);
    const thesis = el("p", "source-thesis");
    appendRichText(thesis, study.thesis);
    const pre = el("pre", "source-pre");
    const code = el("code");
    code.textContent = study.snippet;
    pre.append(code);

    article.append(meta, summary, thesis, pre);

    wrap.append(article);
  });
  return wrap;
}

function renderFigures(figures) {
  const list = el("div", "plate-list");
  figures.forEach((figure) => {
    const plate = el("figure", "plate");
    const trigger = el("button", "plate-trigger");
    trigger.type = "button";
    trigger.dataset.src = figure.src;
    trigger.dataset.alt = figure.alt;
    trigger.dataset.caption = `${figure.title} | ${figure.time} | ${figure.caption}`;

    const frame = el("div", "plate-frame");
    const image = document.createElement("img");
    image.src = figure.src;
    image.alt = figure.alt;
    image.loading = "lazy";
    frame.append(image);

    const body = el("figcaption", "plate-body");
    body.append(el("p", "plate-time", figure.time), el("h4", "plate-title", figure.title));
    const caption = el("p", "plate-caption");
    appendRichText(caption, figure.caption);
    body.append(caption);

    trigger.append(frame, body);
    plate.append(trigger);
    list.append(plate);
  });
  return list;
}

function renderReferences(items) {
  return listFromItems(items, "reference-list");
}

function renderChapterNotes(chapter) {
  const notes = el("section", "chapter-section-block");
  notes.append(el("h3", "chapter-subtitle", "정리와 점검"));

  const practice = el("article", "appendix-article");
  practice.append(el("h4", "appendix-title", "실습 체크"));
  practice.append(listFromItems(chapter.labTasks, "appendix-list"));

  const pitfalls = el("article", "appendix-article");
  pitfalls.append(el("h4", "appendix-title", "막히기 쉬운 지점"));
  pitfalls.append(listFromItems(chapter.pitfalls, "appendix-list"));

  const review = el("article", "appendix-article");
  review.append(el("h4", "appendix-title", "복습 질문"));
  review.append(listFromItems(chapter.reviewQuestions, "appendix-list"));

  const takeaway = el("article", "appendix-article");
  takeaway.append(el("h4", "appendix-title", "한 장 요약"));
  takeaway.append(listFromItems(chapter.takeaway, "appendix-list"));

  notes.append(practice, pitfalls, review, takeaway);
  return notes;
}

function renderChapters() {
  bookData.chapters.forEach((chapter) => {
    const article = el("article", "chapter");
    article.id = chapter.id;

    const header = el("header", "chapter-header");
    header.append(
      el("p", "chapter-number", chapter.chapterNo),
      el("p", "chapter-code", chapter.code),
      el("h2", "chapter-title", chapter.title)
    );

    const strap = el("p", "chapter-strap");
    appendRichText(strap, chapter.strap);
    const duration = el("p", "chapter-duration", chapter.duration);
    header.append(strap, duration);

    if (chapter.tags && chapter.tags.length) {
      const tags = el("div", "chapter-tags");
      chapter.tags.forEach((tag) => {
        const chip = el("span", "chapter-tag");
        appendRichText(chip, tag);
        tags.append(chip);
      });
      header.append(tags);
    }

    const opening = el("section", "chapter-opening");
    const intro = el("article", "chapter-intro");
    intro.append(el("h3", "chapter-subtitle", "장 도입"));
    const introBody = el("p", "chapter-intro-body");
    appendRichText(introBody, chapter.intro);
    intro.append(introBody);

    const thesis = el("article", "chapter-thesis");
    thesis.append(el("h3", "chapter-subtitle", "핵심 논지"));
    const thesisBody = el("p", "chapter-thesis-body");
    appendRichText(thesisBody, chapter.thesis);
    thesis.append(thesisBody);
    opening.append(intro, thesis);

    const goals = el("section", "chapter-section-block");
    goals.append(el("h3", "chapter-subtitle", "학습 목표"));
    goals.append(listFromItems(chapter.learningGoals, "chapter-list"));

    const lecture = el("section", "chapter-section-block");
    lecture.append(el("h3", "chapter-subtitle", "강의 본문"));
    lecture.append(renderLectureSections(chapter.sections));

    const source = el("section", "chapter-section-block");
    source.append(el("h3", "chapter-subtitle", "관련 코드 해설"));
    source.append(renderSourceStudies(chapter.sourceStudies));

    const figures = el("section", "chapter-section-block");
    figures.append(el("h3", "chapter-subtitle", "도판"));
    figures.append(renderFigures(chapter.figures));

    const references = el("section", "chapter-section-block");
    references.append(el("h3", "chapter-subtitle", "핵심 소스 참조"));
    references.append(renderReferences(chapter.references));

    article.append(header, opening, goals, lecture, source, figures, renderChapterNotes(chapter), references);
    chaptersRoot.append(article);
  });
}

function renderAppendix() {
  const checklist = el("article", "appendix-article");
  checklist.append(el("h3", "appendix-title", "전체 체크리스트"));
  checklist.append(listFromItems(bookData.checklist, "appendix-list"));

  const seminar = el("article", "appendix-article");
  seminar.append(el("h3", "appendix-title", "세미나 질문"));
  seminar.append(listFromItems(bookData.seminarQuestions, "appendix-list"));

  const assignments = el("article", "appendix-article");
  assignments.append(el("h3", "appendix-title", "권장 과제"));
  assignments.append(listFromItems(bookData.assignments, "appendix-list"));

  const glossary = el("article", "appendix-article");
  glossary.append(el("h3", "appendix-title", "용어 정리"));
  bookData.glossary.forEach((entry) => {
    const item = el("article", "glossary-item");
    const term = el("h4", "glossary-term", entry.term);
    const description = el("p", "glossary-description");
    appendRichText(description, entry.description);
    item.append(term, description);
    glossary.append(item);
  });

  appendixRoot.append(checklist, seminar, assignments, glossary);
}

function setupLightbox() {
  chaptersRoot.addEventListener("click", (event) => {
    const trigger = event.target.closest(".plate-trigger");
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

renderCover();
renderDocumentInfo();
renderToc();
renderGuide();
renderChapters();
renderAppendix();
setupLightbox();
