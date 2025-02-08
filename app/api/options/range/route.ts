import { fetchOptionsInRange } from '@/app/lib/data';
import dayjs from 'dayjs';

export async function GET(request: Request): Promise<Response> {
  // force SSR
  console.log(`Forcing SSR: ${new URL(request.url).searchParams}`);

  const pdEnd = dayjs(new Date());
  const pdStart = pdEnd.startOf('month');
  const result = await fetchOptionsInRange(pdStart.toDate(), pdEnd.toDate());

  // month run rate
  const runRate = result.reduce((currValue, option) => {
    const ostart = dayjs(option.traded);
    const oend = dayjs(option.exp); // exp takes into account BTC options
    const oamt = option.price * 100 - option.fee;
    const amtPerDay = oamt / oend.diff(ostart, 'days');

    if (
      (pdStart.isBefore(ostart) || pdStart.isSame(ostart)) &&
      (pdEnd.isAfter(oend) || pdEnd.isSame(oend))
    ) {
      return currValue + oamt;
    } else if (ostart.isBefore(pdStart) && oend.isAfter(pdEnd)) {
      return currValue + amtPerDay * pdEnd.diff(pdStart, 'days');
    } else if (ostart.isBefore(pdStart)) {
      return currValue + amtPerDay * oend.diff(pdStart, 'days');
    } else if (oend.isAfter(pdEnd)) {
      return currValue + amtPerDay * pdEnd.diff(ostart, 'days');
    } else {
      throw new Error(`this_should_never_happen: ${JSON.stringify(option)}`);
    }
  }, 0);

  return Response.json({ options: result, runRate });
}
