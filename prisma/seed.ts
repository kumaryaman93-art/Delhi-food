import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed default settings
  await prisma.settings.upsert({
    where: { id: "1" },
    update: {},
    create: {
      id: "1",
      restaurantName: "Delhi Food Junction",
      tagline: "100% Pure Vegetarian",
      about: "Best Continental Restaurant in Ludhiana Punjab India. Located in Salem Tabri, we serve a wide variety of vegetarian dishes — from Chinese snacks to South Indian, North Indian mains, fresh mocktails, and more!",
      phone: "099147 55509",
      address: "Netaji Nagar, Netaji Colony, Salem Tabri, Ludhiana, Punjab 141008",
    },
  });

  // Seed admin user
  const hashedPassword = await bcrypt.hash("Admin@123", 12);
  await prisma.admin.upsert({
    where: { email: "admin@delhifoodjunction.com" },
    update: {},
    create: {
      email: "admin@delhifoodjunction.com",
      passwordHash: hashedPassword,
      name: "DFJ Admin",
    },
  });

  // Seed categories and menu items
  const categories = [
    {
      name: "Chat & Snacks", emoji: "🥙", order: 1,
      items: [
        { name: "Pav Bhaji", price: 80, desc: "Mumbai-style spicy mashed vegetables with butter pav" },
        { name: "Dahi Bhalle", price: 50, desc: "Soft lentil dumplings soaked in yogurt with chutneys" },
        { name: "Bhalla Papdi", price: 50, desc: "Crispy papdi with dahi bhalle and tangy chutneys" },
        { name: "Jaljeera (Extra 150ml)", price: 20, desc: "Refreshing cumin-flavored drink" },
        { name: "Stuff Golgappa (Dahi Wala)", price: 60, desc: "Crispy puris stuffed with potato and dahi" },
        { name: "Chatpata Suka Golgappa", price: 10, desc: "Dry spicy golgappas" },
        { name: "Chatpata Cream Golgappa", price: 15, desc: "Cream-filled spicy golgappas" },
      ],
    },
    {
      name: "Chinese Snacks", emoji: "🥢", order: 2,
      items: [
        { name: "Chilli Garlic Potato", price: 150, desc: "Crispy potato tossed in chilli garlic sauce" },
        { name: "Spring Roll (Noodles)", price: 150, desc: "Crispy rolls stuffed with spicy noodles" },
        { name: "Cheese Corn Roll", price: 180, desc: "Golden rolls filled with cheese and sweet corn" },
        { name: "Manchurian Dry", price: 90, half: 90, desc: "Crispy vegetable manchurian in dry sauce" },
        { name: "Manchurian Gravy", price: 90, half: 90, desc: "Vegetable manchurian in spicy gravy" },
        { name: "Manchurian Hongkong", price: 160, desc: "Special Hongkong-style manchurian" },
        { name: "Cheese Manchurian", price: 180, desc: "Manchurian balls loaded with cheese" },
        { name: "Cheese Chilli Dry", price: 120, half: 120, desc: "Crispy cheese cubes tossed with chilli" },
        { name: "Cheese Chilli Gravy", price: 130, half: 130, desc: "Cheese cubes in spicy chilli gravy" },
        { name: "Cheese Finger", price: 200, desc: "Cheesy crispy fingers" },
        { name: "Mushroom Chilli Dry", price: 120, half: 120, desc: "Stir-fried mushrooms with chilli" },
        { name: "Mushroom Chilli Gravy", price: 140, half: 140, desc: "Mushrooms in spicy chilli gravy" },
        { name: "Mushroom Duplex", price: 190, desc: "Double-style mushroom preparation" },
        { name: "Crispy Veg", price: 160, desc: "Mixed crispy vegetables" },
        { name: "Veg. Bullets", price: 160, desc: "Crispy vegetable bullets" },
        { name: "Paneer Singapuri", price: 140, half: 140, desc: "Paneer in Singapore-style sauce" },
        { name: "Paneer Hongkong", price: 220, desc: "Paneer in Hongkong-style spicy sauce" },
        { name: "Honey Chilli Potato", price: 160, desc: "Crispy potato in honey chilli glaze" },
        { name: "Honey Chilly Cauliflower", price: 160, desc: "Crispy cauliflower in honey chilli sauce" },
      ],
    },
    {
      name: "Pizza", emoji: "🍕", order: 3,
      items: [
        { name: "Margherita Pizza (Small)", price: 80, desc: "Classic pizza with tomato sauce and mozzarella" },
        { name: "Mix Veg Pizza (Small)", price: 100, desc: "Loaded with fresh mixed vegetables" },
        { name: "Mix Veg Corn Pizza (Small)", price: 110, desc: "Mixed vegetables with sweet corn" },
        { name: "Sweet Corn Pizza (Small)", price: 70, desc: "Creamy sweet corn pizza" },
        { name: "Aachari Pizza (Medium)", price: 170, desc: "Tangy pickle-spiced pizza" },
        { name: "Tandoori Pizza (Medium)", price: 170, desc: "Indian tandoori-style pizza" },
        { name: "Mexican Pizza (Medium)", price: 170, desc: "Spicy Mexican-style pizza" },
        { name: "Double Cheese Pizza (Medium)", price: 200, desc: "Extra cheese double delight" },
        { name: "Chilly Paneer Pizza (Large)", price: 220, desc: "Spicy paneer with chilli on pizza" },
        { name: "Paneer Tikka Pizza (Large)", price: 220, desc: "Tandoori paneer tikka pizza" },
        { name: "Makhani Paneer Pizza (Large)", price: 220, desc: "Rich makhani paneer pizza" },
      ],
    },
    {
      name: "Noodles", emoji: "🍜", order: 4,
      items: [
        { name: "Veg. Noodles", price: 90, half: 90, desc: "Classic vegetable hakka noodles" },
        { name: "Veg. Chilli Garlic Noodles", price: 160, desc: "Spicy chilli garlic noodles" },
        { name: "Veg. Singapuri Noodles", price: 160, desc: "Singapore-style spicy noodles" },
        { name: "Hakka Noodles", price: 160, desc: "Classic hakka-style noodles" },
        { name: "Veg. Noodles Chopsuey", price: 180, desc: "Crispy noodles with vegetable sauce" },
        { name: "Spanish Noodles", price: 190, desc: "Spanish-style seasoned noodles" },
        { name: "Special Noodles", price: 120, half: 120, desc: "Chef's special noodle preparation" },
      ],
    },
    {
      name: "Fried Rice & Combo", emoji: "🍚", order: 5,
      items: [
        { name: "Veg. Fried Rice", price: 100, desc: "Classic vegetable fried rice" },
        { name: "Chilly Garlic Fried Rice", price: 120, desc: "Spicy chilli garlic fried rice" },
        { name: "Manchurian with Fried Rice", price: 140, desc: "Manchurian and fried rice combo" },
        { name: "Cheese Chilly Fried Rice", price: 160, desc: "Cheese-loaded chilli fried rice" },
      ],
    },
    {
      name: "South Indian", emoji: "🥞", order: 6,
      items: [
        { name: "Plain Dosa", price: 100, desc: "Crispy plain dosa with sambar and chutney" },
        { name: "Masala Dosa", price: 120, desc: "Dosa stuffed with spiced potato filling" },
        { name: "Veg. Dosa", price: 130, desc: "Dosa with mixed vegetable filling" },
        { name: "Onion Dosa", price: 130, desc: "Crispy dosa with onion topping" },
        { name: "Paneer Dosa", price: 150, desc: "Dosa filled with spiced paneer" },
        { name: "Spl. Dosa", price: 160, desc: "Special loaded dosa" },
        { name: "Masala Rava Dosa", price: 140, desc: "Crispy rava dosa with masala filling" },
        { name: "Onion Rava Dosa", price: 150, desc: "Crispy rava dosa with onions" },
        { name: "Paneer Rava Dosa", price: 160, desc: "Rava dosa with paneer filling" },
        { name: "Masala Uttapam", price: 140, desc: "Thick pancake with masala topping" },
        { name: "Onion Uttapam", price: 160, desc: "Fluffy uttapam with onions" },
        { name: "Paneer Uttapam", price: 180, desc: "Uttapam topped with paneer" },
        { name: "Idli Sambar", price: 120, desc: "Soft idlis with sambar and chutney" },
        { name: "Vada Sambar", price: 120, desc: "Crispy vadas with sambar" },
        { name: "Dahi Vada", price: 100, desc: "Soft vadas soaked in dahi" },
      ],
    },
    {
      name: "Biryani & Rice", emoji: "🍛", order: 7,
      items: [
        { name: "Veg. Biryani", price: 180, desc: "Fragrant basmati rice with vegetables and spices" },
        { name: "Veg Biryani Gravy", price: 230, desc: "Biryani served with dal or gravy" },
        { name: "Spl. Biryani", price: 200, desc: "Special chef's biryani" },
        { name: "Mutter Pullao", price: 150, desc: "Aromatic peas pullao" },
        { name: "Jeera Rice", price: 130, desc: "Fragrant cumin-flavored rice" },
      ],
    },
    {
      name: "Indian Main Course", emoji: "🍲", order: 8,
      items: [
        { name: "Dal Makhani", price: 100, half: 100, desc: "Creamy black lentils slow-cooked overnight" },
        { name: "Dal Yellow", price: 180, desc: "Yellow lentil dal tempered with spices" },
        { name: "Dal Punjabi Tadka", price: 180, desc: "Punjabi-style dal with smoky tadka" },
        { name: "Chana Masala", price: 180, desc: "Spicy chickpea curry" },
        { name: "Mix Vegetable", price: 100, half: 100, desc: "Seasonal mixed vegetable curry" },
        { name: "Nav Ratan Korma", price: 270, desc: "Rich nine-ingredient royal korma" },
        { name: "Mushroom Mutter", price: 230, desc: "Mushroom and peas curry" },
        { name: "Mushroom Do Piaza", price: 230, desc: "Mushroom with double onion preparation" },
        { name: "Malai Kofta", price: 230, desc: "Soft paneer-potato balls in creamy sauce" },
        { name: "Malai Methi", price: 230, desc: "Creamy fenugreek-flavored curry" },
        { name: "Cheese Tomato", price: 230, desc: "Cheese cubes in tomato-based gravy" },
        { name: "Shahi Paneer", price: 150, half: 150, desc: "Paneer in rich royal cream sauce" },
        { name: "Palak Paneer", price: 230, desc: "Paneer in spiced spinach gravy" },
        { name: "Paneer Lababdar", price: 250, desc: "Paneer in tangy tomato-onion gravy" },
        { name: "Paneer Do Piaza", price: 230, desc: "Paneer with double onion preparation" },
        { name: "Karahi Paneer", price: 150, half: 150, desc: "Paneer cooked in iron wok with spices" },
        { name: "Paneer Kofta", price: 230, desc: "Paneer dumplings in rich gravy" },
        { name: "Paneer Butter Masala", price: 150, half: 150, desc: "Paneer in rich buttery tomato sauce" },
        { name: "Paneer Pasanda Masala", price: 230, desc: "Flat paneer stuffed with dry fruits" },
        { name: "Rara Paneer", price: 230, desc: "Paneer cooked with minced vegetables" },
        { name: "Handi Paneer", price: 230, desc: "Paneer slow-cooked in clay pot" },
        { name: "Paneer Khurchan", price: 250, desc: "Paneer scraped and cooked with peppers" },
        { name: "Makhani Paneer", price: 250, desc: "Paneer in classic makhani sauce" },
        { name: "Delhi Spl. Paneer Begam Bar", price: 300, desc: "Signature Delhi-style paneer specialty" },
      ],
    },
    {
      name: "Indian Breads", emoji: "🫓", order: 9,
      items: [
        { name: "Plain Roti", price: 10, desc: "Simple whole wheat roti" },
        { name: "Butter Roti", price: 15, desc: "Roti topped with butter" },
        { name: "Naan", price: 30, desc: "Soft leavened bread baked in tandoor" },
        { name: "Missi Roti", price: 30, desc: "Spiced chickpea flour roti" },
        { name: "Garlic Naan", price: 60, desc: "Naan flavored with garlic and herbs" },
        { name: "Butter Naan", price: 40, desc: "Soft naan topped with butter" },
        { name: "Cheese Naan", price: 90, desc: "Naan stuffed with melted cheese" },
        { name: "Pudina Prantha", price: 50, desc: "Layered flatbread with mint flavor" },
        { name: "Laccha Prantha", price: 50, desc: "Flaky multi-layered flatbread" },
        { name: "Red/Green Chilli Prantha", price: 50, desc: "Spicy chilli-flavored layered bread" },
      ],
    },
    {
      name: "Tandoori Snacks", emoji: "🔥", order: 10,
      items: [
        { name: "Paneer Tikka", price: 120, half: 120, desc: "Marinated paneer grilled in tandoor" },
        { name: "Paneer Malai", price: 140, half: 140, desc: "Creamy malai-marinated paneer tikka" },
        { name: "Mushroom Tikka", price: 180, desc: "Tandoor-grilled marinated mushrooms" },
        { name: "Mushroom Malai Tikka", price: 200, desc: "Creamy malai mushroom tikka" },
        { name: "Snacks Champ (Dry)", price: 100, half: 100, desc: "Dry-style soya champ snack" },
        { name: "Masala Champ", price: 100, half: 100, desc: "Spicy masala-coated soya champ" },
        { name: "Malai Champ", price: 120, half: 120, desc: "Creamy malai soya champ" },
        { name: "Aachari Champ", price: 120, half: 120, desc: "Pickle-spiced soya champ" },
        { name: "Kalimirch Champ", price: 120, half: 120, desc: "Black pepper flavored soya champ" },
        { name: "Afgani Champ", price: 140, half: 140, desc: "Afghani-style creamy soya champ", featured: true },
        { name: "Mint Haryali Champ", price: 120, half: 120, desc: "Mint and herb marinated soya champ" },
        { name: "Butter Masala Gravy Champ", price: 130, half: 130, desc: "Soya champ in butter masala gravy" },
        { name: "Delhi Spl. Champ", price: 140, half: 140, desc: "Signature Delhi-style soya champ" },
        { name: "Delhi Spl. Gravy Champ", price: 140, half: 140, desc: "Delhi special champ in gravy" },
        { name: "White Gravy Champ", price: 140, half: 140, desc: "Soya champ in white cream gravy" },
      ],
    },
    {
      name: "Raita & Salad", emoji: "🥗", order: 11,
      items: [
        { name: "Pineapple Raita", price: 110, desc: "Yogurt with pineapple and spices" },
        { name: "Mix Veg Raita", price: 90, desc: "Yogurt with mixed vegetables" },
        { name: "Boondi Raita", price: 90, desc: "Yogurt with crispy boondi" },
        { name: "Green Salad", price: 70, desc: "Fresh garden vegetable salad" },
        { name: "Papad", price: 15, desc: "Crispy roasted papad" },
      ],
    },
    {
      name: "Pasta", emoji: "🍝", order: 12,
      items: [
        { name: "Red Sauce Juicy Pasta", price: 170, desc: "Pasta in tangy red tomato sauce", featured: true },
        { name: "Spl. Red Sauce Juicy Pasta", price: 210, desc: "Special loaded red sauce pasta" },
        { name: "White Sauce Pasta", price: 180, desc: "Creamy white béchamel sauce pasta", featured: true },
        { name: "Spl. White Sauce Pasta", price: 220, desc: "Special loaded white sauce pasta" },
        { name: "Mix Sauce Pasta", price: 250, desc: "Best of both — red and white sauce" },
      ],
    },
    {
      name: "Soups", emoji: "🍵", order: 13,
      items: [
        { name: "Veg. Manchow Soup", price: 60, desc: "Tangy Chinese manchow soup with crispy noodles" },
        { name: "Veg. Sweet Corn Soup", price: 60, desc: "Creamy sweet corn vegetable soup" },
        { name: "Veg Hot & Sour Soup", price: 80, desc: "Spicy and tangy hot & sour soup" },
      ],
    },
    {
      name: "Wraps (Kathi Roll)", emoji: "🌯", order: 14,
      items: [
        { name: "Veg Wrap", price: 100, desc: "Fresh vegetable filling in a soft wrap" },
        { name: "Chilli Paneer Wrap", price: 140, desc: "Spicy chilli paneer in a kathi roll" },
        { name: "Paneer Tikka Wrap", price: 160, desc: "Tandoori paneer tikka wrap" },
      ],
    },
    {
      name: "Burger", emoji: "🍔", order: 15,
      items: [
        { name: "Aloo Tikki Burger", price: 40, desc: "Classic aloo tikki in a burger bun" },
        { name: "Crispy Chatpta Burger", price: 50, desc: "Crispy chatpata patty burger" },
        { name: "Veggie Burger", price: 60, desc: "Fresh vegetable patty burger" },
        { name: "Noodle Burger", price: 60, desc: "Unique noodle-filled burger" },
        { name: "Mexican Burger", price: 60, desc: "Spicy Mexican-style burger" },
        { name: "Tandoori Burger", price: 60, desc: "Tandoori-spiced patty burger" },
        { name: "Cheese Slice Burger", price: 70, desc: "Burger with cheese slice" },
        { name: "Cheese Bust Burger", price: 70, desc: "Cheese-burst burger" },
        { name: "Makhani Burger", price: 80, desc: "Makhani-flavored special burger" },
        { name: "Spicy Garlic Burger", price: 80, desc: "Spicy garlic-loaded burger" },
        { name: "Maharaja Burger", price: 100, desc: "The ultimate royal burger", featured: true },
        { name: "French Fries Plain", price: 80, desc: "Crispy golden french fries" },
        { name: "French Fries Peri-Peri", price: 100, desc: "Fries tossed in peri-peri spice" },
        { name: "French Fries with Cheese", price: 120, desc: "Fries loaded with melted cheese" },
        { name: "French Fries Smokey", price: 120, desc: "Smokey flavored french fries" },
      ],
    },
    {
      name: "Sandwich & Garlic Bread", emoji: "🥪", order: 16,
      items: [
        { name: "Veg Grilled Sandwich", price: 100, desc: "Classic grilled vegetable sandwich" },
        { name: "Veg Corn Sandwich", price: 110, desc: "Sandwich with sweet corn and vegetables" },
        { name: "Tandoori Sandwich", price: 120, desc: "Sandwich with tandoori-spiced filling" },
        { name: "Mexican Sandwich", price: 120, desc: "Spicy Mexican-style sandwich" },
        { name: "Chilly Paneer Sandwich", price: 140, desc: "Sandwich filled with chilli paneer" },
        { name: "Paneer Tikka Sandwich", price: 160, desc: "Sandwich with paneer tikka filling" },
        { name: "Stuffed Garlic Bread", price: 140, desc: "Garlic bread stuffed with vegetables" },
        { name: "Stuffed Mushroom Garlic Bread", price: 160, desc: "Garlic bread stuffed with mushrooms" },
        { name: "Spicy Paneer Garlic Bread", price: 160, desc: "Garlic bread with spicy paneer topping" },
      ],
    },
    {
      name: "Momos", emoji: "🥟", order: 17,
      items: [
        { name: "Veg. Steam Momos", price: 80, desc: "Steamed dumplings with vegetable filling" },
        { name: "Fried Momos", price: 90, desc: "Crispy fried vegetable dumplings" },
        { name: "Tandoori Momos", price: 110, desc: "Tandoor-grilled momos with spicy marinade" },
      ],
    },
    {
      name: "Mocktails", emoji: "🥤", order: 18,
      items: [
        { name: "Fresh Lime Soda", price: 60, desc: "Refreshing fresh lime soda" },
        { name: "Mojito (Mocktail)", price: 80, desc: "Mint and lime mocktail" },
        { name: "Black Current Mojito", price: 100, desc: "Black currant flavored mojito" },
        { name: "Peach Mojito", price: 120, desc: "Peach-flavored fresh mojito" },
        { name: "Blue Sky (Mocktail)", price: 80, desc: "Blue-colored refreshing mocktail" },
        { name: "Jungle Bird (Mocktail)", price: 120, desc: "Tropical jungle bird mocktail" },
        { name: "Sunsets (Mocktail)", price: 120, desc: "Beautiful sunset-colored mocktail" },
        { name: "Thai Beach (Mocktail)", price: 120, desc: "Thai-inspired beach mocktail" },
      ],
    },
    {
      name: "Hot Coffee & Beverages", emoji: "☕", order: 19,
      items: [
        { name: "Cappuccino", price: 70, desc: "Classic Italian cappuccino" },
        { name: "Americano", price: 70, desc: "Strong black americano coffee" },
        { name: "Green Tea", price: 50, desc: "Refreshing green tea" },
        { name: "Masala Tea", price: 50, desc: "Spiced Indian masala chai" },
        { name: "Packed Water", price: 20, desc: "Mineral water bottle" },
        { name: "Soft Drink", price: 20, desc: "Chilled soft drink" },
      ],
    },
    {
      name: "Ice Cream & Shakes", emoji: "🍦", order: 20,
      items: [
        { name: "Ice Cream (Regular)", price: 70, desc: "Classic vanilla ice cream scoop" },
        { name: "Ice Cream (Premium)", price: 80, desc: "Premium flavor ice cream" },
        { name: "Cold Coffee", price: 110, desc: "Chilled blended coffee shake" },
        { name: "Vanilla Shakes", price: 110, desc: "Creamy vanilla milkshake" },
        { name: "Strawberry Shakes", price: 110, desc: "Fresh strawberry milkshake" },
        { name: "Mango Shakes", price: 110, desc: "Rich mango milkshake" },
        { name: "Black Current Shakes", price: 110, desc: "Black currant milkshake" },
        { name: "Chocolate Shakes", price: 110, desc: "Rich chocolate milkshake" },
        { name: "Orio Shakes", price: 110, desc: "Oreo cookie milkshake" },
        { name: "Kitkat Shakes", price: 110, desc: "KitKat chocolate milkshake" },
        { name: "Butter Scotch Shakes", price: 110, desc: "Creamy butterscotch milkshake" },
      ],
    },
  ];

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { id: cat.name.toLowerCase().replace(/\s+/g, "-").replace(/[&()]/g, "") },
      update: { emoji: cat.emoji, displayOrder: cat.order },
      create: {
        id: cat.name.toLowerCase().replace(/\s+/g, "-").replace(/[&()]/g, ""),
        name: cat.name,
        emoji: cat.emoji,
        displayOrder: cat.order,
      },
    });

    for (let i = 0; i < cat.items.length; i++) {
      const item = cat.items[i] as { name: string; price: number; desc: string; featured?: boolean };
      await prisma.menuItem.upsert({
        where: {
          id: `${category.id}-${item.name.toLowerCase().replace(/\s+/g, "-").replace(/[().,'\/]/g, "").substring(0, 40)}`,
        },
        update: { price: item.price, description: item.desc },
        create: {
          id: `${category.id}-${item.name.toLowerCase().replace(/\s+/g, "-").replace(/[().,'\/]/g, "").substring(0, 40)}`,
          categoryId: category.id,
          name: item.name,
          description: item.desc,
          price: item.price,
          isVeg: true,
          isAvailable: true,
          isFeatured: item.featured ?? false,
          displayOrder: i,
        },
      });
    }
  }

  console.log("✅ Seed complete!");
  console.log("Admin email: admin@delhifoodjunction.com");
  console.log("Admin password: Admin@123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
