import { NextResponse } from 'next/server';

// This function handles GET requests to /api/value-bets
export async function GET(request) {
  // In the future, this is where you'll fetch data from your database
  // or a third-party sports data API.
  const { searchParams } = request.nextUrl;
  const sport = searchParams.get('sport');
  const minValue = searchParams.get('value');
  const search = searchParams.get('search');
  const sortField = searchParams.get('sortField');
  const sortOrder = searchParams.get('sortOrder');
  const page = parseInt(searchParams.get('page') || '0', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  // Generate a larger mock dataset for pagination
  const sports = ['Football', 'Basketball', 'Tennis', 'Hockey', 'Baseball'];
  const mockData = Array.from({ length: 95 }, (_, i) => {
    const sport = sports[i % sports.length];
    return {
      id: i + 1,
      sport: sport,
      match: `${sport} Match ${i + 1}`,
      value: parseFloat((Math.random() * 15).toFixed(2)),
      odds: parseFloat((1.5 + Math.random() * 3).toFixed(2)),
    };
  });

  let filteredData = mockData;

  // Apply sport filter
  if (sport && sport !== 'All') {
    filteredData = filteredData.filter((bet) => bet.sport === sport);
  }

  // Apply value filter
  if (minValue) {
    filteredData = filteredData.filter((bet) => bet.value >= parseFloat(minValue));
  }

  // Apply search filter
  if (search) {
    filteredData = filteredData.filter((bet) => bet.match.toLowerCase().includes(search.toLowerCase()));
  }

  // Apply sorting
  if (sortField && sortOrder) {
    filteredData.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA < valB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  const totalRowCount = filteredData.length;

  // Apply pagination
  const paginatedData = filteredData.slice(page * pageSize, (page + 1) * pageSize);

  return NextResponse.json({
    rows: paginatedData,
    totalRowCount,
  });
}