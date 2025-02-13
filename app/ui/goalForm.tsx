import { Goal } from '@/app/lib/model';
import { useState } from 'react';
import { upsertGoal } from '@/app/lib/actions';
import { mutate } from 'swr';
import clsx from 'clsx';
import { Taggy } from './taggy';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

export function GoalForm({
  editGoalData,
  postSubmitCallback,
}: {
  editGoalData?: Goal;
  postSubmitCallback?: () => void;
}) {
  const defaultSelectedTag = editGoalData?.category ?? -1;
  const [selectedTag, setSelectedTag] = useState(defaultSelectedTag);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <form
      action={async (formData: FormData) => {
        const result = await upsertGoal(formData);
        if (result.status === 'ok') {
          mutate('/api/goals');
          postSubmitCallback?.();
        } else {
          setErrorMessage(result.message ?? '');
        }
      }}
    >
      <div className="">
        <div className="mr-3 mt-2 inline-block align-top md:mt-3">
          <label
            htmlFor="goal_title"
            className="mb-1 block text-xs text-gray-400"
          >
            Title
          </label>
          <input
            type="text"
            id="goal_title"
            name="goal_title"
            placeholder="Buy a hamburger..."
            defaultValue={editGoalData?.name}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>
        <div className="mr-3 mt-2 inline-block align-top md:mt-3">
          <label
            htmlFor="goal_amt"
            className="mb-1 block text-xs text-gray-400"
          >
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            id="goal_amt"
            name="goal_amt"
            placeholder="100.00"
            defaultValue={editGoalData ? editGoalData.amt / 100 : undefined}
            className="focus:shadow-outline w-40 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>
        <div className="mr-3 mt-2 inline-block align-top md:mt-3">
          <label
            htmlFor="goal_category"
            className="mb-1 block text-xs text-gray-400"
          >
            Category
          </label>
          <div className="">
            {[-1, 1, 2, 3, 4].map((tagId) => {
              return (
                <div
                  key={`taggy-option-${tagId}`}
                  className={clsx(
                    'mr-1 inline-block cursor-pointer leading-none',
                    {
                      'rounded-full border-2 border-indigo-600':
                        selectedTag === tagId,
                    },
                  )}
                  onClick={() => setSelectedTag(tagId)}
                >
                  <Taggy tagId={tagId} forceBorder displayMode="full" />
                </div>
              );
            })}
            <input
              type="hidden"
              id="goal_category"
              name="goal_category"
              value={selectedTag}
            />
            {editGoalData && (
              <input
                type="hidden"
                id="edit_goal_id"
                name="edit_goal_id"
                value={editGoalData.id}
              />
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex border-t pt-3 md:mt-6">
        <div className="w-2/3 md:w-3/4">
          {errorMessage && (
            <div className="leading-tight">
              <ExclamationCircleIcon className="inline-block h-5 w-5 text-red-400" />
              <span className="border-b border-red-300 text-sm md:text-base">
                {errorMessage}
              </span>
            </div>
          )}
        </div>
        <div className="w-1/3 text-right md:w-1/4">
          <button
            type="submit"
            className="w-20 rounded border-2 border-blue-400 p-1 font-bold text-blue-400 hover:bg-blue-100 md:w-24"
          >
            {!editGoalData ? 'Add' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
}
