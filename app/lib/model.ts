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
  closed_by: number,
  created: string,
};

export interface Goal {
  id: number,
  name: string,
  amt: number,
  curr_amt: number,
  created: string,
}

export interface ContributionSummary {
  id: number,
  option_id: number,
  option_symbol: string,
  option_strike: number,
  option_type: 'CALL' | 'PUT'
  option_exp: string,
  amt: number,
  created: string,
}
