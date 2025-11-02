'use client'; // Mark this as a client component

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FilterPanel from '@/components/FilterPanel';
import BetSlip from '@/components/BetSlip';

const columns = [
  { field: 'sport', headerName: 'Sport', width: 150 },
  { field: 'match', headerName: 'Match', width: 300 },
  { field: 'odds', headerName: 'Odds', type: 'number', width: 120 },
  { field: 'value', headerName: 'Value (%)', type: 'number', width: 130 },
];

export default function DashboardPage() {
  const [rows, setRows] = useState([]); // Holds data to be displayed
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ sport: 'All', value: 2, search: '' });
  const [isPlacingBets, setIsPlacingBets] = useState(false);
  const [sortModel, setSortModel] = useState([{ field: 'value', sort: 'desc' }]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount] = useState(0);

  // Initialize selectionModel from localStorage
  const [selectionModel, setSelectionModel] = useState(() => {
    // This function runs only on the initial render
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const savedSelection = window.localStorage.getItem('betSlipSelection');
      return savedSelection ? JSON.parse(savedSelection) : [];
    } catch (error) {
      console.error('Error reading selection from localStorage:', error);
      return [];
    }
  });

  // Initialize stakes from localStorage
  const [betStakes, setBetStakes] = useState(() => {
    if (typeof window === 'undefined') {
      return {};
    }
    try {
      const savedStakes = window.localStorage.getItem('betStakes');
      return savedStakes ? JSON.parse(savedStakes) : {};
    } catch (error) {
      console.error('Error reading stakes from localStorage:', error);
      return {};
    }
  });


  // Effect to fetch data when filters change
  useEffect(() => {
    const fetchBets = async () => {
      setLoading(true);
      // Construct URL with query parameters from filters
      const params = new URLSearchParams({
        sport: filters.sport,
        value: filters.value,
        search: filters.search,
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
      });
      // Add sort model to params if it exists
      sortModel.forEach(item => {
        params.append('sortField', item.field);
        params.append('sortOrder', item.sort);
      });

      try {
        const response = await fetch(`/api/value-bets?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setRows(data.rows);
        setRowCount(data.totalRowCount);
      } catch (error) {
        console.error('Failed to fetch bets:', error);
        setRows([]); // Clear rows on error
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, [filters, sortModel, paginationModel]); // Re-run this logic when filters, sortModel, or paginationModel change

  // Effect to save selectionModel to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('betSlipSelection', JSON.stringify(selectionModel));

        // Clean up stakes: remove entries for bets that are no longer selected
        const newStakes = selectionModel.reduce((acc, id) => {
          if (betStakes[id] !== undefined) {
            acc[id] = betStakes[id];
          }
          return acc;
        }, {});
        setBetStakes(newStakes);

      } catch (error) {
        console.error('Error saving selection to localStorage:', error);
      }
    }
  }, [selectionModel]);

  // Effect to save betStakes to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('betStakes', JSON.stringify(betStakes));
      } catch (error) {
        console.error('Error saving stakes to localStorage:', error);
      }
    }
  }, [betStakes]);

  // Find the full row objects for the selected IDs
  const selectedBets = rows.filter((row) => selectionModel.includes(row.id));

  // Handler to remove a bet from the selection
  const handleRemoveBet = (betIdToRemove) => {
    setSelectionModel((prevSelection) => prevSelection.filter((id) => id !== betIdToRemove));
  };

  // Handler to update the stake for a specific bet
  const handleStakeChange = (betId, stake) => {
    setBetStakes((prevStakes) => ({ ...prevStakes, [betId]: stake }));
  };

  // Handler to clear all selected bets
  const handleClearAll = () => {
    setSelectionModel([]);
  };

  // Handler to "place" the bets
  const handlePlaceBets = async () => {
    setIsPlacingBets(true);

    const betsToPlace = selectedBets
      .map(bet => ({
        id: bet.id,
        match: bet.match,
        stake: parseFloat(betStakes[bet.id]) || 0,
      }))
      .filter(bet => bet.stake > 0);

    console.log('Placing bets payload:', betsToPlace);

    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betsToPlace),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place bets.');
      }

      alert(`${betsToPlace.length} bet(s) placed successfully!`);
      // Reset state after placing bets
      setSelectionModel([]);
    } catch (error) {
      console.error('Bet placement failed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsPlacingBets(false);
    }
  };

  return (
    <div>
      <h1>Betting Dashboard</h1>
      <FilterPanel filters={filters} setFilters={setFilters} />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: '20px', marginTop: '20px' }}>
        <Box sx={{ flex: { md: 3 }, height: 400 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            checkboxSelection
            onRowSelectionModelChange={(newSelectionModel) => {
              setSelectionModel(newSelectionModel);
            }}
            rowSelectionModel={selectionModel}
            sortingMode="server"
            onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
            sortModel={sortModel}
            paginationMode="server"
            onPaginationModelChange={setPaginationModel}
            paginationModel={paginationModel}
            rowCount={rowCount}
          />
        </Box>
        <Box sx={{ flex: { md: 1 } }}>
          <BetSlip
            selectedBets={selectedBets}
            betStakes={betStakes}
            onRemoveBet={handleRemoveBet}
            onClearAll={handleClearAll}
            onStakeChange={handleStakeChange}
            onPlaceBets={handlePlaceBets}
            isPlacingBets={isPlacingBets}
          />
        </Box>
      </Box>
    </div>
  );
}