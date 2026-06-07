/* Script para criar o restaurante Big Jhon no banco
   Execute: npx tsx prisma/create-bigjohn.ts
*/
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

// Imagens reais buscadas na web (fundo transparente)
const IMG = {
  // Hambúrgueres — pngimg.com (CC BY-NC 4.0)
  burger1: "https://pngimg.com/uploads/burger_sandwich/burger_sandwich_PNG4136.png", // duplo empilhado
  burger2: "https://pngimg.com/uploads/burger_sandwich/burger_sandwich_PNG4115.png", // classic
  burger3: "https://pngimg.com/uploads/burger_sandwich/burger_sandwich_PNG4135.png", // smash
  burger4: "https://pngimg.com/uploads/burger_sandwich/burger_sandwich_PNG4114.png", // cheddar
  burger5: "https://pngimg.com/uploads/burger_sandwich/burger_sandwich_PNG4140.png", // bacon
  // Frango empanado
  chicken: "https://pngimg.com/uploads/fried_chicken/fried_chicken_PNG14094.png",
  // Batata frita
  fries:   "https://pngimg.com/uploads/fries/fries_PNG97891.png",
  // Bebidas
  coca:    "https://pngimg.com/uploads/cocacola/cocacola_PNG10.png",
  guarana: "https://www.pngkit.com/png/detail/403-4034236_refrigerante-guaran-antarctica-lata-350ml-guaran-antarctica-lata.png",
  agua:    "https://u9a6wmr3as.ufs.sh/f/jppBrbk0cChQ7i05S5tkc0L9oMIXZsFJtwnBh2KCz3y6uSW1",
};

