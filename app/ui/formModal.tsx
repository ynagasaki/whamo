import clsx from 'clsx';
import { useState } from 'react';
import { Goal } from '@/app/lib/model';
import { OptionForm } from './optionForm';
import { GoalForm } from './goalForm';

export function InputFormModal({
  editGoalData,
  postSubmitCallback,
}: {
  editGoalData?: Goal;
  postSubmitCallback?: () => void;
}) {
  const [activeTab, setActiveTab] = useState(!editGoalData ? 0 : 1);

  return (
    <div className="fixed inset-x-0 bottom-8 z-20 mx-4 rounded-lg border bg-white p-6 pt-3 text-gray-700 shadow-md md:mx-12">
      <div className="flex flex-wrap">
        <div className="w-full border-b pr-6 pt-0 md:w-1/4 md:border-0 md:pt-3">
          {!editGoalData && (
            <div
              className={clsx(
                'inline-block cursor-pointer p-2 pl-0 pr-3 md:block md:p-3',
                {
                  'font-bold': activeTab === 0,
                },
              )}
              onClick={() => setActiveTab(0)}
            >
              Add Options
            </div>
          )}
          {!editGoalData && (
            <div
              className={clsx(
                'inline-block cursor-pointer p-2 pl-3 md:block md:border-t md:p-3',
                {
                  'font-bold': activeTab === 1,
                },
              )}
              onClick={() => setActiveTab(1)}
            >
              Add Goals
            </div>
          )}
          {!!editGoalData && (
            <div className="inline-block cursor-pointer p-2 pl-0 font-bold md:block md:p-3">
              Edit Goal
            </div>
          )}
        </div>
        <div className="w-full justify-center md:w-3/4">
          {activeTab === 0 && (
            <OptionForm postSubmitCallback={postSubmitCallback} />
          )}
          {activeTab === 1 && (
            <GoalForm
              editGoalData={editGoalData}
              postSubmitCallback={postSubmitCallback}
            />
          )}
        </div>
      </div>
    </div>
  );
}
