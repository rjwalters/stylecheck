import { ArrowRight, Code2, TrendingUp, Shield, Zap } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">VibeCov</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#docs" className="text-gray-600 hover:text-gray-900">Docs</a>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="http://localhost:8787/auth/login"
                className="text-gray-600 hover:text-gray-900 px-4 py-2"
              >
                Sign In
              </a>
              <a
                href="http://localhost:8787/auth/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              More than just code coverage.
              <br />
              <span className="text-indigo-600">It's code aesthetics.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              VibeCov helps teams maintain consistent coding style and aesthetic across repositories.
              Catch style violations before they reach production with AI-powered analysis.
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="http://localhost:8787/auth/login"
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 flex items-center space-x-2"
              >
                <span>Try VibeCov for Free</span>
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="mailto:hello@vibecov.com"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400"
              >
                Get Demo
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Free for public repositories • No credit card required
            </p>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100">
            <div className="bg-white rounded-lg shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-500">Dashboard Preview</div>
              </div>
              <div className="space-y-3">
                <div className="h-8 bg-gray-100 rounded"></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-24 bg-gradient-to-br from-green-100 to-green-50 rounded flex items-center justify-center">
                    <div className="text-2xl font-bold text-green-700">95%</div>
                  </div>
                  <div className="h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded flex items-center justify-center">
                    <div className="text-2xl font-bold text-blue-700">142</div>
                  </div>
                  <div className="h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded flex items-center justify-center">
                    <div className="text-2xl font-bold text-purple-700">+12%</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Maintain your coding aesthetic
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              VibeCov provides AI-powered tools to help your team write code that matches your style guide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-600">
                Use Claude or GPT-4 to analyze code against your custom style preferences.
                Get intelligent suggestions for improvements.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Vibe Score Tracking
              </h3>
              <p className="text-gray-600">
                Track aesthetic quality over time. Prevent style violations from merging
                with automated PR status checks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                PR Comments
              </h3>
              <p className="text-gray-600">
                Get detailed aesthetic reviews directly in your pull requests.
                Line-by-line feedback on style violations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Custom Style Profiles
              </h3>
              <p className="text-gray-600">
                Define your aesthetic preferences across naming, documentation,
                structure, and more. Or use built-in profiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-600 mb-8">Trusted by development teams at</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
              <div className="text-2xl font-bold text-gray-400">Company 1</div>
              <div className="text-2xl font-bold text-gray-400">Company 2</div>
              <div className="text-2xl font-bold text-gray-400">Company 3</div>
              <div className="text-2xl font-bold text-gray-400">Company 4</div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-indigo-50 rounded-lg p-8 border border-indigo-100">
              <p className="text-lg text-gray-700 italic mb-4">
                "40% of our code reviews were focused on style nitpicks. VibeCov automated that entire
                process and reduced review time to just 10% of what it was before."
              </p>
              <div className="flex items-center">
                <div className="h-12 w-12 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                  JD
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">John Doe</p>
                  <p className="text-sm text-gray-600">Engineering Manager at TechCorp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-indigo-600 text-white rounded-full text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect Your Repository
              </h3>
              <p className="text-gray-600">
                Sign in with GitHub and select the repositories you want to analyze.
                Free for public repos.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-indigo-600 text-white rounded-full text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Configure Your Aesthetic
              </h3>
              <p className="text-gray-600">
                Choose a built-in style profile or customize your own. Define preferences
                for naming, docs, structure, and more.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-indigo-600 text-white rounded-full text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Instant Insights
              </h3>
              <p className="text-gray-600">
                View your vibe score dashboard, add badges to your README, and get
                automated PR reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to improve your code aesthetic?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Start analyzing your repositories today. Free for public repos, no credit card required.
          </p>
          <a
            href="http://localhost:8787/auth/login"
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 inline-flex items-center space-x-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Code2 className="h-6 w-6 text-indigo-400" />
                <span className="text-white font-bold text-lg">VibeCov</span>
              </div>
              <p className="text-sm">
                Code aesthetics monitoring for modern development teams.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            © 2025 VibeCov. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
