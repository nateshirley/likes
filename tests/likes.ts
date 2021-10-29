import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { PublicKey, Keypair } from "@solana/web3.js";
import { Likes } from "../target/types/likes";
import { assert } from "chai";
import * as Base58 from "base-58";

let likeAccount = null;
let likeAccountBump = null;
let payer = null;
const program = anchor.workspace.Likes as Program<Likes>;

describe("likes", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  let wallet: any = provider.wallet;
  payer = wallet.payer;

  // "ts-mocha -p ./tsconfig.json -t 1000000 tests/*.ts"
  //it would probably be better to just do a
  //separate create like account func and then assume the user has an account if they are trying to like something
  it("config", async () => {
    //   await provider.connection.confirmTransaction(
    //     await provider.connection.requestAirdrop(
    //       payer.publicKey,
    //       5 * web3.LAMPORTS_PER_SOL
    //     ),
    //     "confirmed"
    //   );

    let [_likeAccount, _likeAccountBump] =
      await web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode("likes"), payer.publicKey.toBuffer()],
        program.programId
      );
    likeAccount = _likeAccount;
    likeAccountBump = _likeAccountBump;
  });

  it("do some likes", async () => {
    let byteArray = anchor.utils.bytes.utf8.encode("j");
    let likeString = Array.from(byteArray);
    let five =
      "oj6h1R25WFoKieAuaoQo6vb3viFotYfRnw5RMgKBkyDPqJxQSE1hqXN7vgmbmCT4yMNFUTkGNBCnPsJTUKQBDL5";
    if (!(await doesLikeAccountExist(likeAccount, provider.connection))) {
      const init = await program.rpc.initializeLikeAccount(likeAccountBump, {
        accounts: {
          initializer: payer.publicKey,
          likeAccount: likeAccount,
          systemProgram: web3.SystemProgram.programId,
        },
        signers: [payer],
      });
    }
    const tx = await program.rpc.performLike(likeAccountBump, five, {
      accounts: {
        performer: payer.publicKey,
        likeAccount: likeAccount,
      },
      instructions: [
        program.instruction.performLike(
          likeAccountBump,
          "45rycqGrhNJUFuTaTHDUcUxGztUmMg3mgRo8zupyMVUFG6Nkgwvqtwa1GwviE1faxAVScSgypkTpgji4V75fmzWt",
          {
            accounts: {
              performer: payer.publicKey,
              likeAccount: likeAccount,
            },
          }
        ),
        program.instruction.performLike(
          likeAccountBump,
          "3oFpJxV9wLRcmNHR6RRNqUEjWQrPKDHad48oQENuhtNoJAvx4y8buPeTpBGZPDZYMwUoMUiNvxMYU6Qvz5TY4Y7j",
          {
            accounts: {
              performer: payer.publicKey,
              likeAccount: likeAccount,
            },
          }
        ),
        program.instruction.performLike(
          likeAccountBump,
          "4D2S5QNDurq9aBbSSHWK3DxVkLLSRuEab4ZGgD9owU4njtGnRjNeMnxiP3GRZEXVNeLMhzNEGx6iun6Ycp5LcN3z",
          {
            accounts: {
              performer: payer.publicKey,
              likeAccount: likeAccount,
            },
          }
        ),
        program.instruction.performLike(
          likeAccountBump,
          "4n6gSe7q3RHDBhw9yQBC8L9q5pLdjLTFUSrrXZsk2SUEgbM7FadQes1u9vA4nacsKaGpcBZ9WGhUcYTKoq87W65a",
          {
            accounts: {
              performer: payer.publicKey,
              likeAccount: likeAccount,
            },
          }
        ),
      ],
      signers: [payer],
    });
  });

  // it("all the likes", async () => {
  //   let byteArray = anchor.utils.bytes.utf8.encode("9");
  //   let likeString = Array.from(byteArray);
  //   const tx2 = await program.rpc.performLike(likeAccountBump, likeString, {
  //     accounts: {
  //       performer: payer.publicKey,
  //       likeAccount: likeAccount,
  //     },
  //     signers: [payer],
  //   });
  // });

  it("order the likes", async () => {
    let newLikeAccount = await program.account.likes.fetch(likeAccount);
    let rawLikes: any = newLikeAccount.likes;
    let likes: Like[] = Array.from(rawLikes);
    trimEmptyLikes(likes);

    let chronLikes = chronologicalLikes(likes, newLikeAccount.insertIndex);
    printLikes(chronLikes);
    let reverse = reverseChronologicalLikes(likes, newLikeAccount.insertIndex);
    //printLikes(reverse);
  });
});

