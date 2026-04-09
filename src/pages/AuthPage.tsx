import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Mail, Lock, User, GraduationCap, KeyRound, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type UserType = 'student' | 'parent';

const AuthPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPage = searchParams.get('next') || '';
  const [userType, setUserType] = useState<UserType>('student');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Student fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [classGrade, setClassGrade] = useState('6');

  // Parent fields
  const [parentEmail, setParentEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [parentCode, setParentCode] = useState('');

  const handleStudentAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: t('Welcome back!', 'वापस स्वागत है!') });
        navigate(nextPage ? `/${nextPage}` : '/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName, class_grade: parseInt(classGrade) },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: t('Account created! Logging in...', 'अकाउंट बन गया! लॉगिन हो रहा है...') });
        navigate(nextPage ? `/${nextPage}` : '/');
      }
    } catch (error) {
      toast({ title: t('Error', 'त्रुटि'), description: error instanceof Error ? error.message : 'An error occurred', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleParentAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    // Login requires all 3 fields; signup only email + password
    if (!parentEmail || !parentPassword || (isLogin && !parentCode)) {
      toast({ title: t('All fields required', 'सभी फ़ील्ड भरें'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        // Sign in FIRST so code query runs as authenticated user (bypasses anon RLS issues)
        const { data: authData, error: signInErr } = await supabase.auth.signInWithPassword({ email: parentEmail, password: parentPassword });
        if (signInErr) throw signInErr;

        const parentId = authData.user?.id;
        if (!parentId) throw new Error('Login failed');

        // Now validate code as authenticated parent user
        const code = parentCode.trim().toUpperCase();
        const now = new Date().toISOString();
        const { data: invite, error: inviteErr } = await supabase
          .from('parent_invites')
          .select('id, student_id')
          .eq('code', code)
          .eq('used', false)
          .gt('expires_at', now)
          .single();

        if (inviteErr || !invite) {
          // Sign out since code is invalid — don't leave parent logged in
          await supabase.auth.signOut();
          throw new Error(t('Invalid or expired code. Ask your child to generate a new one.', 'कोड गलत या समय-सीमा खत्म। बच्चे से नया कोड लें।'));
        }

        // Link child if not already linked
        const { data: existing } = await supabase
          .from('parent_child_links')
          .select('id')
          .eq('parent_id', parentId)
          .eq('student_id', invite.student_id)
          .single();
        if (!existing) {
          await supabase.from('parent_child_links').insert({ parent_id: parentId, student_id: invite.student_id });
        }
        await supabase.from('parent_invites').update({ used: true }).eq('id', invite.id);

        toast({ title: t('Welcome back!', 'वापस स्वागत है!') });
        navigate('/parent');
      } else {
        // Signup: only email + password, no code needed
        const { data: authData, error: signUpErr } = await supabase.auth.signUp({
          email: parentEmail,
          password: parentPassword,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signUpErr) throw signUpErr;

        const parentId = authData.user?.id;
        if (!parentId) throw new Error('Signup failed');

        // Save parent profile with role='parent'
        await supabase.from('profiles').upsert(
          { id: parentId, email: parentEmail, full_name: parentEmail.split('@')[0], role: 'parent' },
          { onConflict: 'id' }
        );

        toast({ title: t('Account created! Now login with your child\'s code.', 'अकाउंट बन गया! अब बच्चे के कोड से लॉगिन करें।') });
        setIsLogin(true);
        setParentPassword('');
      }
    } catch (error) {
      toast({ title: t('Error', 'त्रुटि'), description: error instanceof Error ? error.message : 'An error occurred', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const switchUserType = (type: UserType) => {
    setUserType(type);
    setIsLogin(true);
    setEmail(''); setPassword(''); setDisplayName(''); setClassGrade('6');
    setParentEmail(''); setParentPassword(''); setParentCode('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img src="/brand_logo.png" alt="Logo" className="h-14 w-auto object-contain" />
          </div>
          <h1 className="font-display font-bold text-2xl gradient-text">MathGenius</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('Master Vedic Mathematics', 'वैदिक गणित में महारत हासिल करें')}
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="flex bg-muted rounded-xl p-1 mb-4">
          <button
            onClick={() => switchUserType('student')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-display font-bold transition-all flex items-center justify-center gap-1.5 ${userType === 'student' ? 'gradient-primary text-primary-foreground shadow-warm' : 'text-muted-foreground'}`}
          >
            <GraduationCap className="w-4 h-4" />
            {t('Student', 'छात्र')}
          </button>
          <button
            onClick={() => switchUserType('parent')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-display font-bold transition-all flex items-center justify-center gap-1.5 ${userType === 'parent' ? 'gradient-primary text-primary-foreground shadow-warm' : 'text-muted-foreground'}`}
          >
            <Users className="w-4 h-4" />
            {t('Parent', 'अभिभावक')}
          </button>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl p-6 shadow-elevated border-2 border-border">
          {/* Login/Signup tab */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-display font-bold transition-all ${isLogin ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              {t('Login', 'लॉगिन')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-display font-bold transition-all ${!isLogin ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              {t('Sign Up', 'साइन अप')}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {userType === 'student' ? (
              <motion.form
                key="student"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleStudentAuth}
                className="space-y-4"
              >
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-display font-semibold">{t('Name', 'नाम')}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder={t('Your name', 'आपका नाम')} className="pl-10 h-12 rounded-xl" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-display font-semibold">{t('Class / Grade', 'कक्षा')}</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select value={classGrade} onChange={e => setClassGrade(e.target.value)} className="w-full pl-10 h-12 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(g => (
                            <option key={g} value={g}>{t(`Class ${g}`, `कक्षा ${g}`)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label className="text-sm font-display font-semibold">{t('Email', 'ईमेल')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10 h-12 rounded-xl" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-display font-semibold">{t('Password', 'पासवर्ड')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 h-12 rounded-xl" required minLength={6} />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 gradient-primary text-primary-foreground font-display font-bold text-base rounded-xl shadow-warm border-0">
                  {loading ? <span className="animate-spin">⏳</span> : isLogin
                    ? <><LogIn className="w-5 h-5 mr-2" />{t('Login', 'लॉगिन')}</>
                    : <><UserPlus className="w-5 h-5 mr-2" />{t('Sign Up', 'साइन अप')}</>}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="parent"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleParentAuth}
                className="space-y-4"
              >
                {/* Parent info banner */}
                <div className="bg-secondary/10 border border-secondary/20 rounded-xl px-3 py-2.5 text-xs text-secondary font-medium">
                  {isLogin
                    ? t('🔑 Enter your email, password & child\'s code to access dashboard.', '🔑 ईमेल, पासवर्ड और बच्चे का कोड डालें।')
                    : t('📱 Create your account. You\'ll need your child\'s code at login time.', '📱 अकाउंट बनाएं। लॉगिन के समय बच्चे का कोड चाहिए होगा।')}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-display font-semibold">{t('Your Email', 'आपकी ईमेल')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="parent@example.com" className="pl-10 h-12 rounded-xl" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-display font-semibold">{t('Password', 'पासवर्ड')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="password" value={parentPassword} onChange={e => setParentPassword(e.target.value)} placeholder="••••••••" className="pl-10 h-12 rounded-xl" required minLength={6} />
                  </div>
                </div>

                {isLogin && (
                  <div className="space-y-2">
                    <Label className="text-sm font-display font-semibold">{t("Child's 6-digit Code", "बच्चे का 6-अंकी कोड")}</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={parentCode}
                        onChange={e => {
                          const val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
                          setParentCode(val);
                        }}
                        placeholder="A3K9P2"
                        className="pl-10 h-12 rounded-xl font-mono tracking-widest text-center uppercase"
                        maxLength={6}
                        required
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{t('Code is valid for 3 minutes only', 'कोड केवल 3 मिनट के लिए वैध है')}</p>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full h-12 gradient-primary text-primary-foreground font-display font-bold text-base rounded-xl shadow-warm border-0">
                  {loading ? <span className="animate-spin">⏳</span> : isLogin
                    ? <><LogIn className="w-5 h-5 mr-2" />{t('Access Dashboard', 'डैशबोर्ड खोलें')}</>
                    : <><Users className="w-5 h-5 mr-2" />{t('Create Account', 'अकाउंट बनाएं')}</>}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
