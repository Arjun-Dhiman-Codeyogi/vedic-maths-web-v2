import { supabase } from '@/integrations/supabase/client';

export type ActivityType = 'page_visit' | 'practice_category' | 'question_result';

export async function logActivity(
  userId: string,
  activityType: ActivityType,
  activityValue: string
): Promise<void> {
  await supabase.from('user_activity_log').insert({
    user_id: userId,
    activity_type: activityType,
    activity_value: activityValue,
  });
}
