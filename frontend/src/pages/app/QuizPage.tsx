import { Button, Card, CardBody, Checkbox, CheckboxGroup, Chip, Progress, Radio, RadioGroup } from '@heroui/react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import DataState from '@/components/DataState';
import PageHeader from '@/components/PageHeader';
import { ListSkeleton } from '@/components/Skeletons';
import { api, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useTitle } from '@/lib/useTitle';
import type { Question, Quiz, QuizResult, QuizSession } from '@/types';

type Answers = Record<number, string[]>;

function useCountdown(deadline: number | null, onZero: () => void): number | null {
  const [left, setLeft] = useState<number | null>(null);
  const fired = useRef(false);
  const cb = useRef(onZero);
  cb.current = onZero;   // always call the latest submit, so the answers given so far are sent
  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const s = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setLeft(s);
      if (s === 0 && !fired.current) { fired.current = true; cb.current(); }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [deadline]);
  return left;
}

function Taking({ session, onResult }: { session: QuizSession; onResult: (r: QuizResult) => void }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const deadline = session.time_limit_minutes ? new Date(session.attempt.started_at).getTime() + session.time_limit_minutes * 60000 : null;
  const answered = Object.values(answers).filter((a) => a.length).length;

  const submit = useCallback(async () => {
    setBusy(true);
    try {
      const payload = Object.fromEntries(Object.entries(answers).map(([q, ids]) => [q, ids.map(Number)]));
      onResult(await api<QuizResult>(`attempts/${session.attempt.id}/submit/`, { method: 'POST', body: { answers: payload } }));
    } catch (e) { toast.error('Could not submit', errorMessage(e)); setBusy(false); }
  }, [answers, session.attempt.id, onResult]);

  const left = useCountdown(deadline, () => { void submit(); });

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-20 flex items-center justify-between gap-4 rounded-lg border border-divider bg-background/90 p-3 backdrop-blur">
        <Progress aria-label="Answered" value={(answered / session.questions.length) * 100} size="sm" className="max-w-xs" label={`${answered}/${session.questions.length} answered`} />
        {left != null && <Chip color={left < 60 ? 'danger' : 'primary'} variant="flat" startContent={<Clock size={14} />}>{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</Chip>}
      </div>
      {session.questions.map((q, i) => (
        <Card key={q.id} shadow="sm"><CardBody className="space-y-3">
          <p className="font-semibold">{i + 1}. {q.prompt}</p>
          {q.kind === 'multiple' ? (
            <CheckboxGroup aria-label={q.prompt} description="Select all that apply" value={answers[q.id] || []} onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}>
              {q.choices.map((c) => <Checkbox key={c.id} value={String(c.id)}>{c.text}</Checkbox>)}
            </CheckboxGroup>
          ) : (
            <RadioGroup aria-label={q.prompt} value={answers[q.id]?.[0] ?? ''} onValueChange={(v) => setAnswers({ ...answers, [q.id]: [v] })}>
              {q.choices.map((c) => <Radio key={c.id} value={String(c.id)}>{c.text}</Radio>)}
            </RadioGroup>
          )}
        </CardBody></Card>
      ))}
      <Button color="primary" size="lg" onPress={() => { void submit(); }} isLoading={busy}>Submit answers</Button>
    </div>
  );
}

function Result({ result, questions, onRetry }: { result: QuizResult; questions: Question[]; onRetry: () => void }) {
  const byQ = Object.fromEntries(result.results.map((r) => [r.question, r]));
  return (
    <div className="space-y-6">
      <Card shadow="md"><CardBody className="items-center space-y-2 p-8 text-center">
        {result.passed ? <CheckCircle2 size={48} className="text-success" /> : <XCircle size={48} className="text-danger" />}
        <h2 className="text-3xl font-semibold">{result.score_pct}%</h2>
        <p className="text-default-600">{result.expired ? 'Time ran out before you submitted.' : result.passed ? 'You passed! Well done.' : `You need ${result.pass_mark_pct}% to pass.`}</p>
        {!!result.xp_awarded && result.xp_awarded > 0 && <Chip color="warning" variant="flat">+{result.xp_awarded} XP</Chip>}
        <div className="flex gap-2 pt-2">
          {!result.passed && result.attempts_remaining !== 0 && <Button color="primary" onPress={onRetry}>Try again{result.attempts_remaining ? ` (${result.attempts_remaining} left)` : ''}</Button>}
          <Button as={Link} to="/my-learning" variant="flat">Back to learning</Button>
        </div>
      </CardBody></Card>
      {questions.map((q, i) => {
        const r = byQ[q.id];
        return (
          <Card key={q.id} shadow="sm"><CardBody className="space-y-2">
            <p className="flex items-start gap-2 font-semibold">{r?.correct ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" /> : <XCircle size={18} className="mt-0.5 shrink-0 text-danger" />}{i + 1}. {q.prompt}</p>
            {r?.correct_choice_ids && <p className="text-sm text-default-600">Correct: {q.choices.filter((c) => r.correct_choice_ids?.includes(c.id)).map((c) => c.text).join(', ')}</p>}
            {r?.explanation && <p className="text-sm text-default-500">{r.explanation}</p>}
          </CardBody></Card>
        );
      })}
    </div>
  );
}

export default function QuizPage() {
  useTitle('Quiz');
  const { id = '' } = useParams();
  const swr = useSWR<Quiz>(`quizzes/${id}/`);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true); setResult(null);
    try { setSession(await api<QuizSession>(`quizzes/${id}/start/`, { method: 'POST' })); }
    catch (e) { toast.error('Cannot start quiz', errorMessage(e)); } finally { setBusy(false); }
  }

  const onResult = useCallback((r: QuizResult) => { setResult(r); void swr.mutate(); }, [swr]);

  return (
    <DataState swr={swr} skeleton={<ListSkeleton rows={3} />}>
      {(quiz) => (
        <div className="mx-auto max-w-3xl">
          <PageHeader title={quiz.title} subtitle={quiz.description} />
          {result && session ? <Result result={result} questions={session.questions} onRetry={() => { setSession(null); setResult(null); void start(); }} />
            : session ? <Taking session={session} onResult={onResult} />
            : (
              <Card shadow="sm"><CardBody className="space-y-4">
                <ul className="list-disc space-y-1 pl-5 text-sm text-default-600">
                  <li>{quiz.question_count} questions</li>
                  <li>Pass mark: {quiz.pass_mark_pct}%</li>
                  {quiz.time_limit_minutes && <li>Time limit: {quiz.time_limit_minutes} minutes (the quiz submits automatically when time is up)</li>}
                  {quiz.max_attempts && <li>Attempts used: {quiz.attempts_used} of {quiz.max_attempts}</li>}
                  {quiz.best_score_pct != null && <li>Your best score: {quiz.best_score_pct}%</li>}
                </ul>
                <Button color="primary" size="lg" className="w-fit" onPress={() => { void start(); }} isLoading={busy}>{quiz.attempts_used ? 'Start another attempt' : 'Start quiz'}</Button>
              </CardBody></Card>
            )}
        </div>
      )}
    </DataState>
  );
}