const main = async () => {
  await db.restaurant.deleteMany({ where: { slug: "big-jhon" } });

  const restaurant = await db.restaurant.create({
    data: {
      name: "Big Jhon Hamburgueria",
      slug: "big-jhon",
      description: "O Burguer de Outro Planeta 🍔 Pontal de Santa Marina, Caraguatatuba",
      primaryColor: "0 84% 50%",
      avatarImageUrl:
        "https://static.ifood-static.com.br/image/upload/logosgde/a6082ee4-13ea-4649-b276-dde7af384af4/202503110920_hmN6_i.jpg",
      coverImageUrl:
        "https://static.ifood-static.com.br/image/upload/logosgde/a6082ee4-13ea-4649-b276-dde7af384af4/202503110920_hmN6_i.jpg",
      kitchenPassword: bcrypt.hashSync("bigjohn123", 10),
      tableCount: 15,
      openingHours: {
        create: [
          { dayOfWeek: 0, openTime: "18:00", closeTime: "23:00" },
          { dayOfWeek: 1, openTime: "18:00", closeTime: "23:00" },
          { dayOfWeek: 2, openTime: "18:00", closeTime: "23:00" },
          { dayOfWeek: 3, openTime: "18:00", closeTime: "23:00" },
          { dayOfWeek: 4, openTime: "18:00", closeTime: "23:00" },
          { dayOfWeek: 5, openTime: "18:00", closeTime: "00:00" },
          { dayOfWeek: 6, openTime: "18:00", closeTime: "00:00" },
        ],
      },
    },
  });

  console.log(`✅ Restaurante criado: ${restaurant.name} (/${restaurant.slug})`);

  // ─── LANCHES ────────────────────────────────────────────────────────────────
  const lanches = await db.menuCategory.create({
    data: { name: "Lanches", restaurantId: restaurant.id },
  });

  await db.product.createMany({
    data: [
      {
        name: "X-Big Jhon",
        badge: "MAIS_PEDIDO",
        description: "O clássico da casa! Hambúrguer artesanal 180g, queijo cheddar, alface, tomate, cebola caramelizada e molho especial no pão brioche.",
        price: 28.00,
        imageUrl: IMG.burger1,
        ingredients: ["Pão brioche", "Hambúrguer artesanal 180g", "Queijo cheddar", "Alface", "Tomate", "Cebola caramelizada", "Molho especial"],
        menuCategoryId: lanches.id,
        restaurantId: restaurant.id,
      },
      {
        name: "X-Bacon Jhon",
        description: "Hambúrguer artesanal 180g, bacon crocante, queijo cheddar, cebola caramelizada e molho defumado no pão brioche.",
        price: 32.00,
        imageUrl: IMG.burger5,
        ingredients: ["Pão brioche", "Hambúrguer artesanal 180g", "Bacon crocante", "Queijo cheddar", "Cebola caramelizada", "Molho defumado"],
        menuCategoryId: lanches.id,
        restaurantId: restaurant.id,
      },
      {
        name: "X-Egg Jhon",
        description: "Hambúrguer artesanal 180g, ovo frito, queijo cheddar, alface, tomate e maionese temperada no pão brioche.",
        price: 30.00,
        imageUrl: IMG.burger2,
        ingredients: ["Pão brioche", "Hambúrguer artesanal 180g", "Ovo frito", "Queijo cheddar", "Alface", "Tomate", "Maionese temperada"],
        menuCategoryId: lanches.id,
        restaurantId: restaurant.id,
      },
      {
        name: "X-Tudo Jhon",
        badge: "NOVO",
        description: "O lanche completo! Hambúrguer duplo 360g, bacon, ovo, queijo cheddar, alface, tomate, cebola e molho especial no pão brioche.",
        price: 42.00,
        imageUrl: IMG.burger3,
        ingredients: ["Pão brioche", "Hambúrguer duplo 360g", "Bacon", "Ovo frito", "Queijo cheddar", "Alface", "Tomate", "Cebola", "Molho especial"],
        menuCategoryId: lanches.id,
        restaurantId: restaurant.id,
      },
      {
        name: "X-Frango Jhon",
        description: "Filé de frango empanado crocante, queijo cheddar, alface, tomate e molho honey mostarda no pão brioche.",
        price: 27.00,
        imageUrl: IMG.chicken,
        ingredients: ["Pão brioche", "Frango empanado crocante", "Queijo cheddar", "Alface", "Tomate", "Molho honey mostarda"],
        menuCategoryId: lanches.id,
        restaurantId: restaurant.id,
      },
      {
        name: "X-Cheddar Jhon",
        description: "Hambúrguer artesanal 180g coberto com cheddar cremoso derretido, cebola caramelizada e molho especial no pão brioche.",
        price: 29.00,
        imageUrl: IMG.burger4,
        ingredients: ["Pão brioche", "Hambúrguer artesanal 180g", "Cheddar cremoso derretido", "Cebola caramelizada", "Molho especial"],
        menuCategoryId: lanches.id,
        restaurantId: restaurant.id,
      },
    ],
  });

  // ─── COMBOS ─────────────────────────────────────────────────────────────────
  const combos = await db.menuCategory.create({
    data: { name: "Combos", restaurantId: restaurant.id },
  });

  await db.product.createMany({
    data: [
      {
        name: "Combo X-Big Jhon",
        badge: "MAIS_PEDIDO",
        description: "X-Big Jhon + batata frita média + bebida (Coca-Cola, Guaraná ou Água).",
        price: 39.90,
        imageUrl: IMG.burger1,
        ingredients: ["X-Big Jhon", "Batata frita média", "Bebida 350ml"],
        menuCategoryId: combos.id,
        restaurantId: restaurant.id,
      },
      {
        name: "Combo X-Bacon Jhon",
        description: "X-Bacon Jhon + batata frita média + bebida (Coca-Cola, Guaraná ou Água).",
        price: 44.90,
        imageUrl: IMG.burger5,
        ingredients: ["X-Bacon Jhon", "Batata frita média", "Bebida 350ml"],
        menuCategoryId: combos.id,
        restaurantId: restaurant.id,
      },
      {
        name: "Combo X-Frango Jhon",
        description: "X-Frango Jhon + batata frita média + bebida (Coca-Cola, Guaraná ou Água).",
        price: 38.90,
        imageUrl: IMG.chicken,
        ingredients: ["X-Frango Jhon", "Batata frita média", "Bebida 350ml"],
        menuCategoryId: combos.id,
        restaurantId: restaurant.id,
      },
      {
        name: "Combo X-Tudo Jhon",
        badge: "NOVO",
        description: "X-Tudo Jhon + batata frita média + bebida (Coca-Cola, Guaraná ou Água).",
        price: 54.90,
        imageUrl: IMG.burger3,
        ingredients: ["X-Tudo Jhon", "Batata frita média", "Bebida 350ml"],
        menuCategoryId: combos.id,
        restaurantId: restaurant.id,
      },
    ],
  });

  // ─── PORÇÕES ────────────────────────────────────────────────────────────────
  const porcoes = await db.menuCategory.create({
    data: { name: "Porções", restaurantId: restaurant.id },
  });

  await db.product.createMany({
    data: [
      {
        name: "Batata Frita Simples",
        description: "Porção de batata frita crocante, sequinha e bem temperada.",
        price: 14.00,
        imageUrl: IMG.fries,
        ingredients: [],
        menuCategoryId: porcoes.id,
        restaurantId: restaurant.id,
      },
      {
        name: "Batata Cheddar Bacon",
        badge: "MAIS_PEDIDO",
        description: "Batata frita crocante coberta com cheddar cremoso e bacon crocante.",
        price: 22.00,
        imageUrl: IMG.fries,
        ingredients: ["Batata frita", "Cheddar cremoso", "Bacon crocante"],
        menuCategoryId: porcoes.id,
        restaurantId: restaurant.id,
      },
      {
        name: "Onion Rings",
        description: "Anéis de cebola empanados e fritos na hora, crocantes por fora e macios por dentro.",
        price: 18.00,
        imageUrl: IMG.chicken,
        ingredients: ["Cebola", "Massa de empanamento"],
        menuCategoryId: porcoes.id,
        restaurantId: restaurant.id,
      },
    ],
  });

  // ─── BEBIDAS ────────────────────────────────────────────────────────────────
  const bebidas = await db.menuCategory.create({
    data: { name: "Bebidas", restaurantId: restaurant.id },
  });

  await db.product.createMany({
    data: [
      {
        name: "Coca-Cola Lata 350ml",
        description: "Coca-Cola gelada.",
        price: 6.00,
        imageUrl: IMG.coca,
        ingredients: [],
        menuCategoryId: bebidas.id,
        restaurantId: restaurant.id,
      },
      {
        name: "Guaraná Antártica Lata 350ml",
        description: "Guaraná Antártica gelado.",
        price: 6.00,
        imageUrl: IMG.guarana,
        ingredients: [],
        menuCategoryId: bebidas.id,
        restaurantId: restaurant.id,
      },
      {
        name: "Suco Natural 400ml",
        description: "Suco de fruta natural. Pergunte os sabores disponíveis.",
        price: 10.00,
        imageUrl: IMG.agua,
        ingredients: [],
        menuCategoryId: bebidas.id,
        restaurantId: restaurant.id,
      },
      {
        name: "Água Mineral 500ml",
        description: "Água mineral gelada.",
        price: 4.00,
        imageUrl: IMG.agua,
        ingredients: [],
        menuCategoryId: bebidas.id,
        restaurantId: restaurant.id,
      },
    ],
  });

  console.log("✅ Cardápio criado com sucesso!");
  console.log("\n📋 Acesso:");
  console.log("   Cardápio:  /big-jhon");
  console.log("   Cozinha:   /big-jhon/kitchen  (senha: bigjohn123)");
  console.log("   QR Codes:  /big-jhon/qrcode");
  console.log("   Admin:     /admin");
  console.log("\n   ⚠️  Ajuste preços e fotos reais no /admin");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
