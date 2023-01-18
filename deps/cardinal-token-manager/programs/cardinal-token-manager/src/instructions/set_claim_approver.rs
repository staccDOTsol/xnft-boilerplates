use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(Accounts)]
pub struct SetClaimApproverCtx<'info> {
    #[account(mut, constraint = token_manager.state == TokenManagerState::Initialized as u8 @ ErrorCode::InvalidTokenManagerState)]
    token_manager: Box<Account<'info, TokenManager>>,

    // issuer
    #[account(mut, constraint = issuer.key() == token_manager.issuer @ ErrorCode::InvalidIssuer)]
    issuer: Signer<'info>,
}

pub fn handler(ctx: Context<SetClaimApproverCtx>, claim_approver: Pubkey) -> Result<()> {
    // set token manager data
    let token_manager = &mut ctx.accounts.token_manager;
    token_manager.claim_approver = Some(claim_approver);
    Ok(())
}
