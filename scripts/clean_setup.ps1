# Enable error handling
$ErrorActionPreference = "Stop"

try {
    Write-Host "Starting extension setup..." -ForegroundColor Blue
    
    # Define paths
    $rootPath = $PSScriptRoot
    $extensionPath = Join-Path $rootPath "extension"
    $iconsPath = Join-Path $extensionPath "icons"

    # Clean and create directories
    Write-Host "Creating directories..." -ForegroundColor Yellow
    Remove-Item -Path $extensionPath -Recurse -Force -ErrorAction SilentlyContinue
    New-Item -ItemType Directory -Path $extensionPath -Force | Out-Null
    New-Item -ItemType Directory -Path $iconsPath -Force | Out-Null

    # Generate icons
    Write-Host "Generating icons..." -ForegroundColor Yellow
    python generate_icons.py
    if ($LASTEXITCODE -ne 0) { throw "Icon generation failed" }

    # Create manifest.json
    Write-Host "Creating manifest.json..." -ForegroundColor Yellow
    $manifest = @{
        manifest_version = 3
        name = "Luxury Blackjack Analyzer"
        version = "1.0"
        description = "Professional Blackjack analysis and strategy tool"
        permissions = @("storage")
        action = @{
            default_popup = "popup.html"
            default_icon = @{
                "16" = "icons/icon16.png"
                "48" = "icons/icon48.png"
                "128" = "icons/icon128.png"
            }
        }
        icons = @{
            "16" = "icons/icon16.png"
            "48" = "icons/icon48.png"
            "128" = "icons/icon128.png"
        }
    }

    $manifest | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $extensionPath "manifest.json")

    # Copy required files
    Write-Host "Copying files..." -ForegroundColor Yellow
    $filesToCopy = @(
        "index.html",
        "script.js",
        "popup.html",
        "popup.js"
    )

    foreach ($file in $filesToCopy) {
        $sourcePath = Join-Path $rootPath $file
        if (Test-Path $sourcePath) {
            Copy-Item -Path $sourcePath -Destination $extensionPath -Force
            Write-Host "  ✓ Copied $file" -ForegroundColor Green
        } else {
            Write-Warning "  ⚠ File not found: $file"
        }
    }

    Write-Host "`nExtension setup complete!" -ForegroundColor Green
    Write-Host "Location: $extensionPath" -ForegroundColor Yellow
    Write-Host "`nTo load the extension in Chrome:"
    Write-Host "1. Go to chrome://extensions/"
    Write-Host "2. Enable Developer mode"
    Write-Host "3. Click 'Load unpacked'"
    Write-Host "4. Select this folder: $extensionPath"

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}