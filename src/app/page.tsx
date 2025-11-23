import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="flex flex-col items-center justify-center gap-8 px-8 py-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            L
          </div>
          <h1 className="text-5xl font-bold text-gray-900">Lovart</h1>
        </div>

        {/* Tagline */}
        <p className="text-xl text-gray-600 text-center max-w-md">
          AI 驱动的设计平台，让创意触手可及
        </p>

        {/* CTA Button */}
        <Link
          href="/lovart"
          className="px-8 py-4 bg-black text-white rounded-full text-lg font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          开始创作 →
        </Link>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-semibold text-gray-900 mb-2">智能设计</h3>
            <p className="text-sm text-gray-600">
              AI 助手帮你生成创意设计方案
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-semibold text-gray-900 mb-2">图像生成</h3>
            <p className="text-sm text-gray-600">
              输入描述即可生成高质量图片
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold text-gray-900 mb-2">实时协作</h3>
            <p className="text-sm text-gray-600">
              云端保存，随时随地访问项目
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
