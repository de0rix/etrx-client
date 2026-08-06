export class GetRanklistRowsArgs {
  constructor(
    contestId: number,
    sortField: string | null,
    sortOrder: boolean | null,
    filterByParticipantType: string | null,
    lang: string | null,
  ) {
    this.contestId = contestId;
    this.sortField = sortField;
    this.sortOrder = sortOrder;
    this.participantType = filterByParticipantType;
    this.lang = lang;
  }

  contestId: number;
  sortField: string | null;
  sortOrder: boolean | null;
  participantType: string | null;
  lang: string | null;
}

export async function getRanklistRows(args: GetRanklistRowsArgs) {
  return await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/RanklistRows/${args.contestId}?` +
      `${args.sortField != null ? `&sortField=${args.sortField}` : ''}` +
      `${args.sortOrder != null ? `&sortOrder=${args.sortOrder}` : ''}` +
      `${args.participantType != null ? `&participantType=${args.participantType}` : ''}` +
      `${args.lang != null ? `&lang=${args.lang}` : 'lang=ru'}`,
    {
      redirect: 'error',
    },
  );
}

export async function updateRanklistRows(
  contestId: number,
  source: string | null = null,
) {
  const provider =
    source?.toLowerCase() === 'ioi' ? 'ioiCodeforces' : 'Codeforces';

  return await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/${provider}/RanklistRows/${contestId}?`,
    {
      redirect: 'error',
      method: 'POST',
    },
  );
}
