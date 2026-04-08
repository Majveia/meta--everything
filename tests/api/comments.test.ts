import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock NextRequest since it's not available outside the Next.js runtime
class MockNextRequest {
  nextUrl: URL;
  constructor(url: string) {
    this.nextUrl = new URL(url);
  }
}

vi.mock('next/server', () => ({
  NextRequest: MockNextRequest,
}));

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
  vi.resetModules();
  // Ensure env is set before each dynamic import
  process.env.YOUTUBE_API_KEY = 'test-yt-key';
});

afterEach(() => {
  delete process.env.YOUTUBE_API_KEY;
});

async function loadRoute() {
  const mod = await import('@/app/api/comments/route');
  return mod.GET;
}

describe('GET /api/comments', () => {
  it('returns empty when videoId is missing', async () => {
    const GET = await loadRoute();
    const req = new MockNextRequest('http://localhost/api/comments');
    const res = await GET(req as never);
    const body = await res.json();

    expect(body.comments).toEqual([]);
    expect(body.source).toBe('none');
  });

  it('returns empty when API key is missing', async () => {
    delete process.env.YOUTUBE_API_KEY;
    const GET = await loadRoute();
    const req = new MockNextRequest('http://localhost/api/comments?videoId=abc');
    const res = await GET(req as never);
    const body = await res.json();

    expect(body.comments).toEqual([]);
    expect(body.source).toBe('none');
  });

  it('maps YouTube commentThreads response correctly', async () => {
    const GET = await loadRoute();
    mockFetch.mockReturnValueOnce(jsonResponse({
      items: [{
        id: 'comment-1',
        snippet: {
          topLevelComment: {
            snippet: {
              authorDisplayName: 'Alice',
              authorProfileImageUrl: 'https://example.com/alice.jpg',
              textDisplay: 'Great video!',
              likeCount: 42,
              publishedAt: '2026-04-08T10:00:00Z',
            },
          },
          totalReplyCount: 3,
        },
      }],
      pageInfo: { totalResults: 1 },
    }));

    const req = new MockNextRequest('http://localhost/api/comments?videoId=abc123');
    const res = await GET(req as never);
    const body = await res.json();

    expect(body.source).toBe('youtube');
    expect(body.total).toBe(1);
    expect(body.comments).toHaveLength(1);
    expect(body.comments[0]).toMatchObject({
      id: 'comment-1',
      author: 'Alice',
      authorImage: 'https://example.com/alice.jpg',
      text: 'Great video!',
      likes: 42,
      replies: 3,
    });
  });

  it('maps sort=recent to order=time in API call', async () => {
    const GET = await loadRoute();
    mockFetch.mockReturnValueOnce(jsonResponse({ items: [], pageInfo: {} }));

    const req = new MockNextRequest('http://localhost/api/comments?videoId=abc&sort=recent');
    await GET(req as never);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('order=time'),
      expect.anything()
    );
  });

  it('defaults to order=relevance when sort is not specified', async () => {
    const GET = await loadRoute();
    mockFetch.mockReturnValueOnce(jsonResponse({ items: [], pageInfo: {} }));

    const req = new MockNextRequest('http://localhost/api/comments?videoId=abc');
    await GET(req as never);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('order=relevance'),
      expect.anything()
    );
  });

  it('returns error when API call fails', async () => {
    const GET = await loadRoute();
    mockFetch.mockReturnValueOnce(jsonResponse({}, 500));

    const req = new MockNextRequest('http://localhost/api/comments?videoId=abc');
    const res = await GET(req as never);
    const body = await res.json();

    expect(body.comments).toEqual([]);
    expect(body.source).toBe('error');
  });

  it('sets Cache-Control header on success', async () => {
    const GET = await loadRoute();
    mockFetch.mockReturnValueOnce(jsonResponse({
      items: [],
      pageInfo: { totalResults: 0 },
    }));

    const req = new MockNextRequest('http://localhost/api/comments?videoId=abc');
    const res = await GET(req as never);

    expect(res.headers.get('Cache-Control')).toBe('public, s-maxage=300, stale-while-revalidate=120');
  });

  it('handles network errors gracefully', async () => {
    const GET = await loadRoute();
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    const req = new MockNextRequest('http://localhost/api/comments?videoId=abc');
    const res = await GET(req as never);
    const body = await res.json();

    expect(body.comments).toEqual([]);
    expect(body.source).toBe('error');
  });
});
