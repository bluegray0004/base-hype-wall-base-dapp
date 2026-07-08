import type { Address } from "viem";

export const MAX_HYPE_TOPIC_LENGTH = 40;
export const MAX_HYPE_MESSAGE_LENGTH = 64;

export const hypeWallAbi = [
  {
    type: "function",
    name: "postShout",
    stateMutability: "nonpayable",
    inputs: [
      { name: "topic", type: "string" },
      { name: "message", type: "string" },
    ],
    outputs: [{ name: "shoutId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getShout",
    stateMutability: "view",
    inputs: [{ name: "shoutId", type: "uint256" }],
    outputs: [
      { name: "author", type: "address" },
      { name: "topic", type: "string" },
      { name: "message", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
] as const;

export type HypeShout = {
  author: Address;
  topic: string;
  message: string;
  createdAt: bigint;
};

export const hypeWallContractAddress = process.env
  .NEXT_PUBLIC_HYPE_WALL_CONTRACT_ADDRESS as Address | undefined;
