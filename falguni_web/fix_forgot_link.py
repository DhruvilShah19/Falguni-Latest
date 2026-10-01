with open('app/(auth)/login/page.tsx', 'r') as f:
    content = f.read()

s1 = """            {/* Forgot password */}
            <div className="flex justify-end mt-1 relative z-10">
              <Link href="/forgot-password"
                className="text-xs font-bold text-[#733617] hover:underline py-1">
                Forgot Password?
              </Link>
            </div>"""

r1 = """            {/* Forgot password */}
            <div className="flex justify-end mt-1 relative z-10">
              <button 
                type="button" 
                onClick={(e) => { e.preventDefault(); router.push('/forgot-password'); }}
                className="text-xs font-bold text-[#733617] hover:underline py-1">
                Forgot Password?
              </button>
            </div>"""

if s1 in content:
    content = content.replace(s1, r1)
else:
    print("Could not find string")

with open('app/(auth)/login/page.tsx', 'w') as f:
    f.write(content)
