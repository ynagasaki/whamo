import { fetchOptionsInRange } from '@/app/lib/data';
import dayjs from 'dayjs';

// number of days between two dates, inclusive of those days
function dayRangeInc(d1: dayjs.Dayjs, d2: dayjs.Dayjs): number {
  if (d1.isAfter(d2)) {
    return Math.ceil(d1.endOf('day').diff(d2.startOf('day'), 'days', true));
  }
  return Math.ceil(d2.endOf('day').diff(d1.startOf('day'), 'days', true));
}

export async function GET(request: Request): Promise<Response> {
  // force SSR
  console.log(`Forcing SSR: ${new URL(request.url).searchParams}`);

  const pdEnd = dayjs(new Date()).endOf('month');
  const pdStart = pdEnd.startOf('month');
  const result = await fetchOptionsInRange(pdStart.toDate(), pdEnd.toDate());

  // month run rate
  const runRate = result.reduce((currValue, option) => {
    const ostart = dayjs(option.traded);
    const oend = dayjs(option.exp); // exp takes into account BTC options
    const oamt = option.price * 100 - option.fee; // price and fee take into account BTC options
    const amtPerDay = oamt / dayRangeInc(oend, ostart);

    if (
      (pdStart.isBefore(ostart) || pdStart.isSame(ostart)) &&
      (pdEnd.isAfter(oend) || pdEnd.isSame(oend))
    ) {
      return currValue + oamt;
    } else if (ostart.isBefore(pdStart) && oend.isAfter(pdEnd)) {
      return currValue + amtPerDay * dayRangeInc(pdEnd, pdStart);
    } else if (ostart.isBefore(pdStart)) {
      return currValue + amtPerDay * dayRangeInc(oend, pdStart);
    } else if (oend.isAfter(pdEnd)) {
      return currValue + amtPerDay * dayRangeInc(pdEnd, ostart);
    } else {
      throw new Error(`this_should_never_happen: ${JSON.stringify(option)}`);
    }
  }, 0);

  return Response.json({ options: result, runRate });
}
