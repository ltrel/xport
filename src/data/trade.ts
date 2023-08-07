import { z } from 'zod';
import { parse } from 'csv/browser/esm/sync';

export interface TradeRecord {
  date: Date;
  orderType: 'Buy' | 'Sell';
  sym: string;
  unitPrice: number;
  quantity: number;
  fees: number;
}

export const TradeRecordSchema = z.object({
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
