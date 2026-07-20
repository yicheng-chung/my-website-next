import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SpotifyArtist = { name: string };
type SpotifyImage = { url: string };
type SpotifyTrack = {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: { images: SpotifyImage[] };
  external_urls: { spotify: string };
};

// Spotify's own API is occasionally slow to respond — without a timeout, a
// hung upstream request can drag this route past its own function timeout,
// which is what was likely behind the "upstream request timeout" surfaced
// on the site (that, or the old <iframe> embed's own flaky error page —
// see NowPlaying.tsx, which no longer depends on that embed at all).
const UPSTREAM_TIMEOUT_MS = 6000;

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN ?? "",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`Failed to refresh Spotify token: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

function trackToResponse(track: SpotifyTrack, isPlaying: boolean) {
  return NextResponse.json({
    isPlaying,
    trackId: track.id,
    track: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    albumArt: track.album.images[0]?.url ?? null,
    url: track.external_urls.spotify,
  });
}

export async function GET() {
  try {
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    const nowPlayingRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (nowPlayingRes.status === 200) {
      const data = await nowPlayingRes.json();
      if (data?.item) {
        return trackToResponse(data.item as SpotifyTrack, true);
      }
    }

    const recentRes = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const recentData = await recentRes.json();
    const track = recentData?.items?.[0]?.track as SpotifyTrack | undefined;

    if (track) {
      return trackToResponse(track, false);
    }

    return NextResponse.json({ isPlaying: false, track: null });
  } catch {
    return NextResponse.json({ isPlaying: false, track: null }, { status: 200 });
  }
}
