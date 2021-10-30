import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { Likes } from "../target/types/likes";
import { assert } from "chai";
import * as Base58 from "base-58";

describe("likes", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Likes as Program<Likes>;

  let wallet: any = provider.wallet;
  let payer = wallet.payer;
  let likes: PublicKey = null;
  let seed = "likes";
  // "ts-mocha -p ./tsconfig.json -t 1000000 tests/*.ts"

  it("config", async () => {
    //   await provider.connection.confirmTransaction(
    //     await provider.connection.requestAirdrop(
    //       payer.publicKey,
    //       5 * web3.LAMPORTS_PER_SOL
    //     ),
    //     "confirmed"
    //   );

    likes = await PublicKey.createWithSeed(
      payer.publicKey,
      seed,
      program.programId
    );
  });

  it("do some likes", async () => {
    let byteArray = anchor.utils.bytes.utf8.encode("j");
    let likeString = Array.from(byteArray);
    let five =
      "oj6h1R25WFoKieAuaoQo6vb3viFotYfRnw5RMgKBkyDPqJxQSE1hqXN7vgmbmCT4yMNFUTkGNBCnPsJTUKQBDL5";
    if (!(await doesLikeAccountExist(likes, provider.connection))) {
      const init = await program.rpc.createLikesAccount({
        accounts: {
          likes: likes,
          user: payer.publicKey,
        },
        instructions: [
          SystemProgram.createAccountWithSeed({
            basePubkey: payer.publicKey,
            fromPubkey: payer.publicKey,
            lamports:
              await provider.connection.getMinimumBalanceForRentExemption(
                program.account.likes.size
              ),
            newAccountPubkey: likes,
            programId: program.programId,
            seed: seed,
            space: program.account.likes.size,
          }),
        ],
        signers: [payer],
      });
    }
    const tx = await program.rpc.newLike(
      "oj6h1R25WFoKieAuaoQo6vb3viFotYfRnw5RMgKBkyDPqJxQSE1hqXN7vgmbmCT4yMNFUTkGNBCnPsJTUKQBDL5",
      {
        accounts: {
          likes: likes,
          user: payer.publicKey,
        },
        instructions: [
          program.instruction.newLike(
            "45rycqGrhNJUFuTaTHDUcUxGztUmMg3mgRo8zupyMVUFG6Nkgwvqtwa1GwviE1faxAVScSgypkTpgji4V75fmzWt",
            {
              accounts: {
                likes: likes,
                user: payer.publicKey,
              },
            }
          ),
          program.instruction.newLike(
            "3oFpJxV9wLRcmNHR6RRNqUEjWQrPKDHad48oQENuhtNoJAvx4y8buPeTpBGZPDZYMwUoMUiNvxMYU6Qvz5TY4Y7j",
            {
              accounts: {
                likes: likes,
                user: payer.publicKey,
              },
            }
          ),
          program.instruction.newLike(
            "4D2S5QNDurq9aBbSSHWK3DxVkLLSRuEab4ZGgD9owU4njtGnRjNeMnxiP3GRZEXVNeLMhzNEGx6iun6Ycp5LcN3z",
            {
              accounts: {
                likes: likes,
                user: payer.publicKey,
              },
            }
          ),
          program.instruction.newLike(
            "4n6gSe7q3RHDBhw9yQBC8L9q5pLdjLTFUSrrXZsk2SUEgbM7FadQes1u9vA4nacsKaGpcBZ9WGhUcYTKoq87W65a",
            {
              accounts: {
                likes: likes,
                user: payer.publicKey,
              },
            }
          ),
        ],
        signers: [payer],
      }
    );
  });

  it("order the likes", async () => {
    //let add: anchor.Address = likes;
    let likesAccount = await program.account.likes.fetch(likes);
    let rawTransactions: any = likesAccount.transactions;
    let transactions: Transaction[] = Array.from(rawTransactions);
    trimEmptyLikes(transactions);

    let chronLikes = chronologicalTransactions(
      transactions,
      likesAccount.insertAt
    );
    printLikes(chronLikes);
    let reverse = reverseChronologicalTransactions(
      transactions,
      likesAccount.insertAt
    );
    printLikes(reverse);
  });

  const decodeTransactionSignature = (transactionSignature: Uint8Array) => {
    while (transactionSignature[transactionSignature.length - 1] === 0) {
      transactionSignature = transactionSignature.slice(0, -1);
    }
    return new TextDecoder("utf-8").decode(
      new Uint8Array(transactionSignature)
    );
  };

  const printLikes = (likedTxns: Transaction[]) => {
    console.log("[");
    likedTxns.forEach((tx, index) => {
      let decodedString = decodeTransactionSignature(tx.signature);
      let truncated =
        decodedString.slice(0, 5) +
        "..." +
        decodedString.slice(decodedString.length - 5);
      console.log(
        "index " +
          index +
          " transaction signature: { \n    " +
          truncated +
          "\n    },"
      );
    });
    console.log("]");
  };
  interface Transaction {
    signature: Uint8Array;
  }
  const zeroByteArray = Buffer.from(Array(88).fill(0));
  const trimEmptyLikes = (likedTxns: Transaction[]) => {
    while (
      Buffer.from(likedTxns[likedTxns.length - 1].signature).equals(
        zeroByteArray
      )
    ) {
      likedTxns.pop();
    }
    return likedTxns;
  };

  const chronologicalTransactions = (
    likedTxns: Transaction[],
    insert_index: number
  ) => {
    let firstSlice = likedTxns.slice(insert_index);
    let secondSlice = likedTxns.slice(0, insert_index);
    return firstSlice.concat(secondSlice);
  };

  const reverseChronologicalTransactions = (
    likedTxns: Transaction[],
    insert_index: number
  ) => chronologicalTransactions(likedTxns, insert_index).reverse();

  const doesLikeAccountExist = async (
    address: PublicKey,
    connection: web3.Connection
  ) => {
    let info = await connection.getAccountInfo(address);
    return info ? true : false;
  };

  //i want zeroes on the end of it because there won't be any zeroes in the string

  const addZeroes = (signature: string) => {
    while (signature.length < 88) {
      signature += "0";
    }
  };
});
