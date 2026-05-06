use anchor_lang::prelude::*;

declare_id!("AEJgjbJf4GW67izumzv7hQotMQMihBaedyNQ9U898zG7");

#[program]
pub mod pqsdk {
    use super::*;

    pub fn init_vault(ctx: Context<InitVault>, commitment: [u8; 32]) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.dilithium_commitment = commitment;
        vault.bump = ctx.bumps.vault;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.vault.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.vault.to_account_info(),
            ],
        )?;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64, secret_hash: [u8; 32]) -> Result<()> {
        // 1. Verify the commitment hash
        let provided_commitment = anchor_lang::solana_program::hash::hash(&secret_hash).to_bytes();
        require!(
            ctx.accounts.vault.dilithium_commitment == provided_commitment,
            PQSDKError::InvalidDilithiumHash
        );

        let vault_info = ctx.accounts.vault.to_account_info();
        let user_info = ctx.accounts.user_wallet.to_account_info();

        // 2. Safety Check: Ensure the vault has enough SOL (including rent)
        let rent_exempt_minimum = Rent::get()?.minimum_balance(vault_info.data_len());
        let current_balance = vault_info.lamports();
        
        require!(
            current_balance >= amount + rent_exempt_minimum,
            PQSDKError::InsufficientFunds
        );

        // 3. THE FIX: Direct Lamport Adjustment
        // We bypass the System Program to avoid the "from must not carry data" error
        **vault_info.try_borrow_mut_lamports()? -= amount;
        **user_info.try_borrow_mut_lamports()? += amount;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitVault<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 1,
        seeds = [b"pqvault", user.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, VaultAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"pqvault", user.key().as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, VaultAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"pqvault", user_wallet.key().as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, VaultAccount>,
    #[account(mut)] // Must be mut to receive lamports
    pub user_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct VaultAccount {
    pub dilithium_commitment: [u8; 32],
    pub bump: u8,
}

#[error_code]
pub enum PQSDKError {
    #[msg("Invalid Dilithium hash")]
    InvalidDilithiumHash,
    #[msg("Insufficient funds in vault to maintain rent exemption")]
    InsufficientFunds,
}
