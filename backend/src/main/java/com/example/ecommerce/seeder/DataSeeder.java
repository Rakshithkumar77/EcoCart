package com.example.ecommerce.seeder;

import com.example.ecommerce.entity.*;
import com.example.ecommerce.repository.*;
import com.example.ecommerce.service.CategoryServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CartRepository cartRepository;
    private final CouponRepository couponRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() > 0) {
            log.info("Database already seeded with products. Skipping seeder...");
            return;
        }

        log.info("Seeding database with sample e-commerce records...");

        // 1. Seed Users
        List<User> testUsers = new ArrayList<>();
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("Store Admin")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .phone("1234567890")
                    .role(Role.ROLE_ADMIN)
                    .build();
            userRepository.save(admin);
            cartRepository.save(Cart.builder().user(admin).build());

            for (int i = 1; i <= 3; i++) {
                User user = User.builder()
                        .name("User " + i)
                        .email("user" + i + "@example.com")
                        .password(passwordEncoder.encode("User@123"))
                        .phone("987654321" + i)
                        .role(Role.ROLE_USER)
                        .build();
                testUsers.add(userRepository.save(user));
                cartRepository.save(Cart.builder().user(user).build());
            }
        } else {
            testUsers = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ROLE_USER).toList();
        }

        // 2. Seed Categories
        Category electronics = categoryRepository.save(Category.builder().name("Electronics").slug("electronics").description("Gadgets, devices, and accessories").build());
        Category fashion = categoryRepository.save(Category.builder().name("Fashion").slug("fashion").description("Apparel, clothing, and wear").build());
        Category homeKitchen = categoryRepository.save(Category.builder().name("Home & Kitchen").slug("home-kitchen").description("Kitchenware and home decorations").build());
        Category books = categoryRepository.save(Category.builder().name("Books").slug("books").description("Fiction, non-fiction, academic, and novels").build());
        Category beauty = categoryRepository.save(Category.builder().name("Beauty").slug("beauty").description("Cosmetics and skincare").build());
        Category sports = categoryRepository.save(Category.builder().name("Sports").slug("sports").description("Fitness equipment and outdoor gear").build());

        // Subcategories
        Category laptops = categoryRepository.save(Category.builder().name("Laptops").slug("laptops").parentCategory(electronics).build());
        Category phones = categoryRepository.save(Category.builder().name("Mobile Phones").slug("mobile-phones").parentCategory(electronics).build());
        Category mensWear = categoryRepository.save(Category.builder().name("Men's Wear").slug("mens-wear").parentCategory(fashion).build());
        Category womensWear = categoryRepository.save(Category.builder().name("Women's Wear").slug("womens-wear").parentCategory(fashion).build());

        // 3. Seed Coupons
        couponRepository.save(Coupon.builder()
                .code("WELCOME10")
                .discountType(DiscountType.PERCENT)
                .discountValue(BigDecimal.valueOf(10))
                .minOrderValue(BigDecimal.valueOf(50.00))
                .expiryDate(LocalDateTime.now().plusYears(1))
                .isActive(true)
                .build());

        couponRepository.save(Coupon.builder()
                .code("FLAT50")
                .discountType(DiscountType.FLAT)
                .discountValue(BigDecimal.valueOf(50))
                .minOrderValue(BigDecimal.valueOf(200.00))
                .expiryDate(LocalDateTime.now().plusYears(1))
                .isActive(true)
                .build());

        // 4. Seed Products (30+ products)
        List<ProductSeedData> seedData = Arrays.asList(
                // Electronics -> Laptops
                new ProductSeedData("MacBook Pro 16", "Apple Silicon M3 Max, 36GB RAM, 1TB SSD, Space Black", BigDecimal.valueOf(2499.00), null, 15, "SKU-MBP16", laptops),
                new ProductSeedData("Dell XPS 15", "Intel Core i9, 32GB RAM, 1TB SSD, NVIDIA RTX 4060, OLED Touch Screen", BigDecimal.valueOf(1999.00), BigDecimal.valueOf(1849.00), 8, "SKU-DELLX15", laptops),
                new ProductSeedData("ASUS ROG Zephyrus G14", "AMD Ryzen 9, 16GB RAM, 1TB SSD, RTX 4070, Gaming Laptop", BigDecimal.valueOf(1599.00), null, 4, "SKU-ROGZ14", laptops), // Low Stock
                new ProductSeedData("Lenovo ThinkPad X1 Carbon", "Intel Ultra 7, 16GB RAM, 512GB SSD, Professional Laptop", BigDecimal.valueOf(1749.00), null, 12, "SKU-TPX1C", laptops),
                
                // Electronics -> Phones
                new ProductSeedData("iPhone 15 Pro Max", "256GB, Titanium Blue, A17 Pro Chip, 5X Telephoto Camera", BigDecimal.valueOf(1199.00), null, 25, "SKU-IP15PM", phones),
                new ProductSeedData("Samsung Galaxy S24 Ultra", "512GB, Titanium Gray, S-Pen included, Snapdragon 8 Gen 3", BigDecimal.valueOf(1299.00), BigDecimal.valueOf(1199.00), 20, "SKU-S24U", phones),
                new ProductSeedData("Google Pixel 8 Pro", "128GB, Obsidian, Tensor G3 Chip, Best-in-class AI Camera", BigDecimal.valueOf(999.00), BigDecimal.valueOf(849.00), 5, "SKU-PIX8P", phones), // Low Stock
                new ProductSeedData("OnePlus 12", "512GB, Silky Black, 16GB RAM, 100W Charging", BigDecimal.valueOf(799.00), null, 14, "SKU-OP12", phones),

                // Fashion -> Men's Wear
                new ProductSeedData("Men's Slim Fit Suit", "Elegant 3-Piece Navy Blue Suit for weddings and office", BigDecimal.valueOf(199.99), null, 15, "SKU-MSUIT", mensWear),
                new ProductSeedData("Premium Leather Jacket", "Classic black bomber leather jacket made of 100% sheepskin", BigDecimal.valueOf(149.99), BigDecimal.valueOf(129.99), 9, "SKU-MJACKET", mensWear), // Low Stock
                new ProductSeedData("Organic Cotton T-Shirt Pack", "Pack of 3 basic crewneck shirts (White, Gray, Black)", BigDecimal.valueOf(29.99), null, 50, "SKU-MTSHIRT", mensWear),
                new ProductSeedData("Men's Denim Jeans", "Classic straight-leg blue jeans, stretchable and comfortable", BigDecimal.valueOf(49.99), null, 30, "SKU-MJEANS", mensWear),

                // Fashion -> Women's Wear
                new ProductSeedData("Floral Summer Dress", "Lightweight, breathable bohemian dress with print", BigDecimal.valueOf(39.99), BigDecimal.valueOf(34.99), 22, "SKU-WDRESS", womensWear),
                new ProductSeedData("Wool Trench Coat", "Warm double-breasted winter trench coat in beige", BigDecimal.valueOf(120.00), null, 10, "SKU-WCOAT", womensWear),
                new ProductSeedData("Designer Handbag", "Faux leather top-handle satchel shoulder bag", BigDecimal.valueOf(89.99), BigDecimal.valueOf(79.99), 6, "SKU-WBAG", womensWear), // Low Stock
                new ProductSeedData("Women's Activewear Set", "High-waist yoga leggings and sports bra, matching set", BigDecimal.valueOf(45.00), null, 40, "SKU-WACTIVE", womensWear),

                // Home & Kitchen
                new ProductSeedData("Air Fryer XL", "5.8 Quart Digital Air Fryer with 10 pre-programmed presets", BigDecimal.valueOf(119.99), BigDecimal.valueOf(99.99), 18, "SKU-AIRFRY", homeKitchen),
                new ProductSeedData("Professional Blender", "1400W High Speed Blender for smoothies and purees", BigDecimal.valueOf(89.99), null, 11, "SKU-BLENDER", homeKitchen),
                new ProductSeedData("Espresso Machine", "15 Bar Pressure Coffee Maker with steam wand for cappuccino", BigDecimal.valueOf(149.99), null, 3, "SKU-ESPRESSO", homeKitchen), // Low Stock
                new ProductSeedData("Non-Stick Cookware Set", "12-Piece Ceramic Pots and Pans Set, toxin-free", BigDecimal.valueOf(129.99), BigDecimal.valueOf(109.99), 15, "SKU-PANS", homeKitchen),

                // Books
                new ProductSeedData("The Great Gatsby", "F. Scott Fitzgerald's classic novel exploring the Jazz Age", BigDecimal.valueOf(14.99), null, 100, "SKU-BOOK-GATSBY", books),
                new ProductSeedData("Sapiens", "A Brief History of Humankind by Yuval Noah Harari", BigDecimal.valueOf(22.00), BigDecimal.valueOf(18.50), 45, "SKU-BOOK-SAPIENS", books),
                new ProductSeedData("Atomic Habits", "An Easy & Proven Way to Build Good Habits & Break Bad Ones", BigDecimal.valueOf(16.99), null, 80, "SKU-BOOK-HABITS", books),
                new ProductSeedData("Introduction to Algorithms", "CLRS Computer Science textbook on algorithms", BigDecimal.valueOf(95.00), null, 14, "SKU-BOOK-ALGO", books),

                // Beauty
                new ProductSeedData("Hyaluronic Acid Serum", "Hydrating face serum with Pure Hyaluronic Acid", BigDecimal.valueOf(24.99), null, 60, "SKU-BEAUTY-HA", beauty),
                new ProductSeedData("Matte Liquid Lipstick", "Long-lasting, waterproof bold red lipstick", BigDecimal.valueOf(18.00), BigDecimal.valueOf(14.00), 35, "SKU-BEAUTY-LIP", beauty),
                new ProductSeedData("Mineral Sunscreen SPF 50", "Broad-spectrum sunscreen, lightweight and non-greasy", BigDecimal.valueOf(22.99), null, 40, "SKU-BEAUTY-SUN", beauty),
                new ProductSeedData("Clay Face Mask", "Deep pore cleansing French Green Clay mask", BigDecimal.valueOf(16.50), null, 8, "SKU-BEAUTY-MASK", beauty), // Low stock

                // Sports
                new ProductSeedData("Adjustable Dumbbells Set", "Pair of dumbbells adjustable from 5 to 52.5 lbs", BigDecimal.valueOf(299.99), BigDecimal.valueOf(269.99), 7, "SKU-SPORT-DUMB", sports), // Low stock
                new ProductSeedData("Yoga Mat Pro", "1/4 inch thick eco-friendly TPE yoga mat with alignment lines", BigDecimal.valueOf(39.99), null, 50, "SKU-SPORT-YOGA", sports),
                new ProductSeedData("Outdoor Camping Tent", "4-Person double-layer waterproof dome tent", BigDecimal.valueOf(79.99), null, 15, "SKU-SPORT-TENT", sports),
                new ProductSeedData("Hydration Backpack", "Lightweight running water backpack with 2L bladder", BigDecimal.valueOf(35.00), BigDecimal.valueOf(29.99), 25, "SKU-SPORT-PACK", sports)
        );

        long imgCounter = 1;
        for (ProductSeedData pData : seedData) {
            Product product = Product.builder()
                    .name(pData.name)
                    .slug(CategoryServiceImpl.toSlug(pData.name))
                    .description(pData.description)
                    .price(pData.price)
                    .discountPrice(pData.discountPrice)
                    .stockQuantity(pData.stockQuantity)
                    .sku(pData.sku)
                    .category(pData.category)
                    .ratingAvg(0.0)
                    .isActive(true)
                    .build();

            Product savedProduct = productRepository.save(product);

            // Generate images
            List<String> imageUrls = getProductImageUrls(savedProduct.getName());
            ProductImage primaryImg = ProductImage.builder()
                    .product(savedProduct)
                    .imageUrl(imageUrls.get(0))
                    .isPrimary(true)
                    .build();
            productImageRepository.save(primaryImg);

            ProductImage secImg = ProductImage.builder()
                    .product(savedProduct)
                    .imageUrl(imageUrls.get(1))
                    .isPrimary(false)
                    .build();
            productImageRepository.save(secImg);

            savedProduct.setImages(new ArrayList<>(Arrays.asList(primaryImg, secImg)));
            
            // Seed a few reviews
            if (testUsers.size() > 0) {
                // Add review from User 1
                Review rev1 = Review.builder()
                        .product(savedProduct)
                        .user(testUsers.get(0))
                        .rating(4 + (int) (Math.random() * 2)) // 4 or 5 stars
                        .comment("Excellent quality, highly recommend this product!")
                        .build();
                reviewRepository.save(rev1);

                // Add review from User 2
                Review rev2 = Review.builder()
                        .product(savedProduct)
                        .user(testUsers.get(1))
                        .rating(3 + (int) (Math.random() * 3)) // 3, 4 or 5 stars
                        .comment("Decent purchase, matches description.")
                        .build();
                reviewRepository.save(rev2);

                // Update product average rating
                savedProduct.setRatingAvg((double) (rev1.getRating() + rev2.getRating()) / 2.0);
                productRepository.save(savedProduct);
            }
        }

        log.info("Database seeding successfully completed!");
    }

    private List<String> getProductImageUrls(String name) {
        switch (name) {
            case "MacBook Pro 16":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
                    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"
                );
            case "Dell XPS 15":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
                    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800"
                );
            case "ASUS ROG Zephyrus G14":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
                    "https://images.unsplash.com/photo-1593642532744-d377ab507dc8?w=800"
                );
            case "Lenovo ThinkPad X1 Carbon":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800",
                    "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800"
                );
            case "iPhone 15 Pro Max":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800",
                    "https://images.unsplash.com/photo-1565849906663-52dd2582737a?w=800"
                );
            case "Samsung Galaxy S24 Ultra":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
                    "https://images.unsplash.com/photo-1610945415295-d9bde113ad80?w=800"
                );
            case "Google Pixel 8 Pro":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
                    "https://images.unsplash.com/photo-1598327105854-c86c4f1ae3a1?w=800"
                );
            case "OnePlus 12":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=800",
                    "https://images.unsplash.com/photo-1580974852861-13a586938cae?w=800"
                );
            case "Men's Slim Fit Suit":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
                    "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800"
                );
            case "Premium Leather Jacket":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
                    "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800"
                );
            case "Organic Cotton T-Shirt Pack":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
                    "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800"
                );
            case "Men's Denim Jeans":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
                    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800"
                );
            case "Floral Summer Dress":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
                    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800"
                );
            case "Wool Trench Coat":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800",
                    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800"
                );
            case "Designer Handbag":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
                    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800"
                );
            case "Women's Activewear Set":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800",
                    "https://images.unsplash.com/photo-1485727749690-d091e8284ef3?w=800"
                );
            case "Air Fryer XL":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=800",
                    "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800"
                );
            case "Professional Blender":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=800",
                    "https://images.unsplash.com/photo-1534685096185-90ff6a18d200?w=800"
                );
            case "Espresso Machine":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800",
                    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"
                );
            case "Non-Stick Cookware Set":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800",
                    "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800"
                );
            case "The Great Gatsby":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800",
                    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"
                );
            case "Sapiens":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
                    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800"
                );
            case "Atomic Habits":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
                    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800"
                );
            case "Introduction to Algorithms":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800",
                    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800"
                );
            case "Hyaluronic Acid Serum":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
                    "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800"
                );
            case "Matte Liquid Lipstick":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800",
                    "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=800"
                );
            case "Mineral Sunscreen SPF 50":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800",
                    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800"
                );
            case "Clay Face Mask":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
                    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800"
                );
            case "Adjustable Dumbbells Set":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800",
                    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800"
                );
            case "Yoga Mat Pro":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800",
                    "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800"
                );
            case "Outdoor Camping Tent":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
                    "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800"
                );
            case "Hydration Backpack":
                return Arrays.asList(
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
                    "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800"
                );
            default:
                return Arrays.asList(
                    "https://picsum.photos/seed/" + name.hashCode() + "/800/800",
                    "https://picsum.photos/seed/" + (name.hashCode() + 1) + "/800/800"
                );
        }
    }

    private static class ProductSeedData {
        String name;
        String description;
        BigDecimal price;
        BigDecimal discountPrice;
        Integer stockQuantity;
        String sku;
        Category category;

        public ProductSeedData(String name, String description, BigDecimal price, BigDecimal discountPrice, Integer stockQuantity, String sku, Category category) {
            this.name = name;
            this.description = description;
            this.price = price;
            this.discountPrice = discountPrice;
            this.stockQuantity = stockQuantity;
            this.sku = sku;
            this.category = category;
        }
    }
}
