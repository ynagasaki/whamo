import { Goal } from '@/app/lib/model';
import { useState } from 'react';
import { manageGoal } from '@/app/lib/actions';
import { mutate } from 'swr';
import clsx from 'clsx';
import { Taggy } from './taggy';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid';

export function GoalForm({
  editData,
  deleteGoal,
  postSubmitCallback,
}: {
  editData?: Goal;
  deleteGoal?: boolean;
  postSubmitCallback?: () => void;
}) {
  const defaultSelectedTag = editData?.category ?? -1;
  const [selectedTag, setSelectedTag] = useState(defaultSelectedTag);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitDisabled, setSubmitDisabled] = useState(!!deleteGoal);

  return (
    <form
      action={async (formData: FormData) => {
        const result = await manageGoal(formData);
        if (result.status === 'ok') {
          mutate('/api/goals');
          postSubmitCallback?.();
        } else {
          setErrorMessage(result.message ?? '');
        }
      }}
    >
      <div className="pb-1 md:pb-3">
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
            defaultValue={editData?.name}
            readOnly={!!deleteGoal}
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
            defaultValue={editData ? editData.amt / 100 : undefined}
            readOnly={!!deleteGoal}
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
                  onClick={() => {
                    if (!deleteGoal) {
                      setSelectedTag(tagId);
                    }
                  }}
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
            {editData && !deleteGoal && (
              <input
                type="hidden"
                id="edit_goal_id"
                name="edit_goal_id"
                value={editData.id}
              />
            )}
            {editData && deleteGoal && (
              <input
                type="hidden"
                id="delete_goal_id"
                name="delete_goal_id"
                value={editData.id}
              />
            )}
          </div>
        </div>
      </div>
      {deleteGoal && (
        <div className="relative mt-2 border-t md:mt-3">
          <input
            type="checkbox"
            className="absolute right-0 top-3 rounded border-gray-400 md:top-4"
            onClick={() => setSubmitDisabled(!submitDisabled)}
          />
          <ExclamationTriangleIcon className="inline-block h-5 w-5" />
          <label className="mt-2 inline-block md:mt-3">
            Check to confirm delete:
          </label>
        </div>
      )}
      <div className="mt-2 flex border-t pt-3 md:mt-3">
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
          {!deleteGoal && (
            <button
              type="submit"
              className="w-20 rounded border-2 border-blue-400 p-1 font-bold text-blue-400 hover:bg-blue-100 md:w-24"
            >
              {!editData ? 'Add' : 'Save'}
            </button>
          )}
          {deleteGoal && (
            <button
              type="submit"
              className={clsx('w-20 rounded border-2 p-1 font-bold md:w-24', {
                'border-red-400 text-red-400 hover:bg-red-100': !submitDisabled,
                'border-red-200 text-red-200 hover:cursor-not-allowed':
                  submitDisabled,
              })}
              disabled={submitDisabled}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
