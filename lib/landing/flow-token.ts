import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'lf';
const TOKEN_TTL_MS = 60 * 60 * 1000;
const MIN_STEP_GAP_MS = 2000;

export type FlowTokenPayload = {
  s: string;
  ms: number;
  id: string;
  pr?: string;
  iat: number;
};

function getFlowSecret(): string {
  const explicit = process.env.LANDING_FLOW_SECRET?.trim();
  if (explicit) return explicit;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (serviceKey) {
    return createHmac('sha256', 'landing-flow-fallback')
      .update(serviceKey)
      .digest('hex');
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('LANDING_FLOW_SECRET or SUPABASE_SERVICE_ROLE_KEY is required in production.');
  }

  return 'dev-landing-flow-secret';
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

export function hashFlowIdentity(value: string): string {
  return createHmac('sha256', getFlowSecret())
    .update(value.replace(/\D/g, '') || value.trim())
    .digest('hex')
    .slice(0, 24);
}

function signPayload(encodedPayload: string): string {
  return createHmac('sha256', getFlowSecret()).update(encodedPayload).digest('base64url');
}

export function createFlowToken(payload: FlowTokenPayload): string {
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function parseFlowToken(token: string | undefined | null): FlowTokenPayload | null {
  if (!token) return null;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expected = signPayload(encodedPayload);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as FlowTokenPayload;
    if (
      typeof payload.s !== 'string' ||
      typeof payload.ms !== 'number' ||
      typeof payload.id !== 'string' ||
      typeof payload.iat !== 'number'
    ) {
      return null;
    }

    if (Date.now() - payload.iat > TOKEN_TTL_MS) return null;
    return payload;
  } catch {
    return null;
  }
}

export function readFlowTokenFromRequest(request: Request): FlowTokenPayload | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match?.[1]) return null;

  try {
    return parseFlowToken(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function verifyFlowForStep(
  existing: FlowTokenPayload | null,
  slug: string,
  step: number,
  identity: string,
  product?: string
): boolean {
  if (step <= 1) return true;
  if (!existing) return false;
  if (existing.s !== slug) return false;
  if (existing.id !== hashFlowIdentity(identity)) return false;
  if (product && existing.pr && existing.pr !== product) return false;
  if (existing.ms < step - 1) return false;
  if (Date.now() - existing.iat < MIN_STEP_GAP_MS) return false;
  return true;
}

export function buildFlowCookie(
  slug: string,
  completedStep: number,
  identity: string,
  product?: string
): string {
  const payload: FlowTokenPayload = {
    s: slug,
    ms: completedStep,
    id: hashFlowIdentity(identity),
    pr: product,
    iat: Date.now(),
  };

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(createFlowToken(payload))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600${secure}`;
}

export { COOKIE_NAME, MIN_STEP_GAP_MS, TOKEN_TTL_MS };
