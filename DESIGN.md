# 🎨 Design System - WhatsApp Pro

## Características Visuais

### 🌈 Paleta de Cores
- **Gradiente Principal**: #667eea → #764ba2 (Roxo/Azul)
- **Glassmorphism**: Transparência com blur para efeito de vidro
- **Texto**: Branco com sombras suaves
- **Acentos**: Vermelho (#ef4444) para badges

### ✨ Efeitos Especiais
1. **Glassmorphism** - Efeito de vidro fosco em todos os cards
2. **Animações Suaves** - Transições com cubic-bezier
3. **Hover Effects** - Elevação e escala nos elementos
4. **Gradientes Animados** - Background com movimento sutil
5. **Sombras Profundas** - Drop shadows para profundidade

### 🎭 Animações
- **fadeIn**: Entrada suave da aplicação
- **slideUp**: Conteúdo desliza de baixo para cima
- **pulse**: Pulsação nos ícones e badges
- **float**: Movimento flutuante no background
- **qrImagePop**: QR Code aparece com rotação

### 📐 Layout
- **Sidebar**: 280px com glassmorphism
- **Border Radius**: 16-20px para suavidade
- **Spacing**: Sistema consistente de 1.5-2rem
- **Typography**: Inter font family

### 🎯 Componentes Principais

#### Cards de Estatísticas
- Glassmorphism com backdrop-filter
- Hover: Elevação de 8px + escala 1.02
- Ícones animados com bounce
- Números grandes (2.5rem) e bold

#### Lista de Conversas/Contatos
- Items com animação escalonada
- Avatar circular com gradiente
- Hover: Desliza 8px para direita
- Scrollbar customizada

#### Formulário de Envio
- Inputs com glassmorphism
- Botão com efeito de onda ao hover
- Placeholders com emojis
- Focus: Elevação e brilho

### 🚀 Performance
- Animações com GPU (transform, opacity)
- Backdrop-filter para blur eficiente
- Transições suaves (0.3s cubic-bezier)

## Inspiração
Design inspirado em interfaces modernas como:
- Apple iOS glassmorphism
- Spotify cards
- Discord sidebar
- Telegram web
