import AuthForm from "@/components/auth/auth-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 auth-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-main-green to-accent-yellow bg-clip-text text-transparent">
            モチログ
          </h1>
          <p className="text-lg text-muted-foreground">新規アカウント作成</p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </div>
  )
}
