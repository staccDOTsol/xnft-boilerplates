use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Token account not owned by the claim approver")]
    InvalidPaymentTokenAccount,
    #[msg("Invalid issuer")]
    InvalidIssuer,
    #[msg("Token account not owned by the issuer")]
    InvalidPayerTokenAccount,
    #[msg("Invalid token manager for this claim approver")]
    InvalidIssuerTokenAccount,
    #[msg("Invalid token manager for this claim approver")]
    InvalidTokenManager,
    #[msg("Expiration has not passed yet")]
    InvalidExpiration,
    #[msg("Invalid time invalidator")]
    InvalidTimeInvalidator,
    #[msg("Invalid instruction")]
    InvalidInstruction,
    #[msg("Max expiration exceeded")]
    InvalidExtendExpiration,
    #[msg("Invalid payment mint on time invalidator")]
    InvalidPaymentMint,
    #[msg("Invalid extension partial duration not allowed")]
    InvalidExtensionAmount,
    #[msg("Token account incorrect mint")]
    InvalidPaymentManagerTokenAccount,
    #[msg("Invalid collector")]
    InvalidCollector,
    #[msg("Account discriminator is incorrect")]
    AccountDiscriminatorMismatch,
    #[msg("Invalid token manager state for resetting expiration")]
    InvalidTokenManagerState,
    #[msg("Invalid payment manager program")]
    InvalidPaymentManagerProgram,
    #[msg("Invalid payment manager")]
    InvalidPaymentManager,
}
