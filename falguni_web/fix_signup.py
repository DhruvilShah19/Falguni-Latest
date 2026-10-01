with open('app/(auth)/signup/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { createUserWithEmailAndPassword,", "import { createUserWithEmailAndPassword, linkWithPhoneNumber,")

s1 = """  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwValid) {
      setError('Please ensure your password meets all requirements.');
      return;
    }
    setLoading(true); setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: fullname });
      await ensureUserDoc(cred.user, 'email');
      router.push('/');
    } catch (err: any) {
      console.error('Email Sign-Up Error:', err);
      setError(friendlyError(err));
    } finally { setLoading(false); }
  };"""

r1 = """  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwValid) {
      setError('Please ensure your password meets all requirements.');
      return;
    }
    if (!emailPhone || emailPhone.length < 5) {
      setError('Please enter a valid phone number for 2FA verification.');
      return;
    }
    setLoading(true); setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: fullname });
      
      // Force Phone Verification (2FA) immediately
      const fullPhone = `${countryCode}${emailPhone}`;
      if (!window.recaptchaVerifierSignup) {
        window.recaptchaVerifierSignup = new RecaptchaVerifier(auth, 'recaptcha-container-signup', {
          size: 'invisible'
        });
      }
      const result = await linkWithPhoneNumber(cred.user, fullPhone, window.recaptchaVerifierSignup);
      window.confirmationResultSignup = result;
      setOtpSent(true);
      
    } catch (err: any) {
      console.error('Email Sign-Up Error:', err);
      setError(friendlyError(err));
      if (window.recaptchaVerifierSignup) {
        window.recaptchaVerifierSignup.render().then((widgetId: any) => {
          window.grecaptcha.reset(widgetId);
        });
      }
    } finally { setLoading(false); }
  };"""

content = content.replace(s1, r1)

s2 = """  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP.');
      return;
    }

    setLoading(true); setError('');
    try {
      const result = await window.confirmationResultSignup.confirm(otp);
      if (fullname && !result.user.displayName) {
        await updateProfile(result.user, { displayName: fullname });
      }
      await ensureUserDoc(result.user, 'phone');
      router.push('/');
    } catch (err: any) {
      console.error('OTP Verify Error:', err);
      setError(friendlyError(err));
    } finally { setLoading(false); }
  };"""

r2 = """  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP.');
      return;
    }

    setLoading(true); setError('');
    try {
      const result = await window.confirmationResultSignup.confirm(otp);
      if (fullname && !result.user.displayName) {
        await updateProfile(result.user, { displayName: fullname });
      }
      await ensureUserDoc(result.user, signupMethod);
      router.push('/');
    } catch (err: any) {
      console.error('OTP Verify Error:', err);
      setError(friendlyError(err));
    } finally { setLoading(false); }
  };"""

content = content.replace(s2, r2)


s3 = """        ) : (
          <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">
            <AppField"""

r3 = """        ) : (
          !otpSent ? (
          <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">
            <AppField"""

content = content.replace(s3, r3)

s4 = """              {loading ? 'Creating account...' : 'SIGN UP'}
            </button>
          </form>
        )}

        {/* Divider */}"""

r4 = """              {loading ? 'Sending OTP for 2FA...' : 'CONTINUE & VERIFY PHONE'}
            </button>
          </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4 animate-fade-in">
              <div className="text-center mb-2">
                <p className="text-xs text-[#8A796F]">2FA OTP sent to <span className="font-bold text-[#2D1508]">{countryCode}{emailPhone}</span></p>
                <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-[#733617] hover:underline mt-1 font-semibold">Change Number</button>
              </div>
              <AppField
                type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={setOtp}
                icon={<KeyRound size={18} className="text-[#733617]" />}
              />
              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full h-[48px] rounded-xl font-bold text-sm tracking-wider uppercase transition bg-[#733617] text-white hover:bg-[#5C2B12] active:scale-95 disabled:opacity-50 mt-2 shadow-sm"
              >
                {loading ? 'Verifying...' : 'VERIFY & CREATE ACCOUNT'}
              </button>
            </form>
          )
        )}

        {/* Divider */}"""

content = content.replace(s4, r4)

with open('app/(auth)/signup/page.tsx', 'w') as f:
    f.write(content)
