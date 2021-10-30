const anchor = require("@project-serum/anchor");
const { web3 } = anchor;
const { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } = web3;

describe("likes", () => {

    const provider = anchor.Provider.env();
    anchor.setProvider(provider);

    // Program client handle.
    const program = anchor.workspace.Likes;
    let payer = provider.wallet.payer;

    it('Is initialized!', async () => {

        let seed = "likes"
        let likes = await PublicKey.createWithSeed(payer.publicKey, seed, program.programId);
        await program.rpc.createLikesAccount({
            accounts: {
                likes: likes,
                user: payer.publicKey,
            },
            instructions: [
                SystemProgram.createAccountWithSeed({
                    basePubkey: payer.publicKey,
                    fromPubkey: payer.publicKey,
                    lamports: await provider.connection.getMinimumBalanceForRentExemption(program.account.likes.size),
                    newAccountPubkey: likes,
                    programId: program.programId,
                    seed: seed,
                    space: program.account.likes.size,
                })
            ],
            signers: [payer],
        });

        await program.rpc.newLike("oj6h1R25WFoKieAuaoQo6vb3viFotYfRnw5RMgKBkyDPqJxQSE1hqXN7vgmbmCT4yMNFUTkGNBCnPsJTUKQBDL5", {
            accounts: {
                likes: likes,
                user: payer.publicKey
            },
            signers: [
                payer
            ]
        })
    });


});