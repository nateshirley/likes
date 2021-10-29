const anchor = require("@project-serum/anchor");
const { web3 } = anchor;
const { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } = web3;

describe("likes", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.Provider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Likes;

    let payer = provider.wallet.payer;
    let likeAccount = null;
    let likeAccountBump = null;


    it("init", async () => {

        let [_likeAccount, _likeAccountBump] =
            await web3.PublicKey.findProgramAddress(
                [anchor.utils.bytes.utf8.encode("likes"), payer.publicKey.toBuffer()],
                program.programId
            );
        likeAccount = _likeAccount;
        likeAccountBump = _likeAccountBump;

        if (!(await doesLikeAccountExist(likeAccount, provider.connection))) {
            const init = await program.rpc.initializeLikeAccount(likeAccountBump, {
                accounts: {
                    initializer: payer.publicKey,
                    likesAccount: likeAccount,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers: [payer],
            });
        }
        const tx = await program.rpc.performLike(likeAccountBump, "oj6h1R25WFoKieAuaoQo6vb3viFotYfRnw5RMgKBkyDPqJxQSE1hqXN7vgmbmCT4yMNFUTkGNBCnPsJTUKQBDL5", {
            accounts: {
                performer: payer.publicKey,
                likesAccount: likeAccount,
            },
            signers: [payer],
        });
    });

    const doesLikeAccountExist = async (
        likeAccountAddress,
        connection
    ) => {
        let info = await connection.getAccountInfo(likeAccountAddress);
        return info ? true : false;
    };

});
//instructions: [
    //         program.instruction.performLike(
    //             likeAccountBump,
    //             "45rycqGrhNJUFuTaTHDUcUxGztUmMg3mgRo8zupyMVUFG6Nkgwvqtwa1GwviE1faxAVScSgypkTpgji4V75fmzWt",
    //             {
    //                 accounts: {
    //                     performer: payer.publicKey,
    //                     likesAccount: likeAccount,
    //                 },
    //             }
    //         ),
    //     ],