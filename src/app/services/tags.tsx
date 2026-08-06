export class UpdateTags {
  constructor(tags: UpdateTag[]) {
    this.tags = tags;
  }

  tags: UpdateTag[];
}

export class UpdateTag {
  constructor(id: string, priority: number) {
    this.id = id;
    this.priority = priority;
  }

  id: string;
  priority: number;
}

export async function getTags() {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Tags?`, {
    redirect: 'error',
  });
}

export async function updateTags(tags: UpdateTags) {
  return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Tags/?`, {
    redirect: 'error',
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tags),
  });
}
