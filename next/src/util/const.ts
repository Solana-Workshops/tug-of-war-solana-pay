import { Connection, PublicKey } from "@solana/web3.js";

export const TUG_OF_WAR_PROGRAM_ID = new PublicKey('tugLiwCj74Nb5uNqtVgtoQ3x95Jhctz2RDRdLwmG9dF');

export function GetConnection(networkField: string) {
  if (networkField == "devnet") {
    console.log("devnet");
    return new Connection('https://devnet.helius-rpc.com/?api-key=78065db3-87fb-431c-8d43-fcd190212125', {
      wsEndpoint: "wss://devnet.helius-rpc.com/?api-key=78065db3-87fb-431c-8d43-fcd190212125",
      commitment: 'confirmed'
    });
  } else {
    console.log("mainnet");
    return new Connection(process.env.NEXT_PUBLIC_RPC ? process.env.NEXT_PUBLIC_RPC : 'https://rpc.helius.xyz/?api-key=78065db3-87fb-431c-8d43-fcd190212125', {
      wsEndpoint: process.env.NEXT_PUBLIC_WSS_RPC ? process.env.NEXT_PUBLIC_WSS_RPC : "wss://rpc.helius.xyz/?api-key=78065db3-87fb-431c-8d43-fcd190212125",
      commitment: 'confirmed'
    });
  }
}