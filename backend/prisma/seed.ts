import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create restaurants
  const adamSubs = await prisma.restaurant.create({
    data: {
      name: 'Adam Subs',
      description: 'Fresh submarine sandwiches and wraps',
      logoUrl: '/images/adam-subs-logo.webp',
    },
  });

  const aljabriya = await prisma.restaurant.create({
    data: {
      name: 'Aljabriya',
      description: 'Authentic Middle Eastern cuisine and grills',
      logoUrl: '/images/aljabriya-logo.webp',
    },
  });

  const wingman = await prisma.restaurant.create({
    data: {
      name: 'Wingman',
      description: 'Chicken wings and American comfort food',
      logoUrl: '/images/wingman-logo.webp',
    },
  });

  console.log('✅ Created restaurants');

  // Create menu items for Adam Subs
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: adamSubs.id,
        name: 'Philly Cheese Steak Sub',
        description: 'Sliced beef, melted cheese, onions, peppers on a fresh sub roll',
        price: 3.5,
        tags: [],
        imageUrl: '/images/menu/philly-cheese-steak.jpg',
      },
      {
        restaurantId: adamSubs.id,
        name: 'Chicken Teriyaki Sub',
        description: 'Grilled chicken with teriyaki sauce, lettuce, tomatoes',
        price: 3.2,
        tags: [],
        imageUrl: '/images/menu/chicken-teriyaki.jpg',
      },
      {
        restaurantId: adamSubs.id,
        name: 'Meatball Marinara Sub',
        description: 'Italian meatballs in marinara sauce with melted mozzarella',
        price: 3.3,
        tags: [],
        imageUrl: '/images/menu/meatball-sub.jpg',
      },
      {
        restaurantId: adamSubs.id,
        name: 'Tuna Sub',
        description: 'Fresh tuna salad with lettuce, tomatoes, and pickles',
        price: 2.8,
        tags: [],
        imageUrl: '/images/menu/tuna-sub.jpg',
      },
      {
        restaurantId: adamSubs.id,
        name: 'Veggie Delight Sub',
        description: 'Fresh vegetables with cheese and your choice of sauce',
        price: 2.5,
        tags: ['vegetarian'],
        imageUrl: '/images/menu/veggie-sub.jpg',
      },
      {
        restaurantId: adamSubs.id,
        name: 'French Fries',
        description: 'Crispy golden french fries',
        price: 1.0,
        tags: ['vegetarian', 'vegan'],
        imageUrl: '/images/menu/fries.jpg',
      },
      {
        restaurantId: adamSubs.id,
        name: 'Soft Drink',
        description: 'Choice of Pepsi, 7Up, or Mirinda',
        price: 0.5,
        tags: ['vegan'],
        imageUrl: '/images/menu/soft-drink.jpg',
      },
    ],
  });

  // Create menu items for Aljabriya
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: aljabriya.id,
        name: 'Mixed Grill Platter',
        description: 'Lamb kebab, chicken tikka, and kofta with rice and salad',
        price: 5.5,
        tags: ['halal'],
        imageUrl: '/images/menu/mixed-grill.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Chicken Shawarma Plate',
        description: 'Marinated chicken shawarma with garlic sauce, pickles, and fries',
        price: 3.0,
        tags: ['halal'],
        imageUrl: '/images/menu/chicken-shawarma.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Lamb Kebab',
        description: 'Grilled lamb kebab skewers with rice and grilled vegetables',
        price: 4.5,
        tags: ['halal'],
        imageUrl: '/images/menu/lamb-kebab.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Chicken Tikka',
        description: 'Marinated chicken pieces grilled to perfection',
        price: 3.8,
        tags: ['halal'],
        imageUrl: '/images/menu/chicken-tikka.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Falafel Plate',
        description: 'Crispy falafel with hummus, tahini, and fresh vegetables',
        price: 2.5,
        tags: ['vegetarian', 'vegan'],
        imageUrl: '/images/menu/falafel.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Hummus with Meat',
        description: 'Creamy hummus topped with seasoned minced meat',
        price: 3.2,
        tags: ['halal'],
        imageUrl: '/images/menu/hummus-meat.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Arabic Salad',
        description: 'Fresh tomatoes, cucumbers, lettuce with lemon dressing',
        price: 1.5,
        tags: ['vegetarian', 'vegan'],
        imageUrl: '/images/menu/arabic-salad.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Fresh Juice',
        description: 'Choice of orange, lemon mint, or mango juice',
        price: 1.2,
        tags: ['vegan'],
        imageUrl: '/images/menu/fresh-juice.jpg',
      },
    ],
  });

  // Create menu items for Wingman
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: wingman.id,
        name: 'Buffalo Wings (8 pcs)',
        description: 'Classic buffalo wings with blue cheese dip',
        price: 3.5,
        tags: [],
        imageUrl: '/images/menu/buffalo-wings.jpg',
      },
      {
        restaurantId: wingman.id,
        name: 'BBQ Wings (8 pcs)',
        description: 'Smoky BBQ glazed chicken wings',
        price: 3.5,
        tags: [],
        imageUrl: '/images/menu/bbq-wings.jpg',
      },
      {
        restaurantId: wingman.id,
        name: 'Honey Mustard Wings (8 pcs)',
        description: 'Sweet and tangy honey mustard wings',
        price: 3.5,
        tags: [],
        imageUrl: '/images/menu/honey-mustard-wings.jpg',
      },
      {
        restaurantId: wingman.id,
        name: 'Spicy Korean Wings (8 pcs)',
        description: 'Korean-style spicy glazed wings',
        price: 3.8,
        tags: [],
        imageUrl: '/images/menu/korean-wings.jpg',
      },
      {
        restaurantId: wingman.id,
        name: 'Chicken Tenders (5 pcs)',
        description: 'Crispy chicken tenders with your choice of sauce',
        price: 3.2,
        tags: [],
        imageUrl: '/images/menu/chicken-tenders.jpg',
      },
      {
        restaurantId: wingman.id,
        name: 'Loaded Fries',
        description: 'Fries topped with cheese, bacon bits, and ranch',
        price: 2.5,
        tags: [],
        imageUrl: '/images/menu/loaded-fries.jpg',
      },
      {
        restaurantId: wingman.id,
        name: 'Coleslaw',
        description: 'Fresh creamy coleslaw',
        price: 1.0,
        tags: ['vegetarian'],
        imageUrl: '/images/menu/coleslaw.jpg',
      },
      {
        restaurantId: wingman.id,
        name: 'Iced Tea',
        description: 'Refreshing iced tea',
        price: 0.8,
        tags: ['vegan'],
        imageUrl: '/images/menu/iced-tea.jpg',
      },
    ],
  });

  console.log('✅ Created menu items');

  console.log('🎉 Database seeded successfully!');
  console.log(`   - 3 restaurants created`);
  console.log(`   - 23 menu items created`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
