$ErrorActionPreference = "Stop"
$fontUrl = "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/JetBrainsMono.zip"
$tempDir = Join-Path $env:TEMP "nerd-font-install-$(Get-Random)"
$fontDir = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Fonts"

Write-Host "Creating temp directory..."
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

Write-Host "Downloading JetBrainsMono Nerd Font..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $fontUrl -OutFile "$tempDir\JetBrainsMono.zip" -UseBasicParsing

Write-Host "Extracting fonts..."
Expand-Archive -Path "$tempDir\JetBrainsMono.zip" -DestinationPath "$tempDir\fonts" -Force

if (-not (Test-Path $fontDir)) {
    New-Item -ItemType Directory -Force -Path $fontDir | Out-Null
}

Write-Host "Installing fonts..."
$regPath = "HKCU:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts"
$count = 0
Get-ChildItem "$tempDir\fonts\*.ttf" | ForEach-Object {
    Copy-Item $_.FullName -Destination (Join-Path $fontDir $_.Name) -Force
    New-ItemProperty -Path $regPath -Name "$($_.BaseName) (TrueType)" -Value (Join-Path $fontDir $_.Name) -PropertyType String -Force | Out-Null
    $count++
}

Remove-Item -Recurse -Force $tempDir
Write-Host ""
Write-Host "SUCCESS! Installed $count font files." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open Windows Terminal Settings (Ctrl+,)"
Write-Host "2. Go to Profiles > Defaults > Appearance"
Write-Host "3. Set Font face to: JetBrainsMono Nerd Font"
Write-Host "4. Save and restart terminal"
