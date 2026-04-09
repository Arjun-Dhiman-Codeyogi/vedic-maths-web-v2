import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Smart redirect for email links:
// /go?to=practice  → if logged in: /practice, else: /auth?next=practice
const EmailRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const to = searchParams.get('to') || '';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate(`/${to}`, { replace: true });
      } else {
        navigate(`/auth?next=${to}`, { replace: true });
      }
    });
  }, [navigate, to]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
};

export default EmailRedirect;
