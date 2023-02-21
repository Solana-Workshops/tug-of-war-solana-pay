use anchor_lang::prelude::*;

declare_id!("tugLiwCj74Nb5uNqtVgtoQ3x95Jhctz2RDRdLwmG9dF");

const CHEST_RENT: u64 = 946560;

#[program]
pub mod tug_of_war {

    use anchor_lang::system_program::{Transfer, transfer};

    use super::*;

    const MAX_POSITION: u16 = 20;
    const REWARD: u64 = 10000000;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        // This is not really needed but shows you how to access time.
        let clock = Clock::get().unwrap();
        msg!("Timestamp: {}!", clock.unix_timestamp);
        Ok(())
    }

    pub fn restart_game(ctx: Context<Restart>) -> Result<()> {
        let game_data_account = &mut ctx.accounts.game_data_account;

        if game_data_account.player_position > 0 && game_data_account.player_position < MAX_POSITION {
        // Program can be restarted any time currently to be able to add more reward to the chest.
        // If you want the game to be restarted only after it is over, uncomment the panic below.
        //    panic!("Cant restart game, game is still running!");
        }

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.signer.to_account_info().clone(),
                to: ctx.accounts.chest_vault.to_account_info().clone(),
            },
        );

        transfer(cpi_context, REWARD)?;

        game_data_account.player_position = MAX_POSITION / 2;
        Ok(())
    }

    pub fn pull_left(ctx: Context<MoveLeft>) -> Result<()> {
        let game_data_account = &mut ctx.accounts.game_data_account;
        
        if game_data_account.player_position <= 0 || game_data_account.player_position >= MAX_POSITION {
            panic!("Cant pull left, game is over!");
        }

        if game_data_account.player_position == 1 {
            // The game can be restarted more than once to add more money to the chest.
            // So we take all the sol out of the chest but have to leave enough sol in it to pay the rent.
            pay_out_rewards(ctx.accounts.chest_vault.clone(), ctx.accounts.signer.clone())?;      
            game_data_account.player_position -= 1;
            display_game(game_data_account.player_position);
        } else if game_data_account.player_position <= 0 {
            msg!("Team Left won! \\o/");
            display_game(game_data_account.player_position);
        } else {
            game_data_account.player_position -= 1;
            display_game(game_data_account.player_position);
        }
        Ok(())
    }

    pub fn pull_right(ctx: Context<MoveRight>) -> Result<()> {
        let game_data_account = &mut ctx.accounts.game_data_account;

        if game_data_account.player_position <= 0 || game_data_account.player_position >= MAX_POSITION {
            panic!("Cant pull right, game is over!");
        }

        if game_data_account.player_position == MAX_POSITION -1 {
            pay_out_rewards(ctx.accounts.chest_vault.clone(), ctx.accounts.signer.clone())?;    
            game_data_account.player_position += 1;
            display_game(game_data_account.player_position);
       } else
        if game_data_account.player_position >= MAX_POSITION {
            msg!("Team Right won! \\o/");
            display_game(game_data_account.player_position);
        } else {
            game_data_account.player_position = game_data_account.player_position + 1;
            display_game(game_data_account.player_position);
        }
        Ok(())
    }
}

pub fn pay_out_rewards(from: Account<ChestAccount>, to: Signer) -> Result<()> {
    // The game can be restarted more than once to add more money to the chest.
    // So we take all the sol out of the chest but have to leave enough sol in it to pay the rent.
    let current_lamports = from.to_account_info().lamports();
    let amount_that_can_be_payed_out = current_lamports - CHEST_RENT;
    **from
        .to_account_info()
        .try_borrow_mut_lamports()? -= amount_that_can_be_payed_out;
    **to
        .to_account_info()
        .try_borrow_mut_lamports()? += amount_that_can_be_payed_out;   

    Ok(())
}

fn display_game(position: u16) -> &'static str{
    match position {
          0 => "\\o/-------|-------OOO____________________",
          1 => "_ooo-------|-------OOO___________________",
          2 => "__ooo-------|-------OOO__________________",
          3 => "___ooo-------|-------OOO_________________",
          4 => "____ooo-------|-------OOO________________",
          5 => "_____ooo-------|-------OOO_______________",
          6 => "______ooo-------|-------OOO______________",
          7 => "_______ooo-------|-------OOO_____________",
          8 => "________ooo-------|-------OOO____________",
          9 => "_________ooo-------|-------OOO___________",
         10 => "__________ooo-------|-------OOO__________",
         11 => "___________ooo-------|-------OOO_________",
         12 => "____________ooo-------|-------OOO________",
         13 => "_____________ooo-------|-------OOO_______",
         14 => "______________ooo-------|-------OOO______",
         15 => "_______________ooo-------|-------OOO_____",
         16 => "________________ooo-------|-------OOO____",
         17 => "_________________ooo-------|-------OOO___",
         18 => "__________________ooo-------|-------OOO__",
         19 => "___________________ooo-------|-------OOO_",
         20 => "____________________ooo-------|-------\\o/",
        _ => "",
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // We must specify the space in order to initialize an account.
    // First 8 bytes are default account discriminator,
    // next 2 byte come from NewAccount.data being type i16.
    // (u16 = 16 bits signed integer = 8 bytes)
    #[account(
        init_if_needed,
        seeds = [b"tug_of_war"],
        bump,
        payer = signer,
        space = 8 + 2
    )]
    pub new_game_data_account: Account<'info, GameDataAccount>,
    #[account(
        init_if_needed,
        seeds = [b"chest"],
        bump,
        payer = signer,
        space = 8
    )]
    pub chest_vault: Account<'info, ChestAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MoveLeft<'info> {
    #[account(mut, seeds = [b"tug_of_war"], bump)]
    pub game_data_account: Account<'info, GameDataAccount>,
    #[account(mut, seeds = [b"chest"], bump)]
    pub chest_vault: Account<'info, ChestAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct MoveRight<'info> {
    #[account(mut, seeds = [b"tug_of_war"], bump)]
    pub game_data_account: Account<'info, GameDataAccount>,
    #[account(mut, seeds = [b"chest"], bump)]
    pub chest_vault: Account<'info, ChestAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct Restart<'info> {
    #[account(mut, seeds = [b"tug_of_war"], bump)]
    pub game_data_account: Account<'info, GameDataAccount>,
    #[account(mut, seeds = [b"chest"], bump)]
    pub chest_vault: Account<'info, ChestAccount>,
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct GameDataAccount {
    pub player_position: u16,
}

#[account]
pub struct ChestAccount {
}
