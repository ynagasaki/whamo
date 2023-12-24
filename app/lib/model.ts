export interface Option {
  id: number,
  symbol: string,
  strike: number,
  otype: 'CALL' | 'PUT',
  exp: string,
  price: number,
  fee: number,
  action: 'STO' | 'BTC',
  assigned: boolean,
  traded: string,
  created: string,
};
