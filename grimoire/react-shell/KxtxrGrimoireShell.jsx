import React, { useMemo, useState } from 'react';
import './KxtxrGrimoireShell.css';

const FALLBACK_NODES = [
  {
    id: 'creation',
    label: 'Creation',
    subtitle: 'Genesis of Forms',
    sanskrit: 'सृष्टि',
    runes: 'ᚲᚱᛖᚨᛏᛁᛟᚾ',
    es: 'Creación',
    tooltip: 'Origen, herida, forma y canon de KXTXR.',
  },
  {
    id: 'field',
    label: 'Field',
    subtitle: 'Maps · Residue · Entropy',
    sanskrit: 'क्षेत्र',
    runes: 'ᚠᛁᛖᛚᛞ',
    es: 'Campo',
    tooltip: 'REM618, HistoricalEvent, residuo y campo.',
  },
  {
    id: 'frecuency',
    label: 'Frecuency',
    subtitle: 'Waves · Pattern · Interval',
    sanskrit: 'आवृत्ति',
    runes: 'ᚠᚱᛖᚲᚢᛖᚾᚲᛃ',
    es: 'Frecuencia',
    tooltip: 'REM618 → 111 → RETURN → [?].',
  },
  {
    id: 'alchemical_lab',
    label: 'Alchemical Lab',
    subtitle: 'Elements · Reactions · Links',
    sanskrit: 'रसायन',
    runes: 'ᚨᛚᚲᚺᛖᛗᛁᚲᚨᛚ ᛚᚨᛒ',
    es: 'Laboratorio alquímico',
    tooltip: 'Conecta señales, objetos, símbolos, audio, notas y residuos.',
  },
  {
    id: 'notes',
    label: 'Notes',
    subtitle: 'Persistent Knowledge Register',
    sanskrit: 'स्मृति',
    runes: 'ᚾᛟᛏᛖᛋ',
    es: 'Notas',
    tooltip: 'Lo pensado, cambiado, persistido, descartado y descubierto.',
  },
  {
    id: 'objects',
    label: 'Objects',
    subtitle: 'Artifacts · Relics · Store',
    sanskrit: 'वस्तु',
    runes: 'ᛟᛒᛃᛖᚲᛏᛋ',
    es: 'Objetos',
    tooltip: 'Artefactos físicos y digitales del Grimorio.',
  },
  {
    id: 'reconstructions',
    label: 'Reconstructions',
    subtitle: 'Future Fragments · Timelines',
    sanskrit: 'पुनर्निर्माण',
    runes: 'ᚱᛖᚲᛟᚾᛋᛏᚱᚢᚲᛏᛁᛟᚾᛋ',
    es: 'Reconstrucciones',
    tooltip: 'Posibles futuros, próximos eventos y líneas alternativas.',
  },
  {
    id: 't_minus',
    label: '[ T - 0.00001 ]',
    subtitle: 'Before the Creation',
    sanskrit: 'पूर्व',
    runes: 'ᛏ - 0.00001',
    es: 'Antes de la creación',
    tooltip: 'Bio, motivación, atlas, algoritmos, esteganografía y pre-origen.',
  },
];

const NODE_POSITION = {
  creation: 'node--creation',
  field: 'node--field',
  frecuency: 'node--frecuency',
  alchemical_lab: 'node--alchemical-lab',
  notes: 'node--notes',
  objects: 'node--objects',
  reconstructions: 'node--reconstructions',
  t_minus: 'node--t-minus',
};

function Sigil({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 300"
      role="img"
      aria-label="KXTXR sigil"
    >
      <defs>
        <linearGradient id="kxtxr-shell-sigil-gradient" x1="0" x2="1">
          <stop offset="0%" stopColor="#28c8ef" />
          <stop offset="52%" stopColor="#68f2ff" />
          <stop offset="100%" stopColor="#b2ffff" />
        </linearGradient>
      </defs>
      <path
        d="M58 30 L58 176 L116 114 L150 114 L95 173 L136 212 L103 246 L58 198 L58 268"
        fill="none"
        stroke="url(#kxtxr-shell-sigil-gradient)"
        strokeWidth="14"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M184 55 L184 267 L132 210 L158 182 L184 209"
        fill="none"
        stroke="url(#kxtxr-shell-sigil-gradient)"
        strokeWidth="14"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M109 138 L152 181 M151 138 L109 181"
        fill="none"
        stroke="url(#kxtxr-shell-sigil-gradient)"
        strokeWidth="13"
        strokeLinecap="square"
      />
    </svg>
  );
}

function MenuNode({ node, active, translationVisible, onSelect }) {
  const tooltip = `${node.sanskrit || ''} · ${node.runes || ''} · ${node.tooltip || node.es || ''}`;

  return (
    <button
      type="button"
      className={`grimoire-node ${NODE_POSITION[node.id] || ''} ${active ? 'is-active' : ''}`}
      onClick={() => onSelect(node)}
      aria-pressed={active}
      data-tooltip={tooltip}
    >
      <span className="grimoire-node__trace" aria-hidden="true" />
      <span className="grimoire-node__body">
        <span className="grimoire-node__label">{node.label}</span>
        <span className="grimoire-node__subtitle">{node.subtitle}</span>
        <span className="grimoire-node__ritual" aria-hidden="true">
          <span className="grimoire-node__sanskrit">{node.sanskrit}</span>
          <span className="grimoire-node__runes">{node.runes}</span>
        </span>
        <span
          className={`grimoire-node__translation ${translationVisible ? 'is-visible' : ''}`}
          aria-hidden={!translationVisible}
        >
          {node.es}
        </span>
      </span>
      <span className="grimoire-node__corner" aria-hidden="true" />
    </button>
  );
}

