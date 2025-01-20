type Tag = { name: string; color: string; textColor: string };

// TODO: ideally, get this from DB. But Tailwind can't recognize dynamic
// CSS: https://github.com/tailwindlabs/tailwindcss/discussions/11189#discussioncomment-5847992
const tagsData = new Map<number, Tag>([
  [1, { name: 'splurge', color: 'bg-teal-400', textColor: 'text-white' }],
  [2, { name: 'invest', color: 'bg-violet-400', textColor: 'text-white' }],
  [3, { name: 'fun', color: 'bg-yellow-400', textColor: 'text-white' }],
  [4, { name: 'recoup', color: 'bg-pink-400', textColor: 'text-white' }],
]);
const tagsDataDark = new Map<number, Tag>([
  [1, { name: 'splurge', color: 'bg-teal-200', textColor: 'text-teal-600' }],
  [2, { name: 'invest', color: 'bg-violet-200', textColor: 'text-violet-600' }],
  [3, { name: 'fun', color: 'bg-yellow-200', textColor: 'text-yellow-600' }],
  [4, { name: 'recoup', color: 'bg-pink-200', textColor: 'text-pink-500' }],
]);

export function Taggy({ tagId, isDark }: { tagId: number; isDark?: boolean }) {
  let tagData = !isDark ? tagsData.get(tagId) : tagsDataDark.get(tagId);

  if (!tagData) {
    return <span className="hidden">Unrecognized tag ID={tagId}</span>;
  }

  return (
    <div className="inline-block">
      <div
        className={`inline-block md:hidden ${tagData.color} h-4 w-4 rounded-full`}
      ></div>
      <div
        className={`hidden md:inline-block ${tagData.color} rounded-full text-xs ${tagData.textColor} px-2 py-1 leading-none`}
      >
        {tagData.name}
      </div>
    </div>
    // <div className={`inline-block border border-gray-200 rounded-full px-1 leading-none`}>
    //   <span className={`inline-block align-middle bg-teal-400 rounded-full mr-1 w-2 h-2`}></span>
    //   <span className="inline-block text-xs text-gray-400">{name}</span>
    // </div>
  );
}
