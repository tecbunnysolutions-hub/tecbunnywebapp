param (
    [string]$TargetDirectory = "./supabase/migrations"
)

# Define files to ALWAYS keep
$KeepFiles = @("final_schema.sql", "README.md")

if (!(Test-Path -Path $TargetDirectory)) {
    Write-Host "Target directory '$TargetDirectory' does not exist." -ForegroundColor Red
    exit 1
}

# Get all files in the target directory, excluding the KeepFiles
$FilesToDelete = Get-ChildItem -Path $TargetDirectory -File | Where-Object { $KeepFiles -notcontains $_.Name }

if ($FilesToDelete.Count -eq 0) {
    Write-Host "No redundant files found to delete in '$TargetDirectory'." -ForegroundColor Green
    exit 0
}

Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "DRY-RUN: The following files will be DELETED:" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

foreach ($file in $FilesToDelete) {
    Write-Host "  [DELETE] $($file.FullName)" -ForegroundColor Red
}

Write-Host "`nKeeping:" -ForegroundColor Cyan
foreach ($keep in $KeepFiles) {
    if (Test-Path "$TargetDirectory/$keep") {
        Write-Host "  [KEEP]   $TargetDirectory/$keep" -ForegroundColor Green
    }
}

Write-Host "`nWARNING: This action is irreversible and deletes Supabase migration history!" -ForegroundColor Red
$confirmation = Read-Host "Do you want to proceed with deletion? [y/N]"

if ($confirmation -match "^[yY]$") {
    Write-Host "`nProceeding with deletion..." -ForegroundColor Yellow
    foreach ($file in $FilesToDelete) {
        Remove-Item -Path $file.FullName -Force
        Write-Host "Deleted: $($file.Name)" -ForegroundColor DarkGray
    }
    Write-Host "Cleanup complete! Only final_schema.sql and README.md remain." -ForegroundColor Green
} else {
    Write-Host "`nOperation cancelled. No files were deleted." -ForegroundColor Cyan
}