export default function KxtxrGrimoireShell({
  content,
  initialNode = 'creation',
  onNavigate,
  className = '',
}) {
  const nodes = useMemo(() => {
    if (Array.isArray(content?.menu) && content.menu.length === 8) {
      return content.menu.map((node) => ({
        ...node,
        sanskrit: node.sanskrit?.text ?? node.sanskrit ?? '',
        runes: node.runes?.text ?? node.runes ?? '',
        es: node.sanskrit?.es_translation ?? node.runes?.es_translation ?? node.es ?? '',
        tooltip: node.sanskrit?.tooltip ?? node.runes?.tooltip ?? node.tooltip ?? '',
      }));
    }
    return FALLBACK_NODES;
  }, [content]);

  const [activeNode, setActiveNode] = useState(initialNode);
  const [translationVisible, setTranslationVisible] = useState(false);

  const selected = nodes.find((node) => node.id === activeNode) ?? nodes[0];

  function selectNode(node) {
    setActiveNode(node.id);
    onNavigate?.(node);
  }

  return (
    <section
      className={`kxtxr-grimoire-shell ${className}`.trim()}
      aria-label="KXTXR open grimoire navigation"
    >
      <div className="grimoire-ambient" aria-hidden="true">
        <div className="grimoire-ambient__vignette" />
        <div className="grimoire-ambient__fog fog--one" />
        <div className="grimoire-ambient__fog fog--two" />
        <div className="grimoire-ambient__grid" />
        <div className="grimoire-ambient__dust" />
      </div>

      <header className="grimoire-shell__header">
        <div className="grimoire-shell__brand" aria-label="KXTXR">
          <div className="grimoire-shell__orbital-mark" aria-hidden="true">
            <div className="orbital-ring orbital-ring--one" />
            <div className="orbital-ring orbital-ring--two" />
            <Sigil className="grimoire-shell__corner-sigil" />
          </div>
        </div>

        <button
          type="button"
          className={`grimoire-language-toggle ${translationVisible ? 'is-active' : ''}`}
          onClick={() => setTranslationVisible((value) => !value)}
          aria-pressed={translationVisible}
        >
          <span className="grimoire-language-toggle__ritual">सं / ᚱᚢᚾ</span>
          <span className="grimoire-language-toggle__divider">+</span>
          <span className="grimoire-language-toggle__es">ES</span>
        </button>
      </header>

      <div className="grimoire-shell__stage">
        <div className="grimoire-shell__console" aria-live="polite">
          <div className="holo-console__projection" aria-hidden="true" />
          <div className="holo-console__frame">
            <div className="holo-console__scanlines" aria-hidden="true" />
            <div className="holo-console__rune-ring rune-ring--outer" aria-hidden="true" />
            <div className="holo-console__rune-ring rune-ring--inner" aria-hidden="true" />
            <div className="holo-console__particles" aria-hidden="true" />

            <div className="holo-console__sigil-stack" aria-hidden="true">
              <Sigil className="holo-sigil holo-sigil--base" />
              <Sigil className="holo-sigil holo-sigil--glitch glitch--one" />
              <Sigil className="holo-sigil holo-sigil--glitch glitch--two" />
              <Sigil className="holo-sigil holo-sigil--glitch glitch--three" />
            </div>

            <div className="holo-console__state">
              <span className="holo-console__state-label">{selected.label}</span>
              <span className="holo-console__state-ritual">
                {selected.sanskrit} · {selected.runes}
              </span>
              <span
                className={`holo-console__state-es ${translationVisible ? 'is-visible' : ''}`}
              >
                {selected.es}
              </span>
            </div>
          </div>
        </div>

        <div className="grimoire-shell__nodes" aria-label="Grimoire sections">
          {nodes.map((node) => (
            <MenuNode
              key={node.id}
              node={node}
              active={node.id === activeNode}
              translationVisible={translationVisible}
              onSelect={selectNode}
            />
          ))}
        </div>

        <div className="grimoire-book" aria-hidden="true">
          <div className="grimoire-book__shadow" />
          <div className="grimoire-book__page grimoire-book__page--left">
            <div className="grimoire-book__page-grid" />
            <div className="grimoire-book__page-runes">ᛉ ᛏ ᚱ · स्मृति · ᚾ ᛟ ᛞ ᛖ</div>
          </div>
          <div className="grimoire-book__spine" />
          <div className="grimoire-book__page grimoire-book__page--right">
            <div className="grimoire-book__page-grid" />
            <div className="grimoire-book__page-runes">रसायन · ᚠ ᛁ ᛖ ᛚ ᛞ · आवृत्ति</div>
          </div>
          <div className="grimoire-book__core" />
        </div>
      </div>

      <footer className="grimoire-shell__footer" aria-hidden="true">
        <span>ᚲᛉᛏᛉᚱ</span>
        <i />
        <span>GRIMOIRE / OPEN NODE</span>
        <i />
        <span>स्मृति · रसायन · क्षेत्र</span>
      </footer>
    </section>
  );
}
