import type { Response } from 'express'

type Client = { res: Response, userId: string };

const clients: Set<Client> = new Set();

export function addSSEClient(res: Response, userId: string): void {
    clients.add({ res, userId });
    res.on('close', () => {
        clients.forEach((c) => {
            if (c.res === res) clients.delete(c);
        });
    });
}

export function broadcast(eventType: 'downloads' | 'browsing', userId: string): void {
    const payload = JSON.stringify({ type: eventType, userId });
    clients.forEach(({ res, userId: clientUserId }) => {
      if (clientUserId !== userId) return;
      try {
        res.write(`data: ${payload}\n\n`);
      } catch {
        // ignore write errors (e.g. client gone)
      }
    });
  }