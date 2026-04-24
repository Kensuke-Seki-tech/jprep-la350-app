import React from 'react';

/**
 * 各単語に対応するSVGイラストを返す
 * やわらかみのある、シンプルで直感的な絵柄
 */
export function getWordSvg(wordId: string): React.ReactNode {
  const svgs: Record<string, React.ReactNode> = {
    // Week 05
    w05_001: ( // sapling - 苗木
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="108" rx="25" ry="6" fill="#c8a97c" opacity="0.4"/>
        <rect x="56" y="75" width="8" height="33" rx="4" fill="#a0785a"/>
        <ellipse cx="60" cy="60" rx="28" ry="32" fill="#5cb85c"/>
        <ellipse cx="47" cy="52" rx="16" ry="18" fill="#6dca6d"/>
        <ellipse cx="73" cy="55" rx="14" ry="16" fill="#6dca6d"/>
        <ellipse cx="60" cy="42" rx="18" ry="22" fill="#7dd87d"/>
        <circle cx="50" cy="50" r="5" fill="#a8e6a8" opacity="0.6"/>
        <circle cx="70" cy="55" r="4" fill="#a8e6a8" opacity="0.5"/>
      </svg>
    ),
    w05_002: ( // intemperate - 節度のない
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="15" width="20" height="65" rx="10" fill="#e8e8f0" stroke="#ccc" strokeWidth="2"/>
        <rect x="55" y="70" width="10" height="30" rx="5" fill="#ff4444"/>
        <rect x="55" y="40" width="10" height="32" rx="5" fill="#ff8844" opacity="0.7"/>
        <rect x="55" y="20" width="10" height="22" rx="5" fill="#ffcc44" opacity="0.5"/>
        <circle cx="60" cy="85" r="12" fill="#ff3333" stroke="#cc0000" strokeWidth="2"/>
        <text x="60" y="90" textAnchor="middle" fontSize="16" fill="white">!</text>
        <line x1="60" y1="85" x2="75" y2="70" stroke="#ff6666" strokeWidth="2" opacity="0.7"/>
        <line x1="60" y1="85" x2="45" y2="72" stroke="#ff6666" strokeWidth="2" opacity="0.7"/>
      </svg>
    ),
    w05_003: ( // resplendent - 輝かしい
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="25" fill="#FFD700" opacity="0.9"/>
        <circle cx="60" cy="60" r="18" fill="#FFF176"/>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => (
          <line key={i}
            x1={60 + 27 * Math.cos(deg * Math.PI / 180)}
            y1={60 + 27 * Math.sin(deg * Math.PI / 180)}
            x2={60 + 42 * Math.cos(deg * Math.PI / 180)}
            y2={60 + 42 * Math.sin(deg * Math.PI / 180)}
            stroke="#FFD700" strokeWidth={i % 2 === 0 ? 3 : 2} strokeLinecap="round"
          />
        ))}
        <circle cx="60" cy="60" r="8" fill="white" opacity="0.8"/>
        <ellipse cx="52" cy="52" rx="5" ry="3" fill="white" opacity="0.6" transform="rotate(-30 52 52)"/>
      </svg>
    ),
    w05_004: ( // beguiling - 魅力的な
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="55" r="28" fill="#FFB6C1"/>
        <circle cx="60" cy="55" r="22" fill="#FFC0CB"/>
        <circle cx="50" cy="50" r="5" fill="white"/>
        <circle cx="70" cy="50" r="5" fill="white"/>
        <circle cx="51" cy="49" r="3" fill="#333"/>
        <circle cx="71" cy="49" r="3" fill="#333"/>
        <circle cx="52" cy="48" r="1" fill="white"/>
        <circle cx="72" cy="48" r="1" fill="white"/>
        <path d="M50 65 Q60 75 70 65" stroke="#e75480" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M44 42 Q50 38 56 42" stroke="#888" strokeWidth="1.5" fill="none"/>
        <path d="M64 42 Q70 38 76 42" stroke="#888" strokeWidth="1.5" fill="none"/>
        <text x="60" y="100" textAnchor="middle" fontSize="22">✨</text>
      </svg>
    ),
    w05_005: ( // disentangle - ほぐす
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 40 Q40 20 60 40 Q80 60 60 80 Q40 100 60 110" fill="none" stroke="#ff8844" strokeWidth="4" strokeLinecap="round"/>
        <path d="M40 30 Q60 50 40 70 Q20 90 40 100" fill="none" stroke="#4488ff" strokeWidth="4" strokeLinecap="round"/>
        <path d="M80 25 Q60 45 80 65 Q100 85 80 100" fill="none" stroke="#44bb44" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="60" cy="60" r="15" fill="white" opacity="0.85"/>
        <text x="60" y="67" textAnchor="middle" fontSize="20">✂️</text>
      </svg>
    ),
    w05_006: ( // abolish - 廃止する
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="30" width="60" height="75" rx="5" fill="#f5f5f5" stroke="#ccc" strokeWidth="2"/>
        <line x1="40" y1="50" x2="80" y2="50" stroke="#888" strokeWidth="2"/>
        <line x1="40" y1="62" x2="80" y2="62" stroke="#888" strokeWidth="2"/>
        <line x1="40" y1="74" x2="65" y2="74" stroke="#888" strokeWidth="2"/>
        <circle cx="60" cy="60" r="30" fill="#ff4444" opacity="0.85"/>
        <line x1="40" y1="40" x2="80" y2="80" stroke="white" strokeWidth="6" strokeLinecap="round"/>
        <line x1="80" y1="40" x2="40" y2="80" stroke="white" strokeWidth="6" strokeLinecap="round"/>
      </svg>
    ),
    w05_007: ( // intrepid - 勇敢な
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="108" rx="30" ry="8" fill="#c8a97c" opacity="0.3"/>
        <rect x="52" y="65" width="16" height="40" rx="4" fill="#8B6914"/>
        <rect x="45" y="50" width="30" height="25" rx="5" fill="#e8d08a"/>
        <circle cx="60" cy="42" r="20" fill="#f4c86a"/>
        <circle cx="53" cy="38" r="3" fill="#333"/>
        <circle cx="67" cy="38" r="3" fill="#333"/>
        <path d="M52 52 Q60 58 68 52" stroke="#a0522d" strokeWidth="2" fill="none"/>
        <rect x="36" y="55" width="8" height="20" rx="4" fill="#cd853f"/>
        <rect x="76" y="55" width="8" height="20" rx="4" fill="#cd853f"/>
        <path d="M30 45 L50 55 L30 65 Z" fill="#e74c3c" opacity="0.8"/>
        <text x="60" y="95" textAnchor="middle" fontSize="20">🦁</text>
      </svg>
    ),
    w05_008: ( // languid - だらりとした
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="60" width="90" height="50" rx="8" fill="#8B6914" opacity="0.6"/>
        <rect x="20" y="55" width="80" height="15" rx="4" fill="#a0785a"/>
        <ellipse cx="60" cy="52" rx="22" ry="22" fill="#f4c86a"/>
        <circle cx="52" cy="47" r="3" fill="#333"/>
        <circle cx="68" cy="47" r="3" fill="#333"/>
        <path d="M50 60 Q60 56 70 60" stroke="#888" strokeWidth="2" fill="none"/>
        <path d="M30 65 Q18 70 15 88" fill="none" stroke="#f4c86a" strokeWidth="10" strokeLinecap="round"/>
        <path d="M90 65 Q102 70 105 88" fill="none" stroke="#f4c86a" strokeWidth="10" strokeLinecap="round"/>
        <text x="60" y="115" textAnchor="middle" fontSize="20">😪</text>
      </svg>
    ),
    w05_009: ( // pirouette - くるくる回る
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="35" fill="#FFE4F0" opacity="0.5"/>
        {[0,45,90,135,180,225,270,315].map((deg, i) => (
          <line key={i}
            x1={60 + 30 * Math.cos(deg * Math.PI / 180)}
            y1={60 + 30 * Math.sin(deg * Math.PI / 180)}
            x2={60 + 45 * Math.cos((deg + 15) * Math.PI / 180)}
            y2={60 + 45 * Math.sin((deg + 15) * Math.PI / 180)}
            stroke="#e75480" strokeWidth="2" opacity="0.5" strokeLinecap="round"
          />
        ))}
        <text x="60" y="75" textAnchor="middle" fontSize="42">🩰</text>
        <ellipse cx="60" cy="108" rx="20" ry="5" fill="#e75480" opacity="0.3"/>
      </svg>
    ),
    w05_010: ( // supple - しなやかな
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="108" rx="20" ry="5" fill="#aaa" opacity="0.3"/>
        <path d="M60 20 Q90 35 85 60 Q80 85 60 100 Q40 85 35 60 Q30 35 60 20" fill="#98FB98" opacity="0.8"/>
        <path d="M60 20 Q50 40 55 65 Q58 85 60 100" fill="none" stroke="#5cb85c" strokeWidth="2" strokeDasharray="4,3"/>
        <circle cx="60" cy="20" r="6" fill="#5cb85c"/>
        <path d="M40 50 Q60 45 80 55" fill="none" stroke="#5cb85c" strokeWidth="2"/>
        <path d="M38 70 Q60 65 82 72" fill="none" stroke="#5cb85c" strokeWidth="2"/>
        <text x="60" y="75" textAnchor="middle" fontSize="24">🤸</text>
      </svg>
    ),
    w05_011: ( // reverent - 敬虔な
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="35" r="15" fill="#f4c86a"/>
        <rect x="50" y="50" width="20" height="35" rx="5" fill="#6a9bd6"/>
        <path d="M50 60 L35 55 Q30 65 38 70 L50 68" fill="#6a9bd6"/>
        <path d="M70 60 L85 55 Q90 65 82 70 L70 68" fill="#6a9bd6"/>
        <path d="M43 65 Q60 80 77 65" fill="none" stroke="#f4c86a" strokeWidth="3" strokeLinecap="round"/>
        <rect x="55" y="85" width="10" height="20" rx="3" fill="#8B6914"/>
        <line x1="48" y1="90" x2="72" y2="90" stroke="#8B6914" strokeWidth="2"/>
        <text x="60" y="20" textAnchor="middle" fontSize="16">🙏</text>
      </svg>
    ),
    w05_012: ( // abseil - 懸垂下降
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="120" height="35" rx="0" fill="#9E9E9E" opacity="0.5"/>
        <rect x="0" y="0" width="40" height="120" rx="0" fill="#8D6E63" opacity="0.4"/>
        <line x1="60" y1="0" x2="60" y2="110" stroke="#e0e0e0" strokeWidth="3" strokeDasharray="5,3"/>
        <circle cx="60" cy="5" r="5" fill="#aaa" stroke="#888" strokeWidth="1"/>
        <circle cx="60" cy="65" r="12" fill="#f4c86a"/>
        <rect x="53" y="55" width="14" height="20" rx="3" fill="#4488ff"/>
        <line x1="53" y1="65" x2="42" y2="75" stroke="#f4c86a" strokeWidth="5" strokeLinecap="round"/>
        <line x1="67" y1="65" x2="78" y2="75" stroke="#f4c86a" strokeWidth="5" strokeLinecap="round"/>
        <text x="60" y="110" textAnchor="middle" fontSize="18">🧗</text>
      </svg>
    ),
    w05_013: ( // adulation - 過度の称賛
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="40" r="20" fill="#FFD700" opacity="0.9"/>
        <text x="60" y="48" textAnchor="middle" fontSize="22">⭐</text>
        <text x="25" y="80" fontSize="20">🙌</text>
        <text x="72" y="80" fontSize="20">🙌</text>
        <text x="15" y="55" fontSize="14" fill="#ff8844">❤️</text>
        <text x="88" y="55" fontSize="14" fill="#ff8844">❤️</text>
        <text x="30" y="100" fontSize="12" fill="#666">wow!</text>
        <text x="65" y="100" fontSize="12" fill="#666">love!</text>
        <text x="45" y="113" fontSize="11" fill="#888">amazing!</text>
      </svg>
    ),
    w05_014: ( // decapitate - 斬首する（ユーモラスに表現）
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="65" width="70" height="45" rx="8" fill="#E8D08A"/>
        <text x="60" y="95" textAnchor="middle" fontSize="24">🌻</text>
        <circle cx="60" cy="45" r="20" fill="#FFD700"/>
        <text x="60" y="52" textAnchor="middle" fontSize="20">🌸</text>
        <line x1="20" y1="65" x2="100" y2="65" stroke="#ff4444" strokeWidth="3" strokeDasharray="6,3"/>
        <text x="95" y="62" fontSize="18">✂️</text>
        <text x="12" y="35" fontSize="12" fill="#888">de + capit</text>
        <text x="15" y="48" fontSize="10" fill="#aaa">（頭を除去）</text>
      </svg>
    ),
    w05_015: ( // incandescent - 白熱した
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="108" rx="20" ry="6" fill="#FFD700" opacity="0.3"/>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => (
          <line key={i}
            x1={60 + 32 * Math.cos(deg * Math.PI / 180)}
            y1={60 + 32 * Math.sin(deg * Math.PI / 180)}
            x2={60 + 50 * Math.cos(deg * Math.PI / 180)}
            y2={60 + 50 * Math.sin(deg * Math.PI / 180)}
            stroke="#FFD700" strokeWidth={2} strokeLinecap="round" opacity="0.7"
          />
        ))}
        <circle cx="60" cy="60" r="30" fill="#FFF9C4"/>
        <circle cx="60" cy="60" r="22" fill="#FFEE58"/>
        <circle cx="60" cy="60" r="14" fill="#FFD700"/>
        <circle cx="60" cy="60" r="7" fill="white" opacity="0.9"/>
        <rect x="50" y="90" width="20" height="8" rx="3" fill="#aaa"/>
        <rect x="52" y="98" width="16" height="12" rx="2" fill="#e0e0e0"/>
      </svg>
    ),
    w05_016: ( // diversion - 注意をそらすこと
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <line x1="15" y1="60" x2="75" y2="60" stroke="#888" strokeWidth="4" strokeLinecap="round"/>
        <polygon points="75,50 100,60 75,70" fill="#888"/>
        <path d="M55 60 Q70 45 90 40" fill="none" stroke="#ff4444" strokeWidth="4" strokeLinecap="round"/>
        <polygon points="78,32 95,38 84,50" fill="#ff4444"/>
        <circle cx="35" cy="60" r="8" fill="#4488ff" opacity="0.8"/>
        <text x="35" y="65" textAnchor="middle" fontSize="10" fill="white">👁</text>
        <text x="95" y="35" fontSize="16">🎯</text>
      </svg>
    ),
    w05_017: ( // impenetrable - 入り込めない
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="20" width="60" height="90" rx="3" fill="#90A4AE"/>
        <rect x="33" y="23" width="54" height="84" rx="2" fill="#B0BEC5"/>
        {[35,50,65,80,95].map((y, i) => (
          <rect key={i} x="38" y={y} width="44" height="8" rx="2" fill="#90A4AE" opacity="0.6"/>
        ))}
        <path d="M5 55 L25 60 L5 65 Z" fill="#e74c3c" opacity="0.8"/>
        <line x1="25" y1="60" x2="30" y2="60" stroke="#e74c3c" strokeWidth="3"/>
        <text x="30" y="55" fontSize="18">💥</text>
        <path d="M30 60 L18 50" fill="none" stroke="#ff8844" strokeWidth="2" strokeDasharray="3,2"/>
      </svg>
    ),

    // Week 06
    w06_001: ( // ravishing - うっとりさせる
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="115" rx="35" ry="8" fill="#FFB6C1" opacity="0.3"/>
        <path d="M35 80 Q60 100 85 80 L90 115 L30 115 Z" fill="#fff0f5"/>
        <path d="M38 80 Q60 95 82 80 L80 115 L40 115 Z" fill="white"/>
        <circle cx="60" cy="55" r="22" fill="#f4c86a"/>
        <circle cx="51" cy="50" r="4" fill="#333"/>
        <circle cx="69" cy="50" r="4" fill="#333"/>
        <circle cx="52" cy="48" r="1.5" fill="white"/>
        <path d="M50 63 Q60 70 70 63" stroke="#e75480" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <text x="20" y="50" fontSize="16">💕</text>
        <text x="85" y="45" fontSize="16">✨</text>
        <text x="25" y="70" fontSize="14">😍</text>
        <text x="80" y="72" fontSize="14">😍</text>
      </svg>
    ),
    w06_002: ( // frothy - 泡立った
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="55" width="60" height="60" rx="5" fill="#6B3A2A" opacity="0.85"/>
        <rect x="33" y="58" width="54" height="54" rx="3" fill="#4a2310" opacity="0.9"/>
        <ellipse cx="60" cy="58" rx="30" ry="10" fill="#4a2310"/>
        <ellipse cx="60" cy="48" rx="28" ry="12" fill="#f5f5f5"/>
        <circle cx="48" cy="44" r="7" fill="white"/>
        <circle cx="60" cy="41" r="9" fill="white"/>
        <circle cx="72" cy="44" r="7" fill="white"/>
        <circle cx="54" cy="50" r="5" fill="white" opacity="0.8"/>
        <circle cx="66" cy="50" r="6" fill="white" opacity="0.8"/>
        <circle cx="42" cy="50" r="4" fill="white" opacity="0.6"/>
        <circle cx="78" cy="49" r="4" fill="white" opacity="0.6"/>
      </svg>
    ),
    w06_003: ( // incredulous - 信じられない
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="55" r="28" fill="#f4c86a"/>
        <circle cx="50" cy="48" r="5" fill="white"/>
        <circle cx="70" cy="48" r="5" fill="white"/>
        <circle cx="51" cy="48" r="3" fill="#333"/>
        <circle cx="71" cy="48" r="3" fill="#333"/>
        <path d="M50 66 Q60 62 70 66" stroke="#888" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M43 38 Q50 32 57 38" stroke="#555" strokeWidth="2" fill="none"/>
        <path d="M63 36 Q70 30 77 36" stroke="#555" strokeWidth="3" fill="none"/>
        <text x="82" y="42" fontSize="20">🤨</text>
        <text x="18" y="85" fontSize="11" fill="#888">really...?</text>
        <text x="55" y="100" fontSize="22">❓</text>
      </svg>
    ),
    w06_004: ( // convulsive - 痙攣性の
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="40" fill="#ffe0b2" opacity="0.4"/>
        {[0,45,90,135,180,225,270,315].map((deg, i) => (
          <line key={i}
            x1={60 + 25 * Math.cos(deg * Math.PI / 180)}
            y1={60 + 25 * Math.sin(deg * Math.PI / 180)}
            x2={60 + 42 * Math.cos((deg + 20) * Math.PI / 180)}
            y2={60 + 42 * Math.sin((deg + 20) * Math.PI / 180)}
            stroke="#ff8844" strokeWidth="3" strokeLinecap="round" opacity="0.8"
          />
        ))}
        <text x="60" y="72" textAnchor="middle" fontSize="32">⚡</text>
        <circle cx="60" cy="60" r="18" fill="#FFE082" opacity="0.6"/>
      </svg>
    ),
    w06_005: ( // corrosive - 腐食性の
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="45" y="30" width="30" height="65" rx="8" fill="#B2DFDB"/>
        <rect x="47" y="32" width="26" height="61" rx="6" fill="#E0F2F1" opacity="0.9"/>
        <ellipse cx="60" cy="30" rx="18" ry="7" fill="#B2DFDB"/>
        <ellipse cx="60" cy="30" rx="14" ry="5" fill="#E0F2F1" opacity="0.9"/>
        <path d="M50 50 Q55 55 48 62 Q44 68 50 72" fill="none" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round"/>
        <path d="M70 45 Q65 52 72 58 Q77 64 70 70" fill="none" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="55" cy="80" r="4" fill="#69F0AE" opacity="0.7"/>
        <circle cx="67" cy="75" r="3" fill="#69F0AE" opacity="0.6"/>
        <text x="15" y="30" fontSize="20">⚠️</text>
        <text x="85" y="30" fontSize="16">☠️</text>
      </svg>
    ),
    w06_006: ( // corporal - 伍長
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="35" r="18" fill="#f4c86a"/>
        <rect x="48" y="53" width="24" height="42" rx="3" fill="#5D4037"/>
        <rect x="40" y="58" width="12" height="30" rx="3" fill="#5D4037"/>
        <rect x="68" y="58" width="12" height="30" rx="3" fill="#5D4037"/>
        <rect x="48" y="95" width="10" height="20" rx="3" fill="#4E342E"/>
        <rect x="62" y="95" width="10" height="20" rx="3" fill="#4E342E"/>
        <rect x="52" y="53" width="16" height="8" rx="2" fill="#795548"/>
        <rect x="44" y="60" width="5" height="12" rx="2" fill="#FFD700" opacity="0.9"/>
        <rect x="49" y="60" width="5" height="12" rx="2" fill="#FFD700" opacity="0.9"/>
        <text x="60" y="30" textAnchor="middle" fontSize="14">🎖️</text>
      </svg>
    ),
    w06_007: ( // menace - 脅威
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="112" rx="30" ry="7" fill="#555" opacity="0.2"/>
        <ellipse cx="60" cy="68" rx="38" ry="30" fill="#795548"/>
        <ellipse cx="60" cy="55" rx="32" ry="26" fill="#A1887F"/>
        <circle cx="44" cy="52" r="7" fill="white"/>
        <circle cx="76" cy="52" r="7" fill="white"/>
        <circle cx="45" cy="53" r="4" fill="#f44336"/>
        <circle cx="77" cy="53" r="4" fill="#f44336"/>
        <path d="M40 72 L48 65 L52 72 L58 60 L64 72 L68 65 L76 72 L80 72" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="30" y="38" width="12" height="6" rx="2" fill="#795548"/>
        <rect x="78" y="38" width="12" height="6" rx="2" fill="#795548"/>
      </svg>
    ),
    w06_008: ( // confiscate - 没収する
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="55" width="35" height="25" rx="5" fill="#90CAF9"/>
        <rect x="52" y="57" width="31" height="21" rx="4" fill="#BBDEFB"/>
        <circle cx="82" cy="62" r="3" fill="#fff" opacity="0.7"/>
        <path d="M30 65 L50 65" stroke="#888" strokeWidth="3" strokeLinecap="round"/>
        <path d="M40 55 L50 65 L40 75" fill="none" stroke="#888" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="18" y="50" width="40" height="65" rx="5" fill="#f5f5f5" stroke="#ccc" strokeWidth="2"/>
        <text x="38" y="75" textAnchor="middle" fontSize="18">🏛️</text>
        <text x="38" y="100" textAnchor="middle" fontSize="10" fill="#666">国庫</text>
      </svg>
    ),
    w06_009: ( // demerit - 欠点・罰点
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="25" width="80" height="80" rx="5" fill="white" stroke="#ddd" strokeWidth="2"/>
        <text x="35" y="65" fontSize="14" fill="#888">merit</text>
        <text x="60" y="55" fontSize="22">→</text>
        <rect x="20" y="25" width="80" height="80" rx="5" fill="white" stroke="#ddd" strokeWidth="2" opacity="0"/>
        <circle cx="60" cy="65" r="28" fill="#ff4444" opacity="0.85"/>
        <text x="60" y="73" textAnchor="middle" fontSize="28" fill="white">✕</text>
        <text x="60" y="115" textAnchor="middle" fontSize="11" fill="#888">-10 points</text>
      </svg>
    ),
    w06_010: ( // bedraggled - ずぶ濡れ
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <text x="8" y="40" fontSize="13" fill="#88aaff">💧</text>
        <text x="25" y="22" fontSize="13" fill="#88aaff">💧</text>
        <text x="55" y="18" fontSize="13" fill="#88aaff">💧</text>
        <text x="85" y="25" fontSize="13" fill="#88aaff">💧</text>
        <text x="100" y="42" fontSize="13" fill="#88aaff">💧</text>
        <ellipse cx="60" cy="75" rx="28" ry="22" fill="#90A4AE" opacity="0.7"/>
        <ellipse cx="60" cy="60" rx="22" ry="18" fill="#B0BEC5"/>
        <circle cx="50" cy="56" r="4" fill="#555"/>
        <circle cx="70" cy="56" r="4" fill="#555"/>
        <path d="M50 68 Q60 63 70 68" stroke="#666" strokeWidth="2" fill="none"/>
        <path d="M38 62 Q25 70 22 85" fill="none" stroke="#90A4AE" strokeWidth="8" strokeLinecap="round" opacity="0.8"/>
        <path d="M82 62 Q95 70 98 85" fill="none" stroke="#90A4AE" strokeWidth="8" strokeLinecap="round" opacity="0.8"/>
        <path d="M42 78 L38 95" stroke="#88aaff" strokeWidth="2" strokeLinecap="round"/>
        <path d="M60 90 L58 108" stroke="#88aaff" strokeWidth="2" strokeLinecap="round"/>
        <path d="M78 78 L82 95" stroke="#88aaff" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    w06_011: ( // chastened - 反省した
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="50" r="22" fill="#f4c86a"/>
        <circle cx="51" cy="45" r="3.5" fill="#333"/>
        <circle cx="69" cy="45" r="3.5" fill="#333"/>
        <path d="M50 62 Q60 57 70 62" stroke="#888" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <line x1="45" y1="38" x2="57" y2="43" stroke="#888" strokeWidth="2"/>
        <line x1="75" y1="38" x2="63" y2="43" stroke="#888" strokeWidth="2"/>
        <text x="55" y="35" fontSize="18">😔</text>
        <rect x="45" y="72" width="30" height="38" rx="5" fill="#9E9E9E"/>
        <path d="M35 82 L45 85 L45 100 L35 98 Z" fill="#9E9E9E"/>
        <path d="M85 82 L75 85 L75 100 L85 98 Z" fill="#9E9E9E"/>
        <text x="60" y="60" textAnchor="middle" fontSize="12">💭</text>
        <text x="60" y="25" textAnchor="middle" fontSize="10" fill="#888">sorry...</text>
      </svg>
    ),
    w06_012: ( // ultrasonic - 超音波
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <text x="30" y="65" textAnchor="middle" fontSize="28">🦇</text>
        {[1,2,3].map(i => (
          <path key={i}
            d={`M55 ${60 - i * 3} Q${55 + i * 15} 60 55 ${60 + i * 3}`}
            fill="none" stroke={`hsl(${210 + i * 15}, 70%, ${50 + i * 10}%)`}
            strokeWidth="2.5" strokeLinecap="round" opacity={1 - i * 0.15}
          />
        ))}
        <text x="95" y="50" textAnchor="middle" fontSize="14">🔇</text>
        <path d="M85 45 L105 35" stroke="#ff4444" strokeWidth="2"/>
        <path d="M85 55 L105 65" stroke="#ff4444" strokeWidth="2"/>
        <text x="90" y="80" fontSize="10" fill="#888">人の耳</text>
        <text x="88" y="92" fontSize="10" fill="#888">きこえない</text>
        <text x="55" y="105" textAnchor="middle" fontSize="10" fill="#5B86E5">ultra（超）+ son（音）</text>
      </svg>
    ),
    w06_013: ( // digression - 脱線
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <line x1="10" y1="75" x2="65" y2="75" stroke="#888" strokeWidth="4" strokeLinecap="round"/>
        <polygon points="65,68 88,75 65,82" fill="#888"/>
        <path d="M45 75 Q55 55 85 35" fill="none" stroke="#ff4444" strokeWidth="4" strokeLinecap="round"/>
        <polygon points="73,28 90,33 80,47" fill="#ff4444"/>
        <text x="88" y="30" fontSize="14">🐱</text>
        <text x="75" y="22" fontSize="10" fill="#888">余談...</text>
        <text x="8" y="95" fontSize="10" fill="#888">本題</text>
        <text x="50" y="50" fontSize="10" fill="#ff4444">脱線！</text>
        <text x="10" y="112" fontSize="10" fill="#5B86E5">di（わき）+ gress（進む）</text>
      </svg>
    ),
    w06_014: ( // recalcitrant - 反抗的な
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="38" r="18" fill="#f4c86a"/>
        <circle cx="52" cy="33" r="3" fill="#333"/>
        <circle cx="68" cy="33" r="3" fill="#333"/>
        <path d="M50 46 Q60 42 70 46" stroke="#888" strokeWidth="2" fill="none"/>
        <path d="M44 28 Q52 22 58 28" stroke="#555" strokeWidth="2.5" fill="none"/>
        <path d="M62 28 Q68 22 76 28" stroke="#555" strokeWidth="2.5" fill="none"/>
        <rect x="48" y="56" width="24" height="35" rx="4" fill="#ef5350"/>
        <path d="M30 66 L48 62 L48 78 L30 80 Z" fill="#ef5350"/>
        <path d="M72 62 L90 60 L92 78 L72 78 Z" fill="#ef5350"/>
        <rect x="50" y="91" width="10" height="20" rx="3" fill="#b71c1c"/>
        <rect x="60" y="91" width="10" height="20" rx="3" fill="#b71c1c"/>
        <path d="M30 80 Q25 90 28 100" fill="none" stroke="#f4c86a" strokeWidth="7" strokeLinecap="round"/>
        <text x="90" y="100" fontSize="18">😤</text>
      </svg>
    ),
    w06_015: ( // pun - 駄洒落
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="20" width="45" height="35" rx="8" fill="#FFF9C4" stroke="#FFD700" strokeWidth="2"/>
        <text x="34" y="43" textAnchor="middle" fontSize="14" fill="#F57F17">bat</text>
        <rect x="63" y="20" width="45" height="35" rx="8" fill="#E1F5FE" stroke="#4FC3F7" strokeWidth="2"/>
        <text x="85" y="43" textAnchor="middle" fontSize="14" fill="#0277BD">bat</text>
        <text x="34" y="65" textAnchor="middle" fontSize="22">🦇</text>
        <text x="85" y="65" textAnchor="middle" fontSize="22">🏏</text>
        <path d="M57 37 L63 37" stroke="#888" strokeWidth="2" strokeDasharray="3,2"/>
        <text x="60" y="90" textAnchor="middle" fontSize="22">😄</text>
        <text x="60" y="108" textAnchor="middle" fontSize="10" fill="#888">同じ音・違う意味</text>
      </svg>
    ),
    w06_016: ( // bleak - 荒涼とした
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="120" height="120" fill="#ECEFF1"/>
        <rect x="0" y="70" width="120" height="50" fill="#CFD8DC"/>
        <ellipse cx="60" cy="70" rx="60" ry="8" fill="#B0BEC5"/>
        <rect x="0" y="0" width="120" height="40" fill="#B0BEC5" opacity="0.4"/>
        <ellipse cx="30" cy="30" rx="25" ry="15" fill="#90A4AE" opacity="0.6"/>
        <ellipse cx="80" cy="20" rx="30" ry="18" fill="#90A4AE" opacity="0.5"/>
        <line x1="58" y1="70" x2="58" y2="35" stroke="#546E7A" strokeWidth="3"/>
        <path d="M58 35 Q75 42 70 55" fill="none" stroke="#546E7A" strokeWidth="2"/>
        <path d="M58 45 Q42 50 45 62" fill="none" stroke="#546E7A" strokeWidth="2"/>
        <path d="M58 55 Q72 58 68 68" fill="none" stroke="#546E7A" strokeWidth="2"/>
      </svg>
    ),
  };

  return svgs[wordId] ?? (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#f0f0f0"/>
      <text x="60" y="75" textAnchor="middle" fontSize="40">📖</text>
    </svg>
  );
}
