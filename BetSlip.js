'use client';

import { Box, Typography, List, ListItem, ListItemText, Button, Paper, IconButton, TextField, Divider, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function BetSlip({ selectedBets, betStakes, onRemoveBet, onClearAll, onStakeChange, onPlaceBets, isPlacingBets }) {
  const hasBets = selectedBets.length > 0;

  // Calculate totals
  const { totalStake, totalPayout } = selectedBets.reduce((totals, bet) => {
    const stake = parseFloat(betStakes[bet.id]) || 0;
    if (stake > 0) { // Only include positive stakes in totals
      totals.totalStake += stake;
      totals.totalPayout += stake * bet.odds;
    }
    return totals;
  }, { totalStake: 0, totalPayout: 0 });

  return (
    <Paper elevation={3} sx={{ padding: '16px', height: '400px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          Bet Slip
        </Typography>
        {hasBets && (
          <Button size="small" onClick={onClearAll}>
            Clear All
          </Button>
        )}
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'auto', mt: 1 }}>
        {hasBets ? (
          <List dense>
            {selectedBets.map((bet) => {
              const stakeValue = betStakes[bet.id];
              const isInvalid = stakeValue !== undefined && stakeValue !== '' && parseFloat(stakeValue) < 0;

              return (
                <ListItem
                  key={bet.id}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', pt: 1, pb: 2 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <ListItemText
                      primary={`${bet.match} @ ${bet.odds.toFixed(2)}`}
                      secondary={`Sport: ${bet.sport} | Value: ${bet.value}%`}
                    />
                    <IconButton edge="end" aria-label="delete" onClick={() => onRemoveBet(bet.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField
                    label="Stake"
                    type="number"
                    size="small"
                    variant="outlined"
                    value={stakeValue || ''}
                    onChange={(e) => onStakeChange(bet.id, e.target.value)}
                    sx={{ mt: 1, width: '100px' }}
                    error={isInvalid}
                    helperText={isInvalid ? 'Positive only' : ''}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Select bets from the table to add them here.
          </Typography>
        )}
      </Box>
      {hasBets && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ p: 1 }}>
            <Typography variant="body1">Total Stake: <strong>${totalStake.toFixed(2)}</strong></Typography>
            <Typography variant="body1">Potential Payout: <strong>${totalPayout.toFixed(2)}</strong></Typography>
          </Box>
          <Button variant="contained" color="primary" onClick={onPlaceBets} sx={{ mt: 1 }} disabled={totalStake === 0 || isPlacingBets}>
            {isPlacingBets ? <CircularProgress size={24} color="inherit" /> : 'Place Bets'}
          </Button>
        </>
      )}
    </Paper>
  );
}