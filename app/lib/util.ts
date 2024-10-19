import { Option } from './model';

export function sqldt(dt: Date = new Date()): string {
  return dt.toISOString().split('T')[0];
}

export function fmtMoney(amt: number): string {
  if (amt % 100 > 0) {
    if (amt % 10 > 0) {
      return `${amt / 100}`;
    }
    return `${amt / 100}0`;
  }
  return `${amt / 100}.00`;
}

export function toCents(amt: number): number {
  return Math.round(amt * 100);
}

export function tenseExp(option: Option): string {
  return option.exp < sqldt(new Date()) ? 'expired' : 'expires';
}

export async function fetcher(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<any> {
  const response = await fetch(input, init);
  return response.json();
}

export function assertNumber(s: string | undefined | null): asserts s {
  if (!s || Number.isNaN(s)) {
    throw new Error(`${s} is NaN`);
  }
}

export async function postData(
  url: string,
  data: Record<string, string>,
): Promise<unknown> {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  });
  return response.json();
}

export function dday(target: Date): string {
  const now = new Date(); // this is now in GMT
  const targetMs = target.getTime();
  const diffMs =
    targetMs - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diffS = diffMs / 1000;
  const diffMin = diffS / 60;
  const diffHr = diffMin / 60;
  const diffDay = diffHr / 24;
  const diffWk = diffDay / 7;

  if (diffDay >= 14) {
    return `${Math.ceil(diffWk)}w`;
  }
  if (diffDay >= 7) {
    return `next week`;
  }
  if (diffHr >= 24) {
    return `${Math.ceil(diffDay)}d`;
  }
  return `today`;
}

export function numdef(param: number | undefined | null): param is number {
  return param !== undefined && param !== null;
}
