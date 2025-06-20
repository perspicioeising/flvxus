#!/bin/bash
# scripts/init-capacitor.sh

echo "🚀 Iniciando configuração do Capacitor para FLVXUS..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script no diretório raiz do projeto${NC}"
    exit 1
fi

# 1. Instalar dependências do Capacitor
echo -e "${BLUE}📦 Instalando dependências do Capacitor...${NC}"
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# 2. Instalar plugins essenciais
echo -e "${BLUE}📦 Instalando plugins essenciais...${NC}"
npm install @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen @capacitor/network @capacitor/toast @capacitor/share @capacitor/filesystem @capacitor/preferences

# 3. Inicializar Capacitor (se ainda não foi inicializado)
if [ ! -f "capacitor.config.json" ]; then
    echo -e "${BLUE}⚙️  Inicializando Capacitor...${NC}"
    npx cap init "FLVXUS" "br.com.flvxus.app" --web-dir=out
else
    echo -e "${YELLOW}⚠️  Capacitor já foi inicializado${NC}"
fi

# 4. Fazer build de produção
echo -e "${BLUE}🔨 Criando build de produção...${NC}"
npm run build

# 5. Adicionar plataformas
if [ ! -d "android" ]; then
    echo -e "${BLUE}📱 Adicionando plataforma Android...${NC}"
    npx cap add android
else
    echo -e "${YELLOW}⚠️  Plataforma Android já existe${NC}"
fi

if [ ! -d "ios" ]; then
    echo -e "${BLUE}📱 Adicionando plataforma iOS...${NC}"
    npx cap add ios
else
    echo -e "${YELLOW}⚠️  Plataforma iOS já existe${NC}"
fi

# 6. Sincronizar
echo -e "${BLUE}🔄 Sincronizando com plataformas nativas...${NC}"
npx cap sync

# 7. Criar estrutura de ícones (se não existir)
echo -e "${BLUE}🎨 Preparando estrutura para recursos visuais...${NC}"
mkdir -p resources
mkdir -p public/icons

# 8. Lembrete sobre ícones
echo -e "${YELLOW}📌 Lembrete: Adicione os seguintes arquivos:${NC}"
echo "   - public/icon-192x192.png (192x192px)"
echo "   - public/icon-512x512.png (512x512px)"
echo "   - resources/icon.png (1024x1024px - para gerar todos os tamanhos)"
echo "   - resources/splash.png (2732x2732px - para gerar splash screens)"

echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo ""
echo -e "${BLUE}Próximos passos:${NC}"
echo "1. Para Android Studio: npm run cap:android"
echo "2. Para Xcode (macOS): npm run cap:ios"
echo "3. Para testar no dispositivo: npm run cap:run:android"
echo ""
echo -e "${YELLOW}⚠️  Importante:${NC}"
echo "- Certifique-se de ter Android Studio instalado para Android"
echo "- Certifique-se de ter Xcode instalado para iOS (apenas macOS)"
echo "- Configure os ícones e splash screens antes de publicar"