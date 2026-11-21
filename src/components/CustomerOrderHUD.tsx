import { Clock, Flame, Star, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';
import { INGREDIENT_MAP, getRecipeById } from '../data/menuOrders';
import type { FeedbackMessage, GameState } from '../logic/gameState';

function formatTime(sec: number): string {
  const s = Math.ceil(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function StatPill({ icon, label, value, accent }: { icon: ReactNode; label: string; value: ReactNode; accent: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 shadow-md ${accent}`}>
      {icon}
      <div className="leading-tight">
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</div>
        <div className="text-xl font-extrabold tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function FeedbackBanner({ feedback }: { feedback: FeedbackMessage | null }) {
  if (!feedback) return <div className="h-full" />;
  const style = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-amber-400 text-amber-950',
    info: 'bg-white/90 text-amber-950',
  }[feedback.kind];
  return (
    <div key={feedback.id} className={`animate-pop flex h-full items-center gap-3 rounded-2xl px-4 py-2 shadow-md ${style}`}>
      {feedback.scoreDelta !== undefined && (
        <span className="animate-float-up text-2xl font-black tabular-nums">
          {feedback.scoreDelta > 0 ? `+${feedback.scoreDelta}` : feedback.scoreDelta}
        </span>
      )}
      <div className="min-w-0">
        <div className="truncate font-bold">{feedback.title}</div>
        {feedback.details.length > 0 && (
          <div className="truncate text-xs opacity-90">{feedback.details.join(' · ')}</div>
        )}
      </div>
    </div>
  );
}

export default function CustomerOrderHUD({ state }: { state: GameState }) {
  const { order, stats } = state;
  const recipe = order ? getRecipeById(order.recipeId) : null;
  const added = new Set(state.addedIngredients);
  const patience = order ? order.timeRemainingSec / order.timeLimitSec : 0;
  const patienceColor = patience > 0.5 ? 'bg-green-500' : patience > 0.25 ? 'bg-amber-500' : 'bg-red-500';
  const mood = patience > 0.6 ? '😊' : patience > 0.3 ? '😐' : patience > 0 ? '😠' : '😤';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-stretch gap-2">
        <StatPill icon={<Star size={22} />} label="Điểm" value={stats.score} accent="bg-amber-500 text-white" />
        <StatPill
          icon={<Flame size={22} className={stats.combo > 1 ? 'animate-pulse' : ''} />}
          label="Combo"
          value={`x${stats.combo}`}
          accent={stats.combo > 1 ? 'bg-red-600 text-white' : 'bg-white text-amber-950'}
        />
        <StatPill
          icon={<Clock size={22} />}
          label="Ca bán còn"
          value={formatTime(state.shiftRemainingSec)}
          accent={state.shiftRemainingSec <= 10 ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-amber-950'}
        />
        <StatPill icon={<Trophy size={22} />} label="Đã giao" value={`${stats.perfect}/${stats.served}`} accent="bg-white text-amber-950" />
        <div className="min-w-[240px] flex-1">
          <FeedbackBanner feedback={state.feedback} />
        </div>
      </div>

      {order && recipe && (
        <div key={order.id} className="animate-slide-in flex items-center gap-4 rounded-3xl bg-white/90 p-3 shadow-lg ring-1 ring-amber-900/10">
          <div className="flex flex-col items-center">
            <div className="text-5xl leading-none">{order.avatar}</div>
            <div className="text-2xl leading-none">{mood}</div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm text-amber-900/70">{order.customerName} gọi:</span>
              <span className="text-xl font-extrabold text-amber-950">{recipe.name}</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">{recipe.basePoints} điểm</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  state.hasBread ? 'bg-green-100 text-green-800 ring-1 ring-green-500' : 'bg-amber-50 text-amber-900 ring-1 ring-amber-300'
                }`}
              >
                {state.hasBread ? '✓' : '○'} Vỏ bánh giòn
              </span>
              {recipe.requiredIngredients.map((id) => (
                <span
                  key={id}
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    added.has(id) ? 'bg-green-100 text-green-800 ring-1 ring-green-500' : 'bg-amber-50 text-amber-900 ring-1 ring-amber-300'
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
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      ok ? 'bg-green-100 text-green-800 ring-1 ring-green-500' : 'bg-sky-50 text-sky-900 ring-1 ring-sky-300'
                    }`}
                  >
                    {ok ? '✓' : '○'} {g.options.map((o) => INGREDIENT_MAP[o].name).join(' / ')}
                  </span>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-amber-100">
                <div className={`h-full rounded-full transition-[width] duration-100 ${patienceColor}`} style={{ width: `${patience * 100}%` }} />
              </div>
              <span className="w-10 text-right text-xs font-bold tabular-nums text-amber-900">{Math.ceil(order.timeRemainingSec)}s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
