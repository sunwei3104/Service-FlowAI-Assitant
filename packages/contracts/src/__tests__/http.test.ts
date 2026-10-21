import { ApiError, createApiClient, isProblem, shouldRetry, unwrap } from '../http';

type TestPaths = {
  '/things': {
    get: { responses: { 200: { content: { 'application/json': { ok: boolean } } } } };
    post: { responses: { 201: { content: { 'application/json': { id: string } } } } };
  };
};

function stubFetch(response: Response) {
  const calls: Request[] = [];
  vi.stubGlobal('fetch', async (req: Request) => {
    calls.push(req);
    return response.clone();
  });
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

describe('createApiClient', () => {
  const options = {
    baseUrl: 'http://test/api/v1',
    csrfHeader: 'X-CSRF-Token',
    getCsrfToken: () => 'tok',
  };

  it('adds the CSRF header to mutating requests only', async () => {
    const calls = stubFetch(Response.json({ id: '1' }, { status: 201 }));
    const client = createApiClient<TestPaths>(options);
    await client.POST('/things');
    await client.GET('/things');
    expect(calls[0]?.headers.get('X-CSRF-Token')).toBe('tok');
    expect(calls[1]?.headers.get('X-CSRF-Token')).toBeNull();
  });

  it('calls onUnauthorized on 401', async () => {
    stubFetch(
      Response.json({ type: 'about:blank', title: 'Unauthorized', status: 401 }, { status: 401 }),
    );
    const onUnauthorized = vi.fn();
    const client = createApiClient<TestPaths>({ ...options, onUnauthorized });
    await client.GET('/things');
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });
});

describe('unwrap', () => {
  it('returns data on success', async () => {
    stubFetch(Response.json({ ok: true }));
    const client = createApiClient<TestPaths>({
      baseUrl: 'http://test',
      csrfHeader: 'x',
      getCsrfToken: () => null,
    });
    await expect(unwrap(client.GET('/things'))).resolves.toEqual({ ok: true });
  });

  it('throws ApiError carrying the Problem on failure', async () => {
    stubFetch(
      new Response(
        JSON.stringify({ type: 'about:blank', title: 'ไม่พบ', status: 404, requestId: 'r1' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/problem+json' },
        },
      ),
    );
    const client = createApiClient<TestPaths>({
      baseUrl: 'http://test',
      csrfHeader: 'x',
      getCsrfToken: () => null,
    });
    const error = await unwrap(client.GET('/things')).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).isNotFound).toBe(true);
    expect((error as ApiError).problem.requestId).toBe('r1');
  });
});

describe('helpers', () => {
  it('isProblem', () => {
    expect(isProblem({ title: 'x', status: 400, type: 'about:blank' })).toBe(true);
    expect(isProblem({ message: 'x' })).toBe(false);
  });

  it('shouldRetry retries 5xx/network but not 4xx', () => {
    const problem = (status: number) => new ApiError({ type: 'about:blank', title: 't', status });
    expect(shouldRetry(0, problem(503))).toBe(true);
    expect(shouldRetry(0, new TypeError('network'))).toBe(true);
    expect(shouldRetry(0, problem(404))).toBe(false);
    expect(shouldRetry(2, problem(503))).toBe(false);
  });
});
