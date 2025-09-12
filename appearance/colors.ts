export type ThemeColors = {
  // main colors
  primary: string;      // cor principal, ou laranja ou azul...
  onPrimary: string;    // black (texto sobre elementos primários)
  secondary: string;    // #35353a (cor dos cards/containers)
  background: string;   // bg-zinc-800 (#27272a - fundo principal da tela)
  surface: string;      // bg-zinc-800/80 (fundo dos dias da semana no calendário)

  // text colors
  text: string;             // text-white (#ffffff - texto principal)
  textMuted: string;        // text-neutral-400 (#a3a3a3 - texto das letras dos dias da semana)
  textSelected: string;     // text-black (texto do dia selecionado)
  textToday: string;        // text-[#ffa41f] (texto do dia atual)
  textExpenseName: string;  // text-gray-300 (nome das despesas)
  textExpenseDate: string;  // text-neutral-400 (data/hora das despesas)

  // cores de estado
  selected: string;       // bg-[#ffa41f] (fundo do dia selecionado)
  taskIndicator: string;  // bg-[#ffa41f] (bolinha indicadora de tarefas)

  // cores de navegação
  chevronColor: string;   // #ffa41f (cor dos ícones de navegação do calendário)

  // cores financeiras (específicas da tela de despesas)
  gain: string; // text-emerald-400 (#34d399 - cor dos ganhos/receitas)
  loss: string; // text-[#ff7a7f] (#ff7a7f - cor das perdas/despesas)

  // cores de ação/interação
  deleteAction: string;      // bg-rose-500 (#f43f5e - fundo da ação de deletar no swipe)
  deleteActionIcon: string;  // white (cor do ícone de lixeira)

  // Cores de separação/divisão
  border: string; // border-neutral-700 (#404040 - bordas dos items de despesa)

  // cores da Tab Bar
  tabBarBackground: string; // backgroundColor: '#1e1e1e' (fundo da tab bar)
  tabBarActive: string;     // tabBarActiveTintColor: '#ffa41f' (cor dos ícones ativos)
  tabBarInactive: string;   // tabBarInactiveTintColor: '#9CA3AF' (cor dos ícones inativos)

  // moreScreen - Cores específicas
  moreScreenHeader: string;       // #27272A (fundo do header)
  moreScreenTitle: string;        // #FFFFFF (cor do título "Mais recursos")
  categoryTitle: string;          // #A3A3A3 (cor dos títulos das categorias em maiúsculo)
  itemBackground: string;         // #35353A (fundo dos itens de menu)
  itemTitle: string;              // #FFFFFF (título dos itens)
  itemSubtitle: string;           // #A3A3A3 (subtítulo dos itens)
  itemIcon: string;               // #FFFFFF (cor padrão dos ícones)
  settingsIcon: string;           // #FF7A7F (cor específica do ícone de configurações)
  notesIcon: string;              // #FF7A7F (cor específica do ícone de notas)
  premiumBackground: string;      // #35353A (fundo da seção premium)
  premiumBadge: string;           // #FFA41F (cor do badge "PREMIUM")
  premiumTitle: string;           // #FFFFFF (título "Acesso Premium")
  premiumDescription: string;     // #A3A3A3 (descrição do premium)
  premiumPrice: string;           // #FFA41F (cor do preço)
  premiumButton: string;          // #FFA41F (cor de fundo do botão assinar)
  premiumButtonText: string;      // #000000 (cor do texto do botão assinar)
  appVersion: string;             // #A3A3A3 (cor da versão do app)
  chevronIcon: string;            // #A3A3A3 (cor das setas dos itens)

  // Gradientes lineares
  linearGradient: {
    // Gradiente do FAB (botão flutuante)
    primary: string[]; // ['#FFD45A', '#FFA928', '#FF7A00'] - gradiente amarelo/laranja
    // Gradiente dos ícones (GradientIcon)
    icon?: string[];   // gradiente aplicado aos ícones do header
  };
};
