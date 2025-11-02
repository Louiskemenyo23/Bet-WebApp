'use client';

import { Box, FormControl, InputLabel, Select, MenuItem, Slider, Typography, TextField } from '@mui/material';

// A list of sports to show in the filter.
// In a real app, you might generate this dynamically from the data.
const sports = ['All', 'Football', 'Basketball', 'Tennis'];

export default function FilterPanel({ filters, setFilters }) {
  const handleSportChange = (event) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      sport: event.target.value,
    }));
  };

  const handleValueChange = (event, newValue) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      value: newValue,
    }));
  };

  const handleSearchChange = (event) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      search: event.target.value,
    }));
  };

  return (
    <Box sx={{ marginBottom: '20px', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: '16px' }}>
      <FormControl sx={{ minWidth: 150, width: { xs: '100%', sm: 150 } }}>
        <InputLabel id="sport-filter-label">Sport</InputLabel>
        <Select labelId="sport-filter-label" id="sport-select" value={filters.sport} label="Sport" onChange={handleSportChange}>
          {sports.map((sport) => (
            <MenuItem key={sport} value={sport}>{sport}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ width: { xs: '100%', sm: 300 }, paddingLeft: { sm: '16px' }, paddingRight: { sm: '16px' } }}>
        <Typography id="value-slider-label" gutterBottom>
          Min Value ({filters.value}%)
        </Typography>
        <Slider
          aria-labelledby="value-slider-label"
          value={filters.value}
          onChange={handleValueChange}
          step={0.5}
          min={0}
          max={15}
        />
      </Box>
      <TextField
        label="Search Match"
        variant="outlined"
        value={filters.search || ''}
        onChange={handleSearchChange}
        sx={{ width: { xs: '100%', sm: 'auto' } }}
      />
    </Box>
  );
}