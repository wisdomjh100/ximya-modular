'use strict';

(function () {
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const SPECS = {
    keys: {
      octave: { type: 'num', min: -2, max: 2, def: 0, round: true },
      glide: { type: 'num', min: 0, max: 0.45, def: 0.02 },
      mode: { type: 'enum', values: ['retrig', 'legato'], def: 'retrig' },
    },
    seq: {
      bpm: { type: 'num', min: 40, max: 220, def: 112 },
      gate: { type: 'num', min: 0.08, max: 0.92, def: 0.45 },
    },
    vco: {
      wave: { type: 'enum', values: ['sawtooth', 'square', 'triangle', 'sine'], def: 'sawtooth' },
      tune: { type: 'num', min: 24, max: 96, def: 57 },
      octave: { type: 'num', min: -2, max: 2, def: 0, round: true },
      fine: { type: 'num', min: -100, max: 100, def: 0 },
      fm: { type: 'num', min: 0, max: 4000, def: 400 },
    },
    vcf: {
      type: { type: 'enum', values: ['lowpass', 'highpass', 'bandpass'], def: 'lowpass' },
      cutoff: { type: 'num', min: 30, max: 14000, def: 1600 },
      res: { type: 'num', min: 0.2, max: 18, def: 1.1 },
      cv: { type: 'num', min: 0, max: 8000, def: 2400 },
      drive: { type: 'num', min: 1, max: 12, def: 1.6 },
    },
    vca: {
      level: { type: 'num', min: 0, max: 1, def: 0 },
      cv: { type: 'num', min: 0, max: 1.5, def: 1 },
    },
    env: {
      a: { type: 'num', min: 0.003, max: 3, def: 0.01 },
      d: { type: 'num', min: 0.003, max: 3, def: 0.2 },
      s: { type: 'num', min: 0, max: 1, def: 0.6 },
      r: { type: 'num', min: 0.008, max: 5, def: 0.35 },
    },
    lfo: {
      wave: { type: 'enum', values: ['sine', 'triangle', 'square', 'sawtooth'], def: 'sine' },
      rate: { type: 'num', min: 0.05, max: 30, def: 3 },
      depth: { type: 'num', min: 0, max: 1, def: 0.5 },
      polar: { type: 'enum', values: ['bi', 'uni'], def: 'bi' },
    },
    noise: {
      color: { type: 'enum', values: ['white', 'dark'], def: 'white' },
      level: { type: 'num', min: 0, max: 1, def: 0.35 },
    },
    mix: {
      a: { type: 'num', min: 0, max: 1, def: 0.75 },
      b: { type: 'num', min: 0, max: 1, def: 0.75 },
      c: { type: 'num', min: 0, max: 1, def: 0.75 },
    },
    dly: {
      time: { type: 'num', min: 0.01, max: 1.2, def: 0.33 },
      fb: { type: 'num', min: 0, max: 0.88, def: 0.32 },
      mix: { type: 'num', min: 0, max: 1, def: 0.28 },
    },
    att: {
      gain: { type: 'num', min: -1, max: 1, def: 0.7 },
    },
    out: {
      vol: { type: 'num', min: 0, max: 1, def: 0.85 },
    },
    loop: {
      len: { type: 'num', min: 0.4, max: 8, def: 4 },
      speed: { type: 'num', min: 0.5, max: 2, def: 1 },
      mix: { type: 'num', min: 0, max: 1, def: 0.85 },
      dub: { type: 'num', min: 0, max: 0.92, def: 0.65 },
      level: { type: 'num', min: 0, max: 1, def: 1 },
    },
  };

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function midiToFreq(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  function noteName(m) {
    const n = Math.round(m);
    const name = NOTE_NAMES[((n % 12) + 12) % 12];
    return name + (Math.floor(n / 12) - 1);
  }

  function sanitizeValue(spec, value) {
    if (spec.type === 'enum') return spec.values.includes(value) ? value : spec.def;
    let n = Number(value);
    if (!Number.isFinite(n)) n = spec.def;
    n = clamp(n, spec.min, spec.max);
    if (spec.round) n = Math.round(n);
    return n;
  }

  function defaultParams(type) {
    const params = {};
    Object.entries(SPECS[type]).forEach(([key, spec]) => {
      params[key] = spec.def;
    });
    return params;
  }

  function defaultSteps() {
    return [60, 63, 67, 70, 67, 65, 63, 60].map((note) => ({ on: true, note }));
  }

  function normalizeSteps(steps) {
    const base = defaultSteps();
    if (!Array.isArray(steps)) return base;
    return base.map((fallback, i) => {
      const src = steps[i] || fallback;
      return {
        on: !!src.on,
        note: clamp(Math.round(Number(src.note) || fallback.note), 24, 96),
      };
    });
  }

  function driveCurve(amount) {
    const n = 256;
    const curve = new Float32Array(n);
    const k = Math.max(1, amount);
    const norm = Math.tanh(k);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      curve[i] = Math.tanh(k * x) / norm;
    }
    return curve;
  }

  let ctx = null;
  let bus = null;
  let masterAnalyser = null;
  let master = 0.72;
  let muted = false;
  let started = false;
  let nextId = 1;
  const modules = new Map();
  const cables = [];

  function track(rec, node) {
    rec._nodes.push(node);
    return node;
  }

  function makeGate() {
    return {
      kind: 'gate',
      listeners: new Set(),
      emit(on) {
        this.listeners.forEach((fn) => {
          try { fn(!!on); } catch (err) { /* listener */ }
        });
      },
    };
  }

  function buildKeys(rec) {
    const pitch = track(rec, ctx.createConstantSource());
    pitch.offset.value = midiToFreq(60);
    pitch.start();
    const modCv = track(rec, ctx.createConstantSource());
    modCv.offset.value = 0;
    modCv.start();
    const gate = makeGate();
    rec.outputs.pitch = { kind: 'cv', node: pitch };
    rec.outputs.gate = gate;
    rec.outputs.mod = { kind: 'cv', node: modCv };

    const counts = new Map();
    const stack = [];
    let sustain = false;
    let gateOn = false;
    let bend = 0;
    let sounding = 60;

    function applyPitch() {
      const freq = midiToFreq(sounding + bend);
      const now = ctx.currentTime;
      pitch.offset.cancelScheduledValues(now);
      if (rec.params.glide <= 0.001) pitch.offset.setValueAtTime(freq, now);
      else pitch.offset.setTargetAtTime(freq, now, rec.params.glide);
    }

    function openGate() {
      if (gateOn) return;
      gateOn = true;
      gate.emit(true);
      rec.onGateLamp?.(true);
    }

    function release() {
      if (!gateOn) return;
      gateOn = false;
      gate.emit(false);
      rec.onGateLamp?.(false);
    }

    function noteOn(midi) {
      midi = clamp(Math.round(midi), 0, 127);
      const prev = counts.get(midi) || 0;
      counts.set(midi, prev + 1);
      const index = stack.indexOf(midi);
      if (index >= 0) stack.splice(index, 1);
      const wasSounding = stack[stack.length - 1];
      stack.push(midi);
      if (prev === 0) rec.onNote?.(midi, true);
      if (prev > 0 && wasSounding === midi) return;
      sounding = midi;
      applyPitch();
      if (gateOn && rec.params.mode !== 'legato') {
        gate.emit(false);
        gate.emit(true);
        rec.onGateLamp?.(true);
      } else {
        openGate();
      }
    }

    function noteOff(midi) {
      midi = Math.round(midi);
      const prev = counts.get(midi) || 0;
      if (prev <= 0) return;
      if (prev > 1) {
        counts.set(midi, prev - 1);
        return;
      }
      counts.delete(midi);
      const index = stack.indexOf(midi);
      if (index >= 0) stack.splice(index, 1);
      rec.onNote?.(midi, false);
      if (stack.length) {
        sounding = stack[stack.length - 1];
        applyPitch();
        return;
      }
      if (!sustain) release();
    }

    rec.api = {
      noteOn,
      noteOff,
      setSustain(v) {
        sustain = !!v;
        if (!sustain && stack.length === 0) release();
      },
      setBend(semis) {
        bend = clamp(semis, -2, 2);
        applyPitch();
      },
      setMod(v) {
        modCv.offset.setTargetAtTime(clamp(v, 0, 1), ctx.currentTime, 0.02);
      },
      panic() {
        const notes = [...counts.keys()];
        counts.clear();
        stack.length = 0;
        sustain = false;
        bend = 0;
        notes.forEach((midi) => rec.onNote?.(midi, false));
        release();
      },
    };
    rec.dispose = () => stopNodes(rec);
  }

  function buildSeq(rec) {
    rec.params.steps = normalizeSteps(rec.params.steps);
    rec.params.playing = false;
    const pitch = track(rec, ctx.createConstantSource());
    pitch.offset.value = midiToFreq(60);
    pitch.start();
    const gate = makeGate();
    rec.outputs.pitch = { kind: 'cv', node: pitch };
    rec.outputs.gate = gate;

    let running = false;
    let runId = 0;
    let token = 0;
    let timer = 0;
    let stepIndex = 0;
    let nextTime = 0;

    function lamp(on) {
      rec.onGateLamp?.(on);
    }

    function fire(index) {
      const step = rec.params.steps[index];
      rec.onStep?.(index);
      if (!step || !step.on) {
        token += 1;
        gate.emit(false);
        lamp(false);
        return;
      }
      const now = ctx.currentTime;
      pitch.offset.cancelScheduledValues(now);
      pitch.offset.setValueAtTime(midiToFreq(step.note), now);
      token += 1;
      const my = token;
      gate.emit(true);
      lamp(true);
      const dur = 60 / clamp(rec.params.bpm, 40, 220) / 2;
      const ms = dur * clamp(rec.params.gate, 0.05, 0.95) * 1000;
      window.setTimeout(() => {
        if (my !== token) return;
        gate.emit(false);
        lamp(false);
      }, ms);
    }

    function schedule(index, time, run) {
      const delay = Math.max(0, (time - ctx.currentTime) * 1000);
      window.setTimeout(() => {
        if (run !== runId) return;
        fire(index);
      }, delay);
    }

    function play() {
      if (running) return;
      running = true;
      rec.params.playing = true;
      runId += 1;
      const run = runId;
      stepIndex = 0;
      nextTime = ctx.currentTime + 0.05;
      const loop = () => {
        if (run !== runId) return;
        const horizon = ctx.currentTime + 0.12;
        let guard = 0;
        while (nextTime < horizon && guard < 8) {
          schedule(stepIndex, nextTime, run);
          nextTime += 60 / clamp(rec.params.bpm, 40, 220) / 2;
          stepIndex = (stepIndex + 1) % 8;
          guard += 1;
        }
        timer = window.setTimeout(loop, 30);
      };
      loop();
      rec.onPlayChange?.(true);
    }

    function stop() {
      if (!running && !rec.params.playing) {
        token += 1;
        gate.emit(false);
        lamp(false);
        return;
      }
      runId += 1;
      token += 1;
      window.clearTimeout(timer);
      timer = 0;
      running = false;
      rec.params.playing = false;
      gate.emit(false);
      lamp(false);
      rec.onStep?.(-1);
      rec.onPlayChange?.(false);
    }

    rec.apply = function (key) {
      if (key === 'steps') rec.onStepsChange?.();
    };

    rec.api = {
      play,
      stop,
      isRunning: () => running,
      randomize() {
        const scale = [0, 3, 5, 7, 10, 12];
        rec.params.steps = Array.from({ length: 8 }, () => ({
          on: Math.random() > 0.12,
          note: 48 + scale[Math.floor(Math.random() * scale.length)] + (Math.random() > 0.65 ? 12 : 0),
        }));
        if (!rec.params.steps.some((step) => step.on)) rec.params.steps[0].on = true;
        rec.onStepsChange?.();
      },
      panic: stop,
    };
    rec.dispose = () => {
      stop();
      stopNodes(rec);
    };
  }

  function buildVco(rec) {
    const osc = track(rec, ctx.createOscillator());
    const tune = track(rec, ctx.createConstantSource());
    const fm = ctx.createGain();
    const out = ctx.createGain();
    osc.frequency.value = 0;
    out.gain.value = 0.45;
    tune.connect(osc.frequency);
    fm.connect(osc.frequency);
    osc.connect(out);
    tune.start();
    osc.start();

    const pitchSources = [];
    rec.outputs.out = { kind: 'audio', node: out };
    rec.inputs.fm = { kind: 'cv', node: fm };
    rec.inputs.pitch = { kind: 'cv', mode: 'pitch' };

    rec.apply = function (key) {
      const p = rec.params;
      if (!key || key === 'wave') osc.type = p.wave;
      if (!key || key === 'tune') tune.offset.value = midiToFreq(p.tune);
      if (!key || key === 'octave' || key === 'fine') osc.detune.value = p.octave * 1200 + p.fine;
      if (!key || key === 'fm') fm.gain.value = p.fm;
    };

    rec.api = {
      connectPitch(node) {
        const first = pitchSources.length === 0;
        if (first) {
          try { tune.disconnect(osc.frequency); } catch (err) { /* already */ }
        }
        try {
          node.connect(osc.frequency);
        } catch (err) {
          if (first) tune.connect(osc.frequency);
          throw err;
        }
        pitchSources.push(node);
        rec.pitchExternal = true;
        rec.onPatchChange?.();
        return () => {
          try { node.disconnect(osc.frequency); } catch (err) { /* gone */ }
          const index = pitchSources.indexOf(node);
          if (index >= 0) pitchSources.splice(index, 1);
          if (pitchSources.length === 0) {
            tune.connect(osc.frequency);
            rec.pitchExternal = false;
            rec.onPatchChange?.();
          }
        };
      },
    };
    rec.apply();
    rec.dispose = () => stopNodes(rec);
  }

  function buildVcf(rec) {
    const filter = ctx.createBiquadFilter();
    const cutoff = track(rec, ctx.createConstantSource());
    const cv = ctx.createGain();
    const shaper = ctx.createWaveShaper();
    const out = ctx.createGain();
    filter.frequency.value = 0;
    out.gain.value = 0.9;
    shaper.oversample = '2x';
    cutoff.connect(filter.frequency);
    cv.connect(filter.frequency);
    filter.connect(shaper);
    shaper.connect(out);
    cutoff.start();
    rec.inputs.in = { kind: 'audio', node: filter };
    rec.inputs.cv = { kind: 'cv', node: cv };
    rec.outputs.out = { kind: 'audio', node: out };

    rec.apply = function (key) {
      const p = rec.params;
      if (!key || key === 'type') filter.type = p.type;
      if (!key || key === 'cutoff') cutoff.offset.value = p.cutoff;
      if (!key || key === 'res') filter.Q.value = p.res;
      if (!key || key === 'cv') cv.gain.value = p.cv;
      if (!key || key === 'drive') shaper.curve = driveCurve(p.drive);
    };
    rec.apply();
    rec.dispose = () => stopNodes(rec);
  }

  function buildVca(rec) {
    const input = ctx.createGain();
    const amp = ctx.createGain();
    const bias = track(rec, ctx.createConstantSource());
    const cv = ctx.createGain();
    amp.gain.value = 0;
    bias.connect(amp.gain);
    cv.connect(amp.gain);
    input.connect(amp);
    bias.start();
    rec.inputs.in = { kind: 'audio', node: input };
    rec.inputs.cv = { kind: 'cv', node: cv };
    rec.outputs.out = { kind: 'audio', node: amp };
    rec.apply = function (key) {
      if (!key || key === 'level') bias.offset.value = rec.params.level;
      if (!key || key === 'cv') cv.gain.value = rec.params.cv;
    };
    rec.apply();
    rec.dispose = () => stopNodes(rec);
  }

  function buildEnv(rec) {
    const env = track(rec, ctx.createConstantSource());
    env.offset.value = 0.0001;
    env.start();
    rec.outputs.out = { kind: 'cv', node: env };
    rec.inputs.gate = { kind: 'gate' };

    function go(on) {
      const now = ctx.currentTime;
      const param = env.offset;
      const attack = Math.max(0.005, rec.params.a);
      const decay = Math.max(0.005, rec.params.d);
      const release = Math.max(0.012, rec.params.r);
      const sustainLevel = Math.max(0.0001, clamp(rec.params.s, 0, 1));
      try {
        if (typeof param.cancelAndHoldAtTime === 'function') param.cancelAndHoldAtTime(now);
        else {
          param.cancelScheduledValues(now);
          param.setValueAtTime(Math.max(0.0001, param.value || 0.0001), now);
        }
        if (on) {
          param.linearRampToValueAtTime(1, now + attack);
          param.linearRampToValueAtTime(sustainLevel, now + attack + decay);
        } else {
          param.linearRampToValueAtTime(0.0001, now + release);
        }
      } catch (err) {
        param.cancelScheduledValues(ctx.currentTime);
        param.setValueAtTime(on ? 1 : 0.0001, ctx.currentTime);
      }
      rec.onGateLamp?.(!!on);
    }

    rec.receiveGate = (port, on) => {
      if (port === 'gate') go(on);
    };
    rec.api = { panic: () => go(false) };
    rec.dispose = () => stopNodes(rec);
  }

  function buildLfo(rec) {
    const osc = track(rec, ctx.createOscillator());
    const uni = ctx.createWaveShaper();
    const depth = ctx.createGain();
    const curve = new Float32Array(32);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = (x + 1) * 0.5;
    }
    uni.curve = curve;
    rec.outputs.out = { kind: 'cv', node: depth };

    function route() {
      try { osc.disconnect(); } catch (err) { /* fresh */ }
      try { uni.disconnect(); } catch (err) { /* fresh */ }
      if (rec.params.polar === 'uni') {
        osc.connect(uni);
        uni.connect(depth);
      } else {
        osc.connect(depth);
      }
    }

    rec.apply = function (key) {
      const p = rec.params;
      if (!key || key === 'wave') osc.type = p.wave;
      if (!key || key === 'rate') osc.frequency.value = p.rate;
      if (!key || key === 'depth') depth.gain.value = p.depth;
      if (!key || key === 'polar') route();
    };
    rec.apply();
    osc.start();
    rec.dispose = () => stopNodes(rec);
  }

  function buildNoise(rec) {
    const length = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const src = track(rec, ctx.createBufferSource());
    src.buffer = buffer;
    src.loop = true;
    const white = ctx.createGain();
    const darkFilter = ctx.createBiquadFilter();
    darkFilter.type = 'lowpass';
    darkFilter.frequency.value = 700;
    const dark = ctx.createGain();
    const level = ctx.createGain();
    src.connect(white);
    src.connect(darkFilter);
    darkFilter.connect(dark);
    white.connect(level);
    dark.connect(level);
    src.start();
    rec.outputs.out = { kind: 'audio', node: level };
    rec.apply = function (key) {
      if (!key || key === 'color') {
        const isDark = rec.params.color === 'dark';
        white.gain.value = isDark ? 0 : 1;
        dark.gain.value = isDark ? 0.9 : 0;
      }
      if (!key || key === 'level') level.gain.value = rec.params.level;
    };
    rec.apply();
    rec.dispose = () => stopNodes(rec);
  }

  function buildMix(rec) {
    const sum = ctx.createGain();
    const gains = {};
    ['a', 'b', 'c'].forEach((id) => {
      const gain = ctx.createGain();
      gain.connect(sum);
      gains[id] = gain;
      rec.inputs[id] = { kind: 'audio', node: gain };
    });
    rec.outputs.out = { kind: 'audio', node: sum };
    rec.apply = function (key) {
      ['a', 'b', 'c'].forEach((id) => {
        if (!key || key === id) gains[id].gain.value = rec.params[id];
      });
    };
    rec.apply();
    rec.dispose = () => stopNodes(rec);
  }

  function buildDelay(rec) {
    const input = ctx.createGain();
    const dry = ctx.createGain();
    const wet = ctx.createGain();
    const delay = ctx.createDelay(1.5);
    const feedback = ctx.createGain();
    const out = ctx.createGain();
    dry.gain.value = 1;
    input.connect(dry);
    dry.connect(out);
    input.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(out);
    rec.inputs.in = { kind: 'audio', node: input };
    rec.outputs.out = { kind: 'audio', node: out };
    rec.apply = function (key) {
      const p = rec.params;
      if (!key || key === 'time') delay.delayTime.setTargetAtTime(p.time, ctx.currentTime, 0.02);
      if (!key || key === 'fb') feedback.gain.value = p.fb;
      if (!key || key === 'mix') wet.gain.value = p.mix;
    };
    rec.apply();
    rec.dispose = () => stopNodes(rec);
  }

  function buildLoop(rec) {
    const rate = ctx.sampleRate;
    const maxSamples = Math.floor(rate * 8);
    const buffer = new Float32Array(maxSamples);
    const input = ctx.createGain();
    const proc = ctx.createScriptProcessor(1024, 1, 1);
    const tap = ctx.createGain();
    const keep = ctx.createGain();
    keep.gain.value = 0;
    input.connect(proc);
    proc.connect(tap);
    proc.connect(keep);
    keep.connect(bus);

    let state = 'idle';
    let command = '';
    let recIndex = 0;
    let loopLength = 0;
    let phase = 0;
    let gateHigh = false;

    function setState(next) {
      state = next;
      rec._state = next;
    }

    function handle(cmd) {
      if (cmd === 'rec') {
        if (state === 'rec') {
          loopLength = recIndex;
          phase = 0;
          setState(loopLength > rate * 0.08 ? 'play' : 'idle');
          if (state === 'idle') loopLength = 0;
        } else {
          recIndex = 0;
          loopLength = 0;
          phase = 0;
          setState('rec');
        }
        return;
      }
      if (cmd === 'play') {
        if (loopLength < 2) return;
        if (state === 'idle') phase = 0;
        setState(state === 'play' || state === 'dub' ? 'idle' : 'play');
        return;
      }
      if (cmd === 'dub') {
        if (loopLength < 2) return;
        setState(state === 'dub' ? 'play' : 'dub');
        return;
      }
      if (cmd === 'clear') {
        buffer.fill(0);
        loopLength = 0;
        recIndex = 0;
        phase = 0;
        setState('idle');
        rec._pos = 0;
        return;
      }
      if (cmd === 'panic') setState('idle');
    }

    proc.onaudioprocess = (event) => {
      if (command) {
        const cmd = command;
        command = '';
        handle(cmd);
      }
      const inputData = event.inputBuffer.getChannelData(0);
      const output = event.outputBuffer.getChannelData(0);
      const target = Math.max(Math.floor(rate * 0.2), Math.min(maxSamples, Math.floor(rate * rec.params.len)));
      const speed = rec.params.speed;
      const mix = rec.params.mix;
      const level = rec.params.level;
      const feedback = rec.params.dub;
      const count = inputData.length;

      for (let i = 0; i < count; i++) {
        const x = inputData[i];
        let y = x;
        if (state === 'rec') {
          if (recIndex < target && recIndex < maxSamples) {
            buffer[recIndex] = x;
            recIndex += 1;
          } else {
            loopLength = recIndex;
            phase = 0;
            setState(loopLength > rate * 0.08 ? 'play' : 'idle');
          }
        }
        if ((state === 'play' || state === 'dub') && loopLength > 1) {
          let i0 = phase | 0;
          if (i0 >= loopLength) i0 = loopLength - 1;
          let i1 = i0 + 1;
          if (i1 >= loopLength) i1 = 0;
          const frac = phase - (phase | 0);
          const loopSample = buffer[i0] + (buffer[i1] - buffer[i0]) * frac;
          if (state === 'dub') {
            let written = buffer[i0] * feedback + x;
            if (written > 1) written = 1;
            else if (written < -1) written = -1;
            buffer[i0] = written;
          }
          y = x * (1 - mix) + loopSample * mix;
          phase += speed;
          if (phase >= loopLength) phase -= loopLength;
          else if (phase < 0) phase += loopLength;
        }
        output[i] = y * level;
      }

      if (state === 'rec') rec._pos = target ? Math.min(1, recIndex / target) : 0;
      else if ((state === 'play' || state === 'dub') && loopLength > 1) rec._pos = phase / loopLength;
      else rec._pos = 0;
      rec._state = state;
    };

    rec.inputs.in = { kind: 'audio', node: input };
    rec.inputs.rec = { kind: 'gate' };
    rec.outputs.out = { kind: 'audio', node: tap };
    rec._state = 'idle';
    rec._pos = 0;
    rec.receiveGate = (port, on) => {
      if (port !== 'rec') return;
      if (on && !gateHigh) command = 'rec';
      gateHigh = !!on;
    };
    rec.api = {
      rec() { command = 'rec'; },
      play() { command = 'play'; },
      dub() { command = 'dub'; },
      clear() { command = 'clear'; },
      panic() { command = 'panic'; },
    };
    rec.apply = function () {};
    rec.dispose = () => {
      proc.onaudioprocess = null;
      try { input.disconnect(); } catch (err) { /* gone */ }
      try { proc.disconnect(); } catch (err) { /* gone */ }
      try { keep.disconnect(); } catch (err) { /* gone */ }
    };
  }

  function buildAtt(rec) {
    const gain = ctx.createGain();
    rec.inputs.in = { kind: 'cv', node: gain };
    rec.outputs.out = { kind: 'cv', node: gain };
    rec.apply = function () {
      gain.gain.value = rec.params.gain;
    };
    rec.apply();
    rec.dispose = () => stopNodes(rec);
  }

  function buildOut(rec) {
    const gain = ctx.createGain();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.42;
    gain.connect(analyser);
    analyser.connect(bus);
    rec.inputs.in = { kind: 'audio', node: gain };
    rec.analyser = analyser;
    rec.apply = function () {
      gain.gain.value = rec.params.vol;
    };
    rec.apply();
    rec.dispose = () => {
      try { gain.disconnect(); } catch (err) { /* gone */ }
    };
  }

  const BUILDERS = {
    keys: buildKeys,
    seq: buildSeq,
    vco: buildVco,
    vcf: buildVcf,
    vca: buildVca,
    env: buildEnv,
    lfo: buildLfo,
    noise: buildNoise,
    mix: buildMix,
    dly: buildDelay,
    loop: buildLoop,
    att: buildAtt,
    out: buildOut,
  };

  function stopNodes(rec) {
    Object.values(rec.outputs).forEach((port) => {
      if (port.listeners) port.listeners.clear();
      if (port.node) {
        try { port.node.disconnect(); } catch (err) { /* gone */ }
      }
    });
    rec._nodes.forEach((node) => {
      try { node.stop(); } catch (err) { /* not a source */ }
      try { node.disconnect(); } catch (err) { /* gone */ }
    });
  }

  function detachCable(cable) {
    try { cable.unlink(); } catch (err) { /* already */ }
    const index = cables.indexOf(cable);
    if (index >= 0) cables.splice(index, 1);
    modules.get(cable.fromId)?.onPatchChange?.();
    modules.get(cable.toId)?.onPatchChange?.();
  }

  function cableColor(mod, port) {
    if (port.kind === 'gate') return '#f0c14a';
    if (port.kind === 'cv') {
      if (mod.type === 'env') return '#ffbf3c';
      if (mod.type === 'seq') return '#3ddc97';
      if (mod.type === 'keys') return '#f0c14a';
      return '#6cbcff';
    }
    const audio = {
      vco: '#e25b2a',
      vcf: '#ff8a3d',
      vca: '#7dcea0',
      noise: '#d5d5d5',
      mix: '#e7a088',
      dly: '#c9a0ff',
      loop: '#ff8b7a',
      att: '#d9d3c8',
      out: '#ffffff',
    };
    return audio[mod.type] || '#cccccc';
  }

  function compatible(outKind, inKind) {
    if (outKind === 'gate' || inKind === 'gate') return outKind === 'gate' && inKind === 'gate';
    return true;
  }

  function link(fromId, fromPort, toId, toPort) {
    const from = modules.get(fromId);
    const to = modules.get(toId);
    if (!from || !to) throw new Error('missing module');
    const output = from.outputs[fromPort];
    const input = to.inputs[toPort];
    if (!output || !input) throw new Error('missing port');
    if (!compatible(output.kind, input.kind)) throw new Error('incompatible');
    const exists = cables.some((cable) => (
      cable.fromId === fromId && cable.fromPort === fromPort && cable.toId === toId && cable.toPort === toPort
    ));
    if (exists) return null;

    let unlink;
    if (output.kind === 'gate') {
      const fn = (on) => to.receiveGate?.(toPort, on);
      output.listeners.add(fn);
      unlink = () => output.listeners.delete(fn);
    } else if (input.mode === 'pitch') {
      unlink = to.api.connectPitch(output.node);
    } else {
      output.node.connect(input.node);
      unlink = () => {
        try { output.node.disconnect(input.node); } catch (err) { /* gone */ }
      };
    }

    const cable = {
      id: 'c' + (nextId++),
      fromId,
      fromPort,
      toId,
      toPort,
      kind: output.kind,
      color: cableColor(from, output),
      unlink,
    };
    cables.push(cable);
    from.onPatchChange?.();
    to.onPatchChange?.();
    return cable;
  }

  function createModule(type, raw) {
    if (!ctx) throw new Error('audio not started');
    if (!SPECS[type] || !BUILDERS[type]) throw new Error('unknown module ' + type);
    const rec = {
      id: 'm' + (nextId++),
      type,
      x: 48,
      y: 52,
      w: 180,
      h: 320,
      params: defaultParams(type),
      inputs: {},
      outputs: {},
      _nodes: [],
      pitchExternal: false,
      api: {},
    };
    if (raw) {
      Object.entries(SPECS[type]).forEach(([key, spec]) => {
        if (raw[key] !== undefined) rec.params[key] = sanitizeValue(spec, raw[key]);
      });
    }
    if (type === 'seq') {
      rec.params.steps = normalizeSteps(raw && raw.steps);
      rec.params.playing = false;
      rec._wantPlay = !!(raw && raw.playing);
    }
    BUILDERS[type](rec);
    rec.setParam = (key, value) => {
      if (type === 'seq' && key === 'steps') {
        rec.params.steps = normalizeSteps(value);
        rec.apply?.('steps');
        return;
      }
      const spec = SPECS[type][key];
      if (!spec) return;
      rec.params[key] = sanitizeValue(spec, value);
      rec.apply?.(key);
    };
    modules.set(rec.id, rec);
    return rec;
  }

  function removeModule(id) {
    const rec = modules.get(id);
    if (!rec) return;
    try { rec.api?.panic?.(); } catch (err) { /* panic */ }
    cables.filter((cable) => cable.fromId === id || cable.toId === id).forEach(detachCable);
    try { rec.dispose?.(); } catch (err) { /* dispose */ }
    modules.delete(id);
  }

  function reset() {
    [...modules.keys()].forEach(removeModule);
    cables.splice(0, cables.length);
  }

  function applyMaster(seconds) {
    if (!bus) return;
    const now = ctx.currentTime;
    bus.gain.cancelScheduledValues(now);
    bus.gain.setTargetAtTime(muted ? 0 : master, now, seconds);
  }

  function start() {
    if (started) {
      if (ctx.state === 'suspended') ctx.resume();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error('Web Audio unsupported');
    ctx = new AudioCtx();
    bus = ctx.createGain();
    bus.gain.value = 0;
    const hipass = ctx.createBiquadFilter();
    hipass.type = 'highpass';
    hipass.frequency.value = 18;
    hipass.Q.value = 0.707;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.knee.value = 16;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.22;
    masterAnalyser = ctx.createAnalyser();
    masterAnalyser.fftSize = 1024;
    masterAnalyser.smoothingTimeConstant = 0.45;
    bus.connect(hipass);
    hipass.connect(comp);
    comp.connect(ctx.destination);
    comp.connect(masterAnalyser);
    bus.gain.setValueAtTime(0, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(master, ctx.currentTime + 0.08);
    ctx.resume();
    started = true;
  }

  function handleMidi(data) {
    if (!data || data.length < 2 || data[0] >= 0xf0) return;
    const cmd = data[0] & 0xf0;
    const d1 = data[1];
    const d2 = data.length > 2 ? data[2] : 0;
    if (cmd === 0xb0 && (d1 === 120 || d1 === 123)) {
      modules.forEach((mod) => mod.api?.panic?.());
      return;
    }
    if (cmd === 0xb0 && d1 === 64) {
      const down = d2 >= 64;
      modules.forEach((mod) => mod.api?.setSustain?.(down));
      return;
    }
    if (cmd === 0xb0 && d1 === 1) {
      const amount = d2 / 127;
      modules.forEach((mod) => mod.api?.setMod?.(amount));
      return;
    }
    if (cmd === 0xe0) {
      const bend = (((data[2] || 0) << 7) | data[1]) - 8192;
      const semis = (bend / 8192) * 2;
      modules.forEach((mod) => mod.api?.setBend?.(semis));
      return;
    }
    if (cmd === 0x90 && d2 > 0) {
      modules.forEach((mod) => {
        if (mod.type === 'keys') mod.api.noteOn(d1);
      });
      return;
    }
    if (cmd === 0x80 || (cmd === 0x90 && d2 === 0)) {
      modules.forEach((mod) => {
        if (mod.type === 'keys') mod.api.noteOff(d1);
      });
    }
  }

  function enableMidi(onStatus) {
    if (!navigator.requestMIDIAccess) {
      onStatus?.('MIDI 미지원');
      return;
    }
    navigator.requestMIDIAccess().then((access) => {
      const refresh = () => {
        access.inputs.forEach((input) => {
          input.onmidimessage = (event) => handleMidi(event.data);
        });
        const count = [...access.inputs.values()].filter((input) => input.state === 'connected').length;
        onStatus?.(count ? 'MIDI ' + count : 'MIDI 없음');
      };
      refresh();
      access.onstatechange = refresh;
    }).catch(() => onStatus?.('MIDI 거부'));
  }

  function serialize() {
    return {
      v: 1,
      master,
      modules: [...modules.values()].map((mod) => ({
        id: mod.id,
        type: mod.type,
        x: mod.x,
        y: mod.y,
        params: JSON.parse(JSON.stringify(mod.params)),
      })),
      cables: cables.map((cable) => ({
        fromId: cable.fromId,
        fromPort: cable.fromPort,
        toId: cable.toId,
        toPort: cable.toPort,
      })),
    };
  }

  window.Engine = {
    specs: SPECS,
    noteName,
    start,
    create: createModule,
    link,
    removeCable(id) {
      const cable = cables.find((item) => item.id === id);
      if (cable) detachCable(cable);
    },
    disconnectPort(modId, port, dir) {
      cables.filter((cable) => (
        dir === 'out'
          ? cable.fromId === modId && cable.fromPort === port
          : cable.toId === modId && cable.toPort === port
      )).forEach(detachCable);
    },
    removeModule,
    reset,
    get: (id) => modules.get(id),
    list: () => [...modules.values()],
    getCables: () => cables,
    compatible,
    setParam(id, key, value) {
      const mod = modules.get(id);
      if (!mod) return;
      mod.setParam(key, value);
    },
    setMaster(value) {
      master = clamp(Number(value) || 0, 0, 1);
      applyMaster(0.02);
    },
    master: () => master,
    setMuted(value) {
      muted = !!value;
      applyMaster(0.015);
      return muted;
    },
    isMuted: () => muted,
    panic() {
      modules.forEach((mod) => {
        try { mod.api?.panic?.(); } catch (err) { /* panic */ }
      });
    },
    sustain(value) {
      modules.forEach((mod) => mod.api?.setSustain?.(!!value));
    },
    masterAnalyser: () => masterAnalyser,
    enableMidi,
    serialize,
  };
})();
