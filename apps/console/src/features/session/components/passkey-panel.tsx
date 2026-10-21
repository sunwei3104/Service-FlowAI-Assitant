'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ApiError } from '@serviceflow/contracts/http';
import { Button } from '@serviceflow/ui/ui/button';
import { Input } from '@serviceflow/ui/ui/input';
import { Label } from '@serviceflow/ui/ui/label';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { QueryErrorState } from '@/components/query-state';
import type { Schemas } from '@/lib/api/client';

import {
  isCeremonyCancelled,
  passkeyQueries,
  useRegisterPasskey,
  useVerifyPasskey,
} from '../passkey';

type ConsoleProblem = Schemas['Problem'];

/** Right-hand panel of /passkey: (ก) register with bootstrap code, (ข) verify, or locked. */
export function PasskeyPanel({ returnTo }: { returnTo: string }) {
  const t = useTranslations('passkey');
  const tc = useTranslations('common');
  const status = useQuery(passkeyQueries.status());

  if (status.isPending) {
    return (
      <p role="status" className="text-ink-muted m-0">
        {tc('loading')}
      </p>
    );
  }
  if (status.isError)
    return <QueryErrorState error={status.error} onRetry={() => void status.refetch()} />;

  const locked = status.data.lockedUntil && new Date(status.data.lockedUntil) > new Date();
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-auth-title m-0">
          {status.data.registered ? t('verifyTitle') : t('registerTitle')}
        </h1>
        <p className="text-ink-muted m-0 mt-1">
          {t('signedInAs')} <strong className="text-ink">{status.data.email}</strong>
        </p>
      </div>
      {locked ? (
        <Locked until={status.data.lockedUntil!} />
      ) : status.data.registered ? (
        <Verify returnTo={returnTo} />
      ) : (
        <Register returnTo={returnTo} />
      )}
    </div>
  );
}

function Locked({ until }: { until: string }) {
  const t = useTranslations('passkey');
  const format = useFormatter();
  return (
    <section
      role="alert"
      aria-labelledby="h-locked"
      className="border-danger-300 bg-danger-50 text-danger-900 rounded-lg border p-4"
    >
      <h2 id="h-locked" className="text-body-lg m-0 font-semibold">
        {t('lockedTitle')}
      </h2>
      <p className="m-0 mt-1">
        {t('lockedBody', {
          time: format.dateTime(new Date(until), { hour: '2-digit', minute: '2-digit' }),
        })}
      </p>
    </section>
  );
}

function ErrorText({ error }: { error: unknown }) {
  const t = useTranslations('passkey');
  if (!error) return null;
  let message: string;
  if (isCeremonyCancelled(error)) message = t('cancelled');
  else if (error instanceof ApiError && error.status === 401) {
    const remaining = (error.problem as ConsoleProblem).attemptsRemaining ?? 0;
    message = t('failed', { count: remaining });
  } else if (error instanceof ApiError && error.isValidation) message = t('bootstrapInvalid');
  else message = error instanceof ApiError ? error.problem.title : t('cancelled');
  return (
    <p role="alert" className="text-danger-ink m-0">
      {message}
    </p>
  );
}

function Verify({ returnTo }: { returnTo: string }) {
  const t = useTranslations('passkey');
  const router = useRouter();
  const verify = useVerifyPasskey();
  return (
    <div className="flex flex-col gap-3">
      <p className="text-ink-muted m-0">{t('verifyBody')}</p>
      <Button
        type="button"
        size="lg"
        className="text-body-lg h-13 font-semibold"
        disabled={verify.isPending}
        onClick={() => verify.mutate(undefined, { onSuccess: () => router.replace(returnTo) })}
      >
        {verify.isPending ? t('working') : t('verifyButton')}
      </Button>
      <ErrorText error={verify.error} />
    </div>
  );
}

function Register({ returnTo }: { returnTo: string }) {
  const t = useTranslations('passkey');
  const router = useRouter();
  const register = useRegisterPasskey();
  const schema = z.object({
    bootstrapCode: z.string().trim().min(6, t('bootstrapRequired')).max(64),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { bootstrapCode: '' },
  });
  const fieldError = form.formState.errors.bootstrapCode?.message;

  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={form.handleSubmit(({ bootstrapCode }) =>
        register.mutate(bootstrapCode, { onSuccess: () => router.replace(returnTo) }),
      )}
    >
      <p className="text-ink-muted m-0">{t('registerBody')}</p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bootstrapCode">{t('bootstrapLabel')}</Label>
        <Input
          id="bootstrapCode"
          autoComplete="one-time-code"
          spellCheck={false}
          className="min-h-touch font-mono"
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={fieldError ? 'bootstrapCode-error' : undefined}
          {...form.register('bootstrapCode')}
        />
        {fieldError ? (
          <p id="bootstrapCode-error" className="text-body-sm text-danger-ink m-0">
            {fieldError}
          </p>
        ) : null}
      </div>
      <Button
        type="submit"
        size="lg"
        className="text-body-lg h-13 font-semibold"
        disabled={register.isPending}
      >
        {register.isPending ? t('working') : t('registerButton')}
      </Button>
      <ErrorText error={register.error} />
    </form>
  );
}
