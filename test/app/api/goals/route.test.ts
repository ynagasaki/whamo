import {
  describe,
  afterAll,
  beforeAll,
  beforeEach,
  jest,
  test,
} from '@jest/globals';
import assert from 'assert';
import { db } from '@/db';
import { GET } from '@/app/api/goals/route';
import { mkdtemp, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { Client, getClient } from '@/app/lib/db';
import { Goal } from '@/app/lib/model';
jest.mock('@/app/lib/db');

describe('Goals API', () => {
  let client: Client;
  let testDirRoot: string;
  let testFile: string;

  beforeAll(async () => {
    const prefix = join(tmpdir(), 'whamo-test-');
    [testDirRoot, testFile] = await new Promise<[string, string]>(
      (resolve, reject) =>
        mkdtemp(prefix, (err, directory) => {
          if (err) {
            reject(err);
          }
          resolve([directory, join(directory, 'goals-api.sqlite')]);
        }),
    );

    client = await db.connect(testFile);
    await client.setup();
  });

  afterAll(() => {
    rmSync(testDirRoot, { recursive: true, force: true });
  });

  beforeEach(async () => {
    const mockGetClient = <jest.Mock>getClient;
    mockGetClient.mockClear();
    mockGetClient.mockReturnValue(client);
  });

  async function addGoal(g: Goal): Promise<void> {
    await client.sql`INSERT INTO goals (
      id, name, amt, curr_amt, created
    ) VALUES (
      ${g.id},
      ${g.name},
      ${g.amt},
      ${g.curr_amt},
      ${g.created}
    );`;
  }

  test('should fetch goal with no contributions', async () => {
    await addGoal({
      id: 1,
      name: 'goal_1',
      amt: 123,
      curr_amt: 0,
      created: '2024-01-02',
    });

    const response = await GET({
      url: 'http://localhost:3000/',
    } as unknown as Request);
    const json = await response.json();
    assert.equal(!!json.goals, true);
    assert.equal(json.goals.length, 1);

    const goal = json.goals[0] as Goal;
    assert.equal(goal.id, 1);
    assert.equal(goal.name, 'goal_1');
    assert.equal(goal.amt, 123);
    assert.equal(goal.curr_amt, 0);
    assert.equal(goal.created, '2024-01-02');
  });

  test('should not fetch goal with completed contributions', async () => {});
});
