'use strict';

(function () {
  const STORAGE_KEY = 'dongs-modular-v1';
  const KEYMAP = {
    KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7,
    KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11, KeyK: 12, KeyO: 13, KeyL: 14,
    KeyP: 15, Semicolon: 16, Quote: 17,
  };
  const FOOTPRINT = {
    keys: [408, 320],
    seq: [436, 340],
    vco: [184, 360],
    vcf: [184, 380],
    vca: [164, 280],
    env: [176, 300],
    lfo: [176, 320],
    noise: [156, 250],
    mix: [184, 280],
    dly: [176, 290],
    loop: [210, 360],
    att: [150, 230],
    out: [220, 300],
  };
  const META = {
    keys: ['KEYS', 'KEYBOARD'],
    seq: ['SEQ', 'SEQUENCER'],
    vco: ['VCO', 'OSCILLATOR'],
    vcf: ['VCF', 'FILTER'],
    vca: ['VCA', 'AMPLIFIER'],
    env: ['ENV', 'ENVELOPE'],
    lfo: ['LFO', 'MODULATOR'],
    noise: ['NOISE', 'GENERATOR'],
    mix: ['MIX', '3 CHANNEL'],
    dly: ['DLY', 'DELAY'],
    loop: ['LOOP', 'PHRASE LOOPER'],
    att: ['ATT', 'ATTENUVERTER'],
    out: ['OUT', 'SPEAKER'],
  };
  const LIBRARY = [
    ['keys', 'KEYS', '건반 / 게이트'],
    ['seq', 'SEQ', '8스텝 시퀀서'],
    ['vco', 'VCO', '오실레이터'],
    ['vcf', 'VCF', '필터'],
    ['vca', 'VCA', '앰프'],
    ['env', 'ENV', '엔벨로프'],
    ['lfo', 'LFO', 'LFO'],
    ['noise', 'NOISE', '노이즈'],
    ['mix', 'MIX', '믹서'],
    ['dly', 'DLY', '딜레이'],
    ['loop', 'LOOP', '루프 레코더'],
    ['att', 'ATT', '어테뉴에이터'],
    ['out', 'OUT', '출력 / 스코프'],
  ];

  const PRESETS = {
    lead: {
      name: '리드',
      toast: '건반을 누르거나 키보드 A–K로 연주해 보세요.',
      master: 0.72,
      modules: [
        { id: 'keys', type: 'keys', x: 16, y: 48, params: { octave: 0, glide: 0.015, mode: 'retrig' } },
        { id: 'vco', type: 'vco', x: 440, y: 48, params: { wave: 'sawtooth', tune: 57, octave: 0, fine: 0, fm: 250 } },
        { id: 'vcf', type: 'vcf', x: 636, y: 48, params: { type: 'lowpass', cutoff: 1680, res: 1.15, cv: 1700, drive: 1.7 } },
        { id: 'vca', type: 'vca', x: 832, y: 48, params: { level: 0, cv: 1 } },
        { id: 'out', type: 'out', x: 1012, y: 48, params: { vol: 0.85 } },
        { id: 'lfo', type: 'lfo', x: 636, y: 400, params: { wave: 'sine', rate: 0.32, depth: 0.48, polar: 'bi' } },
        { id: 'env', type: 'env', x: 832, y: 400, params: { a: 0.008, d: 0.18, s: 0.64, r: 0.38 } },
      ],
      cables: [
        ['keys', 'pitch', 'vco', 'pitch'],
        ['keys', 'gate', 'env', 'gate'],
        ['env', 'out', 'vca', 'cv'],
        ['vco', 'out', 'vcf', 'in'],
        ['vcf', 'out', 'vca', 'in'],
        ['vca', 'out', 'out', 'in'],
        ['lfo', 'out', 'vcf', 'cv'],
      ],
    },
    bass: {
      name: '베이스',
      toast: '낮은 옥타브 베이스입니다. A–K로 짧게 찍어 보세요.',
      master: 0.7,
      modules: [
        { id: 'keys', type: 'keys', x: 16, y: 48, params: { octave: -1, glide: 0.03, mode: 'retrig' } },
        { id: 'vco', type: 'vco', x: 440, y: 48, params: { wave: 'sawtooth', tune: 40, octave: -1, fine: 0, fm: 80 } },
        { id: 'vcf', type: 'vcf', x: 636, y: 48, params: { type: 'lowpass', cutoff: 240, res: 4.2, cv: 2200, drive: 2.4 } },
        { id: 'vca', type: 'vca', x: 832, y: 48, params: { level: 0, cv: 1 } },
        { id: 'out', type: 'out', x: 1012, y: 48, params: { vol: 0.8 } },
        { id: 'env', type: 'env', x: 832, y: 400, params: { a: 0.004, d: 0.22, s: 0.18, r: 0.2 } },
        { id: 'lfo', type: 'lfo', x: 636, y: 400, params: { wave: 'sine', rate: 0.18, depth: 0.25, polar: 'bi' } },
      ],
      cables: [
        ['keys', 'pitch', 'vco', 'pitch'],
        ['keys', 'gate', 'env', 'gate'],
        ['env', 'out', 'vca', 'cv'],
        ['env', 'out', 'vcf', 'cv'],
        ['lfo', 'out', 'vco', 'fm'],
        ['vco', 'out', 'vcf', 'in'],
        ['vcf', 'out', 'vca', 'in'],
        ['vca', 'out', 'out', 'in'],
      ],
    },
    seq: {
      name: '시퀀스',
      toast: '시퀀서가 돌아갑니다. 스텝을 드래그하면 음높이가 바뀝니다.',
      master: 0.68,
      play: ['seq'],
      modules: [
        { id: 'seq', type: 'seq', x: 36, y: 52, params: { bpm: 112, gate: 0.42, playing: true, steps: [
          { on: true, note: 60 }, { on: true, note: 63 }, { on: true, note: 67 }, { on: true, note: 70 },
          { on: true, note: 67 }, { on: true, note: 65 }, { on: true, note: 63 }, { on: true, note: 58 },
        ] } },
        { id: 'vco', type: 'vco', x: 496, y: 52, params: { wave: 'square', tune: 60, octave: 0, fine: 0, fm: 0 } },
        { id: 'vcf', type: 'vcf', x: 700, y: 52, params: { type: 'lowpass', cutoff: 980, res: 2.2, cv: 2100, drive: 1.8 } },
        { id: 'vca', type: 'vca', x: 904, y: 52, params: { level: 0, cv: 1 } },
        { id: 'out', type: 'out', x: 1092, y: 52, params: { vol: 0.8 } },
        { id: 'env', type: 'env', x: 904, y: 470, params: { a: 0.004, d: 0.13, s: 0.28, r: 0.16 } },
        { id: 'dly', type: 'dly', x: 496, y: 470, params: { time: 0.22, fb: 0.34, mix: 0.32 } },
      ],
      cables: [
        ['seq', 'pitch', 'vco', 'pitch'],
        ['seq', 'gate', 'env', 'gate'],
        ['env', 'out', 'vca', 'cv'],
        ['vco', 'out', 'vcf', 'in'],
        ['vcf', 'out', 'vca', 'in'],
        ['vca', 'out', 'dly', 'in'],
        ['dly', 'out', 'out', 'in'],
      ],
    },
    pad: {
      name: '패드',
      toast: '두 오실레이터가 살짝 어긋난 패드입니다. 건반을 길게 누르세요.',
      master: 0.66,
      modules: [
        { id: 'keys', type: 'keys', x: 36, y: 52, params: { octave: 0, glide: 0.11, mode: 'legato' } },
        { id: 'vco', type: 'vco', x: 468, y: 52, params: { wave: 'sawtooth', tune: 60, octave: 0, fine: 0, fm: 0 } },
        { id: 'vco2', type: 'vco', x: 672, y: 52, params: { wave: 'sawtooth', tune: 60, octave: 0, fine: 9, fm: 0 } },
        { id: 'mix', type: 'mix', x: 876, y: 52, params: { a: 0.62, b: 0.62, c: 0 } },
        { id: 'vcf', type: 'vcf', x: 1080, y: 52, params: { type: 'lowpass', cutoff: 2100, res: 0.55, cv: 800, drive: 1.3 } },
        { id: 'lfo', type: 'lfo', x: 468, y: 470, params: { wave: 'sine', rate: 0.16, depth: 0.35, polar: 'bi' } },
        { id: 'env', type: 'env', x: 672, y: 470, params: { a: 0.42, d: 0.48, s: 0.82, r: 1.5 } },
        { id: 'vca', type: 'vca', x: 876, y: 470, params: { level: 0, cv: 1 } },
        { id: 'dly', type: 'dly', x: 1064, y: 470, params: { time: 0.42, fb: 0.4, mix: 0.36 } },
        { id: 'out', type: 'out', x: 1280, y: 470, params: { vol: 0.8 } },
      ],
      cables: [
        ['keys', 'pitch', 'vco', 'pitch'],
        ['keys', 'pitch', 'vco2', 'pitch'],
        ['keys', 'gate', 'env', 'gate'],
        ['vco', 'out', 'mix', 'a'],
        ['vco2', 'out', 'mix', 'b'],
        ['mix', 'out', 'vcf', 'in'],
        ['vcf', 'out', 'vca', 'in'],
        ['env', 'out', 'vca', 'cv'],
        ['lfo', 'out', 'vcf', 'cv'],
        ['vca', 'out', 'dly', 'in'],
        ['dly', 'out', 'out', 'in'],
      ],
    },
    drone: {
      name: '드론',
      toast: '건반 없이 바로 소리가 납니다. 필터 컷오프를 돌려 보세요.',
      master: 0.6,
      modules: [
        { id: 'vco', type: 'vco', x: 36, y: 52, params: { wave: 'sine', tune: 36, octave: 0, fine: 0, fm: 0 } },
        { id: 'vco2', type: 'vco', x: 240, y: 52, params: { wave: 'sawtooth', tune: 43, octave: 0, fine: 7, fm: 0 } },
        { id: 'mix', type: 'mix', x: 444, y: 52, params: { a: 0.7, b: 0.42, c: 0 } },
        { id: 'vcf', type: 'vcf', x: 648, y: 52, params: { type: 'lowpass', cutoff: 520, res: 2.4, cv: 900, drive: 1.5 } },
        { id: 'vca', type: 'vca', x: 852, y: 52, params: { level: 0.55, cv: 1 } },
        { id: 'out', type: 'out', x: 1040, y: 52, params: { vol: 0.75 } },
        { id: 'lfo', type: 'lfo', x: 648, y: 470, params: { wave: 'sine', rate: 0.1, depth: 0.75, polar: 'bi' } },
        { id: 'dly', type: 'dly', x: 852, y: 470, params: { time: 0.48, fb: 0.38, mix: 0.24 } },
      ],
      cables: [
        ['vco', 'out', 'mix', 'a'],
        ['vco2', 'out', 'mix', 'b'],
        ['mix', 'out', 'vcf', 'in'],
        ['vcf', 'out', 'vca', 'in'],
        ['vca', 'out', 'dly', 'in'],
        ['dly', 'out', 'out', 'in'],
        ['lfo', 'out', 'vcf', 'cv'],
      ],
    },
  };

  const SESSIONS = {
    yorke: {
      name: 'Thom Yorke',
      toast: '톰 요크 세션이 열렸습니다. 시퀀스가 바로 돌고, LOOP의 REC로 겹쳐 녹음할 수 있습니다.',
      master: 0.62,
      modules: [
        { id: 'seq', type: 'seq', x: 16, y: 48, params: { bpm: 100, gate: 0.36, playing: true, steps: [
          { on: true, note: 50 }, { on: true, note: 53 }, { on: true, note: 57 }, { on: true, note: 58 },
          { on: true, note: 57 }, { on: true, note: 55 }, { on: true, note: 53 }, { on: true, note: 52 },
        ] } },
        { id: 'vco', type: 'vco', x: 468, y: 48, params: { wave: 'sawtooth', tune: 50, octave: 0, fine: 0, fm: 0 } },
        { id: 'vco2', type: 'vco', x: 664, y: 48, params: { wave: 'square', tune: 50, octave: 0, fine: 9, fm: 0 } },
        { id: 'mix', type: 'mix', x: 860, y: 48, params: { a: 0.72, b: 0.4, c: 0 } },
        { id: 'vcf', type: 'vcf', x: 1056, y: 48, params: { type: 'lowpass', cutoff: 480, res: 2.8, cv: 2400, drive: 1.9 } },
        { id: 'lfo', type: 'lfo', x: 16, y: 430, params: { wave: 'sine', rate: 0.11, depth: 0.28, polar: 'bi' } },
        { id: 'env', type: 'env', x: 208, y: 430, params: { a: 0.006, d: 0.24, s: 0.12, r: 0.32 } },
        { id: 'vca', type: 'vca', x: 400, y: 430, params: { level: 0, cv: 1 } },
        { id: 'loop', type: 'loop', x: 580, y: 430, params: { len: 4.8, speed: 1, mix: 0.82, dub: 0.62, level: 1 } },
        { id: 'dly', type: 'dly', x: 808, y: 430, params: { time: 0.45, fb: 0.46, mix: 0.34 } },
        { id: 'out', type: 'out', x: 1000, y: 430, params: { vol: 0.78 } },
      ],
      cables: [
        ['seq', 'pitch', 'vco', 'pitch'],
        ['seq', 'pitch', 'vco2', 'pitch'],
        ['seq', 'gate', 'env', 'gate'],
        ['vco', 'out', 'mix', 'a'],
        ['vco2', 'out', 'mix', 'b'],
        ['mix', 'out', 'vcf', 'in'],
        ['vcf', 'out', 'vca', 'in'],
        ['env', 'out', 'vca', 'cv'],
        ['env', 'out', 'vcf', 'cv'],
        ['lfo', 'out', 'vcf', 'cv'],
        ['vca', 'out', 'loop', 'in'],
        ['loop', 'out', 'dly', 'in'],
        ['dly', 'out', 'out', 'in'],
      ],
    },
  };

  let drag = null;
  let suggestCtx = null;
  let selected = null;
  let hydrating = false;
  let saveTimer = 0;
  let toastTimer = 0;
  let cablesDirty = true;
  let loopOn = false;
  const compDown = new Set();
  const scopeBuffers = new WeakMap();

  function $(id) { return document.getElementById(id); }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function snap(v) { return Math.round(v / 8) * 8; }

  function noteName(m) { return Engine.noteName(m); }

  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.classList.remove('show'), 3200);
  }

  function specOf(mod, param) {
    return Engine.specs[mod.type][param];
  }

  function toNorm(value, spec, curve) {
    const v = clamp(value, spec.min, spec.max);
    if (curve === 'log') {
      const a = Math.log(spec.min);
      const b = Math.log(spec.max);
      return (Math.log(v) - a) / (b - a);
    }
    return (v - spec.min) / (spec.max - spec.min);
  }

  function fromNorm(norm, spec, curve) {
    const n = clamp(norm, 0, 1);
    if (curve === 'log') {
      const a = Math.log(spec.min);
      const b = Math.log(spec.max);
      return Math.exp(a + n * (b - a));
    }
    return spec.min + n * (spec.max - spec.min);
  }

  function formatValue(value, format) {
    switch (format) {
      case 'note': return noteName(value);
      case 'hz':
        if (value >= 1000) {
          const k = value / 1000;
          const text = k >= 10 ? k.toFixed(1) : (Math.round(k * 100) / 100).toString();
          return text + 'k';
        }
        return Math.round(value) + 'Hz';
      case 'rate':
        return (value < 10 ? value.toFixed(2) : value.toFixed(1)) + 'Hz';
      case 'cent':
        return (value > 0 ? '+' : '') + Math.round(value);
      case 'pct':
        return Math.round(value * 100);
      case 'sec':
        return value < 0.1 ? Math.round(value * 1000) + 'ms' : value.toFixed(2) + 's';
      case 'oct':
        return (value > 0 ? '+' : '') + Math.round(value);
      case 'bpm':
        return String(Math.round(value));
      case 'num':
        return (Math.round(value * 100) / 100).toFixed(2);
      default:
        return String(Math.round(value * 100) / 100);
    }
  }

  function setKnobUI(el, value, spec, curve, format) {
    const norm = toNorm(value, spec, curve);
    el.querySelector('.knob-cap').style.transform = 'rotate(' + (-135 + norm * 270) + 'deg)';
    el.querySelector('.knob-readout').textContent = formatValue(value, format);
  }

  function knob(mod, param, label, opts) {
    const spec = specOf(mod, param);
    const curve = opts.curve || 'lin';
    const format = opts.format || '';
    const value = mod.params[param];
    const angle = -135 + toNorm(value, spec, curve) * 270;
    return (
      '<div class="knob' + (opts.big ? ' big' : '') + '" data-param="' + param + '" data-curve="' + curve + '" data-format="' + format + '">' +
        '<div class="knob-cap" style="transform:rotate(' + angle + 'deg)"></div>' +
        '<div class="knob-name">' + label + '</div>' +
        '<div class="knob-readout">' + formatValue(value, format) + '</div>' +
      '</div>'
    );
  }

  function choices(mod, param, options) {
    return (
      '<div class="choices" data-param="' + param + '">' +
        options.map((opt) => (
          '<button type="button" data-value="' + opt[0] + '" class="' + (mod.params[param] === opt[0] ? 'on' : '') + '">' + opt[1] + '</button>'
        )).join('') +
      '</div>'
    );
  }

  function jack(dir, port, kind, label) {
    const kindName = kind === 'audio' ? '오디오' : kind === 'cv' ? 'CV' : '게이트';
    const dirName = dir === 'out' ? '출력' : '입력';
    return (
      '<button type="button" class="jack" data-dir="' + dir + '" data-port="' + port + '" data-kind="' + kind + '" title="' + label + ' · ' + kindName + ' ' + dirName + '">' +
        '<span class="hole"></span><em>' + label + '</em>' +
      '</button>'
    );
  }

  function shell(mod, body, inputs, outputs) {
    const meta = META[mod.type];
    return (
      '<article class="module mod-' + mod.type + '" data-id="' + mod.id + '" style="left:' + mod.x + 'px;top:' + mod.y + 'px">' +
        '<span class="screw tl"></span><span class="screw tr"></span><span class="screw bl"></span><span class="screw br"></span>' +
        '<header class="mod-head"><div><div class="mod-title">' + meta[0] + '</div><div class="mod-sub">' + meta[1] + '</div></div>' +
        '<button type="button" class="mod-x" data-action="remove" title="모듈 삭제">×</button></header>' +
        '<div class="mod-body">' + body + '</div>' +
        '<footer class="mod-jacks"><div class="jack-group">' + inputs + '</div><div class="jack-group">' + outputs + '</div></footer>' +
      '</article>'
    );
  }

  function pianoInner(mod) {
    const start = 48 + mod.params.octave * 12;
    const end = start + 24;
    const ww = 20;
    const gap = 2;
    const bw = 13;
    const labels = {
      0: 'A', 1: 'W', 2: 'S', 3: 'E', 4: 'D', 5: 'F', 6: 'T', 7: 'G',
      8: 'Y', 9: 'H', 10: 'U', 11: 'J', 12: 'K', 13: 'O', 14: 'L', 15: 'P', 16: ';', 17: "'",
    };
    const whites = [];
    const blacks = [];
    let wi = 0;
    for (let midi = start; midi <= end; midi++) {
      const semi = midi - start;
      const label = labels[semi] || '';
      const isBlack = [1, 3, 6, 8, 10].includes(((midi % 12) + 12) % 12);
      if (isBlack) {
        const boundary = wi * (ww + gap) - gap / 2;
        blacks.push({ midi, left: boundary - bw / 2, label });
      } else {
        whites.push({ midi, label });
        wi += 1;
      }
    }
    const width = wi * ww + (wi - 1) * gap;
    return (
      '<div class="kb" style="width:' + width + 'px">' +
        '<div class="whites">' + whites.map((key) => (
          '<button type="button" class="key white" data-midi="' + key.midi + '"><span>' + key.label + '</span></button>'
        )).join('') + '</div>' +
        blacks.map((key) => (
          '<button type="button" class="key black" data-midi="' + key.midi + '" style="left:' + key.left + 'px"><span>' + key.label + '</span></button>'
        )).join('') +
      '</div>'
    );
  }

  function stepsInner(mod) {
    return mod.params.steps.map((step, index) => (
      '<div class="step' + (step.on ? ' on' : '') + '" data-step="' + index + '" role="button" tabindex="0">' +
        '<i></i><b>' + noteName(step.note) + '</b>' +
      '</div>'
    )).join('');
  }

  function render(mod) {
    const p = mod.params;
    if (mod.type === 'keys') {
      const body = (
        '<div class="oct-row">' +
          '<button type="button" data-action="oct" data-dir="-1" title="옥타브 다운">−</button>' +
          '<div class="oct-read" data-bind="octave">' + noteName(48 + p.octave * 12) + '</div>' +
          '<button type="button" data-action="oct" data-dir="1" title="옥타브 업">+</button>' +
          knob(mod, 'glide', 'GLIDE', { format: 'sec' }) +
          '<button type="button" class="mode-btn' + (p.mode === 'legato' ? ' on' : '') + '" data-action="mode">' + (p.mode === 'legato' ? 'LEG' : 'RETRIG') + '</button>' +
          '<i class="led"></i>' +
        '</div>' +
        '<div class="piano" data-piano>' + pianoInner(mod) + '</div>'
      );
      return shell(mod, body, '', jack('out', 'pitch', 'cv', 'PITCH') + jack('out', 'gate', 'gate', 'GATE') + jack('out', 'mod', 'cv', 'MOD'));
    }
    if (mod.type === 'seq') {
      const body = (
        '<div class="transport">' +
          '<button type="button" class="play" data-action="play">PLAY</button>' +
          knob(mod, 'bpm', 'BPM', { format: 'bpm' }) +
          knob(mod, 'gate', 'GATE', { format: 'pct' }) +
          '<button type="button" class="dice" data-action="dice" title="스케일 안에서 패턴 생성">패턴</button>' +
          '<i class="led"></i>' +
        '</div>' +
        '<div class="steps">' + stepsInner(mod) + '</div>'
      );
      return shell(mod, body, '', jack('out', 'pitch', 'cv', 'PITCH') + jack('out', 'gate', 'gate', 'GATE'));
    }
    if (mod.type === 'vco') {
      const body = (
        choices(mod, 'wave', [['sawtooth', 'SAW'], ['square', 'SQR'], ['triangle', 'TRI'], ['sine', 'SIN']]) +
        '<div class="badge" data-badge>' + (mod.pitchExternal ? 'EXT' : 'INT') + '</div>' +
        knob(mod, 'tune', 'TUNE', { format: 'note', big: true }) +
        '<div class="row">' +
          knob(mod, 'octave', 'OCT', { format: 'oct' }) +
          knob(mod, 'fine', 'FINE', { format: 'cent' }) +
          knob(mod, 'fm', 'FM', { format: 'hz' }) +
        '</div>'
      );
      return shell(
        mod,
        body,
        jack('in', 'pitch', 'cv', 'KEY') + jack('in', 'fm', 'cv', 'FM'),
        jack('out', 'out', 'audio', 'OUT')
      );
    }
    if (mod.type === 'vcf') {
      const body = (
        choices(mod, 'type', [['lowpass', 'LP'], ['highpass', 'HP'], ['bandpass', 'BP']]) +
        knob(mod, 'cutoff', 'CUTOFF', { format: 'hz', curve: 'log', big: true }) +
        '<div class="row">' +
          knob(mod, 'res', 'RES', { format: 'num' }) +
          knob(mod, 'cv', 'CV', { format: 'hz' }) +
          knob(mod, 'drive', 'DRV', { format: 'num' }) +
        '</div>'
      );
      return shell(mod, body, jack('in', 'in', 'audio', 'IN') + jack('in', 'cv', 'cv', 'CV'), jack('out', 'out', 'audio', 'OUT'));
    }
    if (mod.type === 'vca') {
      const body = (
        knob(mod, 'level', 'LEVEL', { format: 'pct', big: true }) +
        knob(mod, 'cv', 'CV', { format: 'num' }) +
        '<p class="hint-mini">LEVEL은 기본 음량. 엔벨로프를 쓰면 0으로.</p>'
      );
      return shell(mod, body, jack('in', 'in', 'audio', 'IN') + jack('in', 'cv', 'cv', 'CV'), jack('out', 'out', 'audio', 'OUT'));
    }
    if (mod.type === 'env') {
      const body = (
        '<div class="row">' +
          knob(mod, 'a', 'A', { format: 'sec', curve: 'log' }) +
          knob(mod, 'd', 'D', { format: 'sec', curve: 'log' }) +
        '</div>' +
        '<div class="row">' +
          knob(mod, 's', 'S', { format: 'pct' }) +
          knob(mod, 'r', 'R', { format: 'sec', curve: 'log' }) +
        '</div>' +
        '<i class="led big-led"></i>'
      );
      return shell(mod, body, jack('in', 'gate', 'gate', 'GATE'), jack('out', 'out', 'cv', 'OUT'));
    }
    if (mod.type === 'lfo') {
      const body = (
        choices(mod, 'wave', [['sine', 'SIN'], ['triangle', 'TRI'], ['square', 'SQR'], ['sawtooth', 'SAW']]) +
        knob(mod, 'rate', 'RATE', { format: 'rate', curve: 'log', big: true }) +
        '<div class="row">' + knob(mod, 'depth', 'DEPTH', { format: 'pct' }) + '</div>' +
        choices(mod, 'polar', [['bi', 'BI'], ['uni', 'UNI']])
      );
      return shell(mod, body, '', jack('out', 'out', 'cv', 'OUT'));
    }
    if (mod.type === 'noise') {
      const body = choices(mod, 'color', [['white', 'WHITE'], ['dark', 'DARK']]) + knob(mod, 'level', 'LEVEL', { format: 'pct', big: true });
      return shell(mod, body, '', jack('out', 'out', 'audio', 'OUT'));
    }
    if (mod.type === 'mix') {
      const body = '<div class="row">' + knob(mod, 'a', '1', { format: 'pct' }) + knob(mod, 'b', '2', { format: 'pct' }) + knob(mod, 'c', '3', { format: 'pct' }) + '</div>';
      return shell(
        mod,
        body,
        jack('in', 'a', 'audio', '1') + jack('in', 'b', 'audio', '2') + jack('in', 'c', 'audio', '3'),
        jack('out', 'out', 'audio', 'OUT')
      );
    }
    if (mod.type === 'dly') {
      const body = knob(mod, 'time', 'TIME', { format: 'sec', curve: 'log', big: true }) +
        '<div class="row">' + knob(mod, 'fb', 'FB', { format: 'pct' }) + knob(mod, 'mix', 'MIX', { format: 'pct' }) + '</div>';
      return shell(mod, body, jack('in', 'in', 'audio', 'IN'), jack('out', 'out', 'audio', 'OUT'));
    }
    if (mod.type === 'loop') {
      const body = (
        '<div class="loop-btns">' +
          '<button type="button" data-action="loop" data-cmd="rec">REC</button>' +
          '<button type="button" data-action="loop" data-cmd="play">PLAY</button>' +
          '<button type="button" data-action="loop" data-cmd="dub">DUB</button>' +
          '<button type="button" data-action="loop" data-cmd="clear">CLR</button>' +
        '</div>' +
        '<div class="loop-bar" title="루프 위치"><i class="loop-fill"></i></div>' +
        '<i class="led"></i>' +
        knob(mod, 'len', 'LEN', { format: 'sec', big: true }) +
        '<div class="row">' +
          knob(mod, 'speed', 'SPD', { format: 'num' }) +
          knob(mod, 'mix', 'MIX', { format: 'pct' }) +
          knob(mod, 'level', 'LVL', { format: 'pct' }) +
        '</div>' +
        knob(mod, 'dub', 'DUB', { format: 'pct' }) +
        '<p class="hint-mini">REC를 누르고, 다시 누르면 그 길이로 루프됩니다.</p>'
      );
      return shell(mod, body, jack('in', 'in', 'audio', 'IN') + jack('in', 'rec', 'gate', 'REC'), jack('out', 'out', 'audio', 'OUT'));
    }
    if (mod.type === 'att') {
      const body = knob(mod, 'gain', 'GAIN', { format: 'num', big: true }) + '<p class="hint-mini">−1 반전 · 0 무음 · 1 그대로</p>';
      return shell(mod, body, jack('in', 'in', 'cv', 'IN'), jack('out', 'out', 'cv', 'OUT'));
    }
    const body = (
      '<canvas class="scope" width="180" height="74"></canvas>' +
      '<div class="sig-row"><i class="sig"></i><span>SIGNAL</span></div>' +
      knob(mod, 'vol', 'VOL', { format: 'pct', big: true })
    );
    return shell(mod, body, jack('in', 'in', 'audio', 'IN'), '');
  }

  function moduleEl(id) {
    return document.querySelector('.module[data-id="' + id + '"]');
  }

  function bindCallbacks(mod) {
    mod.onPatchChange = () => {
      const badge = moduleEl(mod.id)?.querySelector('[data-badge]');
      if (badge) badge.textContent = mod.pitchExternal ? 'EXT' : 'INT';
      cablesDirty = true;
    };
    mod.onGateLamp = (on) => {
      moduleEl(mod.id)?.querySelectorAll('.led').forEach((led) => led.classList.toggle('on', !!on));
    };
    mod.onNote = (midi, down) => {
      const key = moduleEl(mod.id)?.querySelector('.key[data-midi="' + midi + '"]');
      if (key) key.classList.toggle('down', !!down);
    };
    mod.onStep = (index) => {
      moduleEl(mod.id)?.querySelectorAll('.step').forEach((el, i) => el.classList.toggle('current', i === index));
    };
    mod.onPlayChange = (on) => {
      const button = moduleEl(mod.id)?.querySelector('[data-action="play"]');
      if (!button) return;
      button.classList.toggle('on', !!on);
      button.textContent = on ? 'STOP' : 'PLAY';
    };
    mod.onStepsChange = () => {
      const box = moduleEl(mod.id)?.querySelector('.steps');
      if (box) box.innerHTML = stepsInner(mod);
    };
  }

  function mount(mod) {
    $('modules').insertAdjacentHTML('beforeend', render(mod));
    const el = $('modules').lastElementChild;
    bindCallbacks(mod);
    mod.w = el.offsetWidth || FOOTPRINT[mod.type][0];
    mod.h = el.offsetHeight || FOOTPRINT[mod.type][1];
  }

  function select(id) {
    selected = id;
    document.querySelectorAll('.module').forEach((el) => el.classList.toggle('selected', el.dataset.id === id));
  }

  function showEmpty() {
    $('empty').hidden = Engine.list().length !== 0;
  }

  function updateStats() {
    $('stats').textContent = '모듈 ' + Engine.list().length + ' · 케이블 ' + Engine.getCables().length;
  }

  function fitRack() {
    const rack = $('rack');
    const viewW = rack.parentElement ? rack.parentElement.clientWidth : 1100;
    let width = viewW;
    let height = 760;
    Engine.list().forEach((mod) => {
      width = Math.max(width, mod.x + (mod.w || 200) + 32);
      height = Math.max(height, mod.y + (mod.h || 300) + 40);
    });
    rack.style.width = width + 'px';
    rack.style.height = height + 'px';
  }

  function scheduleSave() {
    if (hydrating) return;
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Engine.serialize())); } catch (err) { /* private mode */ }
      updateStats();
    }, 320);
  }

  function dirty() {
    if (hydrating) return;
    const preset = $('preset');
    if (preset && preset.value) preset.value = '';
    const session = $('session');
    if (session && session.value) session.value = '';
    scheduleSave();
  }

  function refreshKnob(mod, param) {
    const el = moduleEl(mod.id)?.querySelector('.knob[data-param="' + param + '"]');
    if (!el) return;
    setKnobUI(el, mod.params[param], specOf(mod, param), el.dataset.curve || 'lin', el.dataset.format || '');
  }

  function changeOctave(mod, dir) {
    mod.api?.panic?.();
    compDown.clear();
    Engine.setParam(mod.id, 'octave', mod.params.octave + dir);
    const piano = moduleEl(mod.id)?.querySelector('[data-piano]');
    if (piano) piano.innerHTML = pianoInner(mod);
    const read = moduleEl(mod.id)?.querySelector('[data-bind="octave"]');
    if (read) read.textContent = noteName(48 + mod.params.octave * 12);
    dirty();
  }

  function nextSlot(type) {
    const fp = FOOTPRINT[type] || [180, 320];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 10; col++) {
        const x = 36 + col * 210;
        const y = 52 + row * 390;
        const hit = Engine.list().some((mod) => (
          x < mod.x + (mod.w || 180) + 16 &&
          x + fp[0] > mod.x - 16 &&
          y < mod.y + (mod.h || 320) + 16 &&
          y + fp[1] > mod.y - 16
        ));
        if (!hit) return { x, y };
      }
    }
    return { x: 36, y: 52 };
  }

  function addModule(type, x, y) {
    const mod = Engine.create(type);
    if (x == null) {
      const slot = nextSlot(type);
      mod.x = slot.x;
      mod.y = slot.y;
    } else {
      mod.x = Math.max(16, snap(x));
      mod.y = Math.max(46, snap(y));
    }
    mount(mod);
    fitRack();
    select(mod.id);
    showEmpty();
    cablesDirty = true;
    dirty();
    return mod;
  }

  function remove(id) {
    const el = moduleEl(id);
    Engine.removeModule(id);
    el?.remove();
    if (selected === id) selected = null;
    closeSuggest();
    showEmpty();
    fitRack();
    cablesDirty = true;
    dirty();
  }

  function loadPatch(data, presetId, source) {
    hydrating = true;
    closeSuggest();
    Engine.reset();
    $('modules').innerHTML = '';
    selected = null;
    if (!data || !Array.isArray(data.modules)) throw new Error('bad patch');
    const map = {};
    const autoplay = [];
    data.modules.forEach((src) => {
      if (!Engine.specs[src.type]) return;
      const mod = Engine.create(src.type, src.params || {});
      mod.x = clamp(Number(src.x) || 36, 0, 5000);
      mod.y = clamp(Number(src.y) || 52, 0, 5000);
      map[src.id] = mod.id;
      mount(mod);
      if (mod._wantPlay) autoplay.push(mod);
    });
    (data.cables || []).forEach((cable) => {
      const fromId = Array.isArray(cable) ? cable[0] : cable.fromId;
      const fromPort = Array.isArray(cable) ? cable[1] : cable.fromPort;
      const toId = Array.isArray(cable) ? cable[2] : cable.toId;
      const toPort = Array.isArray(cable) ? cable[3] : cable.toPort;
      const from = map[fromId];
      const to = map[toId];
      if (!from || !to) return;
      try { Engine.link(from, fromPort, to, toPort); } catch (err) { /* skip bad cable */ }
    });
    if (typeof data.master === 'number') {
      Engine.setMaster(data.master);
      $('master').value = String(Engine.master());
    }
    autoplay.forEach((mod) => mod.api.play());
    fitRack();
    showEmpty();
    cablesDirty = true;
    if (source === 'session') {
      $('preset').value = '';
      $('session').value = presetId || '';
    } else {
      $('preset').value = presetId || '';
      if ($('session')) $('session').value = '';
    }
    hydrating = false;
    scheduleSave();
    updateStats();
  }

  function loadPreset(id) {
    const preset = PRESETS[id];
    if (!preset) return;
    loadPatch(JSON.parse(JSON.stringify(preset)), id, 'preset');
    toast(preset.toast);
  }

  function loadSession(id) {
    const session = SESSIONS[id];
    if (!session) return;
    loadPatch(JSON.parse(JSON.stringify(session)), id, 'session');
    toast(session.toast);
  }

  function pointOf(el) {
    const rack = $('rack').getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left - rack.left + rect.width / 2,
      y: rect.top - rack.top + rect.height / 2,
    };
  }

  function jackCenter(modId, port, dir) {
    const jackEl = moduleEl(modId)?.querySelector('.jack[data-port="' + port + '"][data-dir="' + dir + '"] .hole');
    if (!jackEl) return null;
    return pointOf(jackEl);
  }

  function cablePath(a, b) {
    const sag = Math.max(42, Math.min(190, Math.abs(b.x - a.x) * 0.34 + 50));
    return 'M ' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) +
      ' C ' + a.x.toFixed(1) + ' ' + (a.y + sag).toFixed(1) +
      ', ' + b.x.toFixed(1) + ' ' + (b.y + sag).toFixed(1) +
      ', ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1);
  }

  function drawCables() {
    const rack = $('rack');
    const svg = $('cables');
    svg.setAttribute('width', rack.clientWidth);
    svg.setAttribute('height', rack.clientHeight);
    const parts = [];
    Engine.getCables().forEach((cable) => {
      const a = jackCenter(cable.fromId, cable.fromPort, 'out');
      const b = jackCenter(cable.toId, cable.toPort, 'in');
      if (!a || !b) return;
      const d = cablePath(a, b);
      const width = cable.kind === 'audio' ? 4.5 : cable.kind === 'gate' ? 3 : 3.4;
      const dash = cable.kind === 'gate' ? ' stroke-dasharray="7 6"' : '';
      parts.push('<path d="' + d + '" stroke="rgba(0,0,0,.4)" stroke-width="' + (width + 2.4) + '" fill="none" stroke-linecap="round" filter="url(#cblur)"/>');
      parts.push('<path d="' + d + '" stroke="' + cable.color + '" stroke-width="' + width + '" fill="none" stroke-linecap="round"' + dash + '/>');
      parts.push('<circle cx="' + a.x.toFixed(1) + '" cy="' + a.y.toFixed(1) + '" r="4.5" fill="' + cable.color + '"/>');
      parts.push('<circle cx="' + b.x.toFixed(1) + '" cy="' + b.y.toFixed(1) + '" r="4.5" fill="' + cable.color + '"/>');
    });
    if (drag && drag.type === 'cable') {
      const fromDir = drag.fromDir;
      const origin = jackCenter(drag.fromId, drag.fromPort, fromDir);
      if (origin && drag.px != null) {
        const rackRect = rack.getBoundingClientRect();
        const tip = drag.snap || { x: drag.px - rackRect.left, y: drag.py - rackRect.top };
        const a = fromDir === 'out' ? origin : tip;
        const b = fromDir === 'out' ? tip : origin;
        const d = cablePath(a, b);
        parts.push('<path d="' + d + '" stroke="#f4efe6" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="4 6" opacity="0.85"/>');
      }
    }
    $('cable-layer').innerHTML = parts.join('');
  }

  function scopeBuffer(analyser) {
    let buffer = scopeBuffers.get(analyser);
    if (!buffer || buffer.length !== analyser.fftSize) {
      buffer = new Uint8Array(analyser.fftSize);
      scopeBuffers.set(analyser, buffer);
    }
    return buffer;
  }

  function rmsOf(buffer) {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < buffer.length; i += 8) {
      const v = (buffer[i] - 128) / 128;
      sum += v * v;
      count += 1;
    }
    return Math.sqrt(sum / Math.max(1, count));
  }

  function drawScopes() {
    document.querySelectorAll('canvas.scope').forEach((canvas) => {
      const mod = Engine.get(canvas.closest('.module').dataset.id);
      if (!mod?.analyser) return;
      const width = canvas.clientWidth || 180;
      const height = canvas.clientHeight || 74;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const bw = Math.max(1, Math.floor(width * dpr));
      const bh = Math.max(1, Math.floor(height * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      const g = canvas.getContext('2d');
      const buffer = scopeBuffer(mod.analyser);
      mod.analyser.getByteTimeDomainData(buffer);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = '#070807';
      g.fillRect(0, 0, width, height);
      g.strokeStyle = 'rgba(255,176,58,0.18)';
      g.beginPath();
      g.moveTo(0, height / 2);
      g.lineTo(width, height / 2);
      g.stroke();
      g.beginPath();
      g.lineWidth = 1.6;
      g.strokeStyle = '#ffb03a';
      const step = buffer.length / width;
      for (let x = 0; x < width; x++) {
        const sample = buffer[Math.min(buffer.length - 1, Math.floor(x * step))] / 128 - 1;
        const y = height / 2 + sample * height * 0.42;
        if (x === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
      const level = rmsOf(buffer);
      const sig = canvas.parentElement.querySelector('.sig');
      if (sig) {
        sig.classList.toggle('hot', level > 0.04);
        sig.classList.toggle('clip', level > 0.45);
      }
    });

    const master = Engine.masterAnalyser();
    if (!master) return;
    const buffer = scopeBuffer(master);
    master.getByteTimeDomainData(buffer);
    const level = rmsOf(buffer);
    const meter = $('meter');
    meter.classList.toggle('hot', level > 0.05);
    meter.classList.toggle('clip', level > 0.5);
  }

  function frame() {
    if (cablesDirty || (drag && drag.type === 'cable')) {
      drawCables();
      cablesDirty = false;
    }
    drawScopes();
    paintLoops();
    window.requestAnimationFrame(frame);
  }

  function paintLoops() {
    Engine.list().forEach((mod) => {
      if (mod.type !== 'loop') return;
      const root = moduleEl(mod.id);
      if (!root) return;
      const fill = root.querySelector('.loop-fill');
      if (fill) fill.style.transform = 'scaleX(' + (mod._pos || 0) + ')';
      const state = mod._state || 'idle';
      if (root.dataset.loop === state) return;
      root.dataset.loop = state;
      root.querySelectorAll('[data-cmd]').forEach((button) => {
        const cmd = button.dataset.cmd;
        const on = (cmd === 'rec' && state === 'rec') ||
          (cmd === 'play' && (state === 'play' || state === 'dub')) ||
          (cmd === 'dub' && state === 'dub');
        button.classList.toggle('on', on);
      });
      const led = root.querySelector('.led');
      if (led) {
        led.classList.toggle('on', state === 'play' || state === 'dub');
        led.classList.toggle('rec', state === 'rec');
      }
    });
  }

  function clearJackMarks() {
    document.querySelectorAll('.jack.hot, .jack.bad, .jack.armed').forEach((el) => {
      el.classList.remove('hot', 'bad', 'armed');
    });
  }

  function jackFromEvent(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const jackEl = el && el.closest ? el.closest('.jack') : null;
    if (!jackEl) return null;
    return {
      el: jackEl,
      id: jackEl.closest('.module').dataset.id,
      port: jackEl.dataset.port,
      dir: jackEl.dataset.dir,
      kind: jackEl.dataset.kind,
    };
  }

  function beginCable(e, jackEl) {
    e.preventDefault();
    drag = {
      type: 'cable',
      fromId: jackEl.closest('.module').dataset.id,
      fromPort: jackEl.dataset.port,
      fromDir: jackEl.dataset.dir,
      fromKind: jackEl.dataset.kind,
      px: e.clientX,
      py: e.clientY,
      sx: e.clientX,
      sy: e.clientY,
      snap: null,
    };
    jackEl.classList.add('armed');
    try { jackEl.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  }

  function beginKnob(e, knobEl) {
    e.preventDefault();
    const mod = Engine.get(knobEl.closest('.module').dataset.id);
    drag = {
      type: 'knob',
      id: mod.id,
      param: knobEl.dataset.param,
      curve: knobEl.dataset.curve || 'lin',
      format: knobEl.dataset.format || '',
      startY: e.clientY,
      startNorm: toNorm(mod.params[knobEl.dataset.param], specOf(mod, knobEl.dataset.param), knobEl.dataset.curve || 'lin'),
      el: knobEl,
    };
    try { knobEl.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  }

  function beginStep(e, stepEl) {
    e.preventDefault();
    const mod = Engine.get(stepEl.closest('.module').dataset.id);
    const index = Number(stepEl.dataset.step);
    drag = {
      type: 'step',
      id: mod.id,
      index,
      startY: e.clientY,
      startNote: mod.params.steps[index].note,
      moved: false,
      el: stepEl,
    };
  }

  function beginPiano(e, piano) {
    e.preventDefault();
    const mod = Engine.get(piano.closest('.module').dataset.id);
    drag = { type: 'piano', id: mod.id, midi: null };
    try { piano.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    slidePiano(e);
  }

  function slidePiano(e) {
    if (!drag || drag.type !== 'piano') return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const key = el && el.closest ? el.closest('.key') : null;
    const same = key && key.closest('.module')?.dataset.id === drag.id;
    const midi = same ? Number(key.dataset.midi) : null;
    if (midi === drag.midi) return;
    const api = Engine.get(drag.id).api;
    if (drag.midi != null) api.noteOff(drag.midi);
    drag.midi = midi;
    if (midi != null) api.noteOn(midi);
  }

  function beginMove(e, head) {
    e.preventDefault();
    const el = head.closest('.module');
    const mod = Engine.get(el.dataset.id);
    const rect = el.getBoundingClientRect();
    drag = {
      type: 'move',
      id: mod.id,
      ox: e.clientX - rect.left,
      oy: e.clientY - rect.top,
    };
  }

  function beginLib(e, button) {
    drag = {
      type: 'lib',
      modType: button.dataset.add,
      label: button.querySelector('b').textContent,
      sx: e.clientX,
      sy: e.clientY,
      moved: false,
    };
  }

  function ensureGhost(text, x, y) {
    let ghost = $('ghost');
    if (!ghost) {
      ghost = document.createElement('div');
      ghost.id = 'ghost';
      ghost.className = 'lib-ghost';
      document.body.appendChild(ghost);
    }
    ghost.textContent = text;
    ghost.style.left = (x + 12) + 'px';
    ghost.style.top = (y + 12) + 'px';
    return ghost;
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;
    if (e.target.closest('#suggest')) return;
    if (!$('suggest').hidden) closeSuggest();
    const modEl = e.target.closest('.module');
    if (modEl) select(modEl.dataset.id);
    else if (e.target.closest('#rack')) select(null);

    const jackEl = e.target.closest('.jack');
    if (jackEl) { beginCable(e, jackEl); return; }
    const knobEl = e.target.closest('.knob');
    if (knobEl) { beginKnob(e, knobEl); return; }
    const stepEl = e.target.closest('.step');
    if (stepEl) { beginStep(e, stepEl); return; }
    const piano = e.target.closest('.piano');
    if (piano) { beginPiano(e, piano); return; }
    const lib = e.target.closest('[data-add]');
    if (lib && lib.closest('#library')) { beginLib(e, lib); return; }
    const head = e.target.closest('.mod-head');
    if (head && !e.target.closest('button')) beginMove(e, head);
  }

  function onPointerMove(e) {
    if (!drag) return;
    if (drag.type === 'knob') {
      const mod = Engine.get(drag.id);
      const spec = specOf(mod, drag.param);
      const scale = e.shiftKey ? 0.0011 : 0.0048;
      const norm = clamp(drag.startNorm + (drag.startY - e.clientY) * scale, 0, 1);
      Engine.setParam(mod.id, drag.param, fromNorm(norm, spec, drag.curve));
      setKnobUI(drag.el, mod.params[drag.param], spec, drag.curve, drag.format);
      return;
    }
    if (drag.type === 'cable') {
      drag.px = e.clientX;
      drag.py = e.clientY;
      document.querySelectorAll('.jack.hot, .jack.bad').forEach((el) => el.classList.remove('hot', 'bad'));
      const hit = jackFromEvent(e);
      drag.snap = null;
      if (hit && !(hit.id === drag.fromId && hit.port === drag.fromPort && hit.dir === drag.fromDir)) {
        const opposite = hit.dir !== drag.fromDir;
        const outKind = drag.fromDir === 'out' ? drag.fromKind : hit.kind;
        const inKind = drag.fromDir === 'in' ? drag.fromKind : hit.kind;
        const ok = opposite && Engine.compatible(outKind, inKind);
        hit.el.classList.add(ok ? 'hot' : 'bad');
        if (ok) drag.snap = pointOf(hit.el.querySelector('.hole'));
      }
      cablesDirty = true;
      return;
    }
    if (drag.type === 'move') {
      const mod = Engine.get(drag.id);
      const el = moduleEl(mod.id);
      const rack = $('rack').getBoundingClientRect();
      mod.x = Math.max(12, snap(e.clientX - rack.left - drag.ox));
      mod.y = Math.max(46, snap(e.clientY - rack.top - drag.oy));
      el.style.left = mod.x + 'px';
      el.style.top = mod.y + 'px';
      fitRack();
      cablesDirty = true;
      return;
    }
    if (drag.type === 'step') {
      const mod = Engine.get(drag.id);
      const delta = Math.round((drag.startY - e.clientY) / 6);
      if (delta !== 0) drag.moved = true;
      const note = clamp(drag.startNote + delta, 24, 96);
      const step = mod.params.steps[drag.index];
      if (step.note !== note) {
        step.note = note;
        drag.el.querySelector('b').textContent = noteName(note);
      }
      return;
    }
    if (drag.type === 'piano') {
      slidePiano(e);
      return;
    }
    if (drag.type === 'lib') {
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true;
      if (drag.moved) {
        ensureGhost(drag.label, e.clientX, e.clientY);
        $('rack').classList.add('drop');
      }
    }
  }

  function describeJack(id, port, dir) {
    const button = moduleEl(id)?.querySelector('.jack[data-port="' + port + '"][data-dir="' + dir + '"]');
    return button ? button.querySelector('em').textContent : port.toUpperCase();
  }

  function moduleTitle(mod) {
    const same = Engine.list().filter((item) => item.type === mod.type);
    const name = META[mod.type][0];
    if (same.length < 2) return name;
    return name + ' ' + (same.indexOf(mod) + 1);
  }

  function patchEnds(origin, other) {
    const out = origin.dir === 'out' ? origin : other;
    const inn = origin.dir === 'in' ? origin : other;
    return { out, inn };
  }

  function tryLink(out, inn) {
    if (!out || !inn || out.dir !== 'out' || inn.dir !== 'in') return false;
    if (!Engine.compatible(out.kind, inn.kind)) {
      toast('이 잭끼리는 연결할 수 없습니다. 게이트는 게이트끼리만 연결됩니다.');
      return false;
    }
    try {
      const cable = Engine.link(out.id, out.port, inn.id, inn.port);
      if (cable === null) {
        toast('이미 연결된 잭입니다.');
        return false;
      }
      dirty();
      closeSuggest();
    } catch (err) {
      toast('이 연결은 만들 수 없습니다.');
      return false;
    }
    cablesDirty = true;
    return true;
  }

  function jackAt(x, y) {
    const el = document.elementFromPoint(x, y);
    const button = el && el.closest ? el.closest('.jack') : null;
    if (!button) return null;
    return {
      el: button,
      id: button.closest('.module').dataset.id,
      port: button.dataset.port,
      dir: button.dataset.dir,
      kind: button.dataset.kind,
    };
  }

  function nearestCompatible(x, y, origin) {
    let best = null;
    let bestDist = 26;
    document.querySelectorAll('.jack').forEach((button) => {
      const id = button.closest('.module').dataset.id;
      const port = button.dataset.port;
      const dir = button.dataset.dir;
      if (id === origin.id && port === origin.port && dir === origin.dir) return;
      if (dir === origin.dir) return;
      const hole = button.querySelector('.hole');
      const rect = hole.getBoundingClientRect();
      const dist = Math.hypot(rect.left + rect.width / 2 - x, rect.top + rect.height / 2 - y);
      if (dist >= bestDist) return;
      const other = { id, port, dir, kind: button.dataset.kind };
      const ends = patchEnds(origin, other);
      if (!Engine.compatible(ends.out.kind, ends.inn.kind)) return;
      bestDist = dist;
      best = other;
    });
    return best;
  }

  const PATCH_HINTS = {
    'keys.pitch>vco.pitch': [100, '건반 음높이를 오실레이터에 넣습니다'],
    'seq.pitch>vco.pitch': [100, '시퀀스 음높이를 오실레이터에 넣습니다'],
    'keys.gate>env.gate': [100, '건반을 누르면 엔벨로프가 열립니다'],
    'seq.gate>env.gate': [100, '스텝마다 엔벨로프가 열립니다'],
    'keys.gate>loop.rec': [74, '건반을 누르는 동안 루프가 녹음됩니다'],
    'seq.gate>loop.rec': [70, '스텝 게이트로 루프를 녹음합니다'],
    'keys.mod>vcf.cv': [78, '모듈레이션 휠로 필터를 엽니다'],
    'keys.mod>vco.fm': [66, '모듈레이션 휠로 음높이를 흔듭니다'],
    'seq.mod>vcf.cv': [64, '시퀀스 모듈레이션으로 필터를 엽니다'],
    'env.out>vca.cv': [100, '엔벨로프로 음량을 엽니다'],
    'env.out>vcf.cv': [90, '엔벨로프로 필터를 엽니다'],
    'lfo.out>vcf.cv': [92, 'LFO로 필터를 흔듭니다'],
    'lfo.out>vco.fm': [86, 'LFO로 음높이를 흔듭니다'],
    'lfo.out>vca.cv': [64, 'LFO로 음량을 흔듭니다'],
    'lfo.out>att.in': [50, 'LFO 세기를 먼저 조절합니다'],
    'env.out>att.in': [48, '엔벨로프 세기를 조절합니다'],
    'att.out>vca.cv': [74, '조절한 CV로 음량을 엽니다'],
    'att.out>vcf.cv': [74, '조절한 CV로 필터를 엽니다'],
    'att.out>vco.fm': [66, '조절한 CV로 음높이를 흔듭니다'],
    'vco.out>vcf.in': [100, '오실레이터를 필터에 넣습니다'],
    'vco.out>mix.a': [76, '믹서 1번으로 소리를 합칩니다'],
    'vco.out>mix.b': [74, '믹서 2번으로 소리를 합칩니다'],
    'vco.out>mix.c': [72, '믹서 3번으로 소리를 합칩니다'],
    'vco.out>vca.in': [58, '필터를 거치지 않고 앰프로 갑니다'],
    'noise.out>vcf.in': [88, '노이즈를 필터에 넣습니다'],
    'noise.out>mix.a': [60, '노이즈를 믹서에 섞습니다'],
    'noise.out>mix.b': [58, '노이즈를 믹서에 섞습니다'],
    'noise.out>mix.c': [56, '노이즈를 믹서에 섞습니다'],
    'vcf.out>vca.in': [100, '필터를 거친 소리를 앰프로 보냅니다'],
    'vcf.out>dly.in': [64, '필터 소리에 딜레이를 겁니다'],
    'vcf.out>loop.in': [62, '필터 소리를 루프에 넣습니다'],
    'vca.out>out.in': [100, '스피커로 보냅니다'],
    'vca.out>dly.in': [80, '앰프 뒤에 딜레이를 겁니다'],
    'vca.out>loop.in': [78, '연주를 루프에 녹음합니다'],
    'mix.out>vcf.in': [86, '합친 소리를 필터에 넣습니다'],
    'mix.out>vca.in': [74, '합친 소리를 앰프로 보냅니다'],
    'mix.out>out.in': [68, '믹서를 바로 스피커로 보냅니다'],
    'dly.out>out.in': [94, '딜레이를 스피커로 보냅니다'],
    'loop.out>dly.in': [76, '루프에 딜레이를 겁니다'],
    'loop.out>out.in': [92, '루프를 스피커로 보냅니다'],
    'vco.out>loop.in': [56, '오실레이터를 바로 루프에 넣습니다'],
    'vco.out>dly.in': [50, '오실레이터에 딜레이를 겁니다'],
    'vco.out>out.in': [36, '오실레이터를 바로 스피커로 보냅니다'],
  };

  function hintFor(src, dst) {
    const key = src.type + '.' + src.port + '>' + dst.type + '.' + dst.port;
    if (PATCH_HINTS[key]) return { score: PATCH_HINTS[key][0], reason: PATCH_HINTS[key][1] };
    if (dst.type === 'out') return { score: 34, reason: '스피커로 바로 보냅니다' };
    if (src.kind === 'gate') return { score: 28, reason: '게이트로 이 모듈을 켭니다' };
    if (dst.port === 'cv' || dst.port === 'fm' || dst.port === 'pitch') return { score: 26, reason: 'CV로 이 모듈을 움직입니다' };
    if (src.kind === 'audio') return { score: 24, reason: '소리를 이 입력으로 보냅니다' };
    return { score: 22, reason: 'CV를 이 입력으로 보냅니다' };
  }

  function recommend(origin) {
    const fromMod = Engine.get(origin.id);
    const portsOf = origin.dir === 'out' ? 'inputs' : 'outputs';
    const otherDir = origin.dir === 'out' ? 'in' : 'out';
    const items = [];
    Engine.list().forEach((mod) => {
      if (mod.id === origin.id) return;
      Object.entries(mod[portsOf]).forEach(([port, spec]) => {
        const other = { id: mod.id, port, dir: otherDir, kind: spec.kind };
        const ends = patchEnds(origin, other);
        if (ends.out.dir !== 'out' || ends.inn.dir !== 'in') return;
        if (!Engine.compatible(ends.out.kind, ends.inn.kind)) return;
        const taken = Engine.getCables().some((cable) => (
          cable.fromId === ends.out.id && cable.fromPort === ends.out.port &&
          cable.toId === ends.inn.id && cable.toPort === ends.inn.port
        ));
        if (taken) return;
        const src = { type: Engine.get(ends.out.id).type, port: ends.out.port, kind: ends.out.kind };
        const dst = { type: Engine.get(ends.inn.id).type, port: ends.inn.port };
        const hint = hintFor(src, dst);
        const occupied = Engine.getCables().some((cable) => cable.toId === ends.inn.id && cable.toPort === ends.inn.port);
        items.push({
          id: mod.id,
          modId: mod.id,
          port,
          dir: otherDir,
          kind: spec.kind,
          score: hint.score + (occupied ? -8 : 10),
          title: moduleTitle(mod) + ' · ' + describeJack(mod.id, port, otherDir),
          reason: occupied ? hint.reason + ' 이 입력에는 이미 선이 있습니다.' : hint.reason,
        });
      });
    });
    items.sort((a, b) => b.score - a.score);
    const strong = items.filter((item) => item.score >= 60);
    return (strong.length ? strong : items).slice(0, 5);
  }

  function closeSuggest() {
    suggestCtx = null;
    const panel = $('suggest');
    if (panel) panel.hidden = true;
    const list = $('suggest-list');
    if (list) list.innerHTML = '';
    clearJackMarks();
  }

  function openSuggest(origin) {
    const items = recommend(origin);
    suggestCtx = { origin, items };
    const mod = Engine.get(origin.id);
    const kindName = origin.kind === 'audio' ? '오디오' : origin.kind === 'cv' ? 'CV' : '게이트';
    const dirName = origin.dir === 'out' ? '출력' : '입력';
    $('suggest-title').textContent = moduleTitle(mod) + ' · ' + describeJack(origin.id, origin.port, origin.dir);
    $('suggest-lead').textContent = items.length
      ? kindName + ' ' + dirName + '을 바닥에 놓았습니다. 아래 잭에 꽂는 걸 추천합니다.'
      : '이 잭과 맞는 입력이나 출력이 랙에 없습니다.';
    const list = $('suggest-list');
    list.innerHTML = '';
    items.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'suggest-item';
      button.dataset.suggest = String(index);
      const name = document.createElement('b');
      name.textContent = item.title;
      const reason = document.createElement('span');
      reason.textContent = item.reason;
      button.append(name, reason);
      list.append(button);
    });
    $('suggest').hidden = false;
    clearJackMarks();
    moduleEl(origin.id)?.querySelector('.jack[data-port="' + origin.port + '"][data-dir="' + origin.dir + '"]')?.classList.add('armed');
  }

  function previewSuggest(index) {
    document.querySelectorAll('.jack.hot').forEach((el) => el.classList.remove('hot'));
    if (!suggestCtx || index == null) return;
    const item = suggestCtx.items[index];
    if (!item) return;
    moduleEl(item.modId)?.querySelector('.jack[data-port="' + item.port + '"][data-dir="' + item.dir + '"]')?.classList.add('hot');
  }

  function finishCable(e) {
    const from = drag;
    drag = null;
    clearJackMarks();
    cablesDirty = true;
    const origin = {
      id: from.fromId,
      port: from.fromPort,
      dir: from.fromDir,
      kind: from.fromKind,
    };
    const direct = jackAt(e.clientX, e.clientY);
    const same = direct && direct.id === origin.id && direct.port === origin.port && direct.dir === origin.dir;
    const hit = same ? null : (direct || nearestCompatible(e.clientX, e.clientY, origin));
    if (hit) {
      const ends = patchEnds(origin, hit);
      if (ends.out.dir === 'out' && ends.inn.dir === 'in') {
        if (Engine.compatible(ends.out.kind, ends.inn.kind)) {
          tryLink(ends.out, ends.inn);
          return;
        }
        if (direct) {
          toast('이 잭끼리는 연결할 수 없습니다. 게이트는 게이트끼리만 연결됩니다.');
          return;
        }
      }
    }
    const moved = Math.hypot(e.clientX - from.sx, e.clientY - from.sy) > 8;
    if (!moved) return;
    const rack = $('rack').getBoundingClientRect();
    const inside = e.clientX >= rack.left && e.clientX <= rack.right && e.clientY >= rack.top && e.clientY <= rack.bottom;
    if (!inside) return;
    openSuggest(origin);
  }

  function onPointerUp(e) {
    if (!drag) return;
    const current = drag;
    if (current.type === 'cable') { finishCable(e); return; }
    if (current.type === 'knob') { drag = null; dirty(); return; }
    if (current.type === 'move') { drag = null; dirty(); return; }
    if (current.type === 'step') {
      drag = null;
      const mod = Engine.get(current.id);
      const step = mod.params.steps[current.index];
      if (!current.moved) {
        step.on = !step.on;
        current.el.classList.toggle('on', step.on);
      }
      dirty();
      return;
    }
    if (current.type === 'piano') {
      if (current.midi != null) Engine.get(current.id).api.noteOff(current.midi);
      drag = null;
      return;
    }
    if (current.type === 'lib') {
      drag = null;
      $('ghost')?.remove();
      $('rack').classList.remove('drop');
      if (!current.moved) {
        addModule(current.modType);
        return;
      }
      const rack = $('rack').getBoundingClientRect();
      const inside = e.clientX >= rack.left && e.clientX <= rack.right && e.clientY >= rack.top && e.clientY <= rack.bottom;
      if (!inside) return;
      const fp = FOOTPRINT[current.modType] || [180, 300];
      addModule(current.modType, e.clientX - rack.left - fp[0] / 2, e.clientY - rack.top - 28);
    }
  }

  function onClick(e) {
    const choice = e.target.closest('.choices button');
    if (choice) {
      const box = choice.closest('.choices');
      const mod = Engine.get(choice.closest('.module').dataset.id);
      Engine.setParam(mod.id, box.dataset.param, choice.dataset.value);
      box.querySelectorAll('button').forEach((button) => button.classList.toggle('on', button === choice));
      dirty();
      return;
    }
    const action = e.target.closest('[data-action]');
    if (!action || !action.closest('.module')) return;
    const mod = Engine.get(action.closest('.module').dataset.id);
    if (!mod) return;
    if (action.dataset.action === 'remove') remove(mod.id);
    if (action.dataset.action === 'oct') changeOctave(mod, Number(action.dataset.dir));
    if (action.dataset.action === 'mode') {
      const next = mod.params.mode === 'legato' ? 'retrig' : 'legato';
      Engine.setParam(mod.id, 'mode', next);
      action.textContent = next === 'legato' ? 'LEG' : 'RETRIG';
      action.classList.toggle('on', next === 'legato');
      dirty();
    }
    if (action.dataset.action === 'loop') {
      const cmd = action.dataset.cmd;
      if (mod.api && mod.api[cmd]) mod.api[cmd]();
      return;
    }
    if (action.dataset.action === 'play' && mod.type === 'seq') {
      if (mod.api.isRunning()) mod.api.stop();
      else mod.api.play();
      dirty();
    }
    if (action.dataset.action === 'dice') {
      mod.api.randomize();
      dirty();
    }
  }

  function onDoubleClick(e) {
    const knobEl = e.target.closest('.knob');
    if (knobEl) {
      const mod = Engine.get(knobEl.closest('.module').dataset.id);
      const spec = specOf(mod, knobEl.dataset.param);
      Engine.setParam(mod.id, knobEl.dataset.param, spec.def);
      refreshKnob(mod, knobEl.dataset.param);
      dirty();
      return;
    }
    const jackEl = e.target.closest('.jack');
    if (!jackEl) return;
    const id = jackEl.closest('.module').dataset.id;
    Engine.disconnectPort(id, jackEl.dataset.port, jackEl.dataset.dir);
    cablesDirty = true;
    dirty();
  }

  function onContextMenu(e) {
    const jackEl = e.target.closest('.jack');
    if (!jackEl) return;
    e.preventDefault();
    Engine.disconnectPort(jackEl.closest('.module').dataset.id, jackEl.dataset.port, jackEl.dataset.dir);
    cablesDirty = true;
    dirty();
  }

  function onWheel(e) {
    const knobEl = e.target.closest('.knob');
    if (knobEl) {
      e.preventDefault();
      const mod = Engine.get(knobEl.closest('.module').dataset.id);
      const spec = specOf(mod, knobEl.dataset.param);
      const curve = knobEl.dataset.curve || 'lin';
      let norm = toNorm(mod.params[knobEl.dataset.param], spec, curve);
      norm += (e.deltaY < 0 ? 1 : -1) * (e.shiftKey ? 0.01 : 0.03);
      Engine.setParam(mod.id, knobEl.dataset.param, fromNorm(norm, spec, curve));
      setKnobUI(knobEl, mod.params[knobEl.dataset.param], spec, curve, knobEl.dataset.format || '');
      dirty();
      return;
    }
    const stepEl = e.target.closest('.step');
    if (!stepEl) return;
    e.preventDefault();
    const mod = Engine.get(stepEl.closest('.module').dataset.id);
    const step = mod.params.steps[Number(stepEl.dataset.step)];
    step.note = clamp(step.note + (e.deltaY < 0 ? 1 : -1), 24, 96);
    stepEl.querySelector('b').textContent = noteName(step.note);
    dirty();
  }

  function eachKeys() {
    return Engine.list().filter((mod) => mod.type === 'keys');
  }

  function computerOn(semi) {
    if (compDown.has(semi)) return;
    compDown.add(semi);
    eachKeys().forEach((mod) => mod.api.noteOn(48 + mod.params.octave * 12 + semi));
  }

  function computerOff(semi) {
    if (!compDown.has(semi)) return;
    compDown.delete(semi);
    eachKeys().forEach((mod) => mod.api.noteOff(48 + mod.params.octave * 12 + semi));
  }

  function onKeyDown(e) {
    if (e.target.closest('input, textarea, select')) return;
    if (e.key === 'Escape' && !$('suggest').hidden) {
      closeSuggest();
      return;
    }
    const help = $('help');
    if (help.open && e.key !== 'Escape') return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (!e.repeat) Engine.sustain(true);
      return;
    }
    if (e.repeat) return;
    if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
      e.preventDefault();
      remove(selected);
      return;
    }
    if (e.code === 'KeyZ' || e.code === 'KeyX') {
      const dir = e.code === 'KeyX' ? 1 : -1;
      eachKeys().forEach((mod) => changeOctave(mod, dir));
      return;
    }
    if (KEYMAP[e.code] != null) {
      e.preventDefault();
      computerOn(KEYMAP[e.code]);
    }
  }

  function onKeyUp(e) {
    if (e.code === 'Space') Engine.sustain(false);
    if (KEYMAP[e.code] != null) computerOff(KEYMAP[e.code]);
  }

  function exportPatch() {
    const blob = new Blob([JSON.stringify(Engine.serialize(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ximya-modular.json';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function bindChrome() {
    $('panic').addEventListener('click', () => {
      compDown.clear();
      Engine.panic();
      toast('모든 음을 껐습니다.');
    });
    $('mute').addEventListener('click', () => {
      const muted = Engine.setMuted(!Engine.isMuted());
      $('mute').classList.toggle('on', muted);
      $('mute').textContent = muted ? '음소거 해제' : '음소거';
    });
    $('master').addEventListener('input', () => {
      Engine.setMaster(Number($('master').value));
      dirty();
    });
    $('load-preset').addEventListener('click', () => {
      const id = $('preset').value;
      if (!id) {
        toast('목록에서 프리셋을 고르세요.');
        return;
      }
      loadPreset(id);
    });
    $('preset').addEventListener('change', () => {
      if ($('preset').value) loadPreset($('preset').value);
    });
    $('session').addEventListener('change', () => {
      if ($('session').value) loadSession($('session').value);
    });
    $('clear').addEventListener('click', () => {
      if (!Engine.list().length) return;
      if (!window.confirm('랙의 모듈을 모두 지울까요?')) return;
      Engine.reset();
      $('modules').innerHTML = '';
      selected = null;
      closeSuggest();
      showEmpty();
      fitRack();
      cablesDirty = true;
      $('preset').value = '';
      dirty();
      toast('랙을 비웠습니다.');
    });
    $('export').addEventListener('click', exportPatch);
    $('import').addEventListener('click', () => $('import-file').click());
    $('import-file').addEventListener('change', () => {
      const file = $('import-file').files[0];
      $('import-file').value = '';
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          loadPatch(JSON.parse(reader.result));
          toast('패치 파일을 불러왔습니다.');
        } catch (err) {
          toast('패치 파일을 읽지 못했습니다.');
        }
      };
      reader.readAsText(file);
    });
    $('help-btn').addEventListener('click', () => $('help').showModal());
    $('help-close').addEventListener('click', () => $('help').close());
    $('suggest-close').addEventListener('click', () => closeSuggest());
    $('suggest-list').addEventListener('pointerover', (e) => {
      const button = e.target.closest('[data-suggest]');
      if (button) previewSuggest(Number(button.dataset.suggest));
    });
    $('suggest-list').addEventListener('pointerout', (e) => {
      if (e.target.closest('[data-suggest]')) previewSuggest(null);
    });
    $('suggest-list').addEventListener('click', (e) => {
      const button = e.target.closest('[data-suggest]');
      if (!button || !suggestCtx) return;
      const item = suggestCtx.items[Number(button.dataset.suggest)];
      if (!item) return;
      const ends = patchEnds(suggestCtx.origin, item);
      const title = item.title;
      if (tryLink(ends.out, ends.inn)) toast(title + '에 연결했습니다.');
    });
  }

  function fillLibrary() {
    $('library').innerHTML = '<p class="lib-label">모듈</p>' + LIBRARY.map((item) => (
      '<button type="button" class="lib-btn" data-add="' + item[0] + '" title="클릭해서 추가하거나 랙으로 드래그">' +
        '<b>' + item[1] + '</b><span>' + item[2] + '</span></button>'
    )).join('') + '<p class="lib-foot">클릭하면 추가되고, 끌어서 놓으면 그 자리에 놓입니다.</p>';
  }

  function start() {
    fillLibrary();
    bindChrome();
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    $('rack').addEventListener('click', onClick);
    $('rack').addEventListener('dblclick', onDoubleClick);
    $('rack').addEventListener('contextmenu', onContextMenu);
    $('rack').addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', () => {
      Engine.sustain(false);
      [...compDown].forEach(computerOff);
    });
    window.addEventListener('resize', () => { cablesDirty = true; });
    if (document.fonts) document.fonts.ready.then(() => { cablesDirty = true; });
    new ResizeObserver(() => { cablesDirty = true; }).observe($('rack'));

    let restored = false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        loadPatch(JSON.parse(raw));
        restored = true;
        toast('지난 패치를 불러왔습니다. A–K로 연주해 보세요.');
      }
    } catch (err) {
      restored = false;
    }
    if (!restored) loadPreset('lead');
    if (!loopOn) {
      loopOn = true;
      window.requestAnimationFrame(frame);
    }
    Engine.enableMidi((info) => { $('midi').textContent = info; });
    updateStats();
    return true;
  }

  window.UI = { start, loadPreset, loadSession, toast };
})();
