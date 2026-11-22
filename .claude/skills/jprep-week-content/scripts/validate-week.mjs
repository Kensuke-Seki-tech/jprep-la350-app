#!/usr/bin/env node
// Week データ検証スクリプト
//   node .claude/skills/jprep-week-content/scripts/validate-week.mjs [weekId ...]
// 引数なしで、現行フォーマットの Week（week14 以降）をすべて検証する。
// week05〜week13 は旧フォーマットで作られており現行の出題規約に合わないため既定では
// スキップする。あえて見たいときだけ --all を付ける。
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
const dataDir = resolve(root, 'public/data')
const POS = ['n', 'adj', 'v', 'adv', 'phrase', 'other']
// 現行フォーマット確立前に作られた Week。--all を付けない限り検証しない。
const LEGACY = new Set(['week05','week06','week07','week08','week09','week10','week11','week12','week13'])
const MORPHEME_TYPES = ['prefix', 'root', 'suffix']

let errors = 0
const err = (weekId, msg) => { console.error(`  ✗ [${weekId}] ${msg}`); errors++ }

function readJson(path, weekId) {
  if (!existsSync(path)) { err(weekId, `ファイルがありません: ${path}`); return null }
  try { return JSON.parse(readFileSync(path, 'utf8')) }
  catch (e) { err(weekId, `JSON 構文エラー: ${path}: ${e.message}`); return null }
}

const config = readJson(resolve(dataDir, 'weeks.config.json'), 'config')
if (!config) process.exit(1)

const args = process.argv.slice(2)
const all = args.includes('--all')
const targets = args.filter(a => !a.startsWith('--'))
const weeks = config.weeks.filter(w =>
  targets.length
    ? targets.includes(w.weekId)
    : w.status === 'available' && (all || !LEGACY.has(w.weekId)))

if (targets.length) {
  for (const t of targets) {
    if (!config.weeks.some(w => w.weekId === t)) err(t, 'weeks.config.json に未登録')
  }
}

