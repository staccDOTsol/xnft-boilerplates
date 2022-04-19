use crate::state::*;
use anchor_lang::prelud::*;
use anchor_spl::token::{Token, TokenAccount};

#[derive(Accounts)]
pub struct SwapV0<'info> {
  #[account(
    mut,
    has_one = base_mint,
    has_one = target_mint,
    has_one = base_storage,
    has_one = target_storage,
  )]
  pub token_conjoiner: Box<Account<'info, TokenConjoinerV0>>,
  pub base_mint: Box<Account<'info, Mint>>,
  #[account(mut)]
  pub target_mint: Box<Account<'info, Mint>>,
  #[account(mut)]
  pub base_storage: Box<Account<'info, TokenAccount>>,
  #[account(mut)]
  pub target_storage: Box<Account<'info, TokenAccount>>,
  pub token_program: Program<'info, Token>,
  pub clock: Sysvar<'info, Clock>,  
}