import {
  Clock,
  Flame,
  Music,
  Music2,
  Star,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { INGREDIENT_MAP } from '../data/menuOrders';
import type { FeedbackMessage, GameState } from '../logic/gameState';
import {
  isBgmEnabled,
  isSoundEnabled,
  toggleBgm,
  toggleSound,
} from '../utils/audioFeedback';

function formatTime(sec: number): string {
  const s = Math.ceil(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function StatPill({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  accent: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-2 shadow-md ring-1 ring-black/5 transition-all ${accent}`}
    >
      <div className="shrink-0">{icon}</div>
      <div className="leading-tight">
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-85">
          {label}
        </div>
        <div className="text-xl font-black tabular-nums tracking-tight">
          {value}
        </div>
      </div>
    </div>
  );
}

function FeedbackBanner({ feedback }: { feedback: FeedbackMessage | null }) {
  if (!feedback) return <div className="h-full" />;

  const isError = feedback.kind === 'error';
  const isSuccess = feedback.kind === 'success';

  const style = isSuccess
    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-emerald-900/20'
    : isError
      ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-red-900/20 animate-shake'
      : feedback.kind === 'warning'
        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-amber-900/10'
        : 'bg-white/95 text-amber-950 shadow-amber-900/10';

  return (
    <div
      key={feedback.id}
      className={`animate-pop relative flex h-full items-center gap-3 overflow-hidden rounded-2xl px-4 py-2 shadow-lg ring-1 ring-black/10 ${style}`}
    >
      {feedback.scoreDelta !== undefined && (
        <span
          className={`animate-float-up shrink-0 text-2xl font-black tabular-nums drop-shadow-sm ${
            feedback.scoreDelta > 0 ? 'text-yellow-200' : 'text-white'
          }`}
        >
          {feedback.scoreDelta > 0
            ? `+${feedback.scoreDelta}`
            : feedback.scoreDelta}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-extrabold sm:text-base">
          {feedback.title}
        </div>
        {feedback.details.length > 0 && (
          <div className="truncate text-xs font-semibold opacity-95">
            {feedback.details.join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
}

const PRESET_LABEL = {
  easy: '🟢 Dễ',
  normal: '🟡 Vừa',
  hard: '🔴 Khó',
  rush: '⚡ Siêu tốc',
  custom: '⚙️ Tùy biến',
};

export default function CustomerOrderHUD({ state }: { state: GameState }) {
  const { order, stats, difficulty } = state;
  const recipe = order ? order.recipe : null;
  const added = new Set(state.addedIngredients);
  const patience = order ? order.timeRemainingSec / order.timeLimitSec : 0;

  const [soundMuted, setSoundMuted] = useState(!isSoundEnabled());
  const [bgmMuted, setBgmMuted] = useState(!isBgmEnabled());

  const handleToggleSound = () => {
    const enabled = toggleSound();
    setSoundMuted(!enabled);
  };

  const handleToggleBgm = () => {
    const enabled = toggleBgm();
    setBgmMuted(!enabled);
  };

  const patienceColor =
    patience > 0.5
      ? 'bg-emerald-500'
      : patience > 0.25
        ? 'bg-amber-500'
        : 'bg-red-600 animate-pulse';

  const mood =
    patience > 0.6 ? '😊' : patience > 0.3 ? '😐' : patience > 0 ? '😠' : '😤';

  return (
    <div className="flex flex-col gap-2">
      {/* Top Stats Strip */}
      <div className="flex flex-wrap items-stretch gap-2">
        <StatPill
          icon={<Star size={22} className="text-yellow-100 fill-yellow-200" />}
          label="Điểm số"
          value={stats.score}
          accent="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
        />

        <StatPill
          icon={
            <Flame
              size={22}
              className={
                stats.combo > 1 ? 'animate-flame text-yellow-300' : 'text-orange-500'
              }
            />
          }
          label="Combo"
          value={`x${stats.combo}`}
          accent={
            stats.combo > 1
              ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white ring-2 ring-yellow-300'
              : 'bg-white/95 text-amber-950'
          }
        />

        <StatPill
          icon={
            <Clock
              size={22}
              className={
                state.shiftRemainingSec <= 15 ? 'text-white' : 'text-amber-700'
              }
            />
          }
          label="Ca bán còn"
          value={formatTime(state.shiftRemainingSec)}
          accent={
            state.shiftRemainingSec <= 15
              ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
              : 'bg-white/95 text-amber-950'
          }
        />

        <StatPill
          icon={<Trophy size={22} className="text-amber-500" />}
          label="Đã hoàn thành"
          value={`${stats.perfect}/${stats.served}`}
          accent="bg-white/95 text-amber-950"
        />

        {/* Difficulty Mode Tag */}
        <div
          title={`Độ khó: ${PRESET_LABEL[difficulty.preset]}${
            difficulty.fastPaced ? ' · Tiết tấu nhanh' : ''
          }`}
          className="flex items-center gap-1.5 rounded-2xl bg-white/90 px-3 py-2 text-xs font-black text-amber-950 shadow-md ring-1 ring-black/5"
        >
          <Zap size={16} className="text-amber-600" />
          <span>{PRESET_LABEL[difficulty.preset]}</span>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-1">
          {/* Sound SFX */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={soundMuted ? 'Bật âm thanh hiệu ứng' : 'Tắt âm thanh hiệu ứng'}
            className="flex items-center justify-center rounded-2xl bg-white/90 px-3 py-2 text-amber-900 shadow-md ring-1 ring-black/5 hover:bg-amber-100 active:scale-95"
          >
            {soundMuted ? (
              <VolumeX size={18} className="text-stone-400" />
            ) : (
              <Volume2 size={18} className="text-amber-700" />
            )}
          </button>

          {/* Cheerful Music BGM */}
          <button
            type="button"
            onClick={handleToggleBgm}
            title={bgmMuted ? 'Bật nhạc vui nhộn (BGM)' : 'Tắt nhạc nền (BGM)'}
            className={`flex items-center justify-center rounded-2xl px-3 py-2 shadow-md ring-1 ring-black/5 transition-all active:scale-95 ${
              bgmMuted
                ? 'bg-white/90 text-stone-400 hover:bg-amber-100'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white ring-2 ring-yellow-300'
            }`}
          >
            {bgmMuted ? (
              <Music size={18} />
            ) : (
              <Music2 size={18} className="animate-bounce" />
            )}
          </button>
        </div>

        {/* Dynamic Feedback Banner */}
        <div className="min-w-[260px] flex-1">
          <FeedbackBanner feedback={state.feedback} />
        </div>
      </div>

      {/* Customer Ticket / Order Card */}
      {order && recipe && (
        <div
          key={order.id}
          className="animate-slide-in flex items-center gap-3.5 rounded-3xl bg-gradient-to-r from-white/95 via-amber-50/90 to-white/95 p-3.5 shadow-lg ring-1 ring-amber-900/15 backdrop-blur sm:gap-5"
        >
          {/* Avatar and Mood */}
          <div className="relative flex shrink-0 flex-col items-center justify-center rounded-2xl bg-amber-100/80 p-2 shadow-inner ring-1 ring-amber-900/10">
            <div className="text-4xl sm:text-5xl leading-none select-none">
              {order.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 text-xl sm:text-2xl leading-none drop-shadow">
              {mood}
            </div>
          </div>

          {/* Ticket Details */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900/70">
                {order.customerName} gọi:
              </span>
              <span className="text-xl font-black text-amber-950 sm:text-2xl">
                {recipe.name}
              </span>
              <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-extrabold text-amber-900">
                +{recipe.basePoints} điểm
              </span>
            </div>

            {/* Checklist of Ingredients */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all ${
                  state.hasBread
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                    : 'bg-amber-100/90 text-amber-900 ring-1 ring-amber-300'
                }`}
              >
                {state.hasBread ? '✓' : '○'} Vỏ bánh giòn
              </span>

              {recipe.requiredIngredients.map((id) => (
                <span
                  key={id}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all ${
                    added.has(id)
                      ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                      : 'bg-white text-amber-950 ring-1 ring-amber-300'
                  }`}
                >
                  {added.has(id) ? '✓' : '○'} {INGREDIENT_MAP[id].name}
                </span>
              ))}

              {(recipe.alternativeGroups ?? []).map((g) => {
                const ok = g.options.some((o) => added.has(o));
                return (
                  <span
                    key={g.label}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all ${
                      ok
                        ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                        : 'bg-sky-50 text-sky-950 ring-1 ring-sky-300'
                    }`}
                  >
                    {ok ? '✓' : '○'}{' '}
                    {g.options.map((o) => INGREDIENT_MAP[o].name).join(' / ')}
                  </span>
                );
              })}
            </div>

            {/* Patience Bar */}
            <div className="mt-2.5 flex items-center gap-2.5">
              <span className="text-[11px] font-bold text-amber-900/70">
                Thời gian chờ:
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-amber-200/60 ring-1 ring-amber-900/10">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${patienceColor}`}
                  style={{
                    width: `${Math.max(0, Math.min(100, patience * 100))}%`,
                  }}
                />
              </div>
              <span className="w-12 text-right text-xs font-black tabular-nums text-amber-950">
                {Math.ceil(order.timeRemainingSec)}s
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
