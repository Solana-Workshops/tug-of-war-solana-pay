import { Connection, PublicKey } from "@solana/web3.js";

export const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC ? process.env.NEXT_PUBLIC_RPC : 'https://api.devnet.solana.com',  {
    wsEndpoint: process.env.NEXT_PUBLIC_WSS_RPC ? process.env.NEXT_PUBLIC_WSS_RPC : "wss://api.devnet.solana.com",
    commitment: 'confirmed' 
  });

export const TUG_OF_WAR_PROGRAM_ID = new PublicKey('tugLiwCj74Nb5uNqtVgtoQ3x95Jhctz2RDRdLwmG9dF');
