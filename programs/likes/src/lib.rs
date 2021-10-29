use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

const LIKES_SEED: &[u8] = b"likes";

#[program]
pub mod likes {
    use super::*;

    pub fn initialize_like_account(
        ctx: Context<InitializeLikeAccount>,
        _like_account_bump: u8,
    ) -> ProgramResult {
        Ok(())
    }

    pub fn perform_like(
        ctx: Context<PerformLike>,
        like_account_bump: u8,
        new_like: [u8; 1],
    ) -> ProgramResult {
        //so we are going to take the like string, and put it in the pda array at the insert index
        //also i have to figure out the default trait bc i want to set the default index to 9 at the beginning

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(_like_account_bump: u8)]
pub struct InitializeLikeAccount<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    #[account(
        init,
        seeds = [LIKES_SEED, initializer.key().as_ref()],
        bump = _like_account_bump,
        payer = initializer
    )]
    pub like_account: Account<'info, Likes>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct Likes {
    pub insert_index: u8,
    pub likes: [[u8; 1]; 10],
}

#[derive(Accounts)]
#[instruction(_like_account_bump: u8)]
pub struct PerformLike<'info> {
    #[account(mut)]
    pub performer: Signer<'info>,
    #[account(
        seeds = [LIKES_SEED, performer.key().as_ref()],
        bump = _like_account_bump,
    )]
    pub like_account: Account<'info, Likes>,
}

//so we don't want to init every time but only if the user doesn't have an account

// #[zero_copy]
// pub struct Like {
//     pub data: [u8; 280],
// }

/*'


so if we want to create a pda it has to be done inside our program because the create_account ix (https://docs.rs/solana-program/1.8.2/src/solana_program/system_instruction.rs.html#312)
requires that the pubkey of the new account be a signer
so i just need anotehr func that does nothing but create the like account



look in anchor chat program

#[zero_copy]
pub struct Message {
    pub from: Pubkey,
    pub data: [u8; 280],
}
*/

/*

insert at 9, move insert index to 8
insert at 8, move insert to 7
…continue
insert at 0, move insert index to 9
insert at 1, move insert index to 0 (at this point, the reverse chron order would be 1,2,3,4,5,6,7,8,9,0)

*/
