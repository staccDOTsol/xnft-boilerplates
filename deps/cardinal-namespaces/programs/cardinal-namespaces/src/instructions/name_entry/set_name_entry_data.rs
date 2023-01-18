use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::TokenAccount,
    cardinal_token_manager::{
        self,
        state::{TokenManager, TokenManagerState},
    },
};

#[derive(Accounts)]
pub struct SetEntryDataV2Ctx<'info> {
    namespace: Box<Account<'info, Namespace>>,
    #[account(mut)]
    name_entry: Box<Account<'info, Entry>>,

    #[account(constraint =
        user_token_account.mint == name_entry.mint
        && user_token_account.owner == user.key()
        && user_token_account.amount > 0
        @ ErrorCode::InvalidOwnerMint
    )]
    user_token_account: Box<Account<'info, TokenAccount>>,
    #[account(constraint =
        token_manager.mint == name_entry.mint
        && token_manager.issuer == namespace.key()
        && token_manager.state != TokenManagerState::Invalidated as u8
        @ ErrorCode::InvalidTokenManager
    )]
    token_manager: Box<Account<'info, TokenManager>>,

    #[account(mut)]
    user: Signer<'info>,
}

pub fn handler(ctx: Context<SetEntryDataV2Ctx>) -> Result<()> {
    let name_entry = &mut ctx.accounts.name_entry;
    name_entry.data = Some(ctx.accounts.user.key());
    Ok(())
}
