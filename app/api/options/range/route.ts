import { fetchOptionsInRange } from '@/app/lib/data';
import { asInt, dayRangeInc } from '@/app/lib/util';
import { Option } from '@/app/lib/model';
import dayjs from 'dayjs';

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const lookback = Math.abs(asInt(params.get('lookb'), 0));
  const lookahead = Math.abs(asInt(params.get('looka'), 0));

  const now = dayjs(new Date());
  const pdEnd = now.endOf('month').add(lookahead, 'month').endOf('month');
  const pdStart = now.startOf('month').add(-lookback, 'month').startOf('month');
  const options = await fetchOptionsInRange(pdStart.toDate(), pdEnd.toDate());
  const result = new Map<String, Number>();

  for (
    var currPdStart = pdStart;
    currPdStart.isBefore(pdEnd);
    currPdStart = currPdStart.add(1, 'month').startOf('month')
  ) {
    const currPdEnd = currPdStart.endOf('month');
    const runRate = getRunRate(options, currPdStart, currPdEnd);
    result.set(currPdStart.format('MMM'), runRate);
  }

  return Response.json({
    options: options,
    runRate: Object.fromEntries(result),
  });
}

function isBtwnInc(
  start: dayjs.Dayjs,
  end: dayjs.Dayjs,
  date: dayjs.Dayjs,
): boolean {
  return (
    (date.isAfter(start) || date.isSame(start)) &&
    (date.isBefore(end) || date.isSame(end))
  );
}

function getRunRate(
  options: Option[],
  pdStart: dayjs.Dayjs,
  pdEnd: dayjs.Dayjs,
): number {
  return options.reduce((currValue, option) => {
    const ostart = dayjs(option.traded);
    const oend = dayjs(option.exp); // exp takes into account BTC options
    const oamt = option.price * 100 - option.fee; // price and fee take into account BTC options
    const amtPerDay = oamt / dayRangeInc(oend, ostart);

    if (isBtwnInc(pdStart, pdEnd, ostart) && isBtwnInc(pdStart, pdEnd, oend)) {
      return currValue + oamt;
    } else if (ostart.isBefore(pdStart) && oend.isAfter(pdEnd)) {
      return currValue + amtPerDay * dayRangeInc(pdEnd, pdStart);
    } else if (ostart.isBefore(pdStart) && isBtwnInc(pdStart, pdEnd, oend)) {
      return currValue + amtPerDay * dayRangeInc(oend, pdStart);
    } else if (oend.isAfter(pdEnd) && isBtwnInc(pdStart, pdEnd, ostart)) {
      return currValue + amtPerDay * dayRangeInc(pdEnd, ostart);
    } else {
      return currValue;
    }
  }, 0);
}
