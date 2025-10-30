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
      // Picks for You
      {
        restaurantId: aljabriya.id,
        name: 'Sarookh Roosy Sandwich',
        description: 'Special signature sandwich',
        price: 1.8,
        tags: ['halal', 'popular'],
        imageUrl: '/images/menu/sarookh-roosy.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Half Chicken',
        description: 'Half grilled chicken',
        price: 2.0,
        tags: ['halal', 'popular'],
        imageUrl: '/images/menu/half-chicken.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Full Chicken',
        description: 'Full grilled chicken',
        price: 3.7,
        tags: ['halal', 'popular'],
        imageUrl: '/images/menu/full-chicken.jpg',
      },
      // Appetizers & Salads
      {
        restaurantId: aljabriya.id,
        name: 'Hummus',
        description: 'Creamy chickpea dip',
        price: 1.1,
        tags: ['vegetarian', 'vegan'],
        imageUrl: '/images/menu/hummus.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Muttabal',
        description: 'Smoky eggplant dip',
        price: 1.1,
        tags: ['vegetarian', 'vegan'],
        imageUrl: '/images/menu/muttabal.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Hot Salad',
        description: 'Spicy mixed salad',
        price: 1.1,
        tags: ['vegetarian', 'vegan'],
        imageUrl: '/images/menu/hot-salad.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Tabbouleh',
        description: 'Fresh parsley and bulgur salad',
        price: 1.1,
        tags: ['vegetarian', 'vegan'],
        imageUrl: '/images/menu/tabbouleh.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Cucumber Yogurt Salad',
        description: 'Refreshing cucumber with yogurt',
        price: 1.1,
        tags: ['vegetarian'],
        imageUrl: '/images/menu/cucumber-yogurt.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Baba Ghanooj',
        description: 'Grilled eggplant dip',
        price: 1.1,
        tags: ['vegetarian', 'vegan'],
        imageUrl: '/images/menu/baba-ghanooj.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Olives Salad',
        description: 'Mixed olives salad',
        price: 1.1,
        tags: ['vegetarian', 'vegan'],
        imageUrl: '/images/menu/olives-salad.jpg',
      },
      // Sandwiches
      {
        restaurantId: aljabriya.id,
        name: 'Chicken Shawarma',
        description: 'Marinated chicken shawarma wrap',
        price: 0.6,
        tags: ['halal'],
        imageUrl: '/images/menu/chicken-shawarma.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Beef Shawarma',
        description: 'Marinated beef shawarma wrap',
        price: 0.7,
        tags: ['halal'],
        imageUrl: '/images/menu/beef-shawarma.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Meat Shawarma Sarookh',
        description: 'Special meat shawarma',
        price: 1.6,
        tags: ['halal'],
        imageUrl: '/images/menu/meat-shawarma-sarookh.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Chicken Tikka Sandwich',
        description: 'Grilled chicken tikka in bread',
        price: 1.5,
        tags: ['halal'],
        imageUrl: '/images/menu/chicken-tikka-sandwich.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Chicken Kabab Sandwich',
        description: 'Grilled chicken kabab in bread',
        price: 1.5,
        tags: ['halal'],
        imageUrl: '/images/menu/chicken-kabab-sandwich.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Meat Kabab Sandwich',
        description: 'Grilled meat kabab in bread',
        price: 1.8,
        tags: ['halal'],
        imageUrl: '/images/menu/meat-kabab-sandwich.jpg',
      },
      {
        restaurantId: aljabriya.id,
        name: 'Meat Tikka Sandwich',
        description: 'Grilled meat tikka in bread',
        price: 1.8,
        tags: ['halal'],
        imageUrl: '/images/menu/meat-tikka-sandwich.jpg',
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
