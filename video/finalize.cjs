// Yukikaki Link — demo video finalizer
// 1) builds the full narration track from narration/sceneN.mp3 + timing.json
//    (lead/tail silence per scene so audio length == recorded timeline length)
// 2) trims the pre-roll off the raw Playwright recording and muxes audio
// 3) verifies the result with ffprobe
//
// Run after director.cjs:  node video/finalize.cjs
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const VIDEO = __dirname;
const OUT = path.join(VIDEO, 'out');
const timing = JSON.parse(fs.readFileSync(path.join(VIDEO, 'timing.json'), 'utf8'));

const ff = (args) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args]);
const probe = (file, entries) => execFileSync('ffprobe',
  ['-v', 'error', '-show_entries', entries, '-of', 'csv=p=0', file]).toString().trim();

// ---------- 1) audio track ----------
const partsDir = path.join(OUT, 'audio_parts');
fs.rmSync(partsDir, { recursive: true, force: true });
fs.mkdirSync(partsDir, { recursive: true });

const concatList = [];
for (const sc of timing.scenes) {
  const silA = path.join(partsDir, `s${sc.n}a.wav`);
  ff(['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', String(sc.lead), '-c:a', 'pcm_s16le', silA]);
  const nar = path.join(partsDir, `n${sc.n}.wav`);
  ff(['-i', path.join(VIDEO, 'narration', `scene${sc.n}.mp3`), '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', nar]);
  const silB = path.join(partsDir, `s${sc.n}b.wav`);
  ff(['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', String(sc.tail), '-c:a', 'pcm_s16le', silB]);
  concatList.push(silA, nar, silB);
}
const listFile = path.join(partsDir, 'list.txt');
fs.writeFileSync(listFile, concatList.map(f => `file '${f}'`).join('\n') + '\n');

const fullWav = path.join(OUT, 'audio_full.wav');
ff(['-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', fullWav]);

const audioWav = path.join(OUT, 'audio.wav');
ff(['-i', fullWav, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', audioWav]);

const audioDur = parseFloat(probe(audioWav, 'format=duration'));
console.log(`audio: ${audioDur.toFixed(3)}s (target ${timing.total}s, delta ${(audioDur - timing.total).toFixed(3)}s)`);
if (Math.abs(audioDur - timing.total) > 0.2) {
  console.error('AUDIO LENGTH MISMATCH — check timing.json vs narration files');
  process.exit(1);
}

// ---------- 2) video: trim pre-roll, pad to exact length, mux ----------
const raw = path.join(OUT, 'raw.webm');
if (!fs.existsSync(raw)) { console.error('missing out/raw.webm — run director.cjs first'); process.exit(1); }

const vOnly = path.join(OUT, 'video_only.mp4');
ff(['-ss', String(timing.offset), '-i', raw,
  '-vf', 'fps=30,tpad=stop_mode=clone:stop_duration=8,scale=1920:1080',
  '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
  '-t', String(timing.total), vOnly]);

const finalMp4 = path.join(OUT, 'yukikaki-link-demo.mp4');
ff(['-i', vOnly, '-i', audioWav,
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
  '-t', String(timing.total), '-movflags', '+faststart', finalMp4]);

// ---------- 3) verify ----------
const vDur = parseFloat(probe(vOnly, 'format=duration'));
const fDur = parseFloat(probe(finalMp4, 'format=duration'));
const streams = probe(finalMp4, 'stream=codec_type,codec_name,width,height,r_frame_rate,duration');
const size = fs.statSync(finalMp4).size;
console.log(`video-only: ${vDur.toFixed(3)}s | final: ${fDur.toFixed(3)}s | ${(size / 1048576).toFixed(1)} MB`);
console.log('streams:\n' + streams);
if (Math.abs(fDur - timing.total) > 0.25) { console.error('FINAL LENGTH MISMATCH'); process.exit(1); }
console.log('OK ->', finalMp4);
