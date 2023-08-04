import { z } from "zod";
import { parse, stringify } from "csv/browser/esm/sync";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { useState } from "react";
import UploadButton from "./UploadButton";
import { Box, Button } from '@mui/material';
import { downloadStr, formatLocalYMD } from './util';

interface TradeRecord {
  date: Date;
  orderType: 'Buy' | 'Sell';
  sym: string,
  unitPrice: number,
  quantity: number,
  fees: number,
}
const TradeRecordSchema = z.object({
  date: z.date(),
  orderType: z.enum(['Buy', 'Sell']),
  sym: z.string(),
  unitPrice: z.number(),
  quantity: z.number(),
  fees: z.number(),
})
const TradeArraySchema = z.array(TradeRecordSchema);

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
    { flex: 1, field: 'date', headerName: 'Date', type: 'date' },
    { flex: 1, field: 'orderType', headerName: 'Order Type' },
    { flex: 1, field: 'sym', headerName: 'Symbol' },
    { flex: 1, field: 'unitPrice', headerName: 'Unit Price', type: 'number' },
    { flex: 1, field: 'quantity', headerName: 'Quantity', type: 'number' },
    { flex: 1, field: 'fees', headerName: 'Fees', type: 'number' },
    { flex: 1, field: 'total', headerName: 'Total', type: 'number' },
  ]

  const rows: GridRowsProp = trades.map((x, i) => ({
    ...x,
    id: i,
    total: x.unitPrice * x.quantity * (x.orderType === 'Buy' ? -1 : 1) - x.fees
  }));

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const newTrades: unknown = parse(text, {
        columns: true,
        cast: (value, context) => {
          if (context.header) {
            return value;
          }
          else if (context.column === 'date') {
            return new Date(value);
          }
          else if (context.index > 2) {
            return Number(value);
          }
          return value;
        },
      });
      setTrades(TradeArraySchema.parse(newTrades));
    }
    catch(e) {
      alert('Error: file could not be imported')
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
    <Box>
      <UploadButton onUpload={handleImport}>Import CSV</UploadButton>
      <Button onClick={handleExport}>Export CSV</Button>
      <DataGrid columns={columns} rows={rows} />
    </Box>
  )
}
