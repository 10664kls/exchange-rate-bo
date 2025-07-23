
export interface ExchangeRate {
  id: string;
  audioFileName: string;
  exchangeRate: number;
  effectedAt: string;
  createdAt: string;
  updatedAt: string;
  status: Status
}

export interface ListExchangeRatesResponse {
  exchangeRates: ExchangeRate[];
  nextPageToken: string;
}

export type Status = 'ACTIVE' | 'INACTIVE';