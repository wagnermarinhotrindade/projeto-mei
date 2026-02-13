# Script para subir alterações para o GitHub automaticamente
Write-Host "Enviando alterações para o GitHub..." -ForegroundColor Cyan

# Adiciona todas as mudanças
git add .

# Pergunta por uma mensagem de commit (ou usa uma padrão)
$mensagem = Read-Host "Digite a descrição das mudanças (ou aperte Enter para 'Update automático')"
if ([string]::IsNullOrWhiteSpace($mensagem)) {
    $mensagem = "Update automático: $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
}

# Faz o commit
git commit -m $mensagem

# Envia para o GitHub
git push

Write-Host "Concluído! Seu projeto está atualizado no GitHub." -ForegroundColor Green
