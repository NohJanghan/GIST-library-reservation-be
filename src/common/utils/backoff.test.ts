import { backoff } from './backoff';

describe('backoff', () => {
  it('should return results of all successful tasks', async () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3),
    ];

    const results = await Promise.all(backoff(tasks));

    expect(results).toEqual([1, 2, 3]);
  });

  it('should retry a failing task and eventually succeed', async () => {
    let counter = 0;
    const tasks = [
      async () => {
        counter++;
        if (counter < 2) {
          throw new Error('Failed');
        }
        return Promise.resolve('Success');
      },
    ];

    const results = await Promise.all(backoff(tasks));

    expect(results).toEqual(['Success']);
    expect(counter).toBe(2);
  });

  it('should throw an error if a task fails more than maxTrial times', async () => {
    const tasks = [() => Promise.reject(new Error('Failed'))];

    await expect(Promise.all(backoff(tasks))).rejects.toThrow('Failed');
  });
});