const decodeTransactionSignature = (transactionSignature: Uint8Array) => {
  while (transactionSignature[transactionSignature.length - 1] === 0) {
    transactionSignature = transactionSignature.slice(0, -1);
  }
  return new TextDecoder("utf-8").decode(new Uint8Array(transactionSignature));
};

const printLikes = (likes: Like[]) => {
  console.log("[");
  likes.forEach((like, index) => {
    let decodedString = decodeTransactionSignature(like.transactionSignature);
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
interface Like {
  transactionSignature: Uint8Array;
}
const zeroByteArray = Buffer.from(Array(88).fill(0));
const trimEmptyLikes = (likes: Like[]) => {
  while (
    Buffer.from(likes[likes.length - 1].transactionSignature).equals(
      zeroByteArray
    )
  ) {
    likes.pop();
  }
  return likes;
};

const chronologicalLikes = (likes: Like[], insert_index: number) => {
  let firstSlice = likes.slice(insert_index);
  let secondSlice = likes.slice(0, insert_index);
  return firstSlice.concat(secondSlice);
};

const reverseChronologicalLikes = (likes: Like[], insert_index: number) =>
  chronologicalLikes(likes, insert_index).reverse();

const doesLikeAccountExist = async (
  likeAccountAddress: PublicKey,
  connection: web3.Connection
) => {
  let info = await connection.getAccountInfo(likeAccountAddress);
  return info ? true : false;
};

//i want zeroes on the end of it because there won't be any zeroes in the string

const eigthLikeInstructions = () => {
  return [
    program.instruction.performLike(
      likeAccountBump,
      Array.from(anchor.utils.bytes.utf8.encode("1")),
      {
        accounts: {
          performer: payer.publicKey,
          likeAccount: likeAccount,
        },
      }
    ),
    program.instruction.performLike(
      likeAccountBump,
      Array.from(anchor.utils.bytes.utf8.encode("2")),
      {
        accounts: {
          performer: payer.publicKey,
          likeAccount: likeAccount,
        },
      }
    ),
    program.instruction.performLike(
      likeAccountBump,
      Array.from(anchor.utils.bytes.utf8.encode("3")),
      {
        accounts: {
          performer: payer.publicKey,
          likeAccount: likeAccount,
        },
      }
    ),
    program.instruction.performLike(
      likeAccountBump,
      Array.from(anchor.utils.bytes.utf8.encode("4")),
      {
        accounts: {
          performer: payer.publicKey,
          likeAccount: likeAccount,
        },
      }
    ),
    program.instruction.performLike(
      likeAccountBump,
      Array.from(anchor.utils.bytes.utf8.encode("5")),
      {
        accounts: {
          performer: payer.publicKey,
          likeAccount: likeAccount,
        },
      }
    ),
    program.instruction.performLike(
      likeAccountBump,
      Array.from(anchor.utils.bytes.utf8.encode("6")),
      {
        accounts: {
          performer: payer.publicKey,
          likeAccount: likeAccount,
        },
      }
    ),
    program.instruction.performLike(
      likeAccountBump,
      Array.from(anchor.utils.bytes.utf8.encode("7")),
      {
        accounts: {
          performer: payer.publicKey,
          likeAccount: likeAccount,
        },
      }
    ),
    program.instruction.performLike(
      likeAccountBump,
      Array.from(anchor.utils.bytes.utf8.encode("8")),
      {
        accounts: {
          performer: payer.publicKey,
          likeAccount: likeAccount,
        },
      }
    ),
  ];
};

const addZeroes = (signature: string) => {
  while (signature.length < 88) {
    signature += "0";
  }
};

/*

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



  it("more likes", async () => {
    let byteArray = anchor.utils.bytes.utf8.encode("n");
    let likeString = Array.from(byteArray);
    const tx2 = await program.rpc.performLike(likeAccountBump, likeString, {
      accounts: {
        performer: payer.publicKey,
        likeAccount: likeAccount,
      },
      instructions: [
        program.instruction.performLike(
          likeAccountBump,
          Array.from(anchor.utils.bytes.utf8.encode("1")),
          {
            accounts: {
              performer: payer.publicKey,
              likeAccount: likeAccount,
            },
          }
        ),
      ],
      signers: [payer],
    });
  });


    it("all the likes", async () => {
    let byteArray = anchor.utils.bytes.utf8.encode("9");
    let likeString = Array.from(byteArray);
    const tx2 = await program.rpc.performLike(likeAccountBump, likeString, {
      accounts: {
        performer: payer.publicKey,
        likeAccount: likeAccount,
      },
      instructions: eigthLikeInstructions(),
      signers: [payer],
    });
  });
  */
