use anchor_lang::prelude::*;

declare_id!("Av2WRMKbkw1ircKXbxh9djiBUhJzasHEhXXHkcz3xVUw");

const LIKES_CAPACITY: u8 = 200;

#[program]
pub mod likes {
    use super::*;

    pub fn create_likes_account(ctx: Context<CreateLikesAccount>) -> ProgramResult {
        let mut likes = ctx.accounts.likes.load_init()?;
        likes.insert_at = 0;
        likes.transactions = [Transaction { signature: [0; 88] }; 200];
        verify_likes_address(ctx.accounts.likes.key(), ctx.accounts.user.key());
        Ok(())
    }
    pub fn new_like(ctx: Context<NewLike>, tx_signature: String) -> ProgramResult {
        let mut likes = ctx.accounts.likes.load_mut()?;
        verify_likes_address(ctx.accounts.likes.key(), ctx.accounts.user.key());

        let new_transaction = new_transaction(tx_signature);
        let insert_at = usize::from(likes.insert_at);
        likes.transactions[insert_at] = new_transaction;
        likes.insert_at = next_insert_index(likes.insert_at);
        Ok(())
    }
}

pub fn verify_likes_address(likes: Pubkey, user: Pubkey) {
    if likes != expected_likes_address(user) {
        msg!("wrong likes account, doesn't belong to given user");
        panic!();
    }
}
pub fn expected_likes_address(base: Pubkey) -> Pubkey {
    Pubkey::create_with_seed(&base, "likes", &id()).unwrap()
}

pub fn next_insert_index(previous: u8) -> u8 {
    if (previous + 1) == LIKES_CAPACITY {
        0
    } else {
        previous + 1
    }
}
fn new_transaction(tx_signature: String) -> Transaction {
    let signature_bytes = tx_signature.as_bytes();
    let mut new_signature = [0u8; 88];
    new_signature[..signature_bytes.len()].copy_from_slice(signature_bytes);
    Transaction {
        signature: new_signature,
    }
}

#[derive(Accounts)]
pub struct NewLike<'info> {
    #[account(mut)]
    likes: Loader<'info, Likes>,
    user: Signer<'info>,
}
#[derive(Accounts)]
pub struct CreateLikesAccount<'info> {
    #[account(zero)]
    likes: Loader<'info, Likes>,
    user: Signer<'info>,
}
#[account(zero_copy)]
pub struct Likes {
    insert_at: u8,
    transactions: [Transaction; 200],
}
#[zero_copy]
pub struct Transaction {
    pub signature: [u8; 88],
}
