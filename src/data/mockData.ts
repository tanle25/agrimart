import { Product } from '../shared/types';

// Dữ liệu sản phẩm chung cho toàn bộ app
export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Cà chua Organic',
    slug: 'ca-chua-organic',
    price: 45000,
    oldPrice: 55000,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400',
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1607305387299-a6d96188fa69?auto=format&fit=crop&q=80&w=600'
    ],
    category: 'Rau củ',
    rating: 5,
    reviews: 12,
    discount: 15,
    description: 'Cà chua Organic được trồng theo phương pháp hữu cơ tại nông trại Đà Lạt. Quả chín đỏ, mọng nước, giàu vitamin A và C, thích hợp làm salad hoặc nấu canh. Sản phẩm không sử dụng thuốc trừ sâu và chất kích thích tăng trưởng.',
    type: 'variable',
    variants: [
      { id: 'v1', name: '500g', price: 25000 },
      { id: 'v2', name: '1kg', price: 45000 }
    ]
  },
  {
    id: 2,
    name: 'Dâu tây Đà Lạt',
    slug: 'dau-tay-da-lat',
    price: 120000,
    oldPrice: 0,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=400',
    images: [
      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1543528176-61b239494933?auto=format&fit=crop&q=80&w=600'
    ],
    category: 'Trái cây',
    rating: 4.8,
    reviews: 45,
    discount: 0,
    description: 'Dâu tây giống New Zealand trồng tại Đà Lạt. Trái to, ngọt thanh, hương thơm quyến rũ. Thu hoạch vào sáng sớm để đảm bảo độ tươi ngon nhất.',
    type: 'simple'
  },
  { id: 3, name: 'Khoai lang mật', slug: 'khoai-lang-mat', price: 35000, oldPrice: 0, image: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&q=80&w=400', category: 'Rau củ', rating: 4.5, reviews: 8, discount: 0, description: 'Khoai lang mật Tà Nung, ruột vàng ươm, chảy mật khi nướng, vị ngọt đậm đà tự nhiên.', type: 'simple' },
  { id: 4, name: 'Gạo ST25', slug: 'gao-st25', price: 180000, oldPrice: 200000, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400', category: 'Lương thực', rating: 5, reviews: 120, discount: 10, description: 'Gạo ST25 ngon nhất thế giới, hạt dài, trắng trong, khi nấu cơm dẻo, thơm mùi lá dứa.', type: 'variable', variants: [{ id: 'g1', name: 'Túi 5kg', price: 180000 }, { id: 'g2', name: 'Túi 10kg', price: 350000 }] },
  { id: 5, name: 'Xà lách thủy canh', slug: 'xa-lach-thuy-canh', price: 30000, oldPrice: 0, image: 'https://images.unsplash.com/photo-1622206151226-18ca2c958a2f?auto=format&fit=crop&q=80&w=400', category: 'Rau củ', rating: 4.2, reviews: 5, discount: 0, description: 'Xà lách mỡ trồng thủy canh công nghệ cao, sạch đất, không sâu bệnh, ăn ngay tại vườn.', type: 'simple' },
  { id: 6, name: 'Bơ sáp 034', slug: 'bo-sap-034', price: 85000, oldPrice: 0, image: 'https://images.unsplash.com/photo-1523049673856-382455342708?auto=format&fit=crop&q=80&w=400', category: 'Trái cây', rating: 4.7, reviews: 32, discount: 0, description: 'Bơ 034 dáng dài, hạt lép, cơm vàng dẻo quánh, béo ngậy.', type: 'simple' },
  { id: 7, name: 'Hạt điều rang muối', slug: 'hat-dieu-rang-muoi', price: 250000, oldPrice: 280000, image: 'https://images.unsplash.com/photo-1536591375315-196000ea3678?auto=format&fit=crop&q=80&w=400', category: 'Đồ khô', rating: 5, reviews: 67, discount: 12, description: 'Hạt điều Bình Phước rang củi thủ công, giữ nguyên vị ngọt bùi, giòn rụm.', type: 'simple' },
  { id: 8, name: 'Cam sành Hàm Yên', slug: 'cam-sanh-ham-yen', price: 40000, oldPrice: 0, image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=400', category: 'Trái cây', rating: 4.0, reviews: 15, discount: 0, description: 'Cam sành mọng nước, vị chua ngọt đậm đà, thích hợp vắt nước uống hàng ngày.', type: 'simple' },
  { id: 9, name: 'Mật ong rừng', slug: 'mat-ong-rung', price: 350000, oldPrice: 400000, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400', category: 'Đồ khô', rating: 5, reviews: 88, discount: 15, description: 'Mật ong rừng nguyên chất, khai thác tự nhiên, màu hổ phách, vị ngọt khé cổ.', type: 'simple' },
  { id: 10, name: 'Bí đỏ hồ lô', slug: 'bi-do-ho-lo', price: 25000, oldPrice: 0, image: 'https://images.unsplash.com/photo-1570586437263-ab629fddd318?auto=format&fit=crop&q=80&w=400', category: 'Rau củ', rating: 4.3, reviews: 10, discount: 0, description: 'Bí đỏ hồ lô dẻo ngọt, vỏ mỏng, giàu dinh dưỡng cho bé ăn dặm.', type: 'simple' },
];

export const BLOG_POSTS = [
  {
    id: 1,
    title: "Cách chọn sầu riêng ngon không thuốc ép chín",
    slug: "cach-chon-sau-rieng-ngon-khong-thuoc-ep-chin",
    excerpt: "Sầu riêng là loại trái cây vua nhưng không phải ai cũng biết cách chọn những quả chín cây tự nhiên. Hãy cùng AgriMart tìm hiểu những bí quyết chọn sầu riêng 'đỉnh của chóp' nhé...",
    content: `
      <p>Sầu riêng là loại trái cây vua của vùng nhiệt đới, nhưng việc chọn được một quả sầu riêng ngon, chín tự nhiên và nhiều cơm không phải là điều dễ dàng. Dưới đây là những bí quyết giúp bạn trở thành chuyên gia chọn sầu riêng.</p>
      
      <h3>1. Quan sát hình dáng và gai</h3>
      <p>Những quả sầu riêng ngon thường có hình dáng phình to đều, không bị méo mó. Gai sầu riêng chín cây sẽ nở to, cứng và đầu gai hơi tròn. Nếu gai nhọn hoắt và mềm thì có thể là quả còn non hoặc bị ép chín.</p>
      
      <h3>2. Kiểm tra cuống</h3>
      <p>Cuống sầu riêng chín cây khi sờ vào sẽ thấy ướt và có nhựa chảy ra. Nếu cuống khô queo, héo hon thì đó là sầu riêng đã để lâu hoặc bị cắt sớm.</p>
      
      <h3>3. Gõ vào quả</h3>
      <p>Dùng cán dao gõ nhẹ vào thân quả. Nếu nghe tiếng "bộp bộp" trầm ấm thì đó là quả nhiều cơm, hạt lép. Nếu nghe tiếng "coong coong" vang thì quả đó hạt to và ít cơm.</p>

      <h3>4. Mùi thơm</h3>
      <p>Sầu riêng chín tự nhiên có mùi thơm nồng nàn, lan tỏa xa. Sầu riêng ngâm thuốc thường có mùi nhạt hoặc thậm chí không mùi cho đến khi bổ ra.</p>
    `,
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=800",
    date: "12/10/2023",
    author: "Minh Anh",
    readTime: "5 phút",
    category: "Mẹo vặt",
    featured: true
  },
  {
    id: 2,
    title: "Lợi ích bất ngờ của khoai lang mật đối với sức khỏe",
    slug: "loi-ich-bat-ngo-cua-khoai-lang-mat-doi-voi-suc-khoe",
    excerpt: "Không chỉ ngon miệng, khoai lang mật còn là liều thuốc quý cho hệ tiêu hóa và hỗ trợ giảm cân hiệu quả...",
    content: "<p>Nội dung đang cập nhật...</p>",
    image: "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&q=80&w=600",
    date: "10/10/2023",
    author: "Thu Hà",
    readTime: "3 phút",
    category: "Sức khỏe"
  },
  {
    id: 3,
    title: "Quy trình trồng rau thủy canh chuẩn VietGAP",
    slug: "quy-trinh-trong-rau-thuy-canh-chuan-vietgap",
    excerpt: "Khám phá nông trại AgriMart nơi sản xuất ra những bó rau xanh sạch, an toàn tuyệt đối cho bữa ăn gia đình...",
    content: "<p>Nội dung đang cập nhật...</p>",
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=600",
    date: "05/10/2023",
    author: "Tuấn Vũ",
    readTime: "7 phút",
    category: "Nông nghiệp"
  },
  {
    id: 4,
    title: "5 Công thức nước ép giúp đẹp da giữ dáng",
    slug: "5-cong-thuc-nuoc-ep-giup-dep-da-giu-dang",
    excerpt: "Tổng hợp các công thức nước ép từ rau củ quả tươi mát, giúp thanh lọc cơ thể và cải thiện làn da...",
    content: "<p>Nội dung đang cập nhật...</p>",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600",
    date: "01/10/2023",
    author: "Ngọc Mai",
    readTime: "4 phút",
    category: "Ẩm thực"
  },
  {
    id: 5,
    title: "Phân biệt các loại gạo ngon trên thị trường",
    slug: "phan-biet-cac-loai-gao-ngon-tren-thi-truong",
    excerpt: "Gạo ST25, Gạo Lài Miên, Gạo Nàng Thơm... loại nào phù hợp nhất với khẩu vị gia đình bạn?",
    content: "<p>Nội dung đang cập nhật...</p>",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
    date: "28/09/2023",
    author: "Thanh Tùng",
    readTime: "6 phút",
    category: "Kiến thức"
  }
];