use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::{prelude::*, solana_program::program::invoke_signed, AccountsClose},
    anchor_spl::token::{self, CloseAccount, Mint, ThawAccount, Token, TokenAccount, Transfer},
    mpl_token_metadata::{instruction::thaw_delegated_account, utils::assert_derivation},
};

#[derive(Accounts)]
pub struct InvalidateCtx<'info> {
    #[account(mut)]
    token_manager: Box<Account<'info, TokenManager>>,
    #[account(mut, constraint =
        token_manager_token_account.owner == token_manager.key()
        && token_manager_token_account.mint == token_manager.mint
        @ ErrorCode::InvalidTokenManagerTokenAccount
    )]
    token_manager_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, constraint = mint.key() == token_manager.mint @ ErrorCode::InvalidMint)]
    mint: Box<Account<'info, Mint>>,

    // recipient
    #[account(mut, constraint = recipient_token_account.key() == token_manager.recipient_token_account @ ErrorCode::InvalidRecipientTokenAccount)]
    recipient_token_account: Box<Account<'info, TokenAccount>>,

    // invalidator
    #[account(constraint =
        token_manager.invalidators.contains(&invalidator.key())
        || ((token_manager.invalidation_type == InvalidationType::Return as u8
            || token_manager.invalidation_type == InvalidationType::Reissue as u8)
        && recipient_token_account.owner == invalidator.key())
        @ ErrorCode::InvalidInvalidator
    )]
    invalidator: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    collector: AccountInfo<'info>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}

pub fn handler<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, InvalidateCtx<'info>>) -> Result<()> {
    let token_manager = &mut ctx.accounts.token_manager;
    let remaining_accs = &mut ctx.remaining_accounts.iter();

    // get PDA seeds to sign with
    let mint = token_manager.mint;
    let token_manager_seeds = &[TOKEN_MANAGER_SEED.as_bytes(), mint.as_ref(), &[token_manager.bump]];
    let token_manager_signer = &[&token_manager_seeds[..]];

    if token_manager.state == TokenManagerState::Claimed as u8 {
        if token_manager.kind == TokenManagerKind::Managed as u8 {
            let mint_manager_info = next_account_info(remaining_accs)?;
            // update mint manager
            let mut mint_manager = Account::<MintManager>::try_from(mint_manager_info)?;
            mint_manager.token_managers = mint_manager.token_managers.checked_sub(1).expect("Sub error");
            mint_manager.exit(ctx.program_id)?;

            let path = &[MINT_MANAGER_SEED.as_bytes(), mint.as_ref()];
            let bump_seed = assert_derivation(ctx.program_id, mint_manager_info, path)?;
            let mint_manager_seeds = &[MINT_MANAGER_SEED.as_bytes(), mint.as_ref(), &[bump_seed]];
            let mint_manager_signer = &[&mint_manager_seeds[..]];

            // thaw recipient account
            let cpi_accounts = ThawAccount {
                account: ctx.accounts.recipient_token_account.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                authority: mint_manager_info.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(mint_manager_signer);
            token::thaw_account(cpi_context)?;
        } else if token_manager.kind == TokenManagerKind::Edition as u8 {
            let edition_info = next_account_info(remaining_accs)?;
            let metadata_program = next_account_info(remaining_accs)?;
            // edition will be validated by metadata_program
            if metadata_program.key() != mpl_token_metadata::id() {
                return Err(error!(ErrorCode::InvalidMetadataProgramId));
            }
            // assert_keys_eq!(metadata_program.key(), mpl_token_metadata::id());

            invoke_signed(
                &thaw_delegated_account(
                    *metadata_program.key,
                    token_manager.key(),
                    ctx.accounts.recipient_token_account.key(),
                    *edition_info.key,
                    ctx.accounts.mint.key(),
                ),
                &[
                    token_manager.to_account_info(),
                    ctx.accounts.recipient_token_account.to_account_info(),
                    edition_info.to_account_info(),
                    ctx.accounts.mint.to_account_info(),
                ],
                &[token_manager_seeds],
            )?;
        }
    }

    match token_manager.invalidation_type {
        t if t == InvalidationType::Return as u8 || token_manager.state == TokenManagerState::Issued as u8 => {
            // find receipt holder
            let return_token_account_info = next_account_info(remaining_accs)?;
            let return_token_account = Account::<TokenAccount>::try_from(return_token_account_info)?;
            if token_manager.receipt_mint == None {
                if return_token_account.owner != token_manager.issuer {
                    return Err(error!(ErrorCode::InvalidIssuerTokenAccount));
                }
            } else {
                let receipt_token_account_info = next_account_info(remaining_accs)?;
                let receipt_token_account = Account::<TokenAccount>::try_from(receipt_token_account_info)?;
                if !(receipt_token_account.mint == token_manager.receipt_mint.expect("No receipt mint") && receipt_token_account.amount > 0) {
                    return Err(error!(ErrorCode::InvalidReceiptMintAccount));
                }
                if receipt_token_account.owner != return_token_account.owner {
                    return Err(error!(ErrorCode::InvalidReceiptMintOwner));
                }
            }

            // transfer back to issuer or receipt holder
            let cpi_accounts = Transfer {
                from: ctx.accounts.recipient_token_account.to_account_info(),
                to: return_token_account_info.to_account_info(),
                authority: token_manager.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(token_manager_signer);
            token::transfer(cpi_context, token_manager.amount)?;

            // close token_manager_token_account
            let cpi_accounts = CloseAccount {
                account: ctx.accounts.token_manager_token_account.to_account_info(),
                destination: ctx.accounts.collector.to_account_info(),
                authority: token_manager.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(token_manager_signer);
            token::close_account(cpi_context)?;

            // close token_manager
            token_manager.state = TokenManagerState::Invalidated as u8;
            token_manager.state_changed_at = Clock::get().unwrap().unix_timestamp;
            token_manager.close(ctx.accounts.collector.to_account_info())?;
        }
        t if t == InvalidationType::Invalidate as u8 => {
            // close token_manager_token_account
            let cpi_accounts = CloseAccount {
                account: ctx.accounts.token_manager_token_account.to_account_info(),
                destination: ctx.accounts.collector.to_account_info(),
                authority: token_manager.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(token_manager_signer);
            token::close_account(cpi_context)?;

            // mark invalid
            token_manager.state = TokenManagerState::Invalidated as u8;
            token_manager.state_changed_at = Clock::get().unwrap().unix_timestamp;

            let required_lamports = ctx.accounts.rent.minimum_balance(token_manager.to_account_info().data_len());
            let token_manager_lamports = token_manager.to_account_info().lamports();
            if token_manager_lamports > required_lamports {
                let diff = token_manager_lamports.checked_sub(required_lamports).expect("Sub error");
                **token_manager.to_account_info().try_borrow_mut_lamports()? = required_lamports;
                **ctx.accounts.collector.to_account_info().try_borrow_mut_lamports()? = ctx.accounts.collector.to_account_info().lamports().checked_add(diff).expect("Add error");
            };
        }
        t if t == InvalidationType::Release as u8 => {
            // close token_manager_token_account
            let cpi_accounts = CloseAccount {
                account: ctx.accounts.token_manager_token_account.to_account_info(),
                destination: ctx.accounts.collector.to_account_info(),
                authority: token_manager.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(token_manager_signer);
            token::close_account(cpi_context)?;

            // close token_manager
            token_manager.state = TokenManagerState::Invalidated as u8;
            token_manager.state_changed_at = Clock::get().unwrap().unix_timestamp;
            token_manager.close(ctx.accounts.collector.to_account_info())?;
        }
        t if t == InvalidationType::Reissue as u8 => {
            // transfer back to token_manager
            let cpi_accounts = Transfer {
                from: ctx.accounts.recipient_token_account.to_account_info(),
                to: ctx.accounts.token_manager_token_account.to_account_info(),
                authority: token_manager.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(token_manager_signer);
            token::transfer(cpi_context, token_manager.amount)?;

            token_manager.state = TokenManagerState::Issued as u8;
            token_manager.recipient_token_account = ctx.accounts.token_manager_token_account.key();
            token_manager.state_changed_at = Clock::get().unwrap().unix_timestamp;

            let required_lamports = ctx.accounts.rent.minimum_balance(token_manager.to_account_info().data_len());
            let token_manager_lamports = token_manager.to_account_info().lamports();
            if token_manager_lamports > required_lamports {
                let diff = token_manager_lamports.checked_sub(required_lamports).expect("Sub error");
                **token_manager.to_account_info().try_borrow_mut_lamports()? = required_lamports;
                **ctx.accounts.collector.to_account_info().try_borrow_mut_lamports()? = ctx.accounts.collector.to_account_info().lamports().checked_add(diff).expect("Add error");
            };
        }
        _ => return Err(error!(ErrorCode::InvalidInvalidationType)),
    }

    Ok(())
}
