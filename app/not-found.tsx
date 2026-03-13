import Link from "next/link";

const popularTools = [
  { slug: "password-generator", name: "Password Generator", icon: "🔐", description: "Generate secure, random passwords" },
  { slug: "qr-code-generator", name: "QR Code Generator", icon: "📱", description: "Create QR codes instantly" },
  { slug: "bmi-calculator", name: "BMI Calculator", icon: "⚖️", description: "Calculate your Body Mass Index" },
  { slug: "json-formatter", name: "JSON Formatter", icon: "{ }", description: "Format and validate JSON data" },
  { slug: "unit-converter", name: "Unit Converter", icon: "📏", description: "Convert between measurement units" },
  { slug: "color-picker", name: "Color Picker", icon: "🎨", description: "Pick and convert colors easily" },
];

const categories = [
  { name: "Finance", icon: "💰" },
  { name: "Text", icon: "📝" },
  { name: "Health", icon: "❤️" },
  { name: "Developer", icon: "💻" },
  { name: "Math", icon: "🔢" },
  { name: "Conversion", icon: "🔄" },
  { name: "Images", icon: "🖼️" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <Link href="/en" className="text-xl font-bold text-blue-600 hover:text-blue-700">
            ToolKit Online
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* 404 Hero */}
        <div className="text-center mb-12">
          <h1 className="text-[120px] sm:text-[160px] font-extrabold leading-none bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mt-2 mb-3">
            Oops! Page not found
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            The page you were looking for doesn&apos;t exist or has been moved.
            But don&apos;t worry — we have plenty of free tools to help you out!
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-14">
          <form action="/en" method="GET" className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              name="q"
              placeholder="Search for a tool... (e.g. calculator, converter, generator)"
              className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 pr-2 flex items-center"
            >
              <span className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                Search
              </span>
            </button>
          </form>
        </div>

        {/* Popular Tools */}
        <section className="mb-14">
          <h3 className="text-lg font-semibold text-gray-800 mb-5 text-center">
            Popular Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/en/tools/${tool.slug}`}
                className="group flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{tool.icon}</span>
                <div>
                  <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors block">
                    {tool.name}
                  </span>
                  <span className="text-sm text-gray-500">{tool.description}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by Category */}
        <section className="mb-14">
          <h3 className="text-lg font-semibold text-gray-800 mb-5 text-center">
            Browse by Category
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href="/en"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm"
              >
                <span>{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Back to Homepage */}
        <div className="text-center">
          <Link
            href="/en"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                clipRule="evenodd"
              />
            </svg>
            Back to Homepage
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        ToolKit Online — Free online tools for everyone
      </footer>
    </div>
  );
}
