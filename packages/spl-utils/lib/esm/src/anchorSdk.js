import { sendInstructions, sendMultipleInstructions } from "./transaction";
export class AnchorSdk {
    program;
    provider;
    programId;
    rpc;
    instruction;
    wallet;
    account;
    errors;
    static ID;
    constructor(args) {
        this.program = args.program;
        this.provider = args.provider;
        this.programId = args.program.programId;
        this.rpc = args.program.rpc;
        this.instruction = args.program.instruction;
        this.wallet = args.provider.wallet;
        this.account = args.program.account;
        this.errors = args.program.idl.errors?.reduce((acc, err) => {
            acc.set(err.code, `${err.name}: ${err.msg}`);
            return acc;
        }, new Map());
    }
    async getAccount(key, decoder) {
        const account = await this.provider.connection.getAccountInfo(key);
        if (account) {
            return decoder(key, account);
        }
        return null;
    }
    async sendInstructions(instructions, signers, payer, commitment) {
        try {
            return await sendInstructions(this.errors || new Map(), this.provider, instructions, signers, payer, commitment);
        }
        catch (e) {
            // If all compute was consumed, this can often mean that the bonding price moved too much, causing
            // our root estimates to be off.
            if (e.logs &&
                e.logs.some((l) => l.endsWith("consumed 200000 of 200000 compute units"))) {
                throw new Error("Consumed all of the compute units. It's possible the price has moved too much, please try again.");
            }
            throw e;
        }
    }
    async execute(command, payer = this.wallet.publicKey, commitment) {
        const { instructions, signers, output } = await command;
        if (instructions.length > 0) {
            const txid = await this.sendInstructions(instructions, signers, payer, commitment);
            return { txid, ...output };
        }
        return output;
    }
    async executeBig(command, payer = this.wallet.publicKey, finality) {
        const { instructions, signers, output } = await command;
        if (instructions.length > 0) {
            const txids = await sendMultipleInstructions(this.errors || new Map(), this.provider, instructions, signers, payer || this.wallet.publicKey, finality);
            return {
                ...output,
                txids: Array.from(txids),
            };
        }
        return output;
    }
}
//# sourceMappingURL=anchorSdk.js.map