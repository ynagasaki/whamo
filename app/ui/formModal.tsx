import clsx from 'clsx';
import { useState } from 'react';
import { Goal, Option } from '@/app/lib/model';
import { OptionForm } from './optionForm';
import { GoalForm } from './goalForm';
import { TrashIcon } from '@heroicons/react/20/solid';

export function InputFormModal({
  editGoalData,
  editOptionData,
  postSubmitCallback,
}: {
  editGoalData?: Goal;
  editOptionData?: Option;
  postSubmitCallback?: () => void;
}) {
  var showForm: 'create' | 'editGoal' | 'editOption' = 'create';

  if (!!editGoalData) {
    showForm = 'editGoal';
  } else if (!!editOptionData) {
    showForm = 'editOption';
  } else {
    showForm = 'create';
  }

  return (
    <div className="fixed inset-x-0 bottom-8 z-20 mx-4 rounded-lg border bg-white p-6 pt-3 text-gray-700 shadow-md md:mx-12">
      {showForm === 'create' && (
        <CreateFormModal postSubmitCallback={postSubmitCallback} />
      )}
      {showForm === 'editGoal' && (
        <EditGoalFormModal
          editData={editGoalData!}
          postSubmitCallback={postSubmitCallback}
        />
      )}
      {showForm === 'editOption' && (
        <EditOptionFormModal
          editData={editOptionData!}
          postSubmitCallback={postSubmitCallback}
        />
      )}
    </div>
  );
}

function CreateFormModal({
  postSubmitCallback,
}: {
  postSubmitCallback?: () => void;
}) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex flex-wrap">
      <div className="w-full border-b pr-6 pt-0 md:w-1/4 md:border-0 md:pt-3">
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
      </div>
      <div className="w-full justify-center md:w-3/4">
        {activeTab === 0 && (
          <OptionForm postSubmitCallback={postSubmitCallback} />
        )}
        {activeTab === 1 && (
          <GoalForm postSubmitCallback={postSubmitCallback} />
        )}
      </div>
    </div>
  );
}

function EditGoalFormModal({
  editData,
  postSubmitCallback,
}: {
  editData: Goal;
  postSubmitCallback?: () => void;
}) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="flex flex-wrap">
      <div className="w-full border-b pr-6 pt-0 md:w-1/4 md:border-0 md:pt-3">
        <div
          className={clsx(
            'inline-block cursor-pointer p-2 pl-0 pr-3 md:block md:p-3',
            {
              'font-bold': activeTab === 0,
            },
          )}
          onClick={() => setActiveTab(0)}
        >
          Edit Goal
        </div>
        <div
          className={clsx(
            'inline-block cursor-pointer p-2 pl-3 md:block md:border-t md:p-3 md:pl-2',
            {
              'font-bold': activeTab === 1,
            },
          )}
          onClick={() => setActiveTab(1)}
        >
          <span className="inline-block align-text-bottom">
            <TrashIcon className="inline-block h-5 w-5" />
          </span>
          Delete Goal
        </div>
      </div>
      <div className="w-full justify-center md:w-3/4">
        {activeTab === 0 && (
          <GoalForm
            editData={editData}
            postSubmitCallback={postSubmitCallback}
          />
        )}
        {activeTab === 1 && (
          <GoalForm
            editData={editData}
            deleteGoal={true}
            postSubmitCallback={postSubmitCallback}
          />
        )}
      </div>
    </div>
  );
}

function EditOptionFormModal({
  editData,
  postSubmitCallback,
}: {
  editData: Option;
  postSubmitCallback?: () => void;
}) {
  return (
    <div className="flex flex-wrap">
      <div className="w-full border-b pr-6 pt-0 md:w-1/4 md:border-0 md:pt-3">
        <div className="inline-block cursor-pointer p-2 pl-0 font-bold md:block md:p-3">
          Close Option
        </div>
      </div>
      <div className="w-full justify-center md:w-3/4">
        <OptionForm
          editData={editData}
          postSubmitCallback={postSubmitCallback}
        />
      </div>
    </div>
  );
}
