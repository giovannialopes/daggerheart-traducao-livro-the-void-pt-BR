# 📦 Guia de Publicação — GitHub + FoundryVTT

Guia passo a passo para publicar atualizações deste módulo no GitHub e disponibilizá-las no FoundryVTT.

> **Pré-requisitos (já configurados nesta máquina):**
> - `git` instalado e autenticado via **GitHub Credential Manager** (não precisa de token na URL)
> - `gh` (GitHub CLI) instalado e logado como `giovannialopes` — verifique com `gh auth status`
> - Repositório: `giovannialopes/daggerheart-traducao-livro-the-void-pt-BR`

---

## 🧠 Conceitos que você precisa entender

| Termo | O que é |
|---|---|
| **`module.json`** | "Carteira de identidade" do módulo. O Foundry lê esse arquivo. |
| **`id`** | Identificador único do módulo. **NUNCA mude** depois de publicado (vira o nome da pasta no Foundry e quebra instalações existentes). |
| **`version`** | Número da versão. Precisa subir a cada atualização (ex.: `2.0` → `2.1`). |
| **`manifest`** | URL que o Foundry consulta para saber se há atualização. Aponta para `releases/latest/download/module.json`. |
| **`download`** | URL do `.zip` que o Foundry baixa ao instalar/atualizar. |
| **Release** | "Pacote" de uma versão no GitHub, com os arquivos (`module.json` + `.zip`) anexados. |

⚠️ **Regra de ouro:** o `manifest` e o `download` usam `releases/latest/...`. Então **sempre** que publicar, a nova versão precisa virar a "Latest release" no GitHub (o passo do `gh release create` já faz isso).

---

## 🔁 Fluxo completo para publicar uma atualização

Suponha que você fez mudanças (traduções, correções) e quer lançar a versão **`2.1`**.

### 1. Faça suas alterações
Edite os arquivos normalmente (compêndios em `compendium/`, interface em `lang/pt-BR.json`, lógica em `module.js`, etc).

### 2. Atualize a versão em 2 lugares do `module.json`
Abra `module.json` e altere:

```jsonc
"version": "2.1",
...
"download": "https://github.com/giovannialopes/daggerheart-traducao-livro-the-void-pt-BR/releases/latest/download/daggerheart-traducao-livro-the-void-pt-BR-v2.1.zip"
```

> ⚠️ **Atenção ao nome do `.zip`:** o campo `download` tem a versão no nome do arquivo (`...-v2.1.zip`). O nome do `.zip` que você gerar no passo 4 **precisa ser idêntico** a esse.

(Opcional) Atualize também o badge de versão no `README.md`.

### 3. Commit e push
No PowerShell, dentro da pasta do projeto:

```powershell
git add .
git commit -m "feat: <descreva a mudanca> e versao 2.1"
git push
```

### 4. Gere o `.zip` da release
Empacote os arquivos do módulo (sem `.git`, sem este guia):

```powershell
$ver = "2.1"
$nome = "daggerheart-traducao-livro-the-void-pt-BR-v$ver.zip"
$zip = Join-Path $env:TEMP $nome
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path @("module.json","module.js","README.md","lang","compendium") -DestinationPath $zip -CompressionLevel Optimal
"Gerado: $zip"
```

### 5. Crie a release no GitHub
Isto cria a tag `v2.1`, marca como "Latest" e anexa os dois arquivos que o Foundry precisa:

```powershell
$gh = "C:\Program Files\GitHub CLI\gh.exe"
$repo = "giovannialopes/daggerheart-traducao-livro-the-void-pt-BR"
& $gh release create "v$ver" "$zip" "module.json#module.json" `
    --repo $repo --title "v$ver" --target main `
    --notes "Atualizacao da traducao PT-BR. Veja as mudancas no repositorio."
```

> O `module.json#module.json` garante que o asset seja servido com o nome `module.json` (essencial para o `manifest` funcionar).

### 6. Valide (opcional, mas recomendado)
Confirme que o manifest público já reflete a nova versão:

```powershell
$m = "https://github.com/giovannialopes/daggerheart-traducao-livro-the-void-pt-BR/releases/latest/download/module.json"
$j = (curl.exe -sL -H "Cache-Control: no-cache" $m) | ConvertFrom-Json
"id = $($j.id) | version = $($j.version)"
```

Deve mostrar `version = 2.1`. (Se mostrar a versão antiga, espere 1-2 min — é cache do GitHub.)

---

## 🛠️ Corrigir uma release já publicada (sem mudar a versão)

Se publicou e percebeu um erro **na mesma versão**, não precisa criar outra release. Regere o `.zip` e **sobrescreva** os assets com `--clobber`:

```powershell
$ver = "2.1"
$gh = "C:\Program Files\GitHub CLI\gh.exe"
$repo = "giovannialopes/daggerheart-traducao-livro-the-void-pt-BR"
$zip = Join-Path $env:TEMP "daggerheart-traducao-livro-the-void-pt-BR-v$ver.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path @("module.json","module.js","README.md","lang","compendium") -DestinationPath $zip -CompressionLevel Optimal
& $gh release upload "v$ver" "$zip" "module.json#module.json" --clobber --repo $repo
```

---

## 🎲 Instalar / atualizar no FoundryVTT

### Instalar (primeira vez)
1. Foundry → **Configuration → Add-on Modules → Install Module**
2. No campo **Manifest URL**, cole:
   ```
   https://github.com/giovannialopes/daggerheart-traducao-livro-the-void-pt-BR/releases/latest/download/module.json
   ```
3. Clique em **Install** e ative o módulo no seu mundo.

> ❗ Use **sempre a URL que termina em `/download/module.json`**. A URL que termina só em `/releases/latest` é a página do site (HTML) e dá erro "Unexpected token '<'".

### Atualizar
Depois de publicar uma nova versão (passos acima), no Foundry:
- Vá em **Add-on Modules** → o Foundry detecta a atualização e mostra o botão **Update** automaticamente.

---

## ✅ Checklist rápido

- [ ] `version` atualizada no `module.json`
- [ ] Nome do `.zip` no campo `download` bate com o `.zip` gerado
- [ ] `git add` + `commit` + `push`
- [ ] `.zip` gerado com `Compress-Archive`
- [ ] `gh release create v<versao>` com `.zip` + `module.json`
- [ ] Manifest público validado (`version` correta)
- [ ] Testado o **Update** no Foundry

---

## 🆘 Problemas comuns

| Erro / Sintoma | Causa | Solução |
|---|---|---|
| `Unexpected token '<'` ao instalar | Colou a URL `/releases/latest` (HTML) | Use a que termina em `/download/module.json` |
| Foundry não vê a atualização | Release nova não está como "Latest" | Refaça com `gh release create` (cria como latest) |
| Manifest mostra versão antiga | Cache do CDN do GitHub | Aguarde 1-2 min e recarregue |
| Módulo sobrescreve / é sobrescrito por outro | `id` igual a outro módulo | Garanta que o `id` no `module.json` seja único |
| `gh` pede login | Sessão expirou | Rode `gh auth login` (opção "web browser") |
