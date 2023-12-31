import { stringify } from 'csv/browser/esm/sync';
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridRowEditStartParams,
  GridRowEditStopParams,
  GridRowEditStopReasons,
  GridRowModel,
  GridRowParams,
  GridRowSelectionModel,
  GridRowsProp,
  MuiEvent,
  useGridApiRef,
} from '@mui/x-data-grid';
import { useState } from 'react';
import {
  Box, Button, Container, Stack,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import useSWR from 'swr';
import UploadButton from './UploadButton';
import { downloadStr, formatLocalYMD } from './util';
import {
  TradeRecordSchema, addTrades, deleteTrades, fetchTrades, tradesFromCSV,
} from './data/trade';

export default function TradeHistory() {
  const { enqueueSnackbar } = useSnackbar();
  const apiRef = useGridApiRef();
  const { data: trades, mutate: mutateTrades } = useSWR('api/trades', fetchTrades);
  const [showNewRow, setShowNewRow] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState<number[]>([]);

  if (trades === undefined) {
    return 'data not yet loaded';
  }

  const enterEditMode = () => {
    setShowNewRow(true);
    setRowSelectionModel([-1]);
    apiRef.current.startRowEditMode({ id: -1, fieldToFocus: 'date' });
  };

  const exitEditMode = () => {
    setRowSelectionModel([]);
    setShowNewRow(false);
  };

  const handleDelete = async () => {
    await deleteTrades(rowSelectionModel);
    await mutateTrades();
    setRowSelectionModel([]);
    enqueueSnackbar(`Deleted ${rowSelectionModel.length} trades`, { variant: 'success', preventDuplicate: true });
  };

  const handleImport = async (file: File) => {
    if (showNewRow) {
      apiRef.current.stopRowEditMode({ id: -1, ignoreModifications: true });
      exitEditMode();
    }
    try {
      const newTrades = await tradesFromCSV(file);
      await deleteTrades(trades.map((x) => x.id));
      await addTrades(newTrades);
      await mutateTrades();
      enqueueSnackbar('File imported successfully', { variant: 'success', preventDuplicate: true });
    } catch (e) {
      enqueueSnackbar('File import failed', { variant: 'error', preventDuplicate: true });
    }
  };

  const handleExport = () => {
    const text = stringify(trades, {
      header: true,
      cast: { date: (value) => formatLocalYMD(value) },
    });
    downloadStr(text, 'xport.csv');
    enqueueSnackbar('File exported successfully', { variant: 'success', preventDuplicate: true });
  };

  const preventRowEditStart: GridEventListener<'rowEditStart'> = (
    _params: GridRowEditStartParams,
    event: MuiEvent,
  ) => {
    const eventCopy = event;
    eventCopy.defaultMuiPrevented = true;
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params: GridRowEditStopParams,
  ) => {
    if (params.reason === GridRowEditStopReasons.escapeKeyDown) {
      exitEditMode();
    }
  };

  const handleSelectionChange = async (
    newModel: GridRowSelectionModel,
  ) => {
    if (!showNewRow) {
      setRowSelectionModel(newModel as number[]);
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const newTrade = TradeRecordSchema.parse(newRow);
    mutateTrades(async () => {
      try {
        await addTrades([newTrade]);
        enqueueSnackbar('Trade added succesfully', { variant: 'success', preventDuplicate: true });
        return await fetchTrades();
      } catch (err) {
        enqueueSnackbar('Trade could not be added', { variant: 'error', preventDuplicate: true });
        throw err;
      }
    }, { revalidate: false });
    exitEditMode();
    return newRow;
  };

  const handleRowUpdateError = () => {
    enqueueSnackbar('Trade could not be added', { variant: 'error', preventDuplicate: true });
  };

  const columns: GridColDef[] = [
    {
      flex: 1,
      field: 'date',
      headerName: 'Date',
      type: 'date',
      editable: true,
    },
    {
      flex: 1,
      field: 'orderType',
      headerName: 'Order Type',
      type: 'singleSelect',
      valueOptions: ['Buy', 'Sell'],
      editable: true,
    },
    {
      flex: 1,
      field: 'sym',
      headerName: 'Symbol',
      editable: true,
    },
    {
      flex: 1,
      field: 'unitPrice',
      headerName: 'Unit Price',
      type: 'number',
      editable: true,
    },
    {
      flex: 1,
      field: 'quantity',
      headerName: 'Quantity',
      type: 'number',
      editable: true,
    },
    {
      flex: 1,
      field: 'fees',
      headerName: 'Fees',
      type: 'number',
      editable: true,
    },
    {
      flex: 1,
      field: 'total',
      headerName: 'Total',
      type: 'number',
    },
  ];

  let rows: GridRowsProp = trades.map((x) => ({
    ...x,
    total: x.unitPrice * x.quantity * (x.orderType === 'Buy' ? -1 : 1) - x.fees,
  }));
  if (showNewRow) {
    rows = [...rows, { id: -1 }];
  }

  let addOrCancelButton;
  if (showNewRow) {
    addOrCancelButton = (
      <Button variant="outlined" color="error" onClick={exitEditMode}>
        Cancel
      </Button>
    );
  } else {
    addOrCancelButton = (
      <Button variant="outlined" color="primary" onClick={enterEditMode}>
        Add Trade
      </Button>
    );
  }

  const deleteButton = (
    <Button
      variant="outlined"
      color="error"
      disabled={showNewRow || !rowSelectionModel.length}
      onClick={handleDelete}
    >
      {rowSelectionModel.length > 1
        ? `Delete ${rowSelectionModel.length} Trades`
        : 'Delete Trade'}
    </Button>
  );

  return (
    <Container maxWidth="lg" disableGutters sx={{ height: '100%' }}>
      <Stack spacing={1} sx={{ height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1}>
            {addOrCancelButton}
            {deleteButton}
          </Stack>
          <Stack direction="row">
            <UploadButton onUpload={handleImport}>Import CSV</UploadButton>
            <Button onClick={handleExport}>Export CSV</Button>
          </Stack>
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <DataGrid
            apiRef={apiRef}
            columns={columns}
            rows={rows}
            editMode="row"
            onRowEditStop={handleRowEditStop}
            onRowEditStart={preventRowEditStart}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleRowUpdateError}
            checkboxSelection
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={handleSelectionChange}
            isRowSelectable={(params: GridRowParams) => !showNewRow || params.id === -1}
            showCellVerticalBorder
          />
        </Box>
      </Stack>
    </Container>
  );
}
