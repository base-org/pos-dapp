import { useState, useEffect } from 'react';
import { createClient, RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SubscriptionOptions {
  channel: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  schema?: string
  table: string
  filter?: string
}

const useRealtimeDb = <T extends { [key: string]: any; } = any>(options: SubscriptionOptions) => {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel(options.channel)
      .on<T>(
        // @ts-ignore
        "postgres_changes",
        {
          event: options.event,
          schema: options.schema || 'public',
          table: options.table,
          filter: options.filter,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          setData((currentData) => [...currentData, payload.new as T])
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [options])

  return data
}

export default useRealtimeDb;