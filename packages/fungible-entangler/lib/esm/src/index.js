import * as anchor from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID, u64, } from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, } from "@solana/web3.js";
import { AnchorSdk, getMintInfo, getTokenAccount, } from "@strata-foundation/spl-utils";
import BN from "bn.js";
import { toBN, toNumber } from "./utils";
export * from "./generated/fungible-entangler";
const truthy = (value) => !!value;
const encode = anchor.utils.bytes.utf8.encode;
export class FungibleEntangler extends AnchorSdk {
    static ID = new PublicKey("fent99TYZcj9PGbeooaZXEMQzMd7rz8vYFiudd8HevB");
    static async init(provider, fungibleEntanglerProgramId = FungibleEntangler.ID) {
        const FungibleEntanglerIDLJson = await anchor.Program.fetchIdl(fungibleEntanglerProgramId, provider);
        const fungibleEntangler = new anchor.Program(FungibleEntanglerIDLJson, fungibleEntanglerProgramId, provider);
        return new this(provider, fungibleEntangler);
    }
    constructor(provider, program) {
        super({ provider, program });
    }
    /**
     * General utility function to check if an account exists
     * @param account
     * @returns
     */
    async accountExists(account) {
        return Boolean(await this.provider.connection.getAccountInfo(account));
    }
    /**
     * Get the PDA key of a Parent Entangler given the mint and dynamicSeed
     *
     *
     * @param mint
     * @param dynamicSeed
     * @returns
     */
    static async fungibleParentEntanglerKey(mint, dynamicSeed, programId = FungibleEntangler.ID) {
        return PublicKey.findProgramAddress([encode("entangler"), mint.toBuffer(), dynamicSeed], programId);
    }
    /**
     * Get the PDA key of a Child Entangler given the mint and parentEntangler
     *
     *
     * @param mint
     * @param parentEntangler
     * @returns
     */
    static async fungibleChildEntanglerKey(parentEntangler, mint, programId = FungibleEntangler.ID) {
        return PublicKey.findProgramAddress([encode("entangler"), parentEntangler.toBuffer(), mint.toBuffer()], programId);
    }
    /**
     * Get the PDA key of a Entangler storage given the entangler
     *
     *
     * @param entangler
     * @returns
     */
    static async storageKey(entangler, programId = FungibleEntangler.ID) {
        return PublicKey.findProgramAddress([encode("storage"), entangler.toBuffer()], programId);
    }
    parentEntanglerDecoder = (pubkey, account) => {
        const coded = this.program.coder.accounts.decode("FungibleParentEntanglerV0", account.data);
        return {
            ...coded,
            publicKey: pubkey,
        };
    };
    getParentEntangler(entanglerKey) {
        return this.getAccount(entanglerKey, this.parentEntanglerDecoder);
    }
    childEntanglerDecoder = (pubkey, account) => {
        try {
            const coded = this.program.coder.accounts.decode("FungibleChildEntanglerV0", account.data);
            return {
                ...coded,
                publicKey: pubkey,
            };
        }
        catch (err) {
            return undefined;
        }
    };
    getChildEntangler(entanglerKey) {
        return this.getAccount(entanglerKey, this.childEntanglerDecoder);
    }
    async getUnixTime() {
        const acc = await this.provider.connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
        return Number(acc.data.readBigInt64LE(8 * 4));
    }
    async createFungibleParentEntanglerInstructions({ authority = this.provider.wallet.publicKey, payer = this.provider.wallet.publicKey, source = this.provider.wallet.publicKey, mint, dynamicSeed, amount, goLiveDate, freezeSwapDate, }) {
        if (!goLiveDate) {
            goLiveDate = new Date(0).setUTCSeconds((await this.getUnixTime()) - 60);
        }
        const mintAcct = await getMintInfo(this.provider, mint);
        const sourceAcct = await this.provider.connection.getAccountInfo(source);
        amount = toNumber(amount, mintAcct);
        // Source is a wallet, need to get the ATA
        if (!sourceAcct || sourceAcct.owner.equals(SystemProgram.programId)) {
            const ataSource = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, payer, true);
            if (!(await this.accountExists(ataSource))) {
                throw new Error(`Owner of ${payer?.toBase58()} does not hold any ${mint.toBase58()} tokens`);
            }
            source = ataSource;
        }
        const sourceAcctAta = await getTokenAccount(this.provider, source);
        const instructions = [];
        const signers = [];
        const [entangler, _entanglerBump] = await FungibleEntangler.fungibleParentEntanglerKey(mint, dynamicSeed);
        const [storage, _storageBump] = await FungibleEntangler.storageKey(entangler);
        instructions.push(await this.instruction.initializeFungibleParentEntanglerV0({
            authority,
            dynamicSeed,
            goLiveUnixTime: new BN(Math.floor(goLiveDate.valueOf() / 1000)),
            freezeSwapUnixTime: freezeSwapDate
                ? new BN(Math.floor(freezeSwapDate.valueOf() / 1000))
                : null,
        }, {
            accounts: {
                payer,
                entangler,
                parentStorage: storage,
                parentMint: mint,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
                clock: SYSVAR_CLOCK_PUBKEY,
            },
        }), Token.createTransferInstruction(TOKEN_PROGRAM_ID, source, storage, sourceAcctAta.owner, [], new u64((amount * Math.pow(10, mintAcct.decimals)).toLocaleString("fullwide", {
            useGrouping: false,
        }))));
        return {
            instructions,
            signers,
            output: {
                entangler,
                storage,
                mint,
            },
        };
    }
    async createFungibleParentEntangler(args, commitment = "confirmed") {
        return this.execute(this.createFungibleParentEntanglerInstructions(args), args.payer, commitment);
    }
    async createFungibleChildEntanglerInstructions({ authority = this.provider.wallet.publicKey, payer = this.provider.wallet.publicKey, parentEntangler, mint, goLiveDate, freezeSwapDate, }) {
        const instructions = [];
        const signers = [];
        if (!goLiveDate) {
            goLiveDate = new Date(0).setUTCSeconds((await this.getUnixTime()) - 60);
        }
        const [entangler, _entanglerBump] = await FungibleEntangler.fungibleChildEntanglerKey(parentEntangler, mint);
        const [storage, _storageBump] = await FungibleEntangler.storageKey(entangler);
        instructions.push(await this.instruction.initializeFungibleChildEntanglerV0({
            goLiveUnixTime: new BN(Math.floor(goLiveDate.valueOf() / 1000)),
            freezeSwapUnixTime: freezeSwapDate
                ? new BN(Math.floor(freezeSwapDate.valueOf() / 1000))
                : null,
        }, {
            accounts: {
                payer,
                parentEntangler,
                entangler,
                authority: authority,
                childStorage: storage,
                childMint: mint,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
                clock: SYSVAR_CLOCK_PUBKEY,
            },
        }));
        return {
            instructions,
            signers,
            output: {
                entangler,
                storage,
                mint,
            },
        };
    }
    async createFungibleChildEntangler(args, commitment = "confirmed") {
        return this.execute(this.createFungibleChildEntanglerInstructions(args), args.payer, commitment);
    }
    async createFungibleEntanglerInstructions({ authority = this.provider.wallet.publicKey, payer = this.provider.wallet.publicKey, source = this.provider.wallet.publicKey, dynamicSeed = Keypair.generate().publicKey.toBuffer(), amount, parentMint, childMint, parentGoLiveDate, parentFreezeSwapDate, childGoLiveDate, childFreezeSwapDate, }) {
        const instructions = [];
        const signers = [];
        if (!parentGoLiveDate) {
            parentGoLiveDate = new Date(0).setUTCSeconds((await this.getUnixTime()) - 60);
        }
        if (!childGoLiveDate) {
            childGoLiveDate = new Date(0).setUTCSeconds((await this.getUnixTime()) - 60);
        }
        const { instructions: parentInstructions, signers: parentSigners, output: parentOutput, } = await this.createFungibleParentEntanglerInstructions({
            authority,
            payer,
            source,
            dynamicSeed,
            amount,
            mint: parentMint,
            goLiveDate: parentGoLiveDate,
            freezeSwapDate: parentFreezeSwapDate,
        });
        const { instructions: childInstructions, signers: childSigners, output: childOutput, } = await this.createFungibleChildEntanglerInstructions({
            authority,
            payer,
            parentEntangler: parentOutput.entangler,
            mint: childMint,
            goLiveDate: childGoLiveDate,
            freezeSwapDate: childFreezeSwapDate,
        });
        instructions.push(...parentInstructions, ...childInstructions);
        return {
            instructions,
            signers,
            output: {
                parentEntangler: parentOutput.entangler,
                parentStorage: parentOutput.storage,
                parentMint: parentOutput.mint,
                childEntangler: childOutput.entangler,
                childStorage: childOutput.storage,
                childMint: childOutput.mint,
            },
        };
    }
    async createFungibleEntangler(args, commitment = "confirmed") {
        return this.execute(this.createFungibleEntanglerInstructions(args), args.payer, commitment);
    }
    async swapParentForChildInstructions({ payer = this.wallet.publicKey, source, sourceAuthority = this.wallet.publicKey, parentEntangler, childEntangler, destination, ...rest }) {
        let { amount, all } = { amount: null, all: null, ...rest };
        const parentAcct = (await this.getParentEntangler(parentEntangler));
        const childAcct = (await this.getChildEntangler(childEntangler));
        const parentMint = await getMintInfo(this.provider, parentAcct.parentMint);
        const instructions = [];
        const signers = [];
        if (!destination) {
            destination = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, childAcct.childMint, sourceAuthority, true);
            if (!(await this.accountExists(destination))) {
                console.log(`Creating child ${childAcct.childMint.toBase58()} account`);
                instructions.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, childAcct.childMint, destination, sourceAuthority, payer));
            }
        }
        if (!source) {
            source = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, parentAcct.parentMint, sourceAuthority, true);
            if (!(await this.accountExists(source))) {
                console.warn("Source account for swap does not exist, if it is not created in an earlier instruction this can cause an error");
            }
        }
        if (amount) {
            amount = toBN(amount, parentMint);
        }
        const args = {
            // @ts-ignore
            amount,
            // @ts-ignore
            all,
        };
        instructions.push(await this.instruction.swapParentForChildV0(args, {
            accounts: {
                common: {
                    parentEntangler,
                    parentStorage: parentAcct.parentStorage,
                    childEntangler,
                    childStorage: childAcct.childStorage,
                    source,
                    sourceAuthority,
                    destination,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    clock: SYSVAR_CLOCK_PUBKEY,
                },
            },
        }));
        return {
            instructions,
            signers,
            output: null,
        };
    }
    async swapParentForChild(args, commitment = "confirmed") {
        await this.execute(this.swapParentForChildInstructions(args), args.payer, commitment);
    }
    async swapChildForParentInstructions({ payer = this.wallet.publicKey, source, sourceAuthority = this.wallet.publicKey, parentEntangler, childEntangler, destination, ...rest }) {
        let { amount, all } = { amount: null, all: null, ...rest };
        const parentAcct = (await this.getParentEntangler(parentEntangler));
        const childAcct = (await this.getChildEntangler(childEntangler));
        const childMint = await getMintInfo(this.provider, childAcct.childMint);
        const instructions = [];
        const signers = [];
        if (!destination) {
            destination = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, parentAcct.parentMint, sourceAuthority, true);
            if (!(await this.accountExists(destination))) {
                console.log(`Creating parent ${parentAcct.parentMint.toBase58()} account`);
                instructions.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, parentAcct.parentMint, destination, sourceAuthority, payer));
            }
        }
        if (amount) {
            amount = toBN(amount, childMint);
        }
        if (!source) {
            source = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, childAcct.childMint, sourceAuthority, true);
            if (!(await this.accountExists(source))) {
                console.warn("Source account for swap does not exist, if it is not created in an earlier instruction this can cause an error");
            }
        }
        const args = {
            // @ts-ignore
            amount,
            // @ts-ignore
            all,
        };
        instructions.push(await this.instruction.swapChildForParentV0(args, {
            accounts: {
                common: {
                    parentEntangler,
                    parentStorage: parentAcct.parentStorage,
                    childEntangler,
                    childStorage: childAcct.childStorage,
                    source,
                    sourceAuthority,
                    destination,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    clock: SYSVAR_CLOCK_PUBKEY,
                },
            },
        }));
        return {
            instructions,
            signers,
            output: null,
        };
    }
    async swapChildForParent(args, commitment = "confirmed") {
        await this.execute(this.swapChildForParentInstructions(args), args.payer, commitment);
    }
    async topOffInstructions({ payer = this.wallet.publicKey, source, sourceAuthority = this.wallet.publicKey, amount, ...rest }) {
        const { parentEntangler, childEntangler } = {
            parentEntangler: null,
            childEntangler: null,
            ...rest,
        };
        const entanglerAcct = parentEntangler
            ? await this.getParentEntangler(parentEntangler)
            : await this.getChildEntangler(childEntangler);
        const mint = parentEntangler
            ? entanglerAcct.parentMint
            : entanglerAcct.childMint;
        const mintAcct = await getMintInfo(this.provider, mint);
        const instructions = [];
        const signers = [];
        if (!source) {
            source = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, sourceAuthority, true);
            if (!(await this.accountExists(source))) {
                console.warn("Source account for swap does not exist, if it is not created in an earlier instruction this can cause an error");
            }
        }
        const sourceAcctAta = await getTokenAccount(this.provider, source);
        amount = toNumber(amount, mintAcct);
        instructions.push(Token.createTransferInstruction(TOKEN_PROGRAM_ID, source, parentEntangler
            ? entanglerAcct.parentStorage
            : entanglerAcct.childStorage, sourceAcctAta.owner, [], new u64((amount * Math.pow(10, mintAcct.decimals)).toLocaleString("fullwide", {
            useGrouping: false,
        }))));
        return {
            instructions,
            signers,
            output: null,
        };
    }
    async topOff(args, commitment = "confirmed") {
        await this.execute(this.topOffInstructions(args), args.payer, commitment);
    }
    async transferInstructions({ payer = this.wallet.publicKey, amount, destination, destinationWallet = this.wallet.publicKey, ...rest }) {
        let { parentEntangler, childEntangler } = {
            parentEntangler: null,
            childEntangler: null,
            ...rest,
        };
        const isTransferChild = childEntangler !== null;
        const childEntanglerAcct = childEntangler
            ? await this.getChildEntangler(childEntangler)
            : null;
        parentEntangler = (parentEntangler ||
            (childEntanglerAcct && childEntanglerAcct.parentEntangler));
        const parentEntanglerAcct = await this.getParentEntangler(parentEntangler);
        const mint = isTransferChild
            ? childEntanglerAcct.childMint
            : parentEntanglerAcct.parentMint;
        const mintAcct = await getMintInfo(this.provider, mint);
        const instructions = [];
        const signers = [];
        const destAcct = destination &&
            (await this.provider.connection.getAccountInfo(destination));
        // Destination is a wallet, need to get the ATA
        if (!destAcct || destAcct.owner.equals(SystemProgram.programId)) {
            const ataDestination = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, destinationWallet, false // Explicitly don't allow owner off curve. You need to pass destination as an already created thing to do this
            );
            if (!(await this.accountExists(ataDestination))) {
                instructions.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, ataDestination, destinationWallet, payer));
            }
            destination = ataDestination;
        }
        if (isTransferChild) {
            instructions.push(await this.instruction.transferChildStorageV0({
                amount: toBN(amount, mintAcct),
            }, {
                accounts: {
                    authority: parentEntanglerAcct.authority,
                    parentEntangler,
                    entangler: childEntangler,
                    childStorage: childEntanglerAcct.childStorage,
                    destination: destination,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
            }));
        }
        else {
            instructions.push(await this.instruction.transferParentStorageV0({
                amount: toBN(amount, mintAcct),
            }, {
                accounts: {
                    authority: parentEntanglerAcct.authority,
                    parentEntangler,
                    parentStorage: parentEntanglerAcct.parentStorage,
                    destination: destination,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
            }));
        }
        return {
            instructions,
            signers,
            output: null,
        };
    }
    async transfer(args, commitment = "confirmed") {
        await this.execute(this.transferInstructions(args), args.payer, commitment);
    }
    async closeInstructions({ refund = this.wallet.publicKey, ...rest }) {
        let { parentEntangler, childEntangler } = {
            parentEntangler: null,
            childEntangler: null,
            ...rest,
        };
        const isCloseChild = childEntangler !== null;
        const childEntanglerAcct = childEntangler
            ? await this.getChildEntangler(childEntangler)
            : null;
        parentEntangler = (parentEntangler ||
            (childEntanglerAcct && childEntanglerAcct.parentEntangler));
        const parentEntanglerAcct = await this.getParentEntangler(parentEntangler);
        const mint = isCloseChild
            ? childEntanglerAcct.childMint
            : parentEntanglerAcct.parentMint;
        const instructions = [];
        const signers = [];
        if (isCloseChild) {
            instructions.push(await this.instruction.closeFungibleChildEntanglerV0({
                accounts: {
                    refund,
                    authority: parentEntanglerAcct.authority,
                    parentEntangler,
                    entangler: childEntangler,
                    childStorage: childEntanglerAcct.childStorage,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
            }));
        }
        else {
            instructions.push(await this.instruction.closeFungibleParentEntanglerV0({
                accounts: {
                    refund,
                    authority: parentEntanglerAcct.authority,
                    parentEntangler,
                    parentStorage: parentEntanglerAcct.parentStorage,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
            }));
        }
        return {
            instructions,
            signers,
            output: null,
        };
    }
    async close(args, commitment = "confirmed") {
        await this.execute(this.closeInstructions(args), args.refund, commitment);
    }
}
//# sourceMappingURL=index.js.map