'use client'; // this makes next know that this page should be rendered in the client
import { useEffect, useState } from 'react';
import { getGameDataAccountPDA, getChestAccountPDA } from '@/src/util/utils';
import PayQR from '@/src/components/PayQR';
import {
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import {  Connection, Transaction, } from '@solana/web3.js';
import { useWallet } from "@solana/wallet-adapter-react";
import { useSearchParams } from 'next/navigation'
import { IDL, TugOfWar } from "../pages/api/tug_of_war";
import { Program } from '@coral-xyz/anchor';
import { GetConnection, TUG_OF_WAR_PROGRAM_ID } from '@/src/util/const';
import { AddInitializeInstruction, AddPullLeftInstruction, AddPullRightInstruction, AddRestartInstruction } from '@/pages/api/transaction';

export default function Home() {
  const [gameDataState, setGameDataState] = useState<any>()
  const [currentPlayerPosition, setCurrentPlayerPosition] = useState<number>();
  const [chestLamports, setChestLamports] = useState<number>();
  const [playerDisplay, setPlayerDisplay] = useState<string>();
  const [network, setNetwork] = useState<string>("mainnet");
  const { publicKey, sendTransaction } = useWallet();
  const searchParams = useSearchParams()  
 
  let CONNECTION: Connection;
  let TUG_OF_WAR_PROGRAM: Program<TugOfWar>;

  let counter = 0;

  useEffect(() => {

    let CONNECTION: Connection = GetConnection(searchParams.get('network') == "devnet" ? "devnet" : "mainnet");

    searchParams.get('network') == "devnet" ? setNetwork("devnet") : setNetwork("mainnet");

    TUG_OF_WAR_PROGRAM = new Program<TugOfWar>(IDL, TUG_OF_WAR_PROGRAM_ID, { connection: CONNECTION })

    // A little animation for the player bubbles
    setInterval(() => {
      UpdatePlayerDisplay();
    }, 1300);

    // Listen for changes to the game data account
    const gameDataAccountPublicKey = getGameDataAccountPDA();
    CONNECTION.onAccountChange(
      gameDataAccountPublicKey,
      (updatedAccountInfo, context) => {
        {
          const decoded = TUG_OF_WAR_PROGRAM.coder.accounts.decode(
            "gameDataAccount",
            updatedAccountInfo.data
          )
          console.log(JSON.stringify(decoded));
          setGameDataState(decoded);
          setCurrentPlayerPosition(decoded.playerPosition);
        }
      },
      "confirmed"
    );

    // Listen for changes to the chest account
    const chestAccountPublicKey = getChestAccountPDA();
    CONNECTION.onAccountChange(
      chestAccountPublicKey,
      (updatedAccountInfo, context) => {
        {
          setChestLamports(updatedAccountInfo.lamports);
        }
      },
      "confirmed"
    );

    // Get the initial game data
    const getGameDataAsync = async () => {
      const gameDataAccountPublicKey = getGameDataAccountPDA();
      console.log(gameDataAccountPublicKey);
      
      const gameData = await TUG_OF_WAR_PROGRAM.account.gameDataAccount.fetch(
        gameDataAccountPublicKey,
      );
      setGameDataState(gameData);
      setCurrentPlayerPosition(gameData.playerPosition);
    };

    // Get the initial chest lamports
    const getChestLamportsAsync = async () => {
      const chestPublicKey = getChestAccountPDA();
      const accountInfo = await CONNECTION.getAccountInfo(chestPublicKey);
      setChestLamports(accountInfo?.lamports);
    };

    getGameDataAsync();
    getChestLamportsAsync();

  }, []);

  function UpdatePlayerDisplay() {
    counter++;
    counter = counter % 3;
    if (counter == 0) {
      setPlayerDisplay("ooO-------|-------Ooo");
    } else if (counter == 1) {
      setPlayerDisplay("oOo-------|-------oOo");
    } else if (counter == 2) {
      setPlayerDisplay("Ooo-------|-------ooO");
    }
  }

  function GetRightPulls() {
    if (currentPlayerPosition == undefined) {
      return 0
    } else {
      return 10 - (currentPlayerPosition - 10)
    }
  }
  function GetLeftPulls() {
    if (currentPlayerPosition == undefined) {
      return 0
    } else {
      return 10 + (currentPlayerPosition - 10)
    }
  }

  async function SendInstructionViaWalletAdapter(instruction: string) {
    if (publicKey == undefined) {
      return;
    }

    const transaction = new Transaction();
    const latestBlockhash = await CONNECTION.getLatestBlockhash();
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = latestBlockhash.blockhash;

    if (instruction == "pull_left") {
      AddPullLeftInstruction(TUG_OF_WAR_PROGRAM, publicKey, transaction);
    } else if (instruction == "pull_right") {
      AddPullRightInstruction(TUG_OF_WAR_PROGRAM, publicKey, transaction);
    } else if (instruction == "initialize") {
      AddInitializeInstruction(TUG_OF_WAR_PROGRAM, publicKey, transaction);
    } else if (instruction == "restart") {
      AddRestartInstruction(TUG_OF_WAR_PROGRAM, publicKey, transaction);
    } else {
     console.log("Invalid instruction");
    }

    const signature = await sendTransaction(transaction, CONNECTION);
    await CONNECTION.confirmTransaction(signature, "processed");
  }

  return (
    <main className='min-h-screen bg-blue-500 p-2'>
      {<div className="w-full min-h-screen bg-no-repeat bg-cover bg-center bg-fixed bg-[url('../public/bg.jpg')]">
        <div className="w-full min-h-screen bg-no-repeat bg-cover bg-center bg-fixed bg-blue-900 bg-opacity-60 pt-4">
          {gameDataState && (              
              <WalletMultiButton />
          )}

          <div className='flex flex-col justify-center'>

            {publicKey && (
              <>
                <button onClick={() => {SendInstructionViaWalletAdapter("pull_left")}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Pull Left
                </button>
                <button onClick={() => {SendInstructionViaWalletAdapter("pull_right")}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Pull Right
                </button>
                <button onClick={() => {SendInstructionViaWalletAdapter("initialize")}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Initialize
                </button>
                <button onClick={() => {SendInstructionViaWalletAdapter("restart")}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Restart
                </button>
              </>
            )}

            <div className='bg-white shadow-md rounded-2xl border-solid border border-black mx-auto w-fit p-2 mb-2'>
              <div className='text-center px-3 pb-6 pt-2'>
                <p className='text-xl text-gray-700 my-4'>
                  Tug Of War
                  <br></br>
                  </p>
                  <p className='text-bm text-gray-700 my-4'>
                  Scan the Solana Pay Qr Code to pull left or right.
                  <br></br>
                  </p>
                  {chestLamports && (
                    <>
                      <p>Reward for winning</p><p className='text-xl text-green-600 my-1'>{(chestLamports - 946560) / 1000000000} sol</p>                     
                    </>
                  )}

                <h2 className='mt-8 text-4xl'>
                  {
                    {
                      '0': "\\o/-------|-------ooo____________________",
                      '1': GetLeftPulls() + "_" + playerDisplay + "___________________" + GetRightPulls(),
                      '2': GetLeftPulls() + "__" + playerDisplay + "__________________" + GetRightPulls(),
                      '3': GetLeftPulls() + "___" + playerDisplay + "_________________" + GetRightPulls(),
                      '4': GetLeftPulls() + "____" + playerDisplay + "________________" + GetRightPulls(),
                      '5': GetLeftPulls() + "_____" + playerDisplay + "_______________" + GetRightPulls(),
                      '6': GetLeftPulls() + "______" + playerDisplay + "______________" + GetRightPulls(),
                      '7': GetLeftPulls() + "_______" + playerDisplay + "_____________" + GetRightPulls(),
                      '8': GetLeftPulls() + "________" + playerDisplay + "____________" + GetRightPulls(),
                      '9': GetLeftPulls() + "_________" + playerDisplay + "___________" + GetRightPulls(),
                      '10': GetLeftPulls() + "__________" + playerDisplay + "__________" + GetRightPulls(),
                      '11': GetLeftPulls() + "___________" + playerDisplay + "_________" + GetRightPulls(),
                      '12': GetLeftPulls() + "____________" + playerDisplay + "________" + GetRightPulls(),
                      '13': GetLeftPulls() + "_____________" + playerDisplay + "_______" + GetRightPulls(),
                      '14': GetLeftPulls() + "______________" + playerDisplay + "______" + GetRightPulls(),
                      '15': GetLeftPulls() + "_______________" + playerDisplay + "_____" + GetRightPulls(),
                      '16': GetLeftPulls() + "________________" + playerDisplay + "____" + GetRightPulls(),
                      '17': GetLeftPulls() + "_________________" + playerDisplay + "___" + GetRightPulls(),
                      '18': GetLeftPulls() + "__________________" + playerDisplay + "__" + GetRightPulls(),
                      '19': GetLeftPulls() + "___________________" + playerDisplay + "_" + GetRightPulls(),
                      '20': GetLeftPulls() + "____________________ooo-------|-------\\o/",
                    }[gameDataState ? gameDataState.playerPosition as number : 10]
                  }
                </h2>

              </div>
            </div>

            <li className='flex flex-row justify-between mx-10 text-xl my-4'>

              {currentPlayerPosition != null && (currentPlayerPosition > 0 && currentPlayerPosition < 20) && (
                <PayQR instruction={"pull_left"} network={network}/>
              )}

              {currentPlayerPosition != null && (currentPlayerPosition > 0 && currentPlayerPosition < 20) && (
                <PayQR instruction={"pull_right"} network={network}/>
              )}

              {!gameDataState && (
                <PayQR instruction={"initialize"} network={network}/>
              )}

              {currentPlayerPosition != null && gameDataState != null && (currentPlayerPosition <= 0 || currentPlayerPosition >= 20) && (
                <PayQR instruction={"restart"} network={network}/>
              )}
            </li>
          </div>
        </div>
      </div>}
    </main>
  );
}
