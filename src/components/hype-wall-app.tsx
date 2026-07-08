"use client";

import {
  BadgePlus,
  Loader2,
  MessageSquareQuote,
  Sparkles,
  Sticker,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  hypeWallAbi,
  hypeWallContractAddress,
  MAX_HYPE_MESSAGE_LENGTH,
  MAX_HYPE_TOPIC_LENGTH,
} from "@/lib/hype-wall";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function shortAddress(address?: Address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function dateLabel(createdAt?: bigint) {
  if (!createdAt) return "--";
  return new Date(Number(createdAt) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const stickerPalette = [
  "bg-[#ff5fa2] text-white",
  "bg-[#ffe36e] text-[#1f1730]",
  "bg-[#74ffd1] text-[#0f2231]",
  "bg-[#8d7bff] text-white",
];

export function HypeWallApp() {
  const [shoutIdInput, setShoutIdInput] = useState("1");
  const [topic, setTopic] = useState("Base Build Week");
  const [message, setMessage] = useState("This is the cleanest builder wave yet.");
  const [status, setStatus] = useState(
    "Post one short line of support and turn it into an onchain wall signal.",
  );
  const [walletStatus, setWalletStatus] = useState("");

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync, isPending: disconnecting } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const {
    data: hash,
    writeContract,
    isPending: writing,
    error: writeError,
  } = useWriteContract();

  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash });

  const availableConnectors = useMemo(
    () =>
      connectors
        .filter((item) => item.type !== "mock")
        .sort((a, b) => {
          const score = (item: (typeof connectors)[number]) => {
            if (item.id === "baseAccount" || item.name === "Base Account") {
              return 0;
            }
            if (item.type === "injected") return 1;
            return 2;
          };

          return score(a) - score(b);
        }),
    [connectors],
  );

  async function connectWallet() {
    const errors: string[] = [];
    setWalletStatus("Opening wallet...");

    for (const item of availableConnectors) {
      try {
        await connectAsync({ connector: item, chainId: base.id });
        setWalletStatus("");
        return;
      } catch (error) {
        errors.push(
          error instanceof Error
            ? `${item.name}: ${error.message}`
            : `${item.name}: connection failed`,
        );
      }
    }

    setWalletStatus(
      errors[0] ??
        "No wallet connector is available. Open this app inside Base App or install a wallet.",
    );
  }

  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
      setWalletStatus("Wallet disconnected. Tap Connect to reconnect.");
    } catch (error) {
      setWalletStatus(
        error instanceof Error ? error.message : "Could not disconnect wallet.",
      );
    }
  }
  const parsedShoutId = BigInt(Math.max(1, Number(shoutIdInput || "1")));

  const shoutQuery = useReadContract({
    abi: hypeWallAbi,
    address: hypeWallContractAddress,
    functionName: "getShout",
    args: [parsedShoutId],
    query: {
      enabled: Boolean(hypeWallContractAddress),
      refetchInterval: 12000,
    },
  });

  const shoutTuple = shoutQuery.data as
    | readonly [Address, string, string, bigint]
    | undefined;

  const shout = useMemo(
    () =>
      shoutTuple
        ? {
            author: shoutTuple[0],
            topic: shoutTuple[1],
            message: shoutTuple[2],
            createdAt: shoutTuple[3],
          }
        : undefined,
    [shoutTuple],
  );

  const canPost =
    Boolean(hypeWallContractAddress) &&
    isConnected &&
    chainId === base.id &&
    topic.trim().length > 0 &&
    topic.trim().length <= MAX_HYPE_TOPIC_LENGTH &&
    message.trim().length > 0 &&
    message.trim().length <= MAX_HYPE_MESSAGE_LENGTH;

  const statusText = confirmed
    ? "Transaction confirmed on Base."
    : writeError
      ? writeError.message
      : status;

  function postShout() {
    if (!hypeWallContractAddress) return;
    setStatus("Confirm the wall post in your wallet.");
    writeContract({
      address: hypeWallContractAddress,
      abi: hypeWallAbi,
      functionName: "postShout",
      args: [topic.trim(), message.trim()],
      chainId: base.id,
    });
  }

  return (
    <main className="min-h-screen bg-[#0f1020] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[18px] border border-[#ff5fa2] bg-[#1c1530] shadow-[0_0_34px_rgba(255,95,162,0.22)]">
              <Sticker className="h-5 w-5 text-[#ff5fa2]" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#ff8dc0]">
                Base Hype Wall
              </p>
              <h1 className="text-xl font-black sm:text-2xl">
                Post one line. Light up the wall.
              </h1>
            </div>
          </div>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold">
                {shortAddress(address)}
              </span>
              <button
                className="rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-[#12131f]"
                onClick={disconnectWallet}
              >{disconnecting ? "Disconnecting" : "Disconnect"}</button>
            </div>
          ) : (
            <button
              className="inline-flex items-center gap-2 rounded-full border border-[#ff5fa2] bg-[#ff5fa2] px-4 py-2 text-sm font-semibold text-[#12131f] disabled:opacity-60"
              disabled={availableConnectors.length === 0 || connecting}
              onClick={connectWallet}
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              Connect
            </button>
          )}
        {walletStatus ? (
            <p className="w-full text-right text-xs font-semibold opacity-75">
              {walletStatus}
            </p>
          ) : null}
        </header>

        <div className="grid flex-1 gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,#2a1140_0%,#12131f_45%,#0b0b16_100%)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#74ffd1]">
                <Sparkles className="h-3.5 w-3.5" />
                Onchain support wall
              </p>
              <h2 className="text-4xl font-black leading-tight sm:text-6xl">
                A bright signal board for short Base support posts.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#c6c7e7] sm:text-lg">
                Pick a topic, drop one short line of hype, and turn it into a
                visible onchain sticker on the wall.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { label: shout?.topic || "Base Build Week", note: shout?.message || "This is the cleanest builder wave yet." },
                { label: "Builder energy", note: "More signal, less noise." },
                { label: "Launch mood", note: "Feels like people are actually shipping." },
                { label: "Community read", note: "Base has real momentum now." },
                { label: "Today’s take", note: "Fast, weird, and surprisingly polished." },
                { label: "Wall pulse", note: "One shout can still feel alive on mobile." },
              ].map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className={`min-h-40 rounded-[26px] border border-white/10 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)] ${stickerPalette[index % stickerPalette.length]}`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.18em] opacity-80">
                    {item.label}
                  </p>
                  <p className="mt-4 text-lg font-black leading-7">{item.note}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <section className="rounded-[34px] border border-white/10 bg-[#141626] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.30)]">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#261336] text-[#ff8dc0]">
                  <BadgePlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">Post shout</h3>
                  <p className="text-sm text-[#bfc2e6]">
                    One topic. One short support line.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#74ffd1]">
                    Topic
                  </span>
                  <input
                    className="rounded-2xl border border-white/10 bg-[#0d0f19] px-4 py-3 outline-none"
                    maxLength={MAX_HYPE_TOPIC_LENGTH}
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#74ffd1]">
                    Hype line
                  </span>
                  <textarea
                    className="min-h-24 rounded-2xl border border-white/10 bg-[#0d0f19] px-4 py-3 outline-none"
                    maxLength={MAX_HYPE_MESSAGE_LENGTH}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                </label>
              </div>

              {chainId !== base.id && isConnected ? (
                <button
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff5fa2] px-4 py-3 font-semibold text-[#12131f] disabled:opacity-60"
                  disabled={switching}
                  onClick={() => switchChain({ chainId: base.id })}
                >
                  {switching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wallet className="h-4 w-4" />
                  )}
                  Switch to Base
                </button>
              ) : (
                <button
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff5fa2] px-4 py-3 font-semibold text-[#12131f] disabled:opacity-50"
                  disabled={!canPost || writing || confirming}
                  onClick={postShout}
                >
                  {writing || confirming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquareQuote className="h-4 w-4" />
                  )}
                  Post on Base
                </button>
              )}
            </section>

            <section className="rounded-[34px] border border-white/10 bg-[#141626] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.30)]">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#261336] text-[#74ffd1]">
                  <Sticker className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">Wall lookup</h3>
                  <p className="text-sm text-[#bfc2e6]">
                    Load one shout by ID.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#74ffd1]">
                    Shout ID
                  </span>
                  <input
                    className="rounded-2xl border border-white/10 bg-[#0d0f19] px-4 py-3 outline-none"
                    value={shoutIdInput}
                    onChange={(event) => setShoutIdInput(event.target.value)}
                  />
                </label>
              </div>

              <div className={`mt-4 rounded-[26px] border border-white/10 p-4 ${stickerPalette[1]}`}>
                <p className="text-xs font-black uppercase tracking-[0.18em] opacity-80">
                  {shout?.topic || "Wall sample"}
                </p>
                <p className="mt-3 text-xl font-black leading-8">
                  {shout?.message || "Load a shout to view its exact wall line."}
                </p>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] opacity-70">
                  {shout?.author && shout.author !== ZERO_ADDRESS
                    ? `${shortAddress(shout.author)} • ${dateLabel(shout.createdAt)}`
                    : "Waiting for onchain shout"}
                </p>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-[#0d0f19] p-5 text-white shadow-[0_30px_80px_rgba(0,0,0,0.30)]">
              <h3 className="text-2xl font-black">Wall feed</h3>
              <p className="mt-4 min-h-16 text-sm leading-6 text-[#d1d4f0]">
                {statusText}
              </p>

              {!hypeWallContractAddress ? (
                <p className="rounded-[18px] border border-white/10 bg-white/5 p-3 text-xs leading-6 text-[#d1d4f0]">
                  Add `NEXT_PUBLIC_HYPE_WALL_CONTRACT_ADDRESS` after deploying
                  the hype wall contract, then redeploy Vercel.
                </p>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
