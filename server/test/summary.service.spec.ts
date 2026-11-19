import { Repository } from 'typeorm';
import { SummaryService } from '../src/features/summary/summary.service';
import { ReckoningUser, Return, Transaction } from '../src/typeorm/entities';

type TransactionFixture = Transaction;
type ReturnFixture = Return;

const part = (amount: number | null, ...userIds: number[]) => ({
  amount,
  includees: userIds.map(userId => ({ userId })),
});

const transaction = (
  id: number,
  amount: number,
  payers: Array<[number, number | null]>,
  splitParts: ReturnType<typeof part>[],
  currencyRate: number | null = null,
): TransactionFixture => ({
  id,
  amount,
  currencyRate,
  payers: payers.map(([userId, payerAmount]) => ({ userId, amount: payerAmount })),
  splitParts,
} as unknown as TransactionFixture);

const moneyReturn = (
  amount: number,
  returnedByUserId: number,
  returnedToUserId: number,
  currencyRate: number | null = null,
): ReturnFixture => ({
  amount,
  returnedByUserId,
  returnedToUserId,
  currencyRate,
} as ReturnFixture);

const participant = (userId: number, displayName: string, pseudonym: string | null = null) => ({
  userId,
  pseudonym,
  user: { displayName },
} as ReckoningUser);