for (const cfg of weeks) {
  const id = cfg.weekId
  console.log(`▸ ${id} (${cfg.label})`)
  const week = readJson(resolve(dataDir, `${id}.json`), id)
  const quiz = readJson(resolve(dataDir, `${id}.quiz.json`), id)
  if (!week || !quiz) continue

  // ── weeks.config.json との整合
  if (cfg.dataUrl !== `/data/${id}.json`) err(id, `config.dataUrl が /data/${id}.json ではない`)
  if (week.weekId !== id) err(id, `weekNN.json の weekId が ${id} ではない`)
  if (week.weekNumber !== cfg.weekNumber) err(id, 'weekNumber が config と不一致')
  if (quiz.weekId !== id) err(id, `quiz.json の weekId が ${id} ではない`)

  const words = week.words ?? []
  if (cfg.wordCount !== words.length) err(id, `config.wordCount=${cfg.wordCount} だが実際は ${words.length} 語`)

  // ── 単語データ
  const nn = String(cfg.weekNumber).padStart(2, '0')
  const seen = new Set()
  words.forEach((w, i) => {
    const want = `w${nn}_${String(i + 1).padStart(3, '0')}`
    if (w.id !== want) err(id, `words[${i}].id が ${want} ではない (${w.id})`)
    for (const f of ['english', 'japanese', 'englishDef', 'exampleEn', 'exampleJa', 'ipa', 'katakana', 'emoji']) {
      if (!w[f]) err(id, `${w.english ?? `words[${i}]`}: ${f} が空`)
    }
    if (!POS.includes(w.partOfSpeech)) err(id, `${w.english}: partOfSpeech が不正 (${w.partOfSpeech})`)
    if (seen.has(w.english)) err(id, `${w.english}: 単語が重複`)
    seen.add(w.english)
    const et = w.etymology
    if (!et) { err(id, `${w.english}: etymology がない`); return }
    if (!et.morphemes?.length) err(id, `${w.english}: morphemes が空`)
    for (const m of et.morphemes ?? []) {
      if (!MORPHEME_TYPES.includes(m.type)) err(id, `${w.english}: morpheme.type が不正 (${m.type})`)
      if (!m.part || !m.meaning) err(id, `${w.english}: morpheme の part/meaning が空`)
    }
    if (!et.imageDescription) err(id, `${w.english}: imageDescription が空`)
    if (!et.relatedWords?.length) err(id, `${w.english}: relatedWords が空`)
    if (!et.memoryTip) err(id, `${w.english}: memoryTip が空`)
  })

  const defOf = Object.fromEntries(words.map(w => [w.english, w.englishDef]))
  const allDefs = new Set(words.map(w => w.englishDef))
  const range = (a, b) => words.slice(a, b).map(w => w.english)

  // ── Sentences to Remember
  // 復習用の章など文章を持たない Week は sentencesToRemember 自体を省略してよい（省略時は文章関連の検査をスキップ）
  const hasSents = week.sentencesToRemember !== undefined
  const sents = week.sentencesToRemember ?? []
  if (hasSents && sents.length !== 5) err(id, `sentencesToRemember が ${sents.length} 件（5 件のはず）`)
  sents.forEach((s, i) => { if (!s.text || !s.ja) err(id, `sentencesToRemember[${i}] の text/ja が空`) })

  // ── Part1 match: words[0..9]
  const expectMatch = range(0, 10)
  const gotMatch = (quiz.match ?? []).map(m => m.word)
  if (gotMatch.join('|') !== expectMatch.join('|'))
    err(id, `match の対象語が words[1..10] と不一致\n      期待: ${expectMatch.join(', ')}\n      実際: ${gotMatch.join(', ')}`)
  for (const m of quiz.match ?? []) {
    if (defOf[m.word] !== undefined && m.def !== defOf[m.word])
      err(id, `match "${m.word}": def が englishDef と不一致`)
  }

  // ── Part2 gap: words[0..4] / bank: words[0..9]
  const expectGap = range(0, 5)
  const gotGap = (quiz.gap ?? []).map(g => g.answer)
  if (gotGap.join('|') !== expectGap.join('|'))
    err(id, `gap の対象語が words[1..5] と不一致（実際: ${gotGap.join(', ')}）`)
  for (const g of quiz.gap ?? []) {
    const w = words.find(x => x.english === g.answer)
    if (!w) continue
    if (g.sentence !== w.exampleEn) err(id, `gap "${g.answer}": sentence が exampleEn と不一致`)
    if (g.ja !== w.exampleJa) err(id, `gap "${g.answer}": ja が exampleJa と不一致`)
    const stem = g.answer.replace(/e$/, '')
    if (!g.sentence.toLowerCase().includes(stem.toLowerCase()))
      err(id, `gap "${g.answer}": 例文中に答えの語が見当たらない`)
  }
  if ((quiz.bank ?? []).join('|') !== expectMatch.join('|'))
    err(id, `bank が words[1..10] と不一致（実際: ${(quiz.bank ?? []).join(', ')}）`)

  // ── Part3 mc: words[5..14]
  const expectMc = new Set(range(5, 15))
  const gotMc = (quiz.mc ?? []).map(m => m.word)
  if (gotMc.length !== expectMc.size) err(id, `mc が ${gotMc.length} 件（${expectMc.size} 件のはず）`)
  for (const m of quiz.mc ?? []) {
    if (!expectMc.has(m.word)) err(id, `mc "${m.word}" は出題範囲 words[6..15] 外`)
    if (!m.q?.includes(m.word)) err(id, `mc "${m.word}": 設問文に語が含まれていない`)
    if (m.opts?.length !== 4) err(id, `mc "${m.word}": opts が ${m.opts?.length} 件（4 件のはず）`)
    if (new Set(m.opts).size !== (m.opts?.length ?? 0)) err(id, `mc "${m.word}": opts に重複`)
    if (!(Number.isInteger(m.answer) && m.answer >= 0 && m.answer < (m.opts?.length ?? 0)))
      err(id, `mc "${m.word}": answer インデックスが不正 (${m.answer})`)
    else if (m.opts[m.answer] !== defOf[m.word])
      err(id, `mc "${m.word}": answer の指す選択肢が englishDef と不一致`)
    for (const o of m.opts ?? []) {
      if (!allDefs.has(o)) err(id, `mc "${m.word}": 選択肢 "${o}" が同 Week の englishDef にない`)
    }
  }
  const spread = new Set((quiz.mc ?? []).map(m => m.answer))
  if (gotMc.length >= 4 && spread.size < 3)
    err(id, `mc の answer の位置が偏っている（使われている位置: ${[...spread].sort().join(', ')}）`)

  // ── Part4 dict: sentencesToRemember の 1・3・5 番目
  const expectDict = [sents[0]?.text, sents[2]?.text, sents[4]?.text]
  const gotDict = (quiz.dict ?? []).map(d => d.text)
  if (hasSents && gotDict.join('|') !== expectDict.join('|'))
    err(id, 'dict が sentencesToRemember の 1・3・5 番目と不一致')
  for (const d of quiz.dict ?? []) {
    if (!d.word) { err(id, `dict "${d.text?.slice(0, 20)}…": word が空`); continue }
    if (!d.text?.toLowerCase().includes(d.word.toLowerCase()))
      err(id, `dict: word "${d.word}" が本文中にない`)
  }
}

console.log(errors === 0
  ? `\n✓ ${weeks.length} Week すべて OK`
  : `\n✗ ${errors} 件のエラー`)
process.exit(errors === 0 ? 0 : 1)
