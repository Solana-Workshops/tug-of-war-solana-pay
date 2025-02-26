import { Connection, PublicKey } from "@solana/web3.js";

export const TUG_OF_WAR_PROGRAM_ID = new PublicKey(
  "tugLiwCj74Nb5uNqtVgtoQ3x95Jhctz2RDRdLwmG9dF"
);

export function GetConnection(networkField: string) {
  if (networkField == "devnet") {
    console.log("devnet");
    return new Connection(
      process.env.NEXT_PUBLIC_DEVNET_RPC
        ? process.env.NEXT_PUBLIC_DEVNET_RPC
        : "https://api.devnet.solana.com",
      {
        wsEndpoint: process.env.NEXT_PUBLIC_DEVNET_WSS_RPC
          ? process.env.NEXT_PUBLIC_DEVNET_WSS_RPC
          : "wss://api.devnet.solana.com",
        commitment: "confirmed",
      }
    );
  } else {
    console.log("mainnet");
    return new Connection(
      process.env.NEXT_PUBLIC_RPC
        ? process.env.NEXT_PUBLIC_RPC
        : "https://api.mainnet-beta.solana.com",
      {
        wsEndpoint: process.env.NEXT_PUBLIC_WSS_RPC
          ? process.env.NEXT_PUBLIC_WSS_RPC
          : "wss://api.mainnet-beta.solana.com",
        commitment: "confirmed",
      }
    );
  }
}
