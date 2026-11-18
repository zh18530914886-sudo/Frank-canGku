# GitHub Desktop Simplified Chinese installer bootstrapper
# Downloads the MIT-licensed language pack maintained by Johnserf-Seed and
# invokes its verified installer for the GitHub Desktop version installed here.
# Source: https://github.com/Johnserf-Seed/GitHub-Desktop-Chinese-Language-Pack

[CmdletBinding()]
param(
    [switch]$CheckOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$upstreamArchive = 'https://github.com/Johnserf-Seed/GitHub-Desktop-Chinese-Language-Pack/archive/refs/heads/main.zip'
$desktopRoot = Join-Path $env:LOCALAPPDATA 'GitHubDesktop'

if (-not (Test-Path -LiteralPath $desktopRoot -PathType Container)) {
    throw "GitHub Desktop is not installed in: $desktopRoot"
}

$appDirectory = Get-ChildItem -LiteralPath $desktopRoot -Directory |
    Where-Object { $_.Name -match '^app-(\d+\.\d+\.\d+)$' } |
    Sort-Object { [version]$_.Name.Substring(4) } -Descending |
    Select-Object -First 1

if ($null -eq $appDirectory) {
    throw 'No installed GitHub Desktop version was found.'
}

$version = $appDirectory.Name.Substring(4)
$tempRoot = Join-Path ([IO.Path]::GetTempPath()) ('github-desktop-zh-cn-' + [Guid]::NewGuid().ToString('N'))
$archivePath = Join-Path $tempRoot 'language-pack.zip'
$expandedPath = Join-Path $tempRoot 'expanded'

try {
    New-Item -ItemType Directory -Path $tempRoot | Out-Null

    Write-Host "Downloading the Chinese language pack for GitHub Desktop $version..."
    Invoke-WebRequest -Uri $upstreamArchive -OutFile $archivePath

    Expand-Archive -LiteralPath $archivePath -DestinationPath $expandedPath
    $sourceRoot = Get-ChildItem -LiteralPath $expandedPath -Directory |
        Select-Object -First 1

    if ($null -eq $sourceRoot) {
        throw 'The downloaded language-pack archive has an unexpected layout.'
    }

    $packagePath = Join-Path $sourceRoot.FullName "app-$version"
    $installerPath = Join-Path $sourceRoot.FullName 'scripts\install.ps1'

    if (-not (Test-Path -LiteralPath (Join-Path $packagePath 'manifest.json') -PathType Leaf)) {
        throw "No compatible Chinese language pack is available for GitHub Desktop $version. Check the upstream project for updates."
    }

    if (-not (Test-Path -LiteralPath $installerPath -PathType Leaf)) {
        throw 'The downloaded language-pack installer is missing.'
    }

    Write-Host 'Verifying and installing the Chinese language pack...'
    & $installerPath -AppPath $appDirectory.FullName -PackagePath $packagePath -CheckOnly:$CheckOnly
} finally {
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
}
