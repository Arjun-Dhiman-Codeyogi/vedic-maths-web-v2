import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  const checkSession = async (session: { user: { id: string } } | null) => {
    if (!session) {
      navigate('/auth', { replace: true });
      setChecked(true);
      return;
    }
    // Check role — parent users go to /parent dashboard
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    if (data?.role === 'parent') {
      navigate('/parent', { replace: true });
    }
    setChecked(true);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkSession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!checked) return null;

  return <>{children}</>;
};

export default AuthGuard;
