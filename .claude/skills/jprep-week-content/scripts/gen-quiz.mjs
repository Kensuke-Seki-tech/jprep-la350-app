#!/usr/bin/env node
// weekNN.json から weekNN.quiz.json を規約どおりに生成する。
//   node .claude/skills/jprep-week-content/scripts/gen-quiz.mjs week21 [week22 ...]
// 出題範囲: match=words[0..9] / gap=words[0..4] / bank=words[0..9] /
//           mc=words[5..] / dict=sentencesToRemember の 1・3・5 番目
// dict[].word は文中の内容語から自動で選ぶ。意味的に不適切なら手で直すこと。
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
const dataDir = resolve(root, 'public/data')

const STOP = new Set(('the a an and or but so if then than that this these those of in on at to for with from into over under '
  + 'up down out off about as by it its he she his her him they them their we us our you your i me my '
  + 'was were is are be been being am had has have do does did will would can could should may might must '
  + 'not no only just very much more most some any all both each other another one two three there here when '
  + 'while after before again also even still back long time way thing things something someone anything nothing').split(' '))

const ids = process.argv.slice(2)
if (!ids.length) { console.error('使い方: gen-quiz.mjs week21 [week22 ...]'); process.exit(1) }

for (const id of ids) {
  const src = resolve(dataDir, `${id}.json`)
  if (!existsSync(src)) { console.error(`✗ ${src} がありません`); process.exit(1) }
  const week = JSON.parse(readFileSync(src, 'utf8'))
  const words = week.words
  const sents = week.sentencesToRemember ?? []

  const match = words.slice(0, 10).map(w => ({ word: w.english, def: w.englishDef }))
  const bank  = words.slice(0, 10).map(w => w.english)
  const gap   = words.slice(0, 5).map(w => ({ answer: w.english, sentence: w.exampleEn, ja: w.exampleJa }))

  // Part3: words[5..] を出題。誤答は同 Week の他の語の englishDef から決定的に選ぶ。
  const mc = words.slice(5).map((w, i) => {
    const pool = words.filter(x => x.english !== w.english && x.englishDef !== w.englishDef)
    const distractors = []
    for (let k = 0; distractors.length < 3 && k < pool.length * 2; k++) {
      const cand = pool[(i * 3 + k) % pool.length].englishDef
      if (!distractors.includes(cand)) distractors.push(cand)
    }
    const answer = i % 4                       // 正解位置をラウンドロビンでばらす
    const opts = [...distractors]
    opts.splice(answer, 0, w.englishDef)
    return { q: `What does "${w.english}" mean?`, opts, answer, word: w.english }
  })

  // Part4: 1・3・5 番目の文。キーワードは文中の最長の内容語（その Week の単語を優先）。
  const weekWords = new Set(words.map(w => w.english.toLowerCase()))
  const dict = [sents[0], sents[2], sents[4]].filter(Boolean).map(s => {
    const toks = (s.text.toLowerCase().match(/[a-z']+/g) ?? []).filter(t => t.length > 3 && !STOP.has(t))
    const hit = toks.find(t => weekWords.has(t))
      ?? toks.slice().sort((a, b) => b.length - a.length)[0]
      ?? ''
    return { text: s.text, word: hit }
  })

  const out = { weekId: id, match, gap, bank, mc, dict }
  writeFileSync(resolve(dataDir, `${id}.quiz.json`), JSON.stringify(out, null, 2) + '\n')
  console.log(`✓ ${id}.quiz.json  (match ${match.length} / gap ${gap.length} / mc ${mc.length} / dict ${dict.length})`)
  console.log(`  dict キーワード: ${dict.map(d => d.word).join(', ')}  ← 要確認`)
}
