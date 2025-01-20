type Tag = {
  name: string;
  color: string;
  textColor: string;
  borderColor: string;
};

// TODO: ideally, get this from DB. But Tailwind can't recognize dynamic
// CSS: https://github.com/tailwindlabs/tailwindcss/discussions/11189#discussioncomment-5847992
const tagsData = new Map<number, Tag>([
  [
    -1,
    {
      name: 'none',
      color: 'bg-white',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-300',
    },
  ],
  [
    1,
    {
      name: 'splurge',
      color: 'bg-teal-400',
      textColor: 'text-white',
      borderColor: 'border-teal-400',
    },
  ],
  [
    2,
    {
      name: 'invest',
      color: 'bg-indigo-400',
      textColor: 'text-white',
      borderColor: 'border-indigo-400',
    },
  ],
  [
    3,
    {
      name: 'fun',
      color: 'bg-yellow-400',
      textColor: 'text-white',
      borderColor: 'border-yellow-400',
    },
  ],
  [
    4,
    {
      name: 'repay',
      color: 'bg-pink-400',
      textColor: 'text-white',
      borderColor: 'border-pink-400',
    },
  ],
]);
const tagsDataDark = new Map<number, Tag>([
  [
    1,
    {
      name: 'splurge',
      color: 'bg-teal-200',
      textColor: 'text-teal-600',
      borderColor: 'border-teal-600',
    },
  ],
  [
    2,
    {
      name: 'invest',
      color: 'bg-violet-200',
      textColor: 'text-violet-600',
      borderColor: 'border-violet-600',
    },
  ],
  [
    3,
    {
      name: 'fun',
      color: 'bg-yellow-200',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-600',
    },
  ],
  [
    4,
    {
      name: 'repay',
      color: 'bg-pink-200',
      textColor: 'text-pink-500',
      borderColor: 'border-pink-600',
    },
  ],
]);

export function Taggy({
  tagId,
  isDark,
  forceBorder,
  forceFullSize,
}: {
  tagId: number;
  isDark?: boolean;
  forceBorder?: boolean;
  forceFullSize?: boolean;
}) {
  let tagData = !isDark ? tagsData.get(tagId) : tagsDataDark.get(tagId);

  if (!tagData) {
    return <span className="hidden">Unrecognized tag ID={tagId}</span>;
  }

  return (
    <div className="inline-block">
      {!forceFullSize && (
        <div
          className={`
          inline-block
          md:hidden ${tagData.color}
          h-4
          w-4
          rounded-full
          border
          ${tagData.borderColor}`}
        ></div>
      )}
      <div
        className={`
        ${forceFullSize ? 'inline-block' : 'hidden md:inline-block'}
        ${tagData.color}
        rounded-full
        text-xs
        ${tagData.textColor}
        ${forceBorder ? 'border' : ''}
        ${forceBorder ? tagData.borderColor : ''}
        px-2
        py-1
        leading-none`}
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
