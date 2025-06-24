"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"

interface TableStatus {
  name: string
  exists: boolean
  error?: string
}

export default function SetupPage() {
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<TableStatus[]>([])
  const [setupComplete, setSetupComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requiredTables = ["habits", "habit_logs", "mood_logs"]

  useEffect(() => {
    checkTables()
  }, [])

  const checkTables = async () => {
    setLoading(true)
    setError(null)

    try {
      const tableStatuses: TableStatus[] = []

      for (const tableName of requiredTables) {
        try {
          const { data, error } = await supabase.from(tableName).select("*").limit(1)

          if (error) {
            tableStatuses.push({
              name: tableName,
              exists: false,
              error: error.message,
            })
          } else {
            tableStatuses.push({
              name: tableName,
              exists: true,
            })
          }
        } catch (err) {
          tableStatuses.push({
            name: tableName,
            exists: false,
            error: err instanceof Error ? err.message : "Unknown error",
          })
        }
      }

      setTables(tableStatuses)
      setSetupComplete(tableStatuses.every((table) => table.exists))
    } catch (err) {
      setError(err instanceof Error ? err.message : "テーブルの確認中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const createTables = async () => {
    setLoading(true)
    setError(null)

    try {
      // テーブル作成のSQLを実行
      const { error } = await supabase.rpc("create_mochiroku_tables")

      if (error) {
        // RPCが存在しない場合は、個別にテーブルをチェック
        console.log("RPC not found, tables might already exist or need manual creation")
      }

      // テーブルの状態を再確認
      await checkTables()
    } catch (err) {
      setError(err instanceof Error ? err.message : "テーブルの作成中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                データベースを確認中...
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-main-green">モチログ セットアップ</CardTitle>
            <CardDescription>データベースの設定状況を確認します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold">必要なテーブル:</h3>
              {tables.map((table) => (
                <div key={table.name} className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium">{table.name}</span>
                  <div className="flex items-center gap-2">
                    {table.exists ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-600">存在</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-600">未作成</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {setupComplete ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  すべてのテーブルが正常に設定されています。アプリケーションを使用できます。
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  一部のテーブルが見つかりません。以下のSQLをSupabaseのSQL Editorで実行してください。
                </AlertDescription>
              </Alert>
            )}

            {!setupComplete && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Supabase SQL Editorで実行するSQL:</h4>
                  <div className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                    <pre>{`-- ユーザーの習慣テーブル
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 習慣の記録テーブル
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 気分の記録テーブル
CREATE TABLE IF NOT EXISTS mood_logs (
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

-- ポリシーの作成（存在しない場合のみ）
DO $$
BEGIN
  -- habits テーブルのポリシー
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Users can view own habits') THEN
    CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Users can insert own habits') THEN
    CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Users can update own habits') THEN
    CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Users can delete own habits') THEN
    CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- habit_logs テーブルのポリシー
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_logs' AND policyname = 'Users can view own habit logs') THEN
    CREATE POLICY "Users can view own habit logs" ON habit_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_logs' AND policyname = 'Users can insert own habit logs') THEN
    CREATE POLICY "Users can insert own habit logs" ON habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_logs' AND policyname = 'Users can update own habit logs') THEN
    CREATE POLICY "Users can update own habit logs" ON habit_logs FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_logs' AND policyname = 'Users can delete own habit logs') THEN
    CREATE POLICY "Users can delete own habit logs" ON habit_logs FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- mood_logs テーブルのポリシー
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mood_logs' AND policyname = 'Users can view own mood logs') THEN
    CREATE POLICY "Users can view own mood logs" ON mood_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mood_logs' AND policyname = 'Users can insert own mood logs') THEN
    CREATE POLICY "Users can insert own mood logs" ON mood_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mood_logs' AND policyname = 'Users can update own mood logs') THEN
    CREATE POLICY "Users can update own mood logs" ON mood_logs FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mood_logs' AND policyname = 'Users can delete own mood logs') THEN
    CREATE POLICY "Users can delete own mood logs" ON mood_logs FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;`}</pre>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={checkTables} variant="outline">
                    再確認
                  </Button>
                  <Button
                    onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                    className="bg-main-green hover:bg-main-green/90"
                  >
                    Supabaseダッシュボードを開く
                  </Button>
                </div>
              </div>
            )}

            {setupComplete && (
              <div className="flex gap-2">
                <Button onClick={() => (window.location.href = "/")} className="bg-main-green hover:bg-main-green/90">
                  アプリを開始
                </Button>
                <Button onClick={() => (window.location.href = "/auth/login")} variant="outline">
                  ログイン画面へ
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
