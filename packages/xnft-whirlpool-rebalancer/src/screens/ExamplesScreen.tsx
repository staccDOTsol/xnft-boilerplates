import { Button, Image, Text } from "react-native";
import * as Linking from "expo-linking";
import { atom, useRecoilState } from "recoil";

import { Section } from "../components/Section";
import { Screen } from "../components/Screen";
import { LocalStorage } from "react-xnft";

const testAtom = atom<"native" | "bright">({
  key: "testAtom",
  default: "native",
});

function LearnMoreLink({ url }: { url: string }) {
  return <Text onPress={() => Linking.openURL(url)}>Learn more</Text>;
}
import { AnchorProvider, Instruction } from "@coral-xyz/anchor";

import {
  ORCA_WHIRLPOOL_PROGRAM_ID,
  TickUtil,
  PDAUtil,
  PriceMath,
  WhirlpoolIx,
  decreaseLiquidityQuoteByLiquidityWithParams,
  WhirlpoolContext,
  AccountFetcher,
  buildWhirlpoolClient,
  increaseLiquidityQuoteByInputToken,
  SwapUtils,
  swapQuoteByInputToken,
  decreaseLiquidityQuoteByLiquidity,
  increaseLiquidityQuoteByInputTokenWithParams,
  toTx,
  collectFeesQuote,
  collectRewardsQuote,
} from "@orca-so/whirlpools-sdk";
import {
  AddressLookupTableAccount,
  AddressLookupTableProgram,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Signer,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { Percentage, deriveATA, MathUtil, TransactionPayload } from "@orca-so/common-sdk";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";
import { useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import { useSolanaConnection } from "../hooks/xnft-hooks";
import e from "express";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";


export function ExamplesScreens() {
  const [future, setFuture] = useRecoilState(testAtom);
  const connection = new Connection(process.env.SOLANA_RPC_URL)
  const [localkey, setLocalkey] = useState<Keypair>()
  const [thepool, setThepool] = useState("8QaXeHBrShJTdtN1rWCccBxpSVvKksQ2PCu5nufb2zbk,3ne4mWqdYuNiYrYZC9TrA3FcfuFdErghH97vNPbjicr1,BqnpCdDLPV2pFdAaLnVidmn3G93RP2p5oRdGEY2sJGez,DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263,HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ")
  const [qty, setQty] = useState("138000,138000,138000,138000,138000")
  const [luts, theLuts] = useState([])
  
  const posOlds: any = {};
  // 1000 * 0.0005 $5?
  // @ts-ignore

  setTimeout(async function () {
let tlkk = await LocalStorage.get("localkey2")
if (tlkk == undefined){
  tlkk = Keypair.generate()
  await LocalStorage.set("localkey2", tlkk.secretKey.toString())
  setLocalkey(Keypair.fromSecretKey(new Uint8Array( tlkk.secretKey)))

}
setLocalkey(Keypair.fromSecretKey(new Uint8Array((JSON.parse( "["+tlkk+"]")))))

if (localkey){
  const provider = new AnchorProvider(connection, new NodeWallet( localkey ), {})
  const context = WhirlpoolContext.withProvider(
    provider,
    ORCA_WHIRLPOOL_PROGRAM_ID
  );
    const client = buildWhirlpoolClient(context);
   
    //let position = await client.getPosition(positionk);
    let atas = await connection.getParsedTokenAccountsByOwner(
      localkey.publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    let positions: any = [];
    for (var ata of atas.value) {
      try {
        console.log(ata.account.data.parsed.info.mint);
  
        let maybe = await client.getPosition(
          PDAUtil.getPosition(
            ORCA_WHIRLPOOL_PROGRAM_ID,
            new PublicKey(ata.account.data.parsed.info.mint)
          ).publicKey
        );
        positions.push(maybe);
        posOlds[ata.account.data.parsed.info.mint] = (
          await maybe.getData()
        ).rewardInfos;
      } catch (err) {}
    }
    console.log(positions);
    setInterval(async function () {
      let txs: TransactionPayload [] = []

      for (var index = 0 ; index < thepool.split(',').length; index++){


        
      try {
      let atas = await connection.getParsedTokenAccountsByOwner(
        localkey.publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );
      let positions: any = [];
  
      const pool = await client.getPool(thepool.split(',')[index]
      );
      
      for (var ata of atas.value) {
        try {
          console.log(ata.account.data.parsed.info.mint);
  
          let maybe = await client.getPosition(
            PDAUtil.getPosition(
              ORCA_WHIRLPOOL_PROGRAM_ID,
              new PublicKey(ata.account.data.parsed.info.mint)
            ).publicKey
          );
          (await maybe.getData())
          positions.push(maybe);
          if (
            (await maybe.getData()).rewardInfos ==
            posOlds[ata.account.data.parsed.info.mint]
          ) {
            
            console.log("closeit!");
            const apool = await (await client.getPool(await maybe.getData().whirlpool)).getAddress()

            if (apool == await pool.getAddress()){
            await client.collectFeesAndRewardsForPositions([maybe.getAddress()])
           
            // Must manually call update_fee_and_rewards -> collect_fees -> collect_rewards
            // Convienience function coming soon.
            const txs2 = await pool.closePosition(
              maybe.getAddress(),
              Percentage.fromFraction(100, 100)
            );
            for (var t of txs2) {
           t.addInstruction({instructions: [    SystemProgram.transfer({
            fromPubkey: localkey.publicKey,
            toPubkey: new PublicKey("PoNA1qzqHWar3g8Hy9cxA2Ubi3hV7q84dtXAxD77CSD"),
            lamports: 5000})], signers:[localkey], cleanupInstructions:[]})
              await  t.buildAndExecute()
            
          }
          }
          } else {
            posOlds[ata.account.data.parsed.info.mint] = (
              await maybe.getData()
            ).rewardInfos;
          }
        } catch (err) {
        }
      
      }

      for (var i = 0; i < 4; i++){
        try {
      const poolData = await pool.getData();
      const poolTokenAInfo = pool.getTokenAInfo();
      const poolTokenBInfo = pool.getTokenBInfo();
  
      // Derive the tick-indices based on a human-readable price
      const tokenADecimal = poolTokenAInfo.decimals;
      const tokenBDecimal = poolTokenBInfo.decimals;
      // Derive the Whirlpool address
  
      /*
  
   await( toTx(context, WhirlpoolIx.openPositionWithMetadataIx(context.program, {
      funder: localkey.publicKey,
      positionPda,
      metadataPda,
      positionMintAddress: positionMintKeypair.publicKey,
      positionTokenAccount: positionTokenAccountAddress,
      whirlpool: pool.getAddress(),
      owner: localkey.publicKey,
      tickLowerIndex: poolData.tickCurrentIndex-poolData.tickSpacing,
      tickUpperIndex: poolData.tickCurrentIndex+poolData.tickSpacing,
    })).addSigner(positionMintKeypair).buildAndExecute());
  */
      // Get a quote on the estimated liquidity and tokenIn (50 tokenA)
      //let positionData = await position.getData()
      //if
      console.log(poolData.tickSpacing);
      console.log(poolData.tickCurrentIndex);
  
      const tickLower = TickUtil.getInitializableTickIndex(
        poolData.tickCurrentIndex -
          Math.floor(Math.random() * 8) * poolData.tickSpacing, // @ts-ignore
        poolData.tickSpacing
      );
      const tickUpper = TickUtil.getInitializableTickIndex(
        poolData.tickCurrentIndex +
          Math.floor(Math.random() * 8) * poolData.tickSpacing, // @ts-ignore
        poolData.tickSpacing
      );
      console.log(poolTokenAInfo.mint.toBase58());
  
      const quote = increaseLiquidityQuoteByInputTokenWithParams({
        inputTokenAmount: new u64(parseFloat(qty.split(',')[index]) * 10 ** tokenBDecimal),
        inputTokenMint: poolData.tokenMintB,
  
        tokenMintA: poolData.tokenMintA,
        tokenMintB: poolData.tokenMintB,
        tickCurrentIndex: poolData.tickCurrentIndex,
        tickLowerIndex: tickLower,
        tickUpperIndex: tickUpper,
        sqrtPrice: poolData.sqrtPrice,
        slippageTolerance: Percentage.fromFraction(100, 100),
      });

      const quote2 = increaseLiquidityQuoteByInputTokenWithParams({
        inputTokenAmount: new u64(parseFloat(qty.split(',')[index]) * 10 ** tokenADecimal),
        inputTokenMint: poolData.tokenMintA,
  
        tokenMintA: poolData.tokenMintA,
        tokenMintB: poolData.tokenMintB,
        tickCurrentIndex: poolData.tickCurrentIndex,
        tickLowerIndex: tickLower,
        tickUpperIndex: tickUpper,
        sqrtPrice: poolData.sqrtPrice,
        slippageTolerance: Percentage.fromFraction(100, 100),
      });
      // Construct the open position & increase_liquidity ix and execute the transaction.
      const {  tx } = await pool.openPosition(
        tickLower,
        tickUpper,
        quote
      );

      // Construct the open position & increase_liquidity ix and execute the transaction.
      const { tx: tx22 } = await pool.openPosition(
        tickLower,
        tickUpper,
        quote2
      );
      //thePosition = positionMint
//        tx.addInstruction ({instructions: transferTransaction.instructions, signers:[],cleanupInstructions:[]})
      //  tx.addInstruction ({instructions: tx22.compressIx(false).instructions, signers:tx22.compressIx(false).signers,cleanupInstructions:tx22.compressIx(false).cleanupInstructions})
      tx.addInstruction({instructions: [    SystemProgram.transfer({
        fromPubkey: localkey.publicKey,
        toPubkey: new PublicKey("PoNA1qzqHWar3g8Hy9cxA2Ubi3hV7q84dtXAxD77CSD"),
        lamports: 5000})], signers:[localkey], cleanupInstructions:[]})
        tx22.addInstruction({instructions: [    SystemProgram.transfer({
          fromPubkey: localkey.publicKey,
          toPubkey: new PublicKey("PoNA1qzqHWar3g8Hy9cxA2Ubi3hV7q84dtXAxD77CSD"),
          lamports: 5000})], signers:[localkey], cleanupInstructions:[]})
Math.random() > 0.5 ? (await tx.buildAndExecute()) : (await tx22.buildAndExecute())
      // Fetch the newly created position with liquidity

    } catch (err){
      console.log(err)
          }

      }
    } catch( er ){
      
    console.log(er)
    }
  }

   let keys : PublicKey [] = []
let signers : Signer[]=  [localkey]
let instructions : TransactionInstruction [] = []
   for (var tpayload of  txs){
signers.push(...tpayload.signers)
    for (var ix of tpayload.transaction.instructions){
      instructions.push(...tpayload.transaction.instructions)
try {
  for (var key of ix.keys){
try {
  let test = key.pubkey.toBase58()
    if (!keys.includes(key.pubkey)){
      keys.push(key.pubkey)
    }

} catch (err){

}
  }
}
catch (err){

}
   }
// Send this `extendInstruction` in a transaction to the cluster
// to insert the listing of `addresses` into your lookup table with address `lookupTableAddress`
// To create the Address Lookup Table on chain:
// send the `lookupTableInst` instruction in a transaction

}
}, 60 * 1000);
}
  }, 10000);
  return (
    <Screen>
      <Section title="Set your Orca.so whirlpools...">
        <TextInput
          onChange={(e: any) => setThepool(e.target.value)}
          value={thepool}
        />
      </Section>
      <Section title="qtys to trade...(rough)">
        {qty ? 
        <TextInput
          onChange={(e: any) => setQty((e.target.value))}
          value={qty.toString()}
        />
      : <TextInput
      onChange={(e: any) => setQty((e.target.value))}
      value={"0"}
    />
      }
      </Section>
      <Section title="send your tokens and sol here,...">
        <Text >
          
          {localkey && localkey.publicKey && localkey.publicKey.toBase58()}
        </Text>
      </Section>
      <Section title="import the private key somewhere safu,...">
        <Text >
          
          {localkey && localkey.secretKey && "[" + localkey.secretKey.toString() + "]"}
        </Text>
      </Section>
    </Screen>
  );
}
