# 📘 README - Site Michelle Dantas Advocacia

Bem-vindo à documentação oficial para o gerenciamento do site do escritório Michelle Dantas Advocacia. Este guia foi criado especialmente para a equipe de marketing, com instruções simples e diretas para **atualizar o conteúdo do site**, como posts no blog e páginas de serviços.

---

## 🛠️ Como editar o site

Todas as alterações do site são feitas através do **GitHub**, uma plataforma onde armazenamos e organizamos os arquivos do site. A ideia é que você consiga alterar textos, imagens e conteúdo sem precisar entender de programação.

> **Você precisa apenas de um navegador e acesso ao repositório no GitHub.**

---

## 🗂️ Estrutura dos Arquivos Importantes

- `blog/` → Onde estão os textos dos artigos publicados
- `data/services/` → Onde estão os textos e descrições dos serviços
- `public/assets/img/` → Onde estão as imagens usadas no site

---

## ✍️ Como criar ou alterar um post no blog

1. Acesse o repositório no GitHub.
2. Navegue até a pasta: `blog/`
3. Cada post está em um arquivo com o final `.md` (exemplo: `negativa-plano-saude.md`).
4. Clique no arquivo que deseja editar ou crie um novo clicando em **Add file > Create new file**.
5. Use este modelo:

```
---
title: "Direitos do Consumidor: Como Proceder em Caso de Negativa de Cobertura pelo Plano de Saúde"
date: "2024-04-10"
excerpt: "Saiba o que fazer quando o plano de saúde se recusa a cobrir procedimentos essenciais."
cover: "/assets/img/blog/negativa-plano-saude.png"
---

A negativa de cobertura por parte dos planos de saúde é uma situação recorrente enfrentada por muitos consumidores...
```

6. Após editar, clique em **Commit changes** para salvar.

> **Dica:** Use sempre imagens na horizontal para capa dos artigos, com tamanho 710x430px.

---

## 💼 Como editar ou criar novos serviços

1. Acesse o repositório no GitHub.
2. Navegue até: `data/services.js`
3. Os serviços estão organizados em blocos como este:

```js
{
  id: 10,
  title: "Direito Trabalhista",
  description: "Defesa de direitos de empregados e empregadores.",
  icon: "/assets/img/icon/serviceIcon1_2.png",
  bgImage: "/assets/img/bg/serviceCardThumbBg1_1.png",
  delay: ".4s",
},
```

4. Para editar um serviço, altere o `title`, `description`, ou `icon` conforme necessário.
5. Para adicionar um novo, copie um bloco existente, cole logo abaixo e edite com os novos dados.
6. Clique em **Commit changes** para salvar.

---

## 🖼️ Como adicionar ou alterar imagens

1. Navegue até a pasta: `public/assets/img/`
2. Para inserir uma imagem nova:
   - Clique em **Add file > Upload files**
   - Faça o upload da imagem desejada
   - Clique em **Commit changes**
3. Use o caminho da imagem no blog ou serviço, por exemplo:
   - `/assets/img/blog/novaimagem.png`

> **Atenção:** Mantenha nomes simples, sem espaços ou acentos (ex: `direito-familia.png`).

---

## 📩 Dúvidas ou suporte?

Se tiver qualquer dúvida, entre em contato com a equipe técnica ou envie um e-mail para: **suporte@mdantasadv.com.br**

---

📌 **Dica final:** Se estiver inseguro com alguma edição, crie uma nova cópia do conteúdo e peça para alguém da equipe revisar antes de publicar oficialmente.

---

💡 **Nosso objetivo é que você tenha total autonomia para manter o site sempre atualizado com conteúdos relevantes e confiáveis.**

