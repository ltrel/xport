import { parse, stringify } from "csv/browser/esm/sync";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { useState } from "react";
import UploadButton from "./UploadButton";
import { Button } from '@mui/material';
import { downloadStr, formatLocalYMD } from './util';

interface TradeRecord {
  date: Date;
  orderType: 'Buy' | 'Sell';
  sym: string,
  unitPrice: number,
  quantity: number,
  fees: number,
}

const initialTrades: TradeRecord[] = [
  {
    date: new Date(2017, 3, 2),
    orderType: 'Buy',
    sym: 'VAS',
    unitPrice: 97.31,
    quantity: 2,
    fees: 2
  },
  {
    date: new Date(2019, 5, 3),
    orderType: 'Sell',
    sym: 'VAS',
    unitPrice: 91.29,
    quantity: 1,
    fees: 0
  },
]

export default function TradeHistory() {
  const [trades, setTrades] = useState(initialTrades);

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', type: 'date' },
    { field: 'orderType', headerName: 'Order Type' },
    { field: 'sym', headerName: 'Symbol' },
    { field: 'unitPrice', headerName: 'Unit Price', type: 'number' },
    { field: 'quantity', headerName: 'Quantity', type: 'number' },
    { field: 'fees', headerName: 'Fees', type: 'number' },
    { field: 'total', headerName: 'Total', type: 'number' },
  ]

  const rows: GridRowsProp = trades.map((x, i) => ({
    ...x,
    id: i,
    total: x.unitPrice * x.quantity * (x.orderType === 'Buy' ? -1 : 1) - x.fees
  }));

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const newTrades: TradeRecord[] = parse(text, {
        columns: true,
        cast: (value, context) => {
          if (!context.header && context.column === 'date') {
            return new Date(value);
          }
          return value;
        },
      });
      setTrades(newTrades);
    }
    catch {
      console.log('Import error');  
    }
  };

  const handleExport = () => {
    const text = stringify(trades, {
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
