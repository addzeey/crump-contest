import type { ReactNode } from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

type Emote = {
    code: string;
    url: string;
};

type EmoteApiItem = {
    provider?: number | string;
    code?: string;
    url?: string;
    urls?: Array<{ size?: string; url?: string }>;
};

const DEFAULT_EMOTE_CHANNEL = "murdercrumpet";
const URL_PATTERN = /^https?:\/\/[^\s]+$/i;
const TOKEN_PATTERN = /\s+|https?:\/\/[^\s]+|[^\s]+/gi;
const EMOTE_TOKEN_PATTERN = /^(:?)([A-Za-z0-9_]+)(:?)([.,!?;)]*)$/;

const getEmoteApiUrl = () => {
    const configuredUrl = import.meta.env.VITE_EMOTE_API_URL;
    if (configuredUrl) return configuredUrl;

    const channel = import.meta.env.VITE_EMOTE_CHANNEL || DEFAULT_EMOTE_CHANNEL;
    return `https://emotes.adamcy.pl/v1/channel/${channel}/emotes/all`; 
};

const getBestEmoteUrl = (emote: EmoteApiItem) => {
    if (emote.url) return emote.url;

    return (
        emote.urls?.find((url) => url.size === "2x")?.url ||
        emote.urls?.find((url) => url.size === "4x")?.url ||
        emote.urls?.[0]?.url ||
        null
    );
};

const buildEmoteMap = (emotes: EmoteApiItem[]) => {
    const map: Record<string, Emote> = {};

    for (const emote of emotes) {
        if (!emote.code || map[emote.code]) continue;

        const url = getBestEmoteUrl(emote);
        if (!url) continue;

        map[emote.code] = { code: emote.code, url };
    }

    return map;
};

const fetchEmotes = async () => {
    const response = await fetch(getEmoteApiUrl());
    if (!response.ok) throw new Error("Failed to fetch emotes");

    const data = await response.json();
    const emotes = Array.isArray(data) ? data : data.emotes;

    return buildEmoteMap(Array.isArray(emotes) ? emotes : []);
};

const getEmoteCode = (token: string) => {
    const match = token.match(EMOTE_TOKEN_PATTERN);
    if (!match) return null;

    const [, leadingColon, code, trailingColon] = match;
    const hasColon = leadingColon === ":" || trailingColon === ":";
    if (hasColon && !(leadingColon === ":" && trailingColon === ":")) return null;

    return code;
};

const getTrailingText = (token: string) => token.match(EMOTE_TOKEN_PATTERN)?.[4] || "";

export const useEmoteMap = () => {
    return useQuery({
        queryKey: ["emotes", getEmoteApiUrl()],
        queryFn: fetchEmotes,
        staleTime: Infinity,
        gcTime: Infinity,
        retry: 1,
    });
};

export const useParsedMessage = (message: string | null, emoteMap: Record<string, Emote> = {}) => {
    return useMemo<ReactNode[]>(() => {
        if (!message) return [];

        const tokens = message.match(TOKEN_PATTERN) || [];

        return tokens.map((token, index) => {
            if (/^\s+$/.test(token)) return token;

            if (URL_PATTERN.test(token)) {
                return (
                    <a key={`url-${index}`} href={token} target="_blank" rel="noreferrer">
                        {token}
                    </a>
                );
            }

            const emoteCode = getEmoteCode(token);
            const emote = emoteCode ? emoteMap[emoteCode] : null;

            if (!emote) return token;

            return (
                <span key={`emote-${index}`} className="message-emote-wrap">
                    <img className="message-emote" src={emote.url} alt={emote.code} title={emote.code} loading="lazy" />
                    {getTrailingText(token)}
                </span>
            );
        });
    }, [message, emoteMap]);
};
