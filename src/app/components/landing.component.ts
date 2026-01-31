import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-white">
      <!-- Navigation -->
      <nav class="fixed w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo -->
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span class="text-xl font-bold text-gray-900">Payslip Generator</span>
            </div>

            <!-- Desktop Menu -->
            <div class="hidden md:flex items-center space-x-8">
              <a href="#features" class="text-gray-600 hover:text-gray-900 transition">Features</a>
              <a href="#how-it-works" class="text-gray-600 hover:text-gray-900 transition">How It Works</a>
              <a href="#pricing" class="text-gray-600 hover:text-gray-900 transition">Pricing</a>
              <a routerLink="/login" class="text-gray-600 hover:text-gray-900 transition">Sign In</a>
              <a routerLink="/signup" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Get Started
              </a>
            </div>

            <!-- Mobile Menu Button -->
            <button 
              (click)="toggleMobileMenu()"
              class="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <!-- Mobile Menu -->
          @if (mobileMenuOpen()) {
            <div class="md:hidden py-4 space-y-3 border-t border-gray-200">
              <a href="#features" class="block py-2 text-gray-600 hover:text-gray-900">Features</a>
              <a href="#how-it-works" class="block py-2 text-gray-600 hover:text-gray-900">How It Works</a>
              <a href="#pricing" class="block py-2 text-gray-600 hover:text-gray-900">Pricing</a>
              <a routerLink="/login" class="block py-2 text-gray-600 hover:text-gray-900">Sign In</a>
              <a routerLink="/signup" class="block py-2 px-4 bg-blue-600 text-white rounded-lg text-center">Get Started</a>
            </div>
          }
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="pt-32 pb-20 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div class="max-w-7xl mx-auto">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <!-- Left Content -->
            <div>
              <div class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                ✨ Professional Payslip Generation Made Easy
              </div>
              <h1 class="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Generate Beautiful
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Payslips
                </span>
                in Seconds
              </h1>
              <p class="text-xl text-gray-600 mb-8 leading-relaxed">
                Create professional, customizable payslips for your employees with our intuitive JSON-based platform. 
                Download as PDF, print, or share instantly.
              </p>
              <div class="flex flex-col sm:flex-row gap-4">
                <a routerLink="/login" class="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl text-center">
                  Start For Free
                </a>
                <a href="#how-it-works" class="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition text-center">
                  Watch Demo
                </a>
              </div>
              <div class="flex items-center gap-8 mt-12">
                <div>
                  <div class="text-3xl font-bold text-gray-900">10K+</div>
                  <div class="text-sm text-gray-600">Payslips Generated</div>
                </div>
                <div>
                  <div class="text-3xl font-bold text-gray-900">500+</div>
                  <div class="text-sm text-gray-600">Happy Companies</div>
                </div>
                <div>
                  <div class="text-3xl font-bold text-gray-900">4.9★</div>
                  <div class="text-sm text-gray-600">User Rating</div>
                </div>
              </div>
            </div>

            <!-- Right Content - Preview -->
            <div class="relative">
              <div class="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex gap-2">
                    <div class="w-3 h-3 rounded-full bg-red-500"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span class="text-sm text-gray-500">Live Preview</span>
                </div>
                <div class="space-y-4">
                  <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-lg">
                    <div class="text-lg font-bold">TechCorp Solutions</div>
                    <div class="text-sm opacity-90">Mumbai, Maharashtra</div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="p-3 bg-gray-50 rounded-lg">
                      <div class="text-xs text-gray-500">Employee</div>
                      <div class="font-semibold">Rajesh Kumar</div>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg">
                      <div class="text-xs text-gray-500">Period</div>
                      <div class="font-semibold">Jan 2026</div>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Basic Salary</span>
                      <span class="font-semibold">₹50,000</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">HRA</span>
                      <span class="font-semibold">₹25,000</span>
                    </div>
                    <div class="flex justify-between text-sm text-red-600">
                      <span>Deductions</span>
                      <span class="font-semibold">-₹16,200</span>
                    </div>
                    <hr class="my-3" />
                    <div class="flex justify-between text-lg font-bold">
                      <span>Net Pay</span>
                      <span class="text-green-600">₹86,800</span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Floating badges -->
              <div class="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                ✓ PDF Ready
              </div>
              <div class="absolute -bottom-4 -left-4 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                ⚡ Instant
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-20 px-4 bg-white">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p class="text-xl text-gray-600">Everything you need to manage payslips efficiently</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            @for (feature of features; track feature.title) {
              <div class="p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <span class="text-2xl">{{ feature.icon }}</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">{{ feature.title }}</h3>
                <p class="text-gray-600">{{ feature.description }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section id="how-it-works" class="py-20 px-4 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p class="text-xl text-gray-600">Three simple steps to generate payslips</p>
          </div>

          <div class="grid md:grid-cols-3 gap-12">
            @for (step of steps; track step.number) {
              <div class="text-center">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {{ step.number }}
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3">{{ step.title }}</h3>
                <p class="text-gray-600">{{ step.description }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600">
        <div class="max-w-4xl mx-auto text-center text-white">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p class="text-xl mb-8 opacity-90">Join thousands of companies generating professional payslips</p>
          <a routerLink="/login" class="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition shadow-xl">
            Start Generating Payslips Now →
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-12 px-4 bg-gray-900 text-gray-300">
        <div class="max-w-7xl mx-auto">
          <div class="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div class="flex items-center space-x-2 mb-4">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
                <span class="font-bold text-white">Payslip Generator</span>
              </div>
              <p class="text-sm">Professional payslip generation made simple.</p>
            </div>
            <div>
              <h4 class="font-semibold text-white mb-4">Product</h4>
              <ul class="space-y-2 text-sm">
                <li><a href="#" class="hover:text-white">Features</a></li>
                <li><a href="#" class="hover:text-white">Pricing</a></li>
                <li><a href="#" class="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-white mb-4">Company</h4>
              <ul class="space-y-2 text-sm">
                <li><a href="#" class="hover:text-white">About</a></li>
                <li><a href="#" class="hover:text-white">Blog</a></li>
                <li><a href="#" class="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-white mb-4">Legal</h4>
              <ul class="space-y-2 text-sm">
                <li><a href="#" class="hover:text-white">Privacy</a></li>
                <li><a href="#" class="hover:text-white">Terms</a></li>
                <li><a href="#" class="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div class="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Payslip Generator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class LandingComponent {
  readonly mobileMenuOpen = signal(false);

  readonly features = [
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Generate payslips instantly with our optimized JSON-based system'
    },
    {
      icon: '📱',
      title: 'Fully Responsive',
      description: 'Works perfectly on desktop, tablet, and mobile devices'
    },
    {
      icon: '📄',
      title: 'PDF Export',
      description: 'Download professional PDFs ready for distribution'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your data is encrypted and never stored on our servers'
    },
    {
      icon: '💱',
      title: 'Multi-Currency',
      description: 'Support for all major currencies and formats'
    },
    {
      icon: '🎨',
      title: 'Customizable',
      description: 'Fully customizable templates and salary components'
    }
  ];

  readonly steps = [
    {
      number: '1',
      title: 'Enter JSON Data',
      description: 'Paste or upload your employee and salary data in JSON format'
    },
    {
      number: '2',
      title: 'Preview & Edit',
      description: 'See live preview and make adjustments in real-time'
    },
    {
      number: '3',
      title: 'Download & Share',
      description: 'Export as PDF or print directly from your browser'
    }
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }
}
