import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTable, useSortBy, usePagination, useGlobalFilter } from 'react-table';
import './App.css';

function HighlightTextCell({ value, searchText }) {
  if (!searchText || !value) {
    return <>{value}</>;
  }

  const parts = value.toString().split(new RegExp(`(${searchText})`, 'gi'));
  return (
    <>
      {parts.map((part, index) => (
        <span key={index} className={part.toLowerCase() === searchText.toLowerCase() ? 'highlight' : ''}>
          {part}
        </span>
      ))}
    </>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/api/customers').then((response) => {
      setData(response.data);
    }).catch((error) => {
      console.error('AxiosError:', error);
    });
  }, []);
  
  
  const columns = React.useMemo(
    () => [
      { Header: 'S.No.', accessor: 'sno' },
      { Header: 'Customer Name', accessor: 'customer_name', Cell: ({ value }) => <HighlightTextCell value={value} searchText={searchText} /> },
      { Header: 'Age', accessor: 'age' },
      { Header: 'Phone', accessor: 'phone' },
      { Header: 'Location', accessor: 'location', Cell: ({ value }) => <HighlightTextCell value={value} searchText={searchText} /> },
      {
        Header: 'Date',
        accessor: 'created_at',
        id: 'date',
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
        sortType: (rowA, rowB, columnId) => {
          const dateA = new Date(rowA.values[columnId]);
          const dateB = new Date(rowB.values[columnId]);
          return dateA.getTime() - dateB.getTime();
        },
      },
      {
        Header: 'Time',
        accessor: 'created_at',
        id: 'time',
        Cell: ({ value }) => new Date(value).toLocaleTimeString(),
        sortType: (rowA, rowB, columnId) => {
          const timeA = new Date(rowA.values[columnId]);
          const timeB = new Date(rowB.values[columnId]);
        
          const getSortableTime = (time) => {
            const hours = time.getHours();
            const minutes = time.getMinutes();
            return hours * 100 + minutes;
          };
        
          const sortableTimeA = getSortableTime(timeA);
          const sortableTimeB = getSortableTime(timeB);
        
          return sortableTimeA - sortableTimeB;
        },
        
      },
    ],
    [searchText]
  );



  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setGlobalFilter,
    setSortBy,
    state: { pageIndex,sortBy, globalFilter },
  } = useTable(
    { columns, data, initialState: { pageIndex: 0, pageSize: 20 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );
  const handleSortChange = (columnId) => {

    if (columnId === 'date' || columnId === 'time') {
 
      const newSortBy = sortBy[0]?.id === columnId && sortBy[0]?.desc === false
        ? [{ id: columnId, desc: true }]
        : [{ id: columnId, desc: false }];
  
     
      setSortBy(newSortBy);
    }
  };
  const handleSearch = () => {
    setGlobalFilter(searchText);
  };

  return (
    <div>
      <div className="header">
        <h1 className="main-heading">Explore Your Customer Universe</h1>
      </div>
      <div className="search">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by name or location"
        />
        <button onClick={handleSearch}>
          <span role="img" aria-label="Search">🔍</span>
        </button>
      </div>
      <table {...getTableProps()} style={{ borderSpacing: '0', width: '100%' }}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th
                {...column.getHeaderProps(column.getSortByToggleProps())}
                onClick={() => handleSortChange(column.id)} 
              >
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{column.render('Header')}</span>
                <span>
                  {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                
                {(column.id === 'date' || column.id === 'time') && (
      <button onClick={() => handleSortChange(column.id)}>
        Sort
      </button>
    )}
    </span>
    </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>  
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} className={cell.column.id === 'customer_name' || cell.column.id === 'location' ? 'highlight' : ''}>
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination">
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
       
      </div>
    </div>
  );
}

export default App;
