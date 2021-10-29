use anchor_lang::prelude::*;

declare_id!("Av2WRMKbkw1ircKXbxh9djiBUhJzasHEhXXHkcz3xVUw");

const LIKES_SEED: &[u8] = b"likes";
const LIKES_SIZE: u8 = 35;

#[program]
pub mod likes {
    use super::*;

    pub fn initialize_like_account(ctx: Context<InitializeLikeAccount>) -> ProgramResult {
        //do an emit probably
        // let mut likes_account = ctx.accounts.likes_account.load_init()?;
        // likes_account.insert_index = 0;
        // likes_account.likes = [Like {
        //     transaction_signature: [0; 88],
        // }; 35];
        Ok(())
    }

    pub fn perform_like(
        ctx: Context<PerformLike>,
        _like_account_bump: u8,
        new_like: String,
    ) -> ProgramResult {
        let mut likes_acct = ctx.accounts.likes_account.load_mut()?;
        Ok(())
    }
}

pub fn new_insert_index(previous: u8) -> u8 {
    if (previous + 1) == LIKES_SIZE {
        0
    } else {
        previous + 1
    }
}

#[derive(Accounts)]
pub struct InitializeLikeAccount<'info> {
    #[account(mut)]
    pub likes_account: Loader<'info, LikesAccount>,
}

#[account(zero_copy)]
pub struct LikesAccount {
    insert_index: u8,
    likes: [Like; 35],
}

#[zero_copy]
pub struct Like {
    pub transaction_signature: [u8; 88],
}

#[derive(Accounts)]
#[instruction(_like_account_bump: u8)]
pub struct PerformLike<'info> {
    #[account(mut)]
    pub performer: Signer<'info>,
    #[account(
        mut,
        seeds = [LIKES_SEED, performer.key().as_ref()],
        bump = _like_account_bump,
    )]
    likes_account: Loader<'info, LikesAccount>,
}

// #[zero_copy]
// pub struct Like {
//     pub transaction_signature: [u8; 88],
// }

// impl Likes {
//     fn append(&mut self, like: Like) {
//         self.likes[Likes::index_of(self.insert_index)] = like;
//         // if ChatRoom::index_of(self.head + 1) == ChatRoom::index_of(self.tail) {
//         //     self.tail += 1;
//         // }
//         self.insert_index += 1;
//     }
//     fn index_of(counter: u8) -> usize {
//         std::convert::TryInto::try_into(counter % 42).unwrap()
//     }
// }

// impl Default for Likes {
//     fn default() -> Likes {
//         // let default_like = Like {
//         //     transaction_signature: [0; 88],
//         // };
//         Likes {
//             insert_index: 0,
//             likes: [[0; 88]; 42],
//         }
//     }
// }

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
0_  1_  2_  3_  4_  5_  6_  7_  8_  9_

insert at 0, move insert index to 1
insert at 1, move insert index to 2
…continue
insert at 9, move insert index to 0
insert at 0, move insert index to 1 (at this point, the reverse chron order would be 0,9,8,7,6,5,4,3,2,1

*/

/*

use anchor_lang::prelude::*;

declare_id!("Av2WRMKbkw1ircKXbxh9djiBUhJzasHEhXXHkcz3xVUw");

const LIKES_SEED: &[u8] = b"likes";
const LIKES_SIZE: u8 = 42;

#[program]
pub mod likes {
    use super::*;

    pub fn initialize_like_account(
        ctx: Context<InitializeLikeAccount>,
        _like_account_bump: u8,
    ) -> ProgramResult {
        //do an emit probably
        let mut likes_account = ctx.accounts.likes_account.load_init()?;
        likes_account.insert_index = 0;
        likes_account.likes = [[0; 88]; 42];
        Ok(())
    }

    pub fn perform_like(
        ctx: Context<PerformLike>,
        _like_account_bump: u8,
        new_like: String,
    ) -> ProgramResult {
        let x = &ctx.accounts.likes_account;
        let z = std::mem::size_of_val(x);
        msg!("here is the size {}", z);
        let mut likes_acct = ctx.accounts.likes_account.load_mut()?;
        //let like_bytes = new_like.as_bytes();
        // let mut new_like = [0u8; 88];
        // new_like[..like_bytes.len()].copy_from_slice(like_bytes);
        // likes_account.append(Like {
        //     transaction_signature: new_like,
        // });
        // let like_bytes = new_like.as_bytes();
        // let mut new_like = [0u8; 88];
        // new_like[..like_bytes.len()].copy_from_slice(like_bytes);
        // let index = usize::from(like_account.insert_index);
        // let like = Like {
        //     transaction_signature: new_like,
        // };
        // like_account.likes[index] = like;
        // like_account.insert_index = new_insert_index(like_account.insert_index);
        Ok(())
    }
}

pub fn new_insert_index(previous: u8) -> u8 {
    if (previous + 1) == LIKES_SIZE {
        0
    } else {
        previous + 1
    }
}

#[derive(Accounts)]
#[instruction(_like_account_bump: u8)]
pub struct InitializeLikeAccount<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    // #[account(
    //     init,
    //     seeds = [LIKES_SEED, initializer.key().as_ref()],
    //     bump = _like_account_bump,
    //     payer = initializer
    // )]
    #[account(mut)]
    pub likes_account: Loader<'info, Likes>,
    pub system_program: Program<'info, System>,
}

#[account(zero_copy)]
pub struct Likes {
    insert_index: u8,
    likes: [[u8; 88]; 42],
}

#[derive(Accounts)]
#[instruction(_like_account_bump: u8)]
pub struct PerformLike<'info> {
    #[account(mut)]
    pub performer: Signer<'info>,
    #[account(
        mut,
        seeds = [LIKES_SEED, performer.key().as_ref()],
        bump = _like_account_bump,
    )]
    likes_account: Loader<'info, Likes>,
}

// #[zero_copy]
// pub struct Like {
//     pub transaction_signature: [u8; 88],
// }

// impl Likes {
//     fn append(&mut self, like: Like) {
//         self.likes[Likes::index_of(self.insert_index)] = like;
//         // if ChatRoom::index_of(self.head + 1) == ChatRoom::index_of(self.tail) {
//         //     self.tail += 1;
//         // }
//         self.insert_index += 1;
//     }
//     fn index_of(counter: u8) -> usize {
//         std::convert::TryInto::try_into(counter % 42).unwrap()
//     }
// }

// impl Default for Likes {
//     fn default() -> Likes {
//         // let default_like = Like {
//         //     transaction_signature: [0; 88],
//         // };
//         Likes {
//             insert_index: 0,
//             likes: [[0; 88]; 42],
//         }
//     }
// }

*/