describe('SummaryService', () => {
  let service: SummaryService;
  let transactionRepo: { find: jest.Mock; createQueryBuilder: jest.Mock };
  let returnRepo: { find: jest.Mock };
  let reckoningUserRepo: { find: jest.Mock };
  let queryBuilder: {
    innerJoin: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    select: jest.Mock;
    distinct: jest.Mock;
    getRawMany: jest.Mock;
  };

  beforeEach(() => {
    queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };
    transactionRepo = {
      find: jest.fn().mockResolvedValue([]),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    returnRepo = { find: jest.fn().mockResolvedValue([]) };
    reckoningUserRepo = { find: jest.fn().mockResolvedValue([]) };

    // Unit tests run without a database or Nest application bootstrap.
    service = new SummaryService(
      returnRepo as unknown as Repository<Return>,
      transactionRepo as unknown as Repository<Transaction>,
      reckoningUserRepo as unknown as Repository<ReckoningUser>,
    );
  });

  /** Provide data for getDetailed, where each repository is queried once. */
  const mockDetailed = (
    transactions: TransactionFixture[],
    returns: ReturnFixture[] = [],
    participants: ReckoningUser[] = [],
  ) => {
    transactionRepo.find.mockResolvedValue(transactions);
    returnRepo.find.mockResolvedValue(returns);
    reckoningUserRepo.find.mockResolvedValue(participants);
  };

  /** Provide data for getBasic, including the query identifying relevant split parts. */
  const mockBasic = (
    userId: number,
    transactions: TransactionFixture[],
    returns: ReturnFixture[] = [],
  ) => {
    const asPayer = transactions.filter(t => t.payers.some(p => p.userId === userId));
    const asIncludee = transactions.filter(t =>
      t.splitParts.some(p => p.includees.some(i => i.userId === userId)),
    );
    transactionRepo.find
      .mockResolvedValueOnce(asPayer)
      .mockResolvedValueOnce(asIncludee);
    queryBuilder.getRawMany.mockResolvedValue(asIncludee.map(t => ({ id: t.id })));
    returnRepo.find
      .mockResolvedValueOnce(returns.filter(r => r.returnedByUserId === userId))
      .mockResolvedValueOnce(returns.filter(r => r.returnedToUserId === userId));
  };

  it('returns zero totals for an empty reckoning', async () => {
    mockDetailed([]);
    const result = await service.getDetailed(10);

    expect(result).toEqual({
      numberOfTransactions: 0,
      totalFromTransactions: 0,
      numberOfReturns: 0,
      totalFromReturns: 0,
      numberOfUsers: 0,
      personalSummaries: [],
    });

    const basic = await service.getBasic(10, 1);
    expect(basic).toEqual({
      numberOfPaidTransactions: 0,
      totalFromPaidTransactions: 0,
      numberOfSplitPartTransactions: 0,
      totalFromSplitParts: 0,
      numberOfReturnsGiven: 0,
      totalReturnsGiven: 0,
      numberOfReturnsReceived: 0,
      totalReturnsReceived: 0,
    });
  });

  it('splits multiple parts between different groups and counts each transaction once per participant', async () => {
    const t = transaction(1, 120, [[1, 100], [2, 20]], [part(90, 1, 2, 3), part(30, 2, 3)]);
    mockDetailed([t], [], [participant(1, 'Anna'), participant(2, 'Bartek'), participant(3, 'Celina')]);

    const result = await service.getDetailed(10);
    const summaries = new Map(result.personalSummaries.map(s => [s.userId, s]));
    expect(result.totalFromTransactions).toBe(120);
    expect(result.numberOfUsers).toBe(3);
    expect(summaries.get(1)).toMatchObject({
      totalFromPaidTransactions: 100,
      totalFromSplitParts: 30,
      numberOfSplitPartTransactions: 1,
    });
    expect(summaries.get(2)).toMatchObject({
      totalFromPaidTransactions: 20,
      totalFromSplitParts: 45,
      numberOfSplitPartTransactions: 1,
    });
    expect(summaries.get(3)).toMatchObject({
      totalFromPaidTransactions: 0,
      totalFromSplitParts: 45,
      numberOfSplitPartTransactions: 1,
    });
  });

  it('rounds only after accumulating fractional shares from multiple split parts', async () => {
    // Three shares of 10/3 should equal 10.00, not 9.99.
    const t = transaction(1, 30, [[2, 30]], [part(10, 1, 2, 3), part(10, 1, 2, 3), part(10, 1, 2, 3)]);
    mockDetailed([t]);
    const detailed = await service.getDetailed(10);
    expect(detailed.personalSummaries.find(s => s.userId === 1)?.totalFromSplitParts).toBe(10);

    mockBasic(1, [t]);
    const basic = await service.getBasic(10, 1);
    expect(basic.totalFromSplitParts).toBe(10);
    expect(basic.numberOfSplitPartTransactions).toBe(1);
  });

  it('calculates the remaining amount for a payer and a split part represented by null', async () => {
    const t = transaction(1, 100, [[1, 25], [2, null]], [part(40, 1), part(null, 2, 3)]);
    mockDetailed([t]);
    const detailed = await service.getDetailed(10);
    const byId = new Map(detailed.personalSummaries.map(s => [s.userId, s]));
    expect(byId.get(1)).toMatchObject({ totalFromPaidTransactions: 25, totalFromSplitParts: 40 });
    expect(byId.get(2)).toMatchObject({ totalFromPaidTransactions: 75, totalFromSplitParts: 30 });
    expect(byId.get(3)).toMatchObject({ totalFromSplitParts: 30 });

    mockBasic(2, [t]);
    const basic = await service.getBasic(10, 2);
    expect(basic.totalFromPaidTransactions).toBe(75);
    expect(basic.totalFromSplitParts).toBe(30);
  });

  it('converts to base currency before rounding the cumulative amount', async () => {
    // Each share = 0.01 / 3 * 4.0; three shares = 0.04.
    const t = transaction(1, 0.03, [[2, 0.03]], [part(0.01, 1, 2, 3), part(0.01, 1, 2, 3), part(0.01, 1, 2, 3)], 4);
    mockDetailed([t]);
    const detailed = await service.getDetailed(10);
    expect(detailed.totalFromTransactions).toBe(0.12);
    expect(detailed.personalSummaries.find(s => s.userId === 1)?.totalFromSplitParts).toBe(0.04);

    mockBasic(1, [t]);
    expect((await service.getBasic(10, 1)).totalFromSplitParts).toBe(0.04);
  });

  it('records given and received returns separately without adding them to transaction expenditure', async () => {
    const t = transaction(1, 100, [[1, 100]], [part(100, 1, 2)]);
    const r = moneyReturn(20, 2, 1, 2); // 40 in the base currency
    mockDetailed([t], [r]);
    const detailed = await service.getDetailed(10);
    const byId = new Map(detailed.personalSummaries.map(s => [s.userId, s]));

    expect(detailed.totalFromTransactions).toBe(100);
    expect(detailed.totalFromReturns).toBe(40);
    expect(byId.get(1)).toMatchObject({ totalReturnsReceived: 40, numberOfReturnsReceived: 1 });
    expect(byId.get(2)).toMatchObject({ totalReturnsGiven: 40, numberOfReturnsGiven: 1 });
    expect(byId.get(1)!.totalFromPaidTransactions - byId.get(1)!.totalFromSplitParts
      + byId.get(1)!.totalReturnsGiven - byId.get(1)!.totalReturnsReceived).toBe(10);
    expect(byId.get(2)!.totalFromPaidTransactions - byId.get(2)!.totalFromSplitParts
      + byId.get(2)!.totalReturnsGiven - byId.get(2)!.totalReturnsReceived).toBe(-10);

    mockBasic(2, [t], [r]);
    expect(await service.getBasic(10, 2)).toMatchObject({
      totalReturnsGiven: 40,
      totalReturnsReceived: 0,
      numberOfReturnsGiven: 1,
      numberOfReturnsReceived: 0,
    });
  });

  it('returns the same financial aggregates from basic and detailed summaries', async () => {
    const transactions = [
      transaction(1, 120, [[1, 100], [2, 20]], [part(90, 1, 2, 3), part(30, 2, 3)]),
      transaction(2, 30, [[3, 10], [1, null]], [part(10, 1, 2, 3), part(20, 1, 3)], 1.5),
    ];
    const returns = [moneyReturn(10, 2, 1), moneyReturn(7, 1, 3, 2)];
    mockDetailed(transactions, returns);
    const detailed = await service.getDetailed(10);

    // Reset only mocks used by getBasic; compare to the actual result of getDetailed.
    transactionRepo.find.mockReset();
    returnRepo.find.mockReset();
    queryBuilder.getRawMany.mockReset();
    for (const userId of [1, 2, 3]) {
      mockBasic(userId, transactions, returns);
      const basic = await service.getBasic(10, userId);
      const personal = detailed.personalSummaries.find(s => s.userId === userId)!;
      expect(basic).toEqual({
        numberOfPaidTransactions: personal.numberOfPaidTransactions,
        totalFromPaidTransactions: personal.totalFromPaidTransactions,
        numberOfSplitPartTransactions: personal.numberOfSplitPartTransactions,
        totalFromSplitParts: personal.totalFromSplitParts,
        numberOfReturnsGiven: personal.numberOfReturnsGiven,
        totalReturnsGiven: personal.totalReturnsGiven,
        numberOfReturnsReceived: personal.numberOfReturnsReceived,
        totalReturnsReceived: personal.totalReturnsReceived,
      });
    }
  });

  it('sorts participants by pseudonym when available, otherwise by display name', async () => {
    const t = transaction(1, 10, [[1, 10]], [part(10, 1, 2)]);
    mockDetailed([t], [], [participant(1, 'Zenon', 'Adam'), participant(2, 'Bartek')]);
    const detailed = await service.getDetailed(10);
    expect(detailed.personalSummaries.map(s => s.userId)).toEqual([1, 2]);
  });

  it('does not query split-part transactions when a user has no assigned part', async () => {
    const t = transaction(1, 10, [[1, 10]], [part(10, 2)]);
    transactionRepo.find.mockResolvedValueOnce([t]);
    queryBuilder.getRawMany.mockResolvedValue([]);
    const basic = await service.getBasic(10, 1);
    expect(basic.numberOfPaidTransactions).toBe(1);
    expect(basic.numberOfSplitPartTransactions).toBe(0);
    expect(basic.totalFromSplitParts).toBe(0);
    expect(transactionRepo.find).toHaveBeenCalledTimes(1);
    expect(queryBuilder.distinct).toHaveBeenCalledWith(true);
  });
});
