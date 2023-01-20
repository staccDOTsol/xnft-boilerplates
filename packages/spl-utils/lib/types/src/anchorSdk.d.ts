import { AccountNamespace, Idl, InstructionNamespace, Program, AnchorProvider, RpcNamespace } from "@project-serum/anchor";
import { AllInstructions } from "@project-serum/anchor/dist/cjs/program/namespace/types";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { PublicKey, Signer, TransactionInstruction, Commitment, Finality } from "@solana/web3.js";
import { TypedAccountParser } from "./accountFetchCache";
import { BigInstructionResult, InstructionResult } from "./transaction";
export declare abstract class AnchorSdk<IDL extends Idl> {
    program: Program<IDL>;
    provider: AnchorProvider;
    programId: PublicKey;
    rpc: RpcNamespace<IDL, AllInstructions<IDL>>;
    instruction: InstructionNamespace<IDL, IDL["instructions"][number]>;
    wallet: Wallet;
    account: AccountNamespace<IDL>;
    errors: Map<number, string> | undefined;
    static ID: PublicKey;
    constructor(args: {
        provider: AnchorProvider;
        program: Program<IDL>;
    });
    protected getAccount<T>(key: PublicKey, decoder: TypedAccountParser<T>): Promise<T | null>;
    sendInstructions(instructions: TransactionInstruction[], signers: Signer[], payer?: PublicKey, commitment?: Commitment): Promise<string>;
    execute<Output>(command: Promise<InstructionResult<Output>>, payer?: PublicKey, commitment?: Commitment): Promise<Output & {
        txid?: string;
    }>;
    executeBig<Output>(command: Promise<BigInstructionResult<Output>>, payer?: PublicKey, finality?: Finality): Promise<Output & {
        txids?: string[];
    }>;
}
//# sourceMappingURL=anchorSdk.d.ts.map