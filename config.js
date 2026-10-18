/* ============================================================
   УНИВЕРСАЛЬНЫЙ ШАБЛОН — «Madeleine»
   ------------------------------------------------------------
   Демо-кондитерская. Меняйте тексты, товары, цены и контакты —
   сайт подстроится автоматически. Подробности в README.md.
   ============================================================ */

window.SITE_CONFIG = {

  meta: {
    title: "Madeleine — кондитерская с доставкой по Москве",
    description: "Чизкейки, торты и пирожные ручной работы. Собираем заказ под ваш повод и привозим в день обращения. Бесплатная доставка по Москве.",
    themeColor: "#F6F1EB",
    ogImage: "assets/photos/og-template.jpg",
    siteUrl: "https://coderrrcoffee.github.io/sweet-order-template",
    priceRange: "850–4 500 ₽"
  },

  brand: {
    name: "Madeleine",
    logoLine1: "madeleine",
    logoLine2: "patisserie",
    city: "Москва",
    footerNote: "Десерты, которые говорят за вас."
  },

  theme: {
    bg: "#F6F1EB",
    bgAlt: "#EDE3D9",
    surface: "#FFFCF8",
    ink: "#251C20",
    inkSoft: "#5D4C53",
    muted: "#8B7A80",
    line: "#E2D4CB",
    accent: "#6B3A4A",
    accentSoft: "#EEDDE3",
    green: "#8A7A4E",
    dark: "#251C20",
    cream: "#FFF8F2"
  },

  contacts: {
    // ВАЖНО: замените на реальный юзернейм клиента.
    telegram: "madeleine_demo",
    telegramChannel: "https://t.me/madeleine_demo",
    telegramChannelLabel: "@madeleine_demo",
    phone: "+79990000000",
    phoneDisplay: "+7 999 000-00-00",
    email: "",
    address: "Москва · доставка по городу",
    mapLink: ""
  },

  delivery: {
    free: true,
    price: 0,
    freeLabel: "Бесплатная доставка",
    hours: "9:00–21:00",
    days: "каждый день",
    sameDay: true,
    pickupAddress: "Самовывоз в Москве — адрес и время согласуем в Telegram.",
    minOrder: 0,
    slots: ["09:00–12:00", "12:00–15:00", "15:00–18:00", "18:00–21:00"],
    maxDaysAhead: 60,
    defaultSlot: 1
  },

  hero: {
    eyebrow: "Кондитерская · Москва",
    titleHtml: "Десерты,&nbsp;которые<br>говорят <em>за вас</em>",
    text: "Чизкейки, торты и пирожные ручной работы. Собираем заказ под ваш повод и привозим в день обращения.",
    primaryCta: "Выбрать десерт",
    secondaryCta: "Написать в Telegram",
    image: "assets/photos/hero.webp",
    imageAlt: "Ассорти десертов кондитерской Madeleine",
    badgeTitle: "Бесплатная доставка",
    badgeText: "по Москве · день в день",
    sticker: "ручная работа · каждый день ·",
    stats: [
      { value: "11", label: "авторских десертов" },
      { value: "0 ₽", label: "доставка по городу" },
      { value: "9–21", label: "каждый день" }
    ]
  },

  marquee: ["Ручная работа", "Бесплатная доставка", "День в день", "Натуральные ингредиенты", "Москва"],

  trust: [
    { icon: "delivery", title: "Бесплатная доставка", text: "По Москве день в день. За МКАД — по договорённости." },
    { icon: "fresh", title: "Свежая выпечка", text: "Готовим под заказ и привозим в день доставки." },
    { icon: "choice", title: "Авторские десерты", text: "Чизкейки, торты, профитроли, тарталетки и наборы." },
    { icon: "chat", title: "Отвечаем моментально", text: "В Telegram с 9:00 до 21:00, без выходных." }
  ],

  catalog: {
    eyebrow: "01 — Витрина",
    title: "Выберите свой десерт",
    text: "Цены за десерт целиком или набор. Ниже — хиты витрины, полный список вкусов пришлём в Telegram.",
    note: "Не нашли свой вкус?",
    noteLink: "Напишите в Telegram — соберём под заказ",
    categories: [
      { id: "all", label: "Все" },
      { id: "cheesecakes", label: "Чизкейки" },
      { id: "cakes", label: "Торты" },
      { id: "pastry", label: "Пирожные" },
      { id: "sets", label: "Наборы" }
    ]
  },

  products: [
    {
      id: "san-sebastian", category: "cheesecakes",
      name: "Чизкейк «Сан-Себастьян»",
      desc: "Баскский чизкейк: карамельная корочка и нежная кремовая середина.",
      price: 2400, unit: "шт", weight: 1200, weightLabel: "1,2 кг",
      image: "assets/photos/san-sebastian.webp",
      badge: "Хит", badgeTone: "accent"
    },
    {
      id: "cherry", category: "cheesecakes",
      name: "Чизкейк «Вишнёвый»",
      desc: "Сливочный чизкейк на песочной основе с густым вишнёвым соусом.",
      price: 2500, unit: "шт", weight: 1200, weightLabel: "1,2 кг",
      image: "assets/photos/cherry.webp"
    },
    {
      id: "pistachio", category: "cheesecakes",
      name: "Чизкейк «Фисташковый»",
      desc: "Фисташковая паста, сливочный сыр и тонкая шоколадная основа.",
      price: 2700, unit: "шт", weight: 1100, weightLabel: "1,1 кг",
      image: "assets/photos/pistachio.webp"
    },
    {
      id: "brownie", category: "cheesecakes",
      name: "Брауни-чизкейк",
      desc: "Шоколадный брауни, карамель и слой нежного сливочного чизкейка.",
      price: 2600, unit: "шт", weight: 1200, weightLabel: "1,2 кг",
      image: "assets/photos/brownie.webp"
    },
    {
      id: "pistachio-raspberry", category: "cakes",
      name: "Торт «Фисташка и малина»",
      desc: "Фисташковый бисквит, малиновая начинка и сливочный крем.",
      price: 3200, unit: "шт", weight: 1400, weightLabel: "1,4 кг",
      image: "assets/photos/pistachio-raspberry.webp",
      badge: "Хит", badgeTone: "accent"
    },
    {
      id: "ricotta-pear", category: "cakes",
      name: "Торт «Рикотта с грушей»",
      desc: "Лёгкий торт на рикотте с сочной грушей и тонкой пудрой.",
      price: 3400, unit: "шт", weight: 1300, weightLabel: "1,3 кг",
      image: "assets/photos/ricotta-pear.webp"
    },
    {
      id: "forest-berries", category: "cakes",
      name: "Торт «Лесные ягоды»",
      desc: "Песочная основа, сливочный крем и свежие лесные ягоды.",
      price: 3700, unit: "шт", weight: 1500, weightLabel: "1,5 кг",
      image: "assets/photos/forest-berries.webp"
    },
    {
      id: "profiteroles", category: "pastry",
      name: "Профитроли с фисташкой",
      desc: "12 профитролей с фисташковым и шоколадным кремом в коробке.",
      price: 1400, unit: "набор", weight: 480, weightLabel: "12 шт",
      image: "assets/photos/profiteroles.webp",
      badge: "Хит", badgeTone: "accent"
    },
    {
      id: "tartlets", category: "pastry",
      name: "Тарталетки с малиной",
      desc: "Хрустящая песочная основа, сливочный крем и крупная малина.",
      price: 850, unit: "набор", weight: 360, weightLabel: "4 шт",
      image: "assets/photos/tartlets.webp"
    },
    {
      id: "mini-set", category: "sets",
      name: "Набор «Мини-праздник»",
      desc: "Тарталетки и профитроли в подарочной коробке — удобно взять с собой.",
      price: 2800, unit: "набор", weight: 900, weightLabel: "12 десертов",
      image: "assets/photos/mini-set.webp",
      badge: "Подарок", badgeTone: "green"
    },
    {
      id: "mega-assorti", category: "sets",
      name: "Мега-ассорти чизкейков",
      desc: "2 кг чизкейков разных вкусов — на большой праздник или офис.",
      price: 4500, unit: "набор", weight: 2000, weightLabel: "2 кг",
      image: "assets/photos/mega-assorti.webp",
      badge: "Для праздника", badgeTone: "green"
    }
  ],

  steps: {
    eyebrow: "02 — Как заказать",
    title: "Три шага до десерта",
    text: "Без звонков и переписок на полчаса. Выберите десерты, укажите детали — и отправьте готовый заказ в Telegram.",
    items: [
      { title: "Выбираете десерты", text: "Добавьте в заказ один торт или целый набор — количество меняется в один клик." },
      { title: "Заполняете детали", text: "Дата, время, адрес и пожелания. Всё, что нужно, чтобы не переспрашивать." },
      { title: "Отправляете в Telegram", text: "Сайт собирает готовое сообщение. Останется открыть чат и нажать «Отправить»." }
    ]
  },

  order: {
    eyebrow: "03 — Оформление",
    title: "Соберите заказ",
    text: "Заполните форму — сайт превратит её в готовое сообщение для Telegram. Без регистрации и лишних звонков.",
    summaryTitle: "Ваш заказ",
    formTitle: "Данные для доставки",
    submit: "Оформить в Telegram",
    submitNote: "Откроется чат с продавцом, текст заказа уже будет вставлен.",
    consent: "Согласен на обработку персональных данных",
    emptyTitle: "Пока пусто",
    emptyText: "Добавьте десерты из витрины — они появятся здесь."
  },

  form: {
    occasions: ["Без повода", "День рождения", "Свадьба", "1 сентября", "8 Марта", "Корпоратив", "Другое"],
    inscription: true,
    consent: true
  },

  faq: {
    eyebrow: "04 — Вопросы",
    title: "Коротко о важном",
    text: "Не нашли ответ? Напишите в Telegram — отвечаем моментально.",
    items: [
      { q: "Как быстро вы доставите заказ?", a: "По Москве — день в день, обычно в течение 1–3 часов. Доставка бесплатная. За МКАД — по договорённости." },
      { q: "Можно заказать на сегодня?", a: "Да, мы принимаем заказы день в день. Если нужно срочно — напишите в Telegram, ответим моментально." },
      { q: "Как оплатить заказ?", a: "Переводом на карту или при получении. Удобный способ подтвердим в Telegram." },
      { q: "Можно ли сделать надпись на торте?", a: "Да. Укажите её в форме заказа или в комментарии — оформим бесплатно." },
      { q: "Что такое «доставка-сюрприз»?", a: "Мы привезём десерт получателю от вашего имени и не раскроем отправителя. Напишите об этом в комментарии." },
      { q: "Есть ли десерты без сахара или для аллергиков?", a: "Состав и аллергены уточняйте в Telegram — подскажем, что подойдёт." }
    ]
  },

  footer: {
    note: "Десерты, которые говорят за вас.",
    credit: "Демо-шаблон · замените контакты на свои"
  }
};
