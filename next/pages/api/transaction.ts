// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { createInitializeInstruction, createRestartInstruction, createPullRightInstruction as createPullRightInstruction, createPullLeftInstruction as createPullLeftInstruction, getGameDataAccountPublicKey, getChestAccountPublicKey } from '@/src/util/move';
import { IDL, TugOfWar } from "./tug_of_war";
import { Program } from "@coral-xyz/anchor";
import { TUG_OF_WAR_PROGRAM_ID } from '@/src/util/const';

type POST = {
  transaction: string;
  message: string;
};

type GET = {
  label: string;
  icon: string;
};

function getFromPayload(req: NextApiRequest, payload: string, field: string): string {
  function parseError() { throw new Error(`${payload} parse error: missing ${field}`) };
  let value;
  if (payload === 'Query') {
    if (!(field in req.query)) parseError();
    value = req.query[field];
  }
  if (payload === 'Body') {
    if (!req.body || !(field in req.body)) parseError();
    value = req.body[field];
  }
  if (value === undefined || value.length === 0) parseError();
  return typeof value === 'string' ? value : value[0];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return get(req, res);
  }

  if (req.method === 'POST') {
    return post(req, res);
  }
}

const get = async (req: NextApiRequest, res: NextApiResponse<GET>) => {
  const label = 'Tug of war';
  const icon =
    'https://media.discordapp.net/attachments/964525722301501477/978683590743302184/sol-logo1.png';

  res.status(200).json({
    label,
    icon,
  });
};

const post = async (req: NextApiRequest, res: NextApiResponse<POST>) => {
  
  const accountField = getFromPayload(req, 'Body', 'account');
  const instructionField = getFromPayload(req, 'Query', 'instruction');
  const networkField = getFromPayload(req, 'Query', 'network');
  console.log('networkField', networkField);

  let CONNECTION: Connection;

  if (networkField == "devnet") {
    CONNECTION = new Connection('https://api.devnet.solana.com',  {
      wsEndpoint: "wss://api.devnet.solana.com",
      commitment: 'confirmed'
    });
   } else {
    CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC ? process.env.NEXT_PUBLIC_RPC : 'https://api.devnet.solana.com',  {
      wsEndpoint: process.env.NEXT_PUBLIC_WSS_RPC ? process.env.NEXT_PUBLIC_WSS_RPC : "wss://api.devnet.solana.com",
      commitment: 'confirmed' 
    });
   }

  const LED_SWITCH_PROGRAM = new Program<TugOfWar>(IDL, TUG_OF_WAR_PROGRAM_ID, { connection: CONNECTION })

  const sender = new PublicKey(accountField);

  const transaction = new Transaction();
  const latestBlockhash = await CONNECTION.getLatestBlockhash();
  transaction.feePayer = sender;
  transaction.recentBlockhash = latestBlockhash.blockhash;

  let message;
  if (instructionField == "pull_left") {
    let ix = await LED_SWITCH_PROGRAM.methods.pullLeft().accounts(
      {
      gameDataAccount: getGameDataAccountPublicKey(),
      chestVault: getChestAccountPublicKey(),
      signer: sender
      },
    ).instruction();

    transaction.add(ix);

    message = 'Pull to the left !';
  } else if (instructionField == "pull_right") {
    let ix = await LED_SWITCH_PROGRAM.methods.pullRight().accounts(
      {
      gameDataAccount: getGameDataAccountPublicKey(),
      chestVault: getChestAccountPublicKey(),
      signer: sender
      },
    ).instruction();
    transaction.add(ix);

    message = 'Pull to the right !';
  } else if (instructionField == "initialize") {
    let ix = await LED_SWITCH_PROGRAM.methods.initialize().accounts(
      {
      newGameDataAccount: getGameDataAccountPublicKey(),
      chestVault: getChestAccountPublicKey(),
      signer: sender,
      systemProgram: SystemProgram.programId

      },
    ).instruction();
    transaction.add(ix);

    message = 'Initialize!';
  } else if (instructionField == "restart") {
    let ix = await LED_SWITCH_PROGRAM.methods.restartGame().accounts(
      {
      gameDataAccount: getGameDataAccountPublicKey(),
      chestVault: getChestAccountPublicKey(),
      signer: sender,
      systemProgram: SystemProgram.programId

      },
    ).instruction();
    transaction.add(ix);

    message = 'Restart!';
  } else {
    message = 'Unknown direction';
  }
 
  // Serialize and return the unsigned transaction.
  const serializedTransaction = transaction.serialize({
    verifySignatures: false,
    requireAllSignatures: false,
  });

  const base64Transaction = serializedTransaction.toString('base64');

  res.status(200).send({ transaction: base64Transaction, message });
};
