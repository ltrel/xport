import { z } from "zod";
import { parse, stringify } from "csv/browser/esm/sync";
import { DataGrid, GridColDef, GridEventListener, GridRowEditStartParams, GridRowEditStopParams, GridRowEditStopReasons, GridRowModel, GridRowsProp, MuiEvent, useGridApiRef } from "@mui/x-data-grid";
import { useState } from "react";
import UploadButton from "./UploadButton";
import { Box, Button, Container, Stack } from '@mui/material';
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
  const apiRef = useGridApiRef();
  const [trades, setTrades] = useState(initialTrades);
  const [showNewRow, setShowNewRow] = useState(false);

  const columns: GridColDef[] = [
    { flex: 1, field: 'date', headerName: 'Date', type: 'date', editable: true },
    { flex: 1, field: 'orderType', headerName: 'Order Type', editable: true },
    { flex: 1, field: 'sym', headerName: 'Symbol', editable: true },
    { flex: 1, field: 'unitPrice', headerName: 'Unit Price', type: 'number', editable: true },
    { flex: 1, field: 'quantity', headerName: 'Quantity', type: 'number', editable: true },
    { flex: 1, field: 'fees', headerName: 'Fees', type: 'number', editable: true },
    { flex: 1, field: 'total', headerName: 'Total', type: 'number' },
  ]

  let rows: GridRowsProp = trades.map((x, i) => ({
    ...x,
    id: i,
    total: x.unitPrice * x.quantity * (x.orderType === 'Buy' ? -1 : 1) - x.fees
  }));
  if (showNewRow) {
    const newId = rows.length;
    rows = [...rows, {id: newId}];
  }

  const enterEditMode = () => {
    setShowNewRow(true);
    apiRef.current.startRowEditMode({id: trades.length});
  };

  const exitEditMode = () => {
    setShowNewRow(false);
  }

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

  const preventRowEditStart: GridEventListener<'rowEditStart'> = (_params: GridRowEditStartParams, event: MuiEvent) => {
    event.defaultMuiPrevented = true;
    return;
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params: GridRowEditStopParams, _event: MuiEvent) => {
    if (params.reason === GridRowEditStopReasons.escapeKeyDown) {
      exitEditMode();
      return;
    }
  };

  const processRowUpdate = (newRow: GridRowModel, _oldRow: GridRowModel) => {
    const {id, ...newTrade} = newRow;
    setTrades([...trades, TradeRecordSchema.parse(newTrade)]);
    exitEditMode();
    return newRow;
  };

  let addOrCancelButton;
  if (showNewRow) {
    addOrCancelButton = <Button
      variant='outlined'
      color='error'
      onClick={exitEditMode}
    >
      Cancel
    </Button>;
  }
  else {
    addOrCancelButton = <Button
      variant='outlined'
      color='primary'
      onClick={enterEditMode}
    >
      Add Trade
    </Button>;
  }

  return (
    <Container maxWidth='lg' disableGutters={true}>
      <Stack spacing={1}>
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
          {addOrCancelButton}
          <Stack direction='row'>
            <UploadButton onUpload={handleImport}>Import CSV</UploadButton>
            <Button onClick={handleExport}>Export CSV</Button>
          </Stack>
        </Box>
        <DataGrid
          apiRef={apiRef}
          columns={columns}
          rows={rows}
          editMode='row'
          onRowEditStop={handleRowEditStop}
          onRowEditStart={preventRowEditStart}
          processRowUpdate={processRowUpdate}
        />
      </Stack>
    </Container>
  )
}
