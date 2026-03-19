$WshShell = New-Object -ComObject WScript.Shell
$Desktop = [Environment]::GetFolderPath("Desktop")
$Shortcut = $WshShell.CreateShortcut("$Desktop\projeto paralelo.lnk")
$Shortcut.TargetPath = "C:\Users\gilbe\cinemap\index.html"
$Shortcut.Save()
Write-Host "Atalho criado com sucesso!"
