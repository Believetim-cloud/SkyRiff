$ErrorActionPreference = "Stop"
$nodeVer = "v20.10.0"
$url = "https://nodejs.org/dist/$nodeVer/node-$nodeVer-win-x64.zip"
$dest = "node.zip"
$toolsDir = "tools"
$nodeDirName = "node-$nodeVer-win-x64"
$finalNodePath = Join-Path $PWD "$toolsDir\$nodeDirName"

if (!(Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir | Out-Null
}

if (!(Test-Path "$toolsDir\$nodeDirName\node.exe")) {
    Write-Host "Downloading Node.js..."
    Invoke-WebRequest -Uri $url -OutFile $dest
    
    Write-Host "Extracting..."
    Expand-Archive -Path $dest -DestinationPath $toolsDir -Force
    
    Write-Host "Cleaning up..."
    Remove-Item $dest
} else {
    Write-Host "Node.js already exists."
}

Write-Host "Node.js setup complete."
Write-Host "Path: $finalNodePath"
Write-Host "Configuring environment..."

$env:PATH = "$finalNodePath;$env:PATH"

Write-Host "Verifying version:"
node --version
npm --version

Write-Host "Environment ready! You can now run npm commands."