/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

// Restaurante Gamboa — Cozinha Caiçara
// Av. Dr. Arthur da Costa Filho, 457 — Caraguatatuba, SP
// @gamboa012 | (12) 3881-1453
// Premiado 6 anos no festival "Caraguá a Gosto"
//
// IMAGENS: Substitua os URLs de placeholder (Unsplash) por fotos reais
// dos pratos do restaurante antes de subir para produção.

const prismaClient = new PrismaClient();

// Formata URL Unsplash como placeholder de imagem de qualidade
const img = (id: string, w = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=85&fit=crop`;

const main = async () => {
  await prismaClient.$transaction(async (tx: any) => {
    // Remove dados anteriores do Gamboa (idempotente)
    await tx.restaurant.deleteMany({ where: { slug: "gamboa" } });

    const restaurant = await tx.restaurant.create({
      data: {
        name: "Gamboa",
        slug: "gamboa",
        description:
          "Cozinha Caiçara do litoral norte de SP. Frutos do mar frescos, pizzas artesanais e os sabores autênticos de Caraguatatuba.",
        // Cor primária: azul-mar profundo (teal oceânico)
        primaryColor: "185 65% 35%",
        // Substitua pelos URLs reais da identidade visual do restaurante
        avatarImageUrl: img("1414235077428-338989a2e8c0", 400),
        coverImageUrl: img("1507525428034-b723cf961d3e", 1200),
        tableCount: 25,
        kitchenPassword: bcrypt.hashSync("gamboa123", 10),
      },
    });

    // ─────────────────────────────────────────
    // CATEGORIA: Entradas
    // ─────────────────────────────────────────
    const entradasCat = await tx.menuCategory.create({
      data: { name: "Entradas", restaurantId: restaurant.id },
    });

    await tx.product.createMany({
      data: [
        {
          name: "Casquinha de Siri",
          badge: "MAIS_PEDIDO",
          description:
            "Casquinha de siri preparada no estilo caiçara com refogado de cebola, alho, tomate, coentro fresco e gratinada com farinha de mandioca crocante. Servida quentinha.",
          price: 28.9,
          imageUrl: img("1559737558-2f5a35f4523b"),
          menuCategoryId: entradasCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Siri fresco",
            "Cebola",
            "Alho",
            "Tomate",
            "Coentro",
            "Farinha de mandioca",
            "Azeite",
            "Sal e pimenta do reino",
          ],
        },
        {
          name: "Bolinho de Bacalhau (6 un.)",
          description:
            "Bolinhos crocantes de bacalhau desfiado com batata, cheiro-verde e azeitona preta. Acompanha molho de pimenta caseiro.",
          price: 32.9,
          imageUrl: img("1574894709920-11b28e7367e3"),
          menuCategoryId: entradasCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Bacalhau desfiado",
            "Batata",
            "Cheiro-verde",
            "Azeitona preta",
            "Ovo",
            "Farinha de rosca",
          ],
        },
        {
          name: "Polvo ao Vinagrete",
          badge: "NOVO",
          description:
            "Polvo cozido na perfeição, fatiado e servido frio com vinagrete de tomate, cebola roxa, coentro, azeite e limão siciliano.",
          price: 45.9,
          imageUrl: img("1619566636858-adf3ef46400b"),
          menuCategoryId: entradasCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Polvo",
            "Tomate",
            "Cebola roxa",
            "Coentro",
            "Azeite extra virgem",
            "Limão siciliano",
            "Sal",
          ],
        },
        {
          name: "Camarão ao Alho e Óleo",
          description:
            "Camarões médios salteados na frigideira com azeite, alho frito crocante, pimenta dedo-de-moça e salsinha. Acompanha torradinhas.",
          price: 52.9,
          imageUrl: img("1633504581786-316c8002b1b9"),
          menuCategoryId: entradasCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Camarão médio",
            "Alho",
            "Azeite",
            "Pimenta dedo-de-moça",
            "Salsinha",
            "Limão",
          ],
        },
      ],
    });

    // ─────────────────────────────────────────
    // CATEGORIA: Frutos do Mar
    // ─────────────────────────────────────────
    const mariscosCat = await tx.menuCategory.create({
      data: { name: "Frutos do Mar", restaurantId: restaurant.id },
    });

    await tx.product.createMany({
      data: [
        {
          name: "Polvo Grelhado",
          badge: "MAIS_PEDIDO",
          description:
            "Polvo inteiro grelhado na brasa com azeite, alho e ervas frescas. Servido com arroz branco, farofa caiçara e legumes salteados. Serve 2 pessoas.",
          price: 89.9,
          imageUrl: img("1618375569909-3c8616cf7733"),
          menuCategoryId: mariscosCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Polvo fresco",
            "Azeite extra virgem",
            "Alho",
            "Tomilho",
            "Alecrim",
            "Limão",
            "Arroz branco",
            "Farofa caiçara",
            "Legumes salteados",
          ],
        },
        {
          name: "Camarão na Moranga",
          description:
            "Camarões grandes refogados em molho cremoso de requeijão com catupiry, dentro de uma abóbora moranga assada. Acompanha arroz e farofa. Serve 2 pessoas.",
          price: 85.9,
          imageUrl: img("1569050467447-ce54b3bbc37d"),
          menuCategoryId: mariscosCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Camarão grande",
            "Moranga assada",
            "Catupiry",
            "Requeijão",
            "Cebola",
            "Tomate",
            "Coentro",
            "Azeite",
          ],
        },
        {
          name: "Moqueca de Camarão",
          badge: "MAIS_PEDIDO",
          description:
            "Moqueca caiçara com camarões frescos, leite de coco, azeite de dendê leve, tomate, cebola, pimentão e coentro. Acompanha arroz e pirão. Serve 2 pessoas.",
          price: 79.9,
          imageUrl: img("1567620905732-2d1ec7ab7445"),
          menuCategoryId: mariscosCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Camarão fresco",
            "Leite de coco",
            "Azeite de dendê",
            "Tomate",
            "Cebola",
            "Pimentão",
            "Coentro",
            "Arroz",
            "Pirão",
          ],
        },
        {
          name: "Lulas à Grega",
          description:
            "Anéis de lula frescos grelhados com azeite, alho, tomate cereja, azeitona preta, orégano e suco de limão. Servido com arroz branco. Serve 2 pessoas.",
          price: 72.9,
          imageUrl: img("1625944525533-473f1a3d54e7"),
          menuCategoryId: mariscosCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Lula fresca",
            "Azeite extra virgem",
            "Tomate cereja",
            "Azeitona preta",
            "Orégano",
            "Alho",
            "Limão",
          ],
        },
        {
          name: "Caldeirada de Frutos do Mar",
          description:
            "Caldeirão generoso com camarão, lula, polvo, mexilhão e peixe em caldo aromático de tomate, vinho branco, ervas e leite de coco. Acompanha arroz e pão. Serve 2 pessoas.",
          price: 99.9,
          imageUrl: img("1565680018434-b513d5e5fd47"),
          menuCategoryId: mariscosCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Camarão",
            "Lula",
            "Polvo",
            "Mexilhão",
            "Peixe da estação",
            "Leite de coco",
            "Vinho branco",
            "Tomate",
            "Ervas frescas",
          ],
        },
      ],
    });

    // ─────────────────────────────────────────
    // CATEGORIA: Peixes
    // ─────────────────────────────────────────
    const peixesCat = await tx.menuCategory.create({
      data: { name: "Peixes", restaurantId: restaurant.id },
    });

    await tx.product.createMany({
      data: [
        {
          name: "Pargo Inteiro Frito",
          badge: "MAIS_PEDIDO",
          description:
            "Pargo inteiro temperado com alho, limão e ervas, frito no óleo bem quente até a casca crocante. Acompanha arroz, farofa caiçara, pirão e banana-da-terra frita. Serve 2 pessoas.",
          price: 75.9,
          imageUrl: img("1562802378-063ec186a863"),
          menuCategoryId: peixesCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Pargo fresco inteiro",
            "Alho",
            "Limão",
            "Salsinha",
            "Sal grosso",
            "Arroz branco",
            "Farofa caiçara",
            "Pirão",
            "Banana-da-terra frita",
          ],
        },
        {
          name: "Filé de Peixe Grelhado",
          description:
            "Filé de peixe da estação grelhado no azeite com ervas finas, limão siciliano e manteiga de ervas. Acompanha arroz, legumes salteados e purê de mandioca.",
          price: 65.9,
          imageUrl: img("1534482421-64566f976cfa"),
          menuCategoryId: peixesCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Filé de peixe da estação",
            "Azeite extra virgem",
            "Manteiga de ervas",
            "Limão siciliano",
            "Ervas finas",
            "Arroz",
            "Legumes salteados",
            "Purê de mandioca",
          ],
        },
        {
          name: "Moqueca de Peixe",
          description:
            "Postas de peixe branco fresco cozidas em moqueca caiçara com leite de coco, pimentão, tomate, coentro e um toque de dendê. Acompanha arroz e pirão. Serve 2 pessoas.",
          price: 72.9,
          imageUrl: img("1567620905732-2d1ec7ab7445"),
          menuCategoryId: peixesCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Peixe branco fresco (postas)",
            "Leite de coco",
            "Azeite de dendê",
            "Pimentão",
            "Tomate",
            "Coentro",
            "Cebola",
            "Alho",
          ],
        },
      ],
    });

    // ─────────────────────────────────────────
    // CATEGORIA: Pizzas (noturno)
    // ─────────────────────────────────────────
    const pizzasCat = await tx.menuCategory.create({
      data: { name: "Pizzas", restaurantId: restaurant.id },
    });

    await tx.product.createMany({
      data: [
        {
          name: "Pizza de Camarão",
          badge: "MAIS_PEDIDO",
          description:
            "Molho de tomate, mozzarella, camarão temperado ao alho, catupiry, cebolinha e um fio de azeite. Pizza grande, 8 fatias.",
          price: 65.9,
          imageUrl: img("1513104890138-7c749659a591"),
          menuCategoryId: pizzasCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Massa artesanal",
            "Molho de tomate",
            "Mozzarella",
            "Camarão temperado",
            "Catupiry",
            "Cebolinha",
            "Azeite",
          ],
        },
        {
          name: "Pizza Margherita",
          description:
            "Pizza clássica com molho de tomate fresco, mozzarella fior di latte, folhas de manjericão fresco e azeite extra virgem. Pizza grande, 8 fatias.",
          price: 45.9,
          imageUrl: img("1574071318508-1cdbab80d002"),
          menuCategoryId: pizzasCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Massa artesanal",
            "Molho de tomate fresco",
            "Mozzarella fior di latte",
            "Manjericão fresco",
            "Azeite extra virgem",
          ],
        },
        {
          name: "Pizza Portuguesa",
          description:
            "Molho de tomate, mozzarella, presunto, ovo cozido fatiado, cebola, azeitona preta e orégano. Pizza grande, 8 fatias.",
          price: 52.9,
          imageUrl: img("1565299624946-b28f40a0ae38"),
          menuCategoryId: pizzasCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Massa artesanal",
            "Molho de tomate",
            "Mozzarella",
            "Presunto",
            "Ovo cozido",
            "Cebola",
            "Azeitona preta",
            "Orégano",
          ],
        },
        {
          name: "Pizza de Rúcula com Tomate Seco",
          badge: "NOVO",
          description:
            "Base de molho branco (cream cheese), mozzarella, rúcula fresca, tomate seco, lascas de parmesão e um fio de azeite trufado. Pizza grande, 8 fatias.",
          price: 58.9,
          imageUrl: img("1555992336-03a23c7b20ee"),
          menuCategoryId: pizzasCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Massa artesanal",
            "Cream cheese",
            "Mozzarella",
            "Rúcula fresca",
            "Tomate seco",
            "Parmesão em lascas",
            "Azeite trufado",
          ],
        },
      ],
    });

    // ─────────────────────────────────────────
    // CATEGORIA: Acompanhamentos
    // ─────────────────────────────────────────
    const acompCat = await tx.menuCategory.create({
      data: { name: "Acompanhamentos", restaurantId: restaurant.id },
    });

    await tx.product.createMany({
      data: [
        {
          name: "Arroz Branco",
          description:
            "Arroz branco soltinho com cheiro-verde. Porção para 2 pessoas.",
          price: 12.9,
          imageUrl: img("1516714435131-44d6b64dc6a2"),
          menuCategoryId: acompCat.id,
          restaurantId: restaurant.id,
          ingredients: ["Arroz", "Alho", "Sal", "Cheiro-verde"],
        },
        {
          name: "Farofa Caiçara",
          description:
            "Farofa artesanal de farinha de mandioca torrada com manteiga, cebola caramelizada, bacon e banana-da-terra frita. Especialidade da casa.",
          price: 15.9,
          imageUrl: img("1568901839119-631418a3910d"),
          menuCategoryId: acompCat.id,
          restaurantId: restaurant.id,
          ingredients: [
            "Farinha de mandioca",
            "Manteiga",
            "Cebola caramelizada",
            "Bacon",
            "Banana-da-terra",
          ],
        },
        {
          name: "Pirão de Peixe",
          description:
            "Pirão cremoso feito com o caldo do peixe do dia e farinha de mandioca. Acompanhamento tradicional caiçara.",
          price: 14.9,
          imageUrl: img("1593560708920-61dd98c46a4e"),
          menuCategoryId: acompCat.id,
          restaurantId: restaurant.id,
          ingredients: ["Caldo de peixe", "Farinha de mandioca", "Sal", "Coentro"],
        },
        {
          name: "Batata Frita",
          description: "Batatas fritas crocantes e douradas. Porção individual.",
          price: 18.9,
          imageUrl: img("1573080496219-bb080dd4f877"),
          menuCategoryId: acompCat.id,
          restaurantId: restaurant.id,
          ingredients: ["Batata", "Sal", "Óleo de girassol"],
        },
      ],
    });

    // ─────────────────────────────────────────
    // CATEGORIA: Bebidas
    // ─────────────────────────────────────────
    const bebidasCat = await tx.menuCategory.create({
      data: { name: "Bebidas", restaurantId: restaurant.id },
    });

    await tx.product.createMany({
      data: [
        {
          name: "Caipirinha da Casa",
          badge: "MAIS_PEDIDO",
          description:
            "Caipirinha artesanal com cachaça artesanal, limão tahiti fresco, açúcar cristal e gelo picado. Também disponível em maracujá, morango ou abacaxi.",
          price: 22.9,
          imageUrl: img("1590736969955-71cc94901144"),
          menuCategoryId: bebidasCat.id,
          restaurantId: restaurant.id,
          ingredients: ["Cachaça artesanal", "Limão tahiti", "Açúcar cristal", "Gelo"],
        },
        {
          name: "Cerveja Artesanal 500ml",
          description:
            "Cerveja artesanal gelada — consulte os rótulos disponíveis do dia. Lager, Weiss ou IPA.",
          price: 16.9,
          imageUrl: img("1608270586620-248524c67de9"),
          menuCategoryId: bebidasCat.id,
          restaurantId: restaurant.id,
          ingredients: [],
        },
        {
          name: "Água de Coco Natural",
          badge: "NOVO",
          description: "Água de coco fresca, servida gelada diretamente do coco verde da região.",
          price: 8.9,
          imageUrl: img("1550258987-190a2d41a8ba"),
          menuCategoryId: bebidasCat.id,
          restaurantId: restaurant.id,
          ingredients: ["Água de coco natural"],
        },
        {
          name: "Suco de Caju Natural",
          description:
            "Suco de caju batido na hora com fruta fresca, sem corante nem conservante. 400ml.",
          price: 12.9,
          imageUrl: img("1622597467836-f3285f2131b8"),
          menuCategoryId: bebidasCat.id,
          restaurantId: restaurant.id,
          ingredients: ["Caju fresco", "Água", "Açúcar"],
        },
        {
          name: "Refrigerante 350ml",
          description: "Coca-Cola, Guaraná Antarctica, Fanta Laranja ou Soda Limonada. Gelados.",
          price: 6.9,
          imageUrl: img("1622543925917-763c34d1a86e"),
          menuCategoryId: bebidasCat.id,
          restaurantId: restaurant.id,
          ingredients: [],
        },
        {
          name: "Água Mineral 500ml",
          description: "Água mineral sem gás ou com gás. Bem geladinha.",
          price: 5.9,
          imageUrl: img("1548839140-29a749e1cf4d"),
          menuCategoryId: bebidasCat.id,
          restaurantId: restaurant.id,
          ingredients: [],
        },
      ],
    });

    // ─────────────────────────────────────────
    // CATEGORIA: Sobremesas
    // ─────────────────────────────────────────
    const sobremesasCat = await tx.menuCategory.create({
      data: { name: "Sobremesas", restaurantId: restaurant.id },
    });

    await tx.product.createMany({
      data: [
        {
          name: "Açaí com Granola",
          badge: "MAIS_PEDIDO",
          description:
            "Açaí puro batido na hora, cremoso, servido com granola artesanal, banana fatiada, leite condensado e mel. 500ml.",
          price: 18.9,
          imageUrl: img("1590779033100-9f60a05a013d"),
          menuCategoryId: sobremesasCat.id,
          restaurantId: restaurant.id,
          ingredients: ["Açaí", "Granola artesanal", "Banana", "Leite condensado", "Mel"],
        },
        {
          name: "Pudim de Leite",
          description:
            "Pudim de leite condensado artesanal, feito diariamente na casa, com calda de caramelo escuro. Clássico e irresistível.",
          price: 14.9,
          imageUrl: img("1551024506-0bccd828d307"),
          menuCategoryId: sobremesasCat.id,
          restaurantId: restaurant.id,
          ingredients: ["Leite condensado", "Ovos", "Leite integral", "Açúcar (calda)"],
        },
        {
          name: "Mousse de Maracujá",
          description:
            "Mousse leve e aerado de maracujá fresco com calda de maracujá natural. Sobremesa refrescante perfeita para o litoral.",
          price: 12.9,
          imageUrl: img("1563805042-7684c019e1cb"),
          menuCategoryId: sobremesasCat.id,
          restaurantId: restaurant.id,
          ingredients: ["Maracujá fresco", "Leite condensado", "Creme de leite", "Gelatina"],
        },
      ],
    });

    // ─────────────────────────────────────────
    // HORÁRIOS DE FUNCIONAMENTO
    // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
    // ─────────────────────────────────────────
    await tx.openingHours.createMany({
      data: [
        { restaurantId: restaurant.id, dayOfWeek: 0, openTime: "09:00", closeTime: "22:00", isClosed: false }, // Domingo
        { restaurantId: restaurant.id, dayOfWeek: 1, openTime: "11:30", closeTime: "22:00", isClosed: true  }, // Segunda — folga
        { restaurantId: restaurant.id, dayOfWeek: 2, openTime: "11:30", closeTime: "22:00", isClosed: false }, // Terça
        { restaurantId: restaurant.id, dayOfWeek: 3, openTime: "11:30", closeTime: "22:00", isClosed: false }, // Quarta
        { restaurantId: restaurant.id, dayOfWeek: 4, openTime: "11:30", closeTime: "22:00", isClosed: false }, // Quinta
        { restaurantId: restaurant.id, dayOfWeek: 5, openTime: "11:30", closeTime: "23:00", isClosed: false }, // Sexta
        { restaurantId: restaurant.id, dayOfWeek: 6, openTime: "09:00", closeTime: "23:00", isClosed: false }, // Sábado
      ],
    });

    // ─────────────────────────────────────────
    // CUPOM DE INAUGURAÇÃO
    // ─────────────────────────────────────────
    await tx.coupon.create({
      data: {
        code: "GAMBOA10",
        discountPercent: 10,
        maxUses: 200,
        restaurantId: restaurant.id,
      },
    });

    console.log("✅ Restaurante Gamboa criado com sucesso!");
    console.log(`   Slug:   gamboa`);
    console.log(`   Cor:    hsl(185, 65%, 35%) — Azul-mar`);
    console.log(`   Senha da cozinha: gamboa123 (altere pelo painel admin)`);
    console.log(`   Cupom:  GAMBOA10 — 10% de desconto`);
    console.log(`   📸 Lembre-se de substituir as imagens Unsplash por fotos reais do restaurante.`);
  });
};

main()
  .catch((e) => {
    console.error("❌ Erro ao criar restaurante Gamboa:", e);
    throw e;
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
