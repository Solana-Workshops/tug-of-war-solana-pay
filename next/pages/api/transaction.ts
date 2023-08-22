// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { getGameDataAccountPDA, getChestAccountPDA } from '@/src/util/utils';
import { IDL, TugOfWar } from "./tug_of_war";
import { Program } from "@coral-xyz/anchor";
import { GetConnection, TUG_OF_WAR_PROGRAM_ID } from '@/src/util/const';

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

  let CONNECTION: Connection = GetConnection(networkField);

  const TUG_OF_WAR_PROGRAM = new Program<TugOfWar>(IDL, TUG_OF_WAR_PROGRAM_ID, { connection: CONNECTION })

  const sender = new PublicKey(accountField);

  const transaction = new Transaction();
  const latestBlockhash = await CONNECTION.getLatestBlockhash();
  transaction.feePayer = sender;
  transaction.recentBlockhash = latestBlockhash.blockhash;

  let message;
  if (instructionField == "pull_left") {
    await AddPullLeftInstruction(TUG_OF_WAR_PROGRAM, sender, transaction);

    message = 'Pull to the left !';
  } else if (instructionField == "pull_right") {
    await AddPullRightInstruction(TUG_OF_WAR_PROGRAM, sender, transaction);

    message = 'Pull to the right !';
  } else if (instructionField == "initialize") {
    await AddInitializeInstruction(TUG_OF_WAR_PROGRAM, sender, transaction);

    message = 'Initialize!';
  } else if (instructionField == "restart") {
    await AddRestartInstruction(TUG_OF_WAR_PROGRAM, sender, transaction);

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


export async function AddRestartInstruction(TUG_OF_WAR_PROGRAM: Program<TugOfWar>, sender: PublicKey, transaction: Transaction) {
  let ix = await TUG_OF_WAR_PROGRAM.methods.restartGame().accounts(
    {
      gameDataAccount: getGameDataAccountPDA(),
      chestVault: getChestAccountPDA(),
      signer: sender,
      systemProgram: SystemProgram.programId
    }
  ).instruction();
  transaction.add(ix);
}

export async function AddInitializeInstruction(TUG_OF_WAR_PROGRAM: Program<TugOfWar>, sender: PublicKey, transaction: Transaction) {
  let ix = await TUG_OF_WAR_PROGRAM.methods.initialize().accounts(
    {
      newGameDataAccount: getGameDataAccountPDA(),
      chestVault: getChestAccountPDA(),
      signer: sender,
      systemProgram: SystemProgram.programId
    }
  ).instruction();
  transaction.add(ix);
}

export async function AddPullRightInstruction(TUG_OF_WAR_PROGRAM: Program<TugOfWar>, sender: PublicKey, transaction: Transaction) {
  let ix = await TUG_OF_WAR_PROGRAM.methods.pullRight().accounts(
    {
      gameDataAccount: getGameDataAccountPDA(),
      chestVault: getChestAccountPDA(),
      signer: sender
    }
  ).instruction();
  transaction.add(ix);
}

export async function AddPullLeftInstruction(TUG_OF_WAR_PROGRAM: Program<TugOfWar>, sender: PublicKey, transaction: Transaction) {
  let ix = await TUG_OF_WAR_PROGRAM.methods.pullLeft().accounts(
    {
      gameDataAccount: getGameDataAccountPDA(),
      chestVault: getChestAccountPDA(),
      signer: sender
    }
  ).instruction();

  transaction.add(ix);
}

