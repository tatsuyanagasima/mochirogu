"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SupabaseSetup() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background-ivory to-accent-yellow/10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-main-green flex items-center justify-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Supabase設定が必要です
          </CardTitle>
          <CardDescription className="text-center text-base">
            モチログを使用するには、Supabaseの環境変数を設定する必要があります
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              以下の環境変数が設定されていません：
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">設定手順：</h3>

            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">1. Supabaseプロジェクトの作成</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Supabaseのダッシュボードで新しいプロジェクトを作成してください。
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                  className="text-main-green border-main-green hover:bg-main-green/10"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Supabaseダッシュボード
                </Button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">2. 環境変数の取得</h4>
                <p className="text-sm text-gray-600">プロジェクトの設定 → API から以下の値を取得してください：</p>
                <ul className="text-sm text-gray-600 mt-2 list-disc list-inside">
                  <li>Project URL (NEXT_PUBLIC_SUPABASE_URL)</li>
                  <li>anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">3. データベーステーブルの作成</h4>
                <p className="text-sm text-gray-600 mb-2">以下のSQLをSupabaseのSQL Editorで実行してください：</p>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                  <pre>{`-- ユーザーの習慣テーブル
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 習慣の記録テーブル
CREATE TABLE habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 気分の記録テーブル
CREATE TABLE mood_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) の有効化
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成
CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habit logs" ON habit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habit logs" ON habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habit logs" ON habit_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habit logs" ON habit_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own mood logs" ON mood_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood logs" ON mood_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood logs" ON mood_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mood logs" ON mood_logs FOR DELETE USING (auth.uid() = user_id);`}</pre>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">4. 環境変数の設定</h4>
                <p className="text-sm text-gray-600">プロジェクトの環境変数設定で上記の値を設定してください。</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={() => window.location.reload()} className="bg-main-green hover:bg-main-green/90">
              設定完了後、ページを再読み込み
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
