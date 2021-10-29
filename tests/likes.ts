import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { PublicKey, Keypair } from "@solana/web3.js";
import { Likes } from "../target/types/likes";

describe("likes", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Likes as Program<Likes>;

  //it would probably be better to just do a
  //separate create like account func and then assume the user has an account if they are trying to like something
  it("do a like", async () => {
    let payer = Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        payer.publicKey,
        5 * web3.LAMPORTS_PER_SOL
      ),
      "confirmed"
    );

    let [_likeAccount, _likeAccountBump] =
      await web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode("likes"), payer.publicKey.toBuffer()],
        program.programId
      );

    const init = await program.rpc.initializeLikeAccount(_likeAccountBump, {
      accounts: {
        initializer: payer.publicKey,
        likeAccount: _likeAccount,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [payer],
    });

    let og = anchor.utils.bytes.utf8.encode("j");
    let likeString = Array.from(og);
    const tx = await program.rpc.performLike(_likeAccountBump, likeString, {
      accounts: {
        performer: payer.publicKey,
        likeAccount: _likeAccount,
      },
      signers: [payer],
    });
  });
});
/*
  it("Is initialized!", async () => {
    // Add your test here.
 
    let example =
      "4D2S5QNDurq9aBbSSHWK3DxVkLLSRuEab4ZGgD9owU4njtGnRjNeMnxiP3GRZEXVNeLMhzNEGx6iun6Ycp5LcN3z";
    let examp =
      "oj6h1R25WFoKieAuaoQo6vb3viFotYfRnw5RMgKBkyDPqJxQSE1hqXN7vgmbmCT4yMNFUTkGNBCnPsJTUKQBDL5";
    let three =
      "45rycqGrhNJUFuTaTHDUcUxGztUmMg3mgRo8zupyMVUFG6Nkgwvqtwa1GwviE1faxAVScSgypkTpgji4V75fmzWt";
    //all 87 or 88
    console.log(example.length);
    console.log(examp.length);
    console.log(three.length);
  });

    let s = Buffer.from("h");

   const tx = await program.rpc.performLike(_likeAccountBump, {
      accounts: {
        performer: payer.publicKey,
        likeAccount: _likeAccount,
      },
      instructions: [
        program.instruction.initializeLikeAccount(_likeAccountBump, {
          accounts: {
            initializer: payer.publicKey,
            likeAccount: _likeAccount,
            systemProgram: web3.SystemProgram.programId,
          },
        }),
      ],
      signers: [payer],
    });

  */
