'use client';

import { useUser, useSession } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

export default function DebugAuthPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { session, isLoaded: sessionLoaded } = useSession();
  const supabase = useSupabase();
  const [token, setToken] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [supabaseTest, setSupabaseTest] = useState<any>(null);

  useEffect(() => {
    async function getToken() {
      if (session) {
        try {
          const t = await session.getToken({ template: 'supabase' });
          setToken(t);

          if (t) {
            // Decode JWT
            const parts = t.split('.');
            if (parts.length === 3) {
              const decoded = JSON.parse(atob(parts[1]));
              setDecodedToken(decoded);
            }
          }
        } catch (error) {
          console.error('Failed to get token:', error);
        }
      }
    }

    getToken();
  }, [session]);

  const testApiAuth = async () => {
    try {
      const response = await fetch('/api/test-auth');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testSupabaseConnection = async () => {
    if (!supabase) {
      setSupabaseTest({ error: 'Supabase client not initialized' });
      return;
    }

    try {
      // Try to fetch projects
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

      setSupabaseTest({
        success: !error,
        data,
        error: error ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        } : null,
      });
    } catch (error) {
      setSupabaseTest({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-8">认证调试页面</h1>

        {/* Clerk User Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Clerk 用户信息</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="font-semibold">加载状态:</span>{' '}
              {userLoaded ? '✅ 已加载' : '⏳ 加载中...'}
            </div>
            <div>
              <span className="font-semibold">用户状态:</span>{' '}
              {user ? '✅ 已登录' : '❌ 未登录'}
            </div>
            {user && (
              <>
                <div>
                  <span className="font-semibold">用户 ID:</span> {user.id}
                </div>
                <div>
                  <span className="font-semibold">邮箱:</span>{' '}
                  {user.primaryEmailAddress?.emailAddress || 'N/A'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Clerk Session Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Clerk Session 信息</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="font-semibold">Session 加载:</span>{' '}
              {sessionLoaded ? '✅ 已加载' : '⏳ 加载中...'}
            </div>
            <div>
              <span className="font-semibold">Session 状态:</span>{' '}
              {session ? '✅ 存在' : '❌ 不存在'}
            </div>
          </div>
        </div>

        {/* JWT Token Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Supabase JWT Token</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="font-semibold">Token 状态:</span>{' '}
              {token ? '✅ 已获取' : '❌ 未获取'}
            </div>
            {token && (
              <>
                <div>
                  <span className="font-semibold">Token 预览:</span>
                  <div className="mt-2 p-2 bg-gray-100 rounded break-all text-xs">
                    {token.substring(0, 100)}...
                  </div>
                </div>
                {decodedToken && (
                  <div>
                    <span className="font-semibold">解码后的 Token:</span>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                      {JSON.stringify(decodedToken, null, 2)}
                    </pre>
                    <div className="mt-2">
                      <span className="font-semibold">sub 字段:</span>{' '}
                      {decodedToken.sub ? (
                        <span className="text-green-600">✅ {decodedToken.sub}</span>
                      ) : (
                        <span className="text-red-600">❌ 缺失</span>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* API Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">API 认证测试</h2>
          <button
            onClick={testApiAuth}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
          >
            测试 /api/test-auth
          </button>
          {testResult && (
            <pre className="p-2 bg-gray-100 rounded overflow-auto text-xs">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          )}
        </div>

        {/* Supabase Connection Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Supabase 连接测试</h2>
          <div className="space-y-2 font-mono text-sm mb-4">
            <div>
              <span className="font-semibold">Supabase 客户端:</span>{' '}
              {supabase ? '✅ 已初始化' : '❌ 未初始化'}
            </div>
          </div>
          <button
            onClick={testSupabaseConnection}
            disabled={!supabase}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed mb-4"
          >
            测试 Supabase 查询
          </button>
          {supabaseTest && (
            <div>
              <div className="mb-2">
                <span className="font-semibold">结果:</span>{' '}
                {supabaseTest.success ? (
                  <span className="text-green-600">✅ 成功</span>
                ) : (
                  <span className="text-red-600">❌ 失败</span>
                )}
              </div>
              <pre className="p-2 bg-gray-100 rounded overflow-auto text-xs">
                {JSON.stringify(supabaseTest, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">环境变量检查</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="font-semibold">NEXT_PUBLIC_SUPABASE_URL:</span>{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置'}
            </div>
            <div>
              <span className="font-semibold">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置'}
            </div>
            <div>
              <span className="font-semibold">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:</span>{' '}
              {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ 已设置' : '❌ 未设置'}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">检查清单</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ 确保已在 Clerk Dashboard 创建名为 "supabase" 的 JWT 模板</li>
            <li>✅ 确保 JWT 模板包含 "sub" 声明</li>
            <li>✅ 确保在 Supabase Dashboard 启用了 Clerk 第三方认证</li>
            <li>✅ 确保 Supabase 中配置了正确的 JWKS URL</li>
            <li>✅ 确保数据库中运行了 RLS 策略</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
