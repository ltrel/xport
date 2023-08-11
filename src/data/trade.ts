import { z } from 'zod';
import { parse } from 'csv/browser/esm/sync';

export interface TradeRecord {
  id: Number;
  date: Date;
  orderType: 'Buy' | 'Sell';
  sym: string;
  unitPrice: number;
  quantity: number;
  fees: number;
}

export const TradeRecordSchema = z.object({
  id: z.number(),
  date: z.date(),
  orderType: z.enum(['Buy', 'Sell']),
  sym: z.string(),
  unitPrice: z.number(),
  quantity: z.number(),
  fees: z.number(),
});

export const TradeArraySchema = z.array(TradeRecordSchema);

export const tradesFromCSV = async (file: File): Promise<TradeRecord[]> => {
  const text = await file.text();
  const newTrades: unknown = parse(text, {
    columns: true,
    cast: (value, context) => {
      if (context.header) {
        return value;
      } if (context.column === 'date') {
        return new Date(value);
      } if (context.index > 2) {
        return Number(value);
      }
      return value;
    },
  });
  return TradeArraySchema.parse(newTrades);
};

export const fetchTrades = async (): Promise<TradeRecord[]> => {
  const resJson = await (await fetch('http://localhost:3000/trades')).json();
  const trades = resJson.map((trade: any) => ({ ...trade, date: new Date(trade.date) }));
  return TradeArraySchema.parse(trades);
};

export const addTrades = async (newTrades: TradeRecord[]) => {
  const promiseArr = newTrades.map(async (trade) => {
    const { id, ...withoutId } = trade;
    return fetch('http://localhost:3000/trades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(withoutId),
    });
  });
  return Promise.all(promiseArr);
};

export const deleteTrades = async (ids: Number[]) => {
  const promiseArr = ids.map(async (id) => fetch(`http://localhost:3000/trades/${id}`, {
    method: 'DELETE',
  }));
  return Promise.all(promiseArr);
};
