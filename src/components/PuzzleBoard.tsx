import React, { useState, useEffect } from 'react';
import { PuzzleTile, RuneType } from '@/model/puzzle';
import { useTranslation } from '@/utils/i18n';
import { Sparkles, RefreshCw, Flame, Droplets, Mountain, Wind, Zap, Sun } from 'lucide-react';
import { Button } from './Button';

const RUNE_TYPES: RuneType[] = ['fire', 'water', 'earth', 'air', 'arcane', 'light'];

const RUNE_CONFIG: Record<RuneType, { color: string; bg: string; icon: React.ReactNode }> = {
  fire: { color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/50', icon: <Flame className="w-6 h-6" /> },
  water: { color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/50', icon: <Droplets className="w-6 h-6" /> },
  earth: { color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/50', icon: <Mountain className="w-6 h-6" /> },
  air: { color: 'text-sky-300', bg: 'bg-sky-500/20 border-sky-500/50', icon: <Wind className="w-6 h-6" /> },
  arcane: { color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/50', icon: <Zap className="w-6 h-6" /> },
  light: { color: 'text-yellow-300', bg: 'bg-yellow-500/20 border-yellow-500/50', icon: <Sun className="w-6 h-6" /> },
};

export const PuzzleBoard: React.FC = () => {
  const { t } = useTranslation();
  const [grid, setGrid] = useState<PuzzleTile[][]>([]);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(25);

  const initGrid = () => {
    const newGrid: PuzzleTile[][] = [];
    for (let r = 0; r < 4; r++) {
      const row: PuzzleTile[] = [];
      for (let c = 0; c < 4; c++) {
        const randomType = RUNE_TYPES[Math.floor(Math.random() * RUNE_TYPES.length)];
        row.push({
          id: `${r}-${c}-${Math.random()}`,
          type: randomType,
          row: r,
          col: c,
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setSelected(null);
  };

  useEffect(() => {
    initGrid();
  }, []);

  const handleTileClick = (r: number, c: number) => {
    if (moves <= 0) return;

    if (!selected) {
      setSelected({ row: r, col: c });
      return;
    }

    // Check if adjacent
    const isAdjacent =
      (Math.abs(selected.row - r) === 1 && selected.col === c) ||
      (Math.abs(selected.col - c) === 1 && selected.row === r);

    if (isAdjacent) {
      // Swap tiles
      const newGrid = [...grid.map((row) => [...row])];
      const tempType = newGrid[selected.row][selected.col].type;
      newGrid[selected.row][selected.col].type = newGrid[r][c].type;
      newGrid[r][c].type = tempType;

      setGrid(newGrid);
      setSelected(null);
      setScore((prev) => prev + 120);
      setMoves((prev) => Math.max(0, prev - 1));
    } else {
      setSelected({ row: r, col: c });
    }
  };

  return (
    <div className="flex flex-col items-center bg-slate-900/90 border border-purple-500/30 p-6 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden max-w-md w-full">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-600/20 rounded-full blur-2xl pointer-events-none" />

      {/* Game Header */}
      <div className="w-full flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="font-bold text-slate-200">{t('puzzle.level', 'Level')} 1</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-lg text-purple-200">
            <span className="text-slate-400 mr-1.5">{t('puzzle.score', 'Score')}:</span>
            <span className="font-bold text-amber-300 font-mono">{score}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-lg text-slate-200">
            <span className="text-slate-400 mr-1.5">{t('puzzle.moves', 'Moves')}:</span>
            <span className="font-bold font-mono text-cyan-300">{moves}</span>
          </div>
        </div>
      </div>

      {/* 4x4 Grid Board */}
      <div className="grid grid-cols-4 gap-2.5 p-3 bg-slate-950/70 border border-purple-500/20 rounded-2xl w-full aspect-square">
        {grid.map((row, rIdx) =>
          row.map((tile, cIdx) => {
            const isSel = selected?.row === rIdx && selected?.col === cIdx;
            const config = RUNE_CONFIG[tile.type] || RUNE_CONFIG.arcane;
            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(rIdx, cIdx)}
                className={`flex items-center justify-center rounded-xl border transition-all duration-200 relative group select-none ${
                  config.bg
                } ${
                  isSel
                    ? 'ring-4 ring-purple-400 scale-105 border-white z-10 shadow-lg shadow-purple-500/50'
                    : 'hover:scale-[1.03] hover:border-purple-400/80'
                }`}
              >
                <span className={`${config.color} transition-transform group-hover:scale-110`}>
                  {config.icon}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Controls */}
      <div className="w-full flex items-center justify-between mt-5">
        <span className="text-xs text-slate-400 italic">
          {selected ? 'Select adjacent tile to swap!' : 'Click any rune to begin.'}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={initGrid}
          className="flex items-center gap-1.5 text-xs py-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
          {t('puzzle.restart', 'Restart')}
        </Button>
      </div>
    </div>
  );
};
