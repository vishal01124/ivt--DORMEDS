# ================================================
# DORMEDS - No-Admin TCP Static Server (PowerShell)
# ================================================
$port = 3000
$root = "c:\Users\sharm\laptop data\pharm D\New folder\DORMEDS-i"

$listener = [System.Net.Sockets.TcpListener]3000
try {
    $listener.Start()
    Write-Host "Raw TCP Server started on http://localhost:$port"
} catch {
    Write-Error "Failed to start listener: $_"
    exit
}

while ($true) {
    if (!$listener.Pending()) {
        Start-Sleep -Milliseconds 100
        continue
    }

    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()
    $buffer = New-Object byte[] 1024
    $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
    $requestText = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $bytesRead)

    if ($requestText -match "GET (.*) HTTP") {
        $urlPath = $matches[1]
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        # Remove query strings
        $urlPath = $urlPath.Split('?')[0]
        
        $filePath = Join-Path $root $urlPath
        
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html" }
                ".css"  { "text/css" }
                ".js"   { "application/javascript" }
                ".png"  { "image/png" }
                default { "application/octet-stream" }
            }
            
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            $errorMsg = "HTTP/1.1 404 Not Found`r`nContent-Length: 0`r`n`r`n"
            $errorBytes = [System.Text.Encoding]::ASCII.GetBytes($errorMsg)
            $stream.Write($errorBytes, 0, $errorBytes.Length)
        }
    }
    
    $stream.Close()
    $client.Close()
}
