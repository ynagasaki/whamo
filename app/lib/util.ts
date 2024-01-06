import { Option } from "./model";

export function sqldt(dt: Date = new Date()): string {
  return dt.toISOString().split('T')[0];
}

export function fmtMoney(amt: number): string {
  if (amt * 100 % 100 > 0) {
    return `${Math.round(amt * 100) / 100}`;
  }
  return `${amt}.00`;
}

export function tenseExp(option: Option): string {
  return option.exp < sqldt(new Date()) ? 'expired' : 'expires';
}

export async function fetcher(input: RequestInfo | URL, init?: RequestInit): Promise<any> {
  const response = await fetch(input, init);
  return response.json();
}
