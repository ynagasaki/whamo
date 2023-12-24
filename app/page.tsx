import { fetchOpenOptions } from "./lib/data";
import { Suspense } from 'react';
import { Option } from './lib/model';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <p>
        whamo :)
      </p>
      <Suspense>
        <OptionsList></OptionsList>
      </Suspense>
    </main>
  );
}

async function OptionsList() {
  const openOptions = await fetchOpenOptions();
  return (
    <>
      {
        openOptions.map((option: Option) => {
          return (
            <div key={`OptionList-item-${option.id}`}>
              {option.symbol} @{option.strike} expires {option.exp}
            </div >
          );
        })
      }
    </>
  );
}
