import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { parse, stringify } from "csv/browser/esm/sync";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { useState } from "react";
import UploadButton from "./UploadButton";
import { Button } from '@mui/material';
import { downloadStr, formatLocalYMD } from './util';


const initialRows: GridRowsProp = [
  {
    id: 1,
    date: new Date(2017, 3, 2),
    orderType: 'Buy',
    sym: 'VAS',
    unitPrice: 97.31,
    quantity: 2
  },
  {
    id: 2,
    date: new Date(2019, 5, 3),
    orderType: 'Sell',
    sym: 'VAS',
    unitPrice: 91.29,
    quantity: 1
  },
]

export default function TradeHistory() {
  const [rows, setRows] = useState(initialRows);

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', type: 'date' },
    { field: 'orderType', headerName: 'Order Type' },
    { field: 'sym', headerName: 'Symbol' },
    { field: 'unitPrice', headerName: 'Unit Price', type: 'number' },
    { field: 'quantity', headerName: 'Quantity', type: 'number' },
  ]

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const records: [Object] = parse(text, {
        columns: true,
        cast: (value, context) => {
          if (!context.header && context.column === 'date') {
            return new Date(value);
          }
          return value;
        },
      });
      const newRows = records.map((x, i) => ({...x, id: i}));
      setRows(newRows);
    }
    catch {
      console.log('Import error');  
    }
  };

  const handleExport = () => {
    const withoutIds = rows.map(({id, ...rest}) => rest);
    const text = stringify([...withoutIds], {
      header: true,
      cast: { date: (value) => formatLocalYMD(value) }
    });
    downloadStr(text, 'xport.csv');
  };

  return (
    <>
      <UploadButton onUpload={handleImport}>Import CSV</UploadButton>
      <Button onClick={handleExport}>Export CSV</Button>
      <DataGrid columns={columns} rows={rows} />
    </>
  )
}
