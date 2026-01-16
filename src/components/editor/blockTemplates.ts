'use client';
export const BLOCK_TEMPLATES = [
    {
      id: 'hero-1',
      category: 'Hero',
      label: 'Hero Center với Buttons',
      preview: 'https://dummyimage.com/200x120/3b82f6/ffffff&text=Hero+Center',
      content: `
        <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div class="container mx-auto px-5 text-center">
            <h1 class="text-5xl font-bold mb-6">Chào mừng đến với sản phẩm của chúng tôi</h1>
            <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">Giải pháp tốt nhất cho nhu cầu của bạn. Đơn giản, nhanh chóng và hiệu quả.</p>
            <div class="flex justify-center gap-4">
              <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Bắt đầu</button>
              <button class="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">Tìm hiểu thêm</button>
            </div>
          </div>
        </section>
      `
    },
    {
      id: 'hero-2',
      category: 'Hero',
      label: 'Hero với Image',
      preview: 'https://dummyimage.com/200x120/8b5cf6/ffffff&text=Hero+Image',
      content: `
        <section class="bg-white py-20">
          <div class="container mx-auto px-5 flex flex-col md:flex-row items-center gap-12">
            <div class="flex-1">
              <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Giải pháp hiện đại cho doanh nghiệp</h1>
              <p class="text-lg text-gray-600 mb-8">Nền tảng công nghệ tiên tiến giúp bạn phát triển nhanh chóng và hiệu quả.</p>
              <div class="flex gap-4">
                <button class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Khám phá</button>
                <button class="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">Xem demo</button>
              </div>
            </div>
            <div class="flex-1">
              <img src="https://dummyimage.com/600x400/3b82f6/ffffff&text=Hero+Image" alt="Hero" class="rounded-lg shadow-xl w-full">
            </div>
          </div>
        </section>
      `
    },
    {
      id: 'feature-1',
      category: 'Feature',
      label: '3 Cột Tính năng',
      preview: 'https://dummyimage.com/200x120/10b981/ffffff&text=3+Features',
      content: `
        <section class="bg-gray-50 py-20">
          <div class="container mx-auto px-5">
            <div class="text-center mb-16">
              <h2 class="text-3xl font-bold text-gray-900 mb-4">Tính năng nổi bật</h2>
              <p class="text-gray-600 max-w-2xl mx-auto">Những tính năng mạnh mẽ giúp bạn làm việc hiệu quả hơn</p>
            </div>
            <div class="grid md:grid-cols-3 gap-8">
              <div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Nhanh chóng</h3>
                <p class="text-gray-600">Tốc độ xử lý cực nhanh, tiết kiệm thời gian của bạn</p>
              </div>
              <div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div class="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">An toàn</h3>
                <p class="text-gray-600">Bảo mật cao, đảm bảo dữ liệu của bạn luôn an toàn</p>
              </div>
              <div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div class="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Dễ sử dụng</h3>
                <p class="text-gray-600">Giao diện thân thiện, dễ dàng sử dụng cho mọi người</p>
              </div>
            </div>
          </div>
        </section>
      `
    },
    {
      id: 'feature-2',
      category: 'Feature',
      label: '4 Cột Tính năng',
      preview: 'https://dummyimage.com/200x120/f59e0b/ffffff&text=4+Features',
      content: `
        <section class="bg-white py-20">
          <div class="container mx-auto px-5">
            <div class="text-center mb-16">
              <h2 class="text-3xl font-bold text-gray-900 mb-4">Tại sao chọn chúng tôi?</h2>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-white text-2xl font-bold">1</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Chất lượng</h3>
                <p class="text-gray-600 text-sm">Sản phẩm chất lượng cao</p>
              </div>
              <div class="text-center">
                <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-white text-2xl font-bold">2</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Hỗ trợ</h3>
                <p class="text-gray-600 text-sm">Hỗ trợ 24/7</p>
              </div>
              <div class="text-center">
                <div class="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-white text-2xl font-bold">3</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Giá cả</h3>
                <p class="text-gray-600 text-sm">Giá cả hợp lý</p>
              </div>
              <div class="text-center">
                <div class="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-white text-2xl font-bold">4</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Uy tín</h3>
                <p class="text-gray-600 text-sm">Được tin dùng</p>
              </div>
            </div>
          </div>
        </section>
      `
    },
    {
      id: 'stat-1',
      category: 'Statistics',
      label: 'Thống kê 4 Cột',
      preview: 'https://dummyimage.com/200x120/ef4444/ffffff&text=Stats',
      content: `
        <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div class="container mx-auto px-5">
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div class="text-5xl font-bold mb-2">10K+</div>
                <div class="text-blue-100">Người dùng</div>
              </div>
              <div>
                <div class="text-5xl font-bold mb-2">50+</div>
                <div class="text-blue-100">Quốc gia</div>
              </div>
              <div>
                <div class="text-5xl font-bold mb-2">99%</div>
                <div class="text-blue-100">Hài lòng</div>
              </div>
              <div>
                <div class="text-5xl font-bold mb-2">24/7</div>
                <div class="text-blue-100">Hỗ trợ</div>
              </div>
            </div>
          </div>
        </section>
      `
    },
    {
      id: 'cta-1',
      category: 'CTA',
      label: 'CTA Đơn giản',
      preview: 'https://dummyimage.com/200x120/06b6d4/ffffff&text=CTA',
      content: `
        <section class="bg-blue-600 text-white py-16">
          <div class="container mx-auto px-5 text-center">
            <h2 class="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
            <p class="text-blue-100 mb-8 text-lg">Tham gia cùng hàng nghìn người dùng đã tin tưởng chúng tôi</p>
            <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Bắt đầu ngay</button>
          </div>
        </section>
      `
    },
    {
      id: 'cta-2',
      category: 'CTA',
      label: 'CTA với 2 Buttons',
      preview: 'https://dummyimage.com/200x120/8b5cf6/ffffff&text=CTA+2',
      content: `
        <section class="bg-gray-900 text-white py-20">
          <div class="container mx-auto px-5 text-center">
            <h2 class="text-4xl font-bold mb-4">Nâng cấp ngay hôm nay</h2>
            <p class="text-gray-400 mb-8 text-lg max-w-2xl mx-auto">Trải nghiệm đầy đủ các tính năng với gói premium</p>
            <div class="flex justify-center gap-4">
              <button class="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">Dùng thử miễn phí</button>
              <button class="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">Xem giá</button>
            </div>
          </div>
        </section>
      `
    },
    {
      id: 'gallery-1',
      category: 'Gallery',
      label: 'Gallery Grid',
      preview: 'https://dummyimage.com/200x120/14b8a6/ffffff&text=Gallery',
      content: `
        <section class="bg-white py-20">
          <div class="container mx-auto px-5">
            <div class="text-center mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-4">Thư viện hình ảnh</h2>
              <p class="text-gray-600">Khám phá những khoảnh khắc đẹp nhất</p>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="aspect-square overflow-hidden rounded-lg">
                <img src="https://dummyimage.com/400x400/3b82f6/ffffff&text=Image+1" alt="Gallery" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300">
              </div>
              <div class="aspect-square overflow-hidden rounded-lg">
                <img src="https://dummyimage.com/400x400/10b981/ffffff&text=Image+2" alt="Gallery" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300">
              </div>
              <div class="aspect-square overflow-hidden rounded-lg">
                <img src="https://dummyimage.com/400x400/f59e0b/ffffff&text=Image+3" alt="Gallery" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300">
              </div>
              <div class="aspect-square overflow-hidden rounded-lg">
                <img src="https://dummyimage.com/400x400/ef4444/ffffff&text=Image+4" alt="Gallery" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300">
              </div>
              <div class="aspect-square overflow-hidden rounded-lg">
                <img src="https://dummyimage.com/400x400/8b5cf6/ffffff&text=Image+5" alt="Gallery" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300">
              </div>
              <div class="aspect-square overflow-hidden rounded-lg">
                <img src="https://dummyimage.com/400x400/06b6d4/ffffff&text=Image+6" alt="Gallery" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300">
              </div>
            </div>
          </div>
        </section>
      `
    },
    {
      id: 'content-1',
      category: 'Content',
      label: 'Bài viết 2 Cột',
      preview: 'https://dummyimage.com/200x120/6366f1/ffffff&text=Content',
      content: `
        <section class="bg-white py-20">
          <div class="container mx-auto px-5">
            <div class="grid md:grid-cols-2 gap-12">
              <article>
                <div class="aspect-video overflow-hidden rounded-lg mb-6">
                  <img src="https://dummyimage.com/600x400/3b82f6/ffffff&text=Article+1" alt="Article" class="w-full h-full object-cover">
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-3">Tiêu đề bài viết 1</h2>
                <p class="text-gray-600 mb-4">Mô tả ngắn về bài viết. Nội dung hấp dẫn và thu hút người đọc.</p>
                <a href="#" class="text-blue-600 font-semibold hover:underline">Đọc thêm →</a>
              </article>
              <article>
                <div class="aspect-video overflow-hidden rounded-lg mb-6">
                  <img src="https://dummyimage.com/600x400/10b981/ffffff&text=Article+2" alt="Article" class="w-full h-full object-cover">
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-3">Tiêu đề bài viết 2</h2>
                <p class="text-gray-600 mb-4">Mô tả ngắn về bài viết. Nội dung hấp dẫn và thu hút người đọc.</p>
                <a href="#" class="text-blue-600 font-semibold hover:underline">Đọc thêm →</a>
              </article>
            </div>
          </div>
        </section>
      `
    },
    {
      id: 'testimonial-1',
      category: 'Testimonial',
      label: 'Đánh giá 3 Cột',
      preview: 'https://dummyimage.com/200x120/ec4899/ffffff&text=Reviews',
      content: `
        <section class="bg-gray-50 py-20">
          <div class="container mx-auto px-5">
            <div class="text-center mb-16">
              <h2 class="text-3xl font-bold text-gray-900 mb-4">Khách hàng nói gì về chúng tôi</h2>
            </div>
            <div class="grid md:grid-cols-3 gap-8">
              <div class="bg-white p-6 rounded-xl shadow-sm">
                <div class="flex items-center mb-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-blue-600 font-bold">A</span>
                  </div>
                  <div>
                    <div class="font-semibold text-gray-900">Nguyễn Văn A</div>
                    <div class="text-sm text-gray-500">CEO, Công ty ABC</div>
                  </div>
                </div>
                <p class="text-gray-600">"Dịch vụ tuyệt vời! Chúng tôi rất hài lòng với sản phẩm này."</p>
              </div>
              <div class="bg-white p-6 rounded-xl shadow-sm">
                <div class="flex items-center mb-4">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-green-600 font-bold">B</span>
                  </div>
                  <div>
                    <div class="font-semibold text-gray-900">Trần Thị B</div>
                    <div class="text-sm text-gray-500">Giám đốc, Công ty XYZ</div>
                  </div>
                </div>
                <p class="text-gray-600">"Sản phẩm chất lượng cao, hỗ trợ tốt. Rất đáng để đầu tư!"</p>
              </div>
              <div class="bg-white p-6 rounded-xl shadow-sm">
                <div class="flex items-center mb-4">
                  <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-purple-600 font-bold">C</span>
                  </div>
                  <div>
                    <div class="font-semibold text-gray-900">Lê Văn C</div>
                    <div class="text-sm text-gray-500">Founder, Startup DEF</div>
                  </div>
                </div>
                <p class="text-gray-600">"Giải pháp hoàn hảo cho nhu cầu của chúng tôi. Cảm ơn rất nhiều!"</p>
              </div>
            </div>
          </div>
        </section>
      `
    },
    {
      id: 'pricing-1',
      category: 'Pricing',
      label: 'Bảng giá 3 Cột',
      preview: 'https://dummyimage.com/200x120/14b8a6/ffffff&text=Pricing',
      content: `
        <section class="bg-white py-20">
          <div class="container mx-auto px-5">
            <div class="text-center mb-16">
              <h2 class="text-3xl font-bold text-gray-900 mb-4">Chọn gói phù hợp</h2>
              <p class="text-gray-600">Giá cả hợp lý cho mọi nhu cầu</p>
            </div>
            <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div class="bg-gray-50 p-8 rounded-xl border-2 border-gray-200">
                <h3 class="text-xl font-bold text-gray-900 mb-2">Cơ bản</h3>
                <div class="text-4xl font-bold text-gray-900 mb-4">299K<span class="text-lg text-gray-600">/tháng</span></div>
                <ul class="space-y-3 mb-8">
                  <li class="flex items-center text-gray-600"><span class="text-green-500 mr-2">✓</span> Tính năng cơ bản</li>
                  <li class="flex items-center text-gray-600"><span class="text-green-500 mr-2">✓</span> Hỗ trợ email</li>
                  <li class="flex items-center text-gray-600"><span class="text-green-500 mr-2">✓</span> Cập nhật thường xuyên</li>
                </ul>
                <button class="w-full bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Chọn gói</button>
              </div>
              <div class="bg-blue-600 text-white p-8 rounded-xl border-2 border-blue-600 transform scale-105 shadow-xl">
                <div class="text-center mb-2">
                  <span class="bg-yellow-400 text-blue-900 text-xs font-bold px-2 py-1 rounded">Phổ biến</span>
                </div>
                <h3 class="text-xl font-bold mb-2">Chuyên nghiệp</h3>
                <div class="text-4xl font-bold mb-4">599K<span class="text-lg opacity-90">/tháng</span></div>
                <ul class="space-y-3 mb-8">
                  <li class="flex items-center"><span class="mr-2">✓</span> Tất cả tính năng cơ bản</li>
                  <li class="flex items-center"><span class="mr-2">✓</span> Hỗ trợ ưu tiên</li>
                  <li class="flex items-center"><span class="mr-2">✓</span> Tích hợp API</li>
                  <li class="flex items-center"><span class="mr-2">✓</span> Báo cáo nâng cao</li>
                </ul>
                <button class="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Chọn gói</button>
              </div>
              <div class="bg-gray-50 p-8 rounded-xl border-2 border-gray-200">
                <h3 class="text-xl font-bold text-gray-900 mb-2">Doanh nghiệp</h3>
                <div class="text-4xl font-bold text-gray-900 mb-4">1.299K<span class="text-lg text-gray-600">/tháng</span></div>
                <ul class="space-y-3 mb-8">
                  <li class="flex items-center text-gray-600"><span class="text-green-500 mr-2">✓</span> Tất cả tính năng</li>
                  <li class="flex items-center text-gray-600"><span class="text-green-500 mr-2">✓</span> Hỗ trợ 24/7</li>
                  <li class="flex items-center text-gray-600"><span class="text-green-500 mr-2">✓</span> Tùy chỉnh</li>
                  <li class="flex items-center text-gray-600"><span class="text-green-500 mr-2">✓</span> Quản lý đội nhóm</li>
                </ul>
                <button class="w-full bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Chọn gói</button>
              </div>
            </div>
          </div>
        </section>
      `
    }
];
