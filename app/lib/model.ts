export type OptionType = 'CALL' | 'PUT';

export interface Option {
  id: number,
  symbol: string,
  strike: number,
  otype: OptionType,
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
  option_type: OptionType,
  option_exp: string,
  amt: number,
  created: string,
}
