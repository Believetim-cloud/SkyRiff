' SkyRiff 服务器静默启动脚本
' 双击这个文件，会在后台启动服务器，不显示命令行窗口

Set WshShell = CreateObject("WScript.Shell")

' 获取脚本所在目录
scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' 构建启动命令
command = "cmd /c cd /d """ & scriptDir & """ && start.bat"

' 静默运行（0 = 隐藏窗口）
WshShell.Run command, 0, False

Set WshShell = Nothing

' 显示提示（可选）
MsgBox "SkyRiff 服务器已在后台启动！" & vbCrLf & vbCrLf & "服务地址: http://localhost:3001", vbInformation, "SkyRiff"
