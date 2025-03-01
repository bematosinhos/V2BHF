# 🚀 SBC Starter Kit

<div align="center">

![SBC Starter Kit](https://raw.githubusercontent.com/m4n3z40/sbc-cursor-starter-kit/master/public/vite.svg)

The first web app boilerplate built specifically for AI-first editors like Cursor.

[Demo](https://sbc-cursor-starter-kit.netlify.app) · [Report Bug](https://github.com/m4n3z40/sbc-cursor-starter-kit/issues) · [Request Feature](https://github.com/m4n3z40/sbc-cursor-starter-kit/issues)

</div>

## ✨ Features

- 🏗️ **Modern Stack**: React 19, Vite, TypeScript, and Tailwind CSS
- 🎯 **State Management**: Zustand for simple and efficient state management
- 🎨 **Component Library**: Shadcn/ui for beautiful, accessible UI components
- 🌈 **Animations**: Framer Motion for professional animations
- 📱 **Responsive**: Adaptive layout for all screens
- 🔍 **SEO Optimized**: Best practices for SEO
- 🚦 **Routing**: React Router v7 for modern navigation
- 🛠️ **Development Tools**: ESLint, Prettier, Husky and Lint-staged
- 🧪 **Testing Ready**: Testing configuration included
- 🔄 **Hot Reload**: Instant development updates

## 🎯 Principles

- **AI-first**: Built for AI-first editors like Cursor
- **Simplicity**: Keep things simple yet powerful
- **Quality Code**: Focus on readability and maintainability
- **Safety**: Uses TypeScript, ESLint, Prettier for type safety and code quality
- **DX**: Great developer experience and productivity
- **Best Practices**: Following modern web development standards

## 📦 Project Structure

```
index.html                # Main page
public/                   # Static files
src/
├── assets/               # Static assets
├── components/           # React Components
│   ├── layout/           # Layout components
│   └── ui/               # UI Components (Shadcn)
|   └── <your-component>/ # Custom components
├── hooks/                # Custom React Hooks
├── lib/                  # Utilities and helpers
├── pages/                # Application pages
├── store/                # State management (Zustand)
├── main.tsx              # Main entry point
├── App.tsx               # Routes and Context Providers setup
└── index.css             # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository

```bash
git clone https://github.com/m4n3z40/sbc-cursor-starter-kit.git
cd sbc-cursor-starter-kit
```

2. Install dependencies

```bash
npm install --legacy-peer-deps
# or
pnpm install --legacy-peer-deps
```

3. Start development server

```bash
npm run dev
# or
pnpm dev
```

## 📝 Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally
- `npm run lint`: Run linter
- `npm run lint:fix`: Fix linting issues automatically
- `npm run format`: Format code with Prettier

## 🛠️ Technologies

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Router](https://reactrouter.com/)

## 🎨 Customization

### Themes

The project uses Shadcn UI's design system, which can be customized through Tailwind configuration files.

### Components

All Shadcn UI components can be customized. Check the [official documentation](https://ui.shadcn.com/) for more details.

## 📈 Performance

The project is optimized for performance with:

- Automatic code splitting
- Component lazy loading
- Image optimization
- Asset minification
- Tree shaking

## 🤝 Contributing

Contributions are welcome! Please read our contribution guide before submitting a PR.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn](https://twitter.com/shadcn) for the amazing UI system
- [Cursor](https://cursor.sh/) for the excellent AI-first editor
- All contributors and maintainers of the dependencies used

---

<div align="center">

Made with ❤️ by the community

[⬆ Back to top](#-sbc-starter-kit)

</div>

# V2BHF - Sistema de Gestão de Profissionais Domésticos

Este projeto é um sistema para gestão de profissionais domésticos, permitindo o registro de profissionais, controle de ponto e geração de relatórios.

## Tecnologias Utilizadas

- React
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Zustand
- Supabase
- React Router
- React Hook Form
- Zod

## Configuração do Supabase

### 1. Criar uma conta no Supabase

Acesse [supabase.com](https://supabase.com/) e crie uma conta gratuita.

### 2. Criar um novo projeto

- Após fazer login, clique em "New Project"
- Escolha um nome para o projeto
- Defina uma senha para o banco de dados
- Escolha uma região próxima à sua localização
- Clique em "Create new project"

### 3. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

Você pode encontrar essas informações no painel do Supabase em:
- Project Settings > API > URL e anon/public key

### 4. Configurar o banco de dados

Você pode configurar o banco de dados de duas maneiras:

#### Opção 1: Usando o SQL Editor no Supabase

- No painel do Supabase, vá para SQL Editor
- Crie uma nova query
- Cole o conteúdo do arquivo `scripts/schema.sql`
- Execute a query

#### Opção 2: Usando o script de migração

```bash
# Instalar dependências
npm install

# Executar o script de migração
npm run migrate:data
```

## Executando o Projeto

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

## Autenticação

O sistema utiliza autenticação via Supabase. Você pode configurar:

1. **Email/Senha**: Ative no painel do Supabase em Authentication > Providers > Email
2. **OAuth**: Configure provedores como Google e Microsoft em Authentication > Providers

## Estrutura do Projeto

- `/src/components`: Componentes reutilizáveis
- `/src/pages`: Páginas da aplicação
- `/src/lib`: Funções utilitárias e serviços
- `/src/store`: Gerenciamento de estado com Zustand
- `/scripts`: Scripts para migração e configuração do banco de dados

## Funcionalidades

- Cadastro e gestão de profissionais domésticos
- Registro de ponto (entrada, saída, intervalo)
- Dashboard com visão geral
- Relatórios e exportação para PDF
- Autenticação e controle de acesso
