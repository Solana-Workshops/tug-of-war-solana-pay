import { PublicKey, Connection } from "@solana/web3.js";
import { Buffer } from "buffer";
import { TUG_OF_WAR_PROGRAM_ID } from "./const";

export const getGameDataAccountPDA = () => PublicKey.findProgramAddressSync(
    [
        Buffer.from("tug_of_war")
    ],
    TUG_OF_WAR_PROGRAM_ID,
)[0];

export const getChestAccountPDA = () => PublicKey.findProgramAddressSync(
    [
        Buffer.from("chest")
    ],
    TUG_OF_WAR_PROGRAM_ID,
)[0];
