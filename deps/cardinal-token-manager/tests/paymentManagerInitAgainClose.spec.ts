import { web3 } from "@project-serum/anchor";
import { expectTXTable } from "@saberhq/chai-solana";
import { SolanaProvider, TransactionEnvelope } from "@saberhq/solana-contrib";
import { Keypair } from "@solana/web3.js";
import { expect } from "chai";

import { tryGetAccount } from "../src";
import { getPaymentManager } from "../src/programs/paymentManager/accounts";
import { close, init } from "../src/programs/paymentManager/instruction";
import { findPaymentManagerAddress } from "../src/programs/paymentManager/pda";
import { getProvider } from "./workspace";

describe("Init again and close payment manager", () => {
  const MAKER_FEE = 500;
  const TAKER_FEE = 300;
  const paymentManagerName = Math.random().toString(36).slice(2, 7);
  const feeCollector = Keypair.generate();

  it("Create payment manager", async () => {
    const provider = getProvider();
    const transaction = new web3.Transaction();

    const [ix] = await init(
      provider.connection,
      provider.wallet,
      paymentManagerName,
      {
        feeCollector: feeCollector.publicKey,
        makerFeeBasisPoints: MAKER_FEE,
        takerFeeBasisPoints: TAKER_FEE,
      }
    );

    transaction.add(ix);
    const txEnvelope = new TransactionEnvelope(
      SolanaProvider.init({
        connection: provider.connection,
        wallet: provider.wallet,
        opts: provider.opts,
      }),
      [...transaction.instructions]
    );
    await expectTXTable(txEnvelope, "Create Payment Manager", {
      verbosity: "error",
      formatLogs: true,
    }).to.be.fulfilled;

    const [checkPaymentManagerId] = await findPaymentManagerAddress(
      paymentManagerName
    );
    const paymentManagerData = await getPaymentManager(
      provider.connection,
      checkPaymentManagerId
    );
    expect(paymentManagerData.parsed.name).to.eq(paymentManagerName);
    expect(paymentManagerData.parsed.makerFeeBasisPoints).to.eq(MAKER_FEE);
    expect(paymentManagerData.parsed.takerFeeBasisPoints).to.eq(TAKER_FEE);
  });

  it("Init again fails", () => {
    const provider = getProvider();
    expect(async () => {
      await expectTXTable(
        new TransactionEnvelope(SolanaProvider.init(provider), [
          (
            await init(
              provider.connection,
              provider.wallet,
              paymentManagerName,
              {
                feeCollector: feeCollector.publicKey,
                makerFeeBasisPoints: MAKER_FEE,
                takerFeeBasisPoints: TAKER_FEE,
              }
            )
          )[0],
        ]),
        "Fail to use",
        { verbosity: "error" }
      ).to.be.rejectedWith(Error);
    });
  });

  it("Close", async () => {
    const provider = getProvider();
    const balanceBefore = await provider.connection.getBalance(
      provider.wallet.publicKey
    );
    await expectTXTable(
      new TransactionEnvelope(SolanaProvider.init(provider), [
        await close(
          provider.connection,
          provider.wallet,
          paymentManagerName,
          provider.wallet.publicKey
        ),
      ]),
      "Close payment manager",
      {
        verbosity: "error",
        formatLogs: true,
      }
    ).to.be.fulfilled;

    const [paymentManagerId] = await findPaymentManagerAddress(
      paymentManagerName
    );
    const paymentManagerData = await tryGetAccount(() =>
      getPaymentManager(provider.connection, paymentManagerId)
    );
    expect(paymentManagerData).to.eq(null);

    const balanceAfter = await provider.connection.getBalance(
      provider.wallet.publicKey
    );

    expect(balanceAfter).to.greaterThan(balanceBefore);
  });
});
