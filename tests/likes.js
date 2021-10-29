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

        let likesAccount = web3.Keypair.generate();
        const init = await program.rpc.initializeLikeAccount({
            accounts: {
                likesAccount: likesAccount.publicKey
            },
            instructions: [
                await program.account.likesAccount.createInstruction(likesAccount),
            ],
            signers: [likesAccount],
        });


        // const tx = await program.rpc.performLike(likeAccountBump, "oj6h1R25WFoKieAuaoQo6vb3viFotYfRnw5RMgKBkyDPqJxQSE1hqXN7vgmbmCT4yMNFUTkGNBCnPsJTUKQBDL5", {
        //     accounts: {
        //         performer: payer.publicKey,
        //         likesAccount: likeAccount,
        //     },
        //     signers: [payer],
        // });
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