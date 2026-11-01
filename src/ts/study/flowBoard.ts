import { Assignment, ScreenStep, StudyStep, StudySettings, isLevelStep } from './types';

/** A small dependency-free, keyboard-accessible weekly slide board. Moves are local until Save Study. */
export function createFlowBoard(parent: HTMLElement, source: StudySettings['weeks'], changed: (weeks: StudySettings['weeks']) => void) {
  let weeks: StudySettings['weeks'] = JSON.parse(JSON.stringify(source));
  let availableLevels: { id: string; name: string }[] = [
    ...['Birthday Vibes', 'Cheerful Bliss', 'Slow Elegance', 'Trained', 'Untrained', 'Tryout', 'Nosound']
      .map(name => ({ id: `legacy:${name}`, name: `Bundled: ${name}` }))
  ];
  let selected: { week: string; index: number } | null = null;
  const board = document.createElement('div'); board.className = 'study-flow-board'; parent.appendChild(board);
  const editor = document.createElement('div'); editor.className = 'study-slide-editor'; parent.appendChild(editor);
  const trigger = () => changed(JSON.parse(JSON.stringify(weeks)));
  const make = <K extends keyof HTMLElementTagNameMap>(tag: K, into: HTMLElement, title?: string) => {
    const element = document.createElement(tag); if (title) element.textContent = title; into.appendChild(element); return element;
  };
  const button = (into: HTMLElement, title: string, fn: () => void) => {
    const b = make('button', into, title); b.type = 'button'; b.onclick = fn; return b;
  };
  const placeholder = (kind: 'start' | 'level' | 'break' | 'end'): StudyStep => kind === 'level'
    ? { type: 'level', levelId: 'legacy:Cheerful Bliss', bpmIndex: 0, loops: 3 }
    : { type: kind, text: kind === 'start' ? 'Welcome! Press Continue when ready.' :
      kind === 'break' ? 'Take a break. Press Continue when ready to play again.' :
        'Thanks for playing! Please come back for your next session.' };
  const ordered = () => Object.keys(weeks).sort((a, b) => Number(a) - Number(b));
  function move(fromWeek: string, fromIndex: number, toWeek: string, toIndex: number) {
    const start = weeks[fromWeek]; const destination = weeks[toWeek];
    if (!start || !destination || !start[fromIndex] || toIndex < 0 || toIndex > destination.length) return;
    const [step] = start.splice(fromIndex, 1);
    destination.splice(fromWeek === toWeek && fromIndex < toIndex ? toIndex - 1 : toIndex, 0, step);
    selected = null; trigger(); render();
  }
  function add(week: string, type: 'start' | 'level' | 'break' | 'end') {
    weeks[week].push(placeholder(type)); selected = { week, index: weeks[week].length - 1 }; trigger(); render();
  }
  function edit() {
    editor.replaceChildren();
    if (!selected) { make('p', editor, 'Select a slide to edit its settings. Drag slides to rearrange them; the arrow controls also work without dragging.'); return; }
    const { week, index } = selected;
    const step = weeks[week]?.[index]; if (!step) { selected = null; return edit(); }
    make('h3', editor, `Edit Week ${week} · Slide ${index + 1}`);
    make('p', editor, isLevelStep(step) ? 'Play a level using the chosen difficulty and number of loops.' : 'This screen is shown to the participant until they press Continue.');
    function item(label: string, value: string, change: (v: string) => void, multiline = false) {
      const wrap = make('label', editor); wrap.className = 'study-field'; make('span', wrap, label);
      const input = multiline ? document.createElement('textarea') : document.createElement('input');
      input.value = value; wrap.appendChild(input);
      input.addEventListener('input', () => { change(input.value); trigger(); });
    }
    if (isLevelStep(step)) {
      const selectorRow = make('label', editor); selectorRow.className = 'study-field';
      make('span', selectorRow, 'Choose a bundled or uploaded library level');
      const levelSelect = make('select', selectorRow);
      const placeholder = make('option', levelSelect, 'Choose a level...'); placeholder.value = '';
      for (const level of availableLevels) {
        const option = make('option', levelSelect, level.name); option.value = level.id;
      }
      levelSelect.value = availableLevels.some(level => level.id === step.levelId) ? step.levelId : '';
      levelSelect.onchange = () => { if (!levelSelect.value) return; step.levelId = levelSelect.value; trigger(); render(); };
      item('Level ID (you can also type it manually)', step.levelId, v => { step.levelId = v; });
      item('Difficulty / BPM option (0 is the first)', String(step.bpmIndex), v => { step.bpmIndex = Number(v); });
      item('Number of loops before completing this slide', String(step.loops), v => { step.loops = Number(v); });
    } else {
      item('Message shown to the participant', step.text, v => { step.text = v; }, true);
    }
    button(editor, 'Delete selected slide', () => {
      if (!confirm('Delete this slide?')) return;
      weeks[week].splice(index, 1); selected = null; trigger(); render();
    });
  }
  function render() {
    board.replaceChildren();
    const toolbar = make('div', board); toolbar.className = 'study-flow-toolbar';
    make('h3', toolbar, 'Visual study timeline');
    button(toolbar, '+ Add week', () => {
      const next = Math.max(0, ...ordered().map(Number).filter(n => n > 0)) + 1;
      weeks[String(next)] = []; selected = null; trigger(); render();
    });
    button(toolbar, '+ Pretest', () => { if (!weeks['0']) weeks['0'] = []; trigger(); render(); });
    button(toolbar, '+ Posttest', () => { if (!weeks['-1']) weeks['-1'] = []; trigger(); render(); });
    make('p', board, 'Each row is a week. Each rectangle is a participant screen. Drag to reorder or move slides between weeks.');
    for (const week of ordered()) {
      const section = make('section', board); section.className = 'study-week-row';
      const header = make('div', section); header.className = 'study-week-heading';
      make('strong', header, week === '0' ? 'Pretest' : week === '-1' ? 'Posttest' : `Week ${week}`);
      if (week !== '1') button(header, 'Remove row', () => {
        if (!confirm(`Remove Week ${week} and all its slides?`)) return;
        delete weeks[week]; selected = null; trigger(); render();
      });
      const slides = make('div', section); slides.className = 'study-slides';
      const drop = (e: DragEvent, index: number) => {
        e.preventDefault();
        try {
          const from = JSON.parse(e.dataTransfer?.getData('text/plain') || 'null');
          if (from && typeof from.week === 'string' && Number.isInteger(from.index)) move(from.week, from.index, week, index);
        } catch { /* External drags are not valid study slides. */ }
      };
      slides.ondragover = e => e.preventDefault();
      slides.ondrop = e => { if (e.target === slides) drop(e, weeks[week].length); };
      weeks[week].forEach((step, index) => {
        const tile = make('div', slides); tile.className = `study-slide study-slide-${isLevelStep(step) ? 'level' : step.type}`;
        if (selected?.week === week && selected?.index === index) tile.classList.add('study-slide-selected');
        tile.draggable = true; tile.tabIndex = 0; tile.setAttribute('role', 'button');
        const kind = isLevelStep(step) ? 'Level' : step.type.toUpperCase();
        make('small', tile, `${index + 1} · ${kind}`);
        make('strong', tile, isLevelStep(step) ? step.levelId : step.text.slice(0, 85) || '(empty message)');
        if (isLevelStep(step)) make('small', tile, `BPM ${step.bpmIndex} · ${step.loops} loops`);
        tile.addEventListener('click', () => { selected = { week, index }; render(); });
        tile.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selected = { week, index }; render(); } });
        tile.ondragstart = e => { e.dataTransfer?.setData('text/plain', JSON.stringify({ week, index })); };
        tile.ondragover = e => { e.preventDefault(); e.stopPropagation(); };
        tile.ondrop = e => { e.stopPropagation(); drop(e, index); };
        const controls = make('div', tile); controls.className = 'study-slide-controls';
        const left = button(controls, '←', () => move(week, index, week, Math.max(0, index - 1)));
        left.title = 'Move left'; left.onclick = e => { e.stopPropagation(); move(week, index, week, Math.max(0, index - 1)); };
        const right = button(controls, '→', () => move(week, index, week, Math.min(weeks[week].length, index + 2)));
        right.title = 'Move right'; right.onclick = e => { e.stopPropagation(); move(week, index, week, Math.min(weeks[week].length, index + 2)); };
      });
      const addBar = make('div', section); addBar.className = 'study-flow-add';
      for (const type of ['start', 'level', 'break', 'end'] as const) button(addBar, `+ ${type === 'level' ? 'Play level' : type === 'break' ? 'Break screen' : type === 'start' ? 'Start screen' : 'End screen'}`, () => add(week, type));
    }
    edit();
  }
  render();
  return { getWeeks: () => JSON.parse(JSON.stringify(weeks)) as StudySettings['weeks'], setAvailableLevels: (levels: { id: string; name: string }[]) => { availableLevels = [...availableLevels.filter(x => x.id.startsWith('legacy:')), ...levels]; edit(); }, setWeeks: (value: StudySettings['weeks']) => { weeks = JSON.parse(JSON.stringify(value)); selected = null; trigger(); render(); } };
}
