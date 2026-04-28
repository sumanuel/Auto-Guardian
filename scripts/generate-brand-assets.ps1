Add-Type -AssemblyName System.Drawing

function New-RoundedPath {
  param(
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-Graphics {
  param([System.Drawing.Bitmap]$Bitmap)

  $graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  return $graphics
}

function Get-BrandSymbolPlacement {
  param(
    [float]$FrameX,
    [float]$FrameY,
    [float]$FrameWidth,
    [float]$FrameHeight,
    [float]$Scale
  )

  $symbolBaseX = 153.0
  $symbolBaseY = 86.0
  $symbolWidth = 734.0
  $symbolHeight = 760.0

  return @{
    OffsetX = $FrameX + (($FrameWidth - ($symbolWidth * $Scale)) / 2) - ($symbolBaseX * $Scale)
    OffsetY = $FrameY + (($FrameHeight - ($symbolHeight * $Scale)) / 2) - ($symbolBaseY * $Scale)
  }
}

function New-ShieldPath {
  param(
    [float]$CenterX,
    [float]$Top,
    [float]$Width,
    [float]$Height
  )

  $halfWidth = $Width / 2
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $points = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new($CenterX, $Top + $Height),
    [System.Drawing.PointF]::new($CenterX - ($halfWidth * 0.84), $Top + ($Height * 0.77)),
    [System.Drawing.PointF]::new($CenterX - ($halfWidth * 1.02), $Top + ($Height * 0.26)),
    [System.Drawing.PointF]::new($CenterX - ($halfWidth * 0.64), $Top),
    [System.Drawing.PointF]::new($CenterX + ($halfWidth * 0.64), $Top),
    [System.Drawing.PointF]::new($CenterX + ($halfWidth * 1.02), $Top + ($Height * 0.26)),
    [System.Drawing.PointF]::new($CenterX + ($halfWidth * 0.84), $Top + ($Height * 0.77))
  )
  $path.AddClosedCurve($points, 0.12)
  return $path
}

function Draw-LayeredShield {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$OffsetX,
    [float]$OffsetY,
    [float]$Scale,
    [System.Drawing.Color]$Primary,
    [System.Drawing.Color]$Secondary,
    [System.Drawing.Color]$Highlight
  )

  $outerPath = New-ShieldPath -CenterX ($OffsetX + (520.0 * $Scale)) -Top ($OffsetY + (86.0 * $Scale)) -Width (720.0 * $Scale) -Height (760.0 * $Scale)
  $midPath = New-ShieldPath -CenterX ($OffsetX + (520.0 * $Scale)) -Top ($OffsetY + (126.0 * $Scale)) -Width (612.0 * $Scale) -Height (672.0 * $Scale)
  $innerPath = New-ShieldPath -CenterX ($OffsetX + (520.0 * $Scale)) -Top ($OffsetY + (176.0 * $Scale)) -Width (490.0 * $Scale) -Height (560.0 * $Scale)

  $outerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(112, $Primary))
  $midBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(132, $Secondary))
  $innerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(124, $Highlight))
  $outlinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(146, 255, 255, 255), (14.0 * $Scale))
  $innerOutlinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(108, 255, 255, 255), (8.0 * $Scale))
  $outlinePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Miter
  $innerOutlinePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Miter

  $Graphics.FillPath($outerBrush, $outerPath)
  $Graphics.FillPath($midBrush, $midPath)
  $Graphics.FillPath($innerBrush, $innerPath)
  $Graphics.DrawPath($outlinePen, $outerPath)
  $Graphics.DrawPath($innerOutlinePen, $midPath)
  $Graphics.DrawPath($innerOutlinePen, $innerPath)

  $outerBrush.Dispose()
  $midBrush.Dispose()
  $innerBrush.Dispose()
  $outlinePen.Dispose()
  $innerOutlinePen.Dispose()
  $outerPath.Dispose()
  $midPath.Dispose()
  $innerPath.Dispose()
}

function Draw-BrandSymbol {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$OffsetX,
    [float]$OffsetY,
    [float]$Scale,
    [System.Drawing.Color]$Color,
    [System.Drawing.Color]$Accent,
    [float]$StrokeMultiplier = 1.0
  )

  Draw-LayeredShield -Graphics $Graphics -OffsetX $OffsetX -OffsetY $OffsetY -Scale $Scale -Primary ([System.Drawing.Color]::FromArgb(255, 25, 118, 210)) -Secondary ([System.Drawing.Color]::FromArgb(255, 15, 95, 210)) -Highlight ([System.Drawing.Color]::FromArgb(255, 10, 63, 143))

  $mainPen = New-Object System.Drawing.Pen($Color, (36.0 * $Scale * $StrokeMultiplier))
  $mainPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Square
  $mainPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Square
  $mainPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Miter

  $accentPen = New-Object System.Drawing.Pen($Accent, (22.0 * $Scale * $StrokeMultiplier))
  $accentPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Square
  $accentPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Square
  $accentPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Miter

  $accentBrush = New-Object System.Drawing.SolidBrush($Accent)

  $orbitPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(148, $Accent), (12.0 * $Scale))
  $orbitPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Square
  $orbitPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Square
  $orbitPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Miter
  $Graphics.DrawArc($orbitPen, $OffsetX + (274.0 * $Scale), $OffsetY + (218.0 * $Scale), 472.0 * $Scale, 440.0 * $Scale, 206, 112)
  $Graphics.DrawArc($orbitPen, $OffsetX + (336.0 * $Scale), $OffsetY + (168.0 * $Scale), 328.0 * $Scale, 506.0 * $Scale, 332, 108)
  $Graphics.FillEllipse($accentBrush, $OffsetX + (266.0 * $Scale), $OffsetY + (514.0 * $Scale), 22.0 * $Scale, 22.0 * $Scale)
  $Graphics.FillEllipse($accentBrush, $OffsetX + (640.0 * $Scale), $OffsetY + (250.0 * $Scale), 18.0 * $Scale, 18.0 * $Scale)
  $Graphics.FillEllipse($accentBrush, $OffsetX + (726.0 * $Scale), $OffsetY + (658.0 * $Scale), 24.0 * $Scale, 24.0 * $Scale)

  $checkCircleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 92, 214, 184))
  $Graphics.FillEllipse($checkCircleBrush, $OffsetX + (278.0 * $Scale), $OffsetY + (260.0 * $Scale), 84.0 * $Scale, 84.0 * $Scale)
  $Graphics.DrawLine($accentPen, $OffsetX + (304.0 * $Scale), $OffsetY + (302.0 * $Scale), $OffsetX + (322.0 * $Scale), $OffsetY + (320.0 * $Scale))
  $Graphics.DrawLine($accentPen, $OffsetX + (322.0 * $Scale), $OffsetY + (320.0 * $Scale), $OffsetX + (346.0 * $Scale), $OffsetY + (286.0 * $Scale))

  $aPen = New-Object System.Drawing.Pen($Color, (58.0 * $Scale * $StrokeMultiplier))
  $aPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Flat
  $aPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Flat
  $aPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Bevel
  $Graphics.DrawLine($aPen, $OffsetX + (372.0 * $Scale), $OffsetY + (624.0 * $Scale), $OffsetX + (520.0 * $Scale), $OffsetY + (282.0 * $Scale))
  $Graphics.DrawLine($aPen, $OffsetX + (520.0 * $Scale), $OffsetY + (282.0 * $Scale), $OffsetX + (666.0 * $Scale), $OffsetY + (624.0 * $Scale))
  $Graphics.DrawLine($aPen, $OffsetX + (430.0 * $Scale), $OffsetY + (500.0 * $Scale), $OffsetX + (610.0 * $Scale), $OffsetY + (500.0 * $Scale))

  $orbitPen.Dispose()
  $checkCircleBrush.Dispose()
  $aPen.Dispose()
  $accentBrush.Dispose()
  $accentPen.Dispose()
  $mainPen.Dispose()
}

$assetsPath = 'd:\Mis proyectos\Auto-Guardian\assets'
$playstorePath = Join-Path $assetsPath 'playstore'
if (-not (Test-Path $playstorePath)) {
  New-Item -ItemType Directory -Path $playstorePath | Out-Null
}

$blueDark = [System.Drawing.Color]::FromArgb(255, 10, 63, 143)
$blueMid = [System.Drawing.Color]::FromArgb(255, 15, 95, 210)
$blueLight = [System.Drawing.Color]::FromArgb(255, 25, 118, 210)
$white = [System.Drawing.Color]::White
$ice = [System.Drawing.Color]::FromArgb(255, 234, 244, 255)
$cyan = [System.Drawing.Color]::FromArgb(255, 110, 215, 255)
$softCircle = [System.Drawing.Color]::FromArgb(28, 255, 255, 255)
$softCircle2 = [System.Drawing.Color]::FromArgb(14, 255, 255, 255)
$softPanel = [System.Drawing.Color]::FromArgb(10, 255, 255, 255)
$softPanelBorder = [System.Drawing.Color]::FromArgb(60, 255, 255, 255)
$darkPill = [System.Drawing.Color]::FromArgb(34, 6, 25, 58)

$iconBitmap = New-Object System.Drawing.Bitmap 512, 512
$iconGraphics = New-Graphics $iconBitmap
$iconRect = [System.Drawing.Rectangle]::new(0, 0, 512, 512)
$iconBackground = New-Object System.Drawing.Drawing2D.LinearGradientBrush($iconRect, $blueDark, $blueLight, 45)
$iconPath = New-RoundedPath -X 22 -Y 22 -Width 468 -Height 468 -Radius 74
$iconGraphics.FillPath($iconBackground, $iconPath)
$iconGraphics.FillEllipse((New-Object System.Drawing.SolidBrush($softCircle)), 310, -30, 210, 210)
$iconGraphics.FillEllipse((New-Object System.Drawing.SolidBrush($softCircle2)), -36, 386, 130, 130)
$innerPath = New-RoundedPath -X 92 -Y 84 -Width 328 -Height 328 -Radius 42
$iconGraphics.FillPath((New-Object System.Drawing.SolidBrush($softPanel)), $innerPath)
$iconPlacement = Get-BrandSymbolPlacement -FrameX 92 -FrameY 84 -FrameWidth 328 -FrameHeight 328 -Scale 0.43
Draw-BrandSymbol -Graphics $iconGraphics -OffsetX $iconPlacement.OffsetX -OffsetY $iconPlacement.OffsetY -Scale 0.43 -Color $white -Accent $cyan -StrokeMultiplier 1.12
$iconGraphics.Dispose()
$iconBitmap.Save((Join-Path $assetsPath 'icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$iconBitmap.Dispose()
$iconBackground.Dispose()
$iconPath.Dispose()
$innerPath.Dispose()

$adaptiveBitmap = New-Object System.Drawing.Bitmap 1024, 1024
$adaptiveGraphics = New-Graphics $adaptiveBitmap
$adaptiveRect = [System.Drawing.Rectangle]::new(0, 0, 1024, 1024)
$adaptiveBackground = New-Object System.Drawing.Drawing2D.LinearGradientBrush($adaptiveRect, $blueDark, $blueLight, 45)
$adaptivePath = New-RoundedPath -X 44 -Y 44 -Width 936 -Height 936 -Radius 146
$adaptiveGraphics.FillPath($adaptiveBackground, $adaptivePath)
$adaptiveGraphics.FillEllipse((New-Object System.Drawing.SolidBrush($softCircle)), 645, -86, 430, 430)
$adaptiveGraphics.FillEllipse((New-Object System.Drawing.SolidBrush($softCircle2)), -78, 760, 260, 260)
$adaptiveInnerPath = New-RoundedPath -X 178 -Y 166 -Width 668 -Height 668 -Radius 86
$adaptiveGraphics.FillPath((New-Object System.Drawing.SolidBrush($softPanel)), $adaptiveInnerPath)
$adaptivePlacement = Get-BrandSymbolPlacement -FrameX 178 -FrameY 166 -FrameWidth 668 -FrameHeight 668 -Scale 0.81
Draw-BrandSymbol -Graphics $adaptiveGraphics -OffsetX $adaptivePlacement.OffsetX -OffsetY $adaptivePlacement.OffsetY -Scale 0.81 -Color $white -Accent $cyan -StrokeMultiplier 1.1
$adaptiveGraphics.Dispose()
$adaptiveBitmap.Save((Join-Path $assetsPath 'adaptive-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$adaptiveBitmap.Dispose()
$adaptiveBackground.Dispose()
$adaptivePath.Dispose()
$adaptiveInnerPath.Dispose()

$faviconBitmap = New-Object System.Drawing.Bitmap 256, 256
$faviconGraphics = New-Graphics $faviconBitmap
$faviconRect = [System.Drawing.Rectangle]::new(0, 0, 256, 256)
$faviconBackground = New-Object System.Drawing.Drawing2D.LinearGradientBrush($faviconRect, $blueDark, $blueMid, 45)
$faviconPath = New-RoundedPath -X 10 -Y 10 -Width 236 -Height 236 -Radius 40
$faviconGraphics.FillPath($faviconBackground, $faviconPath)
$faviconGraphics.FillEllipse((New-Object System.Drawing.SolidBrush($softCircle2)), 150, -20, 120, 120)
$faviconPlacement = Get-BrandSymbolPlacement -FrameX 24 -FrameY 24 -FrameWidth 208 -FrameHeight 208 -Scale 0.215
Draw-BrandSymbol -Graphics $faviconGraphics -OffsetX $faviconPlacement.OffsetX -OffsetY $faviconPlacement.OffsetY -Scale 0.215 -Color $white -Accent $cyan -StrokeMultiplier 1.08
$faviconGraphics.Dispose()
$faviconBitmap.Save((Join-Path $assetsPath 'favicon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$faviconBitmap.Dispose()
$faviconBackground.Dispose()
$faviconPath.Dispose()

$featureBitmap = New-Object System.Drawing.Bitmap 1024, 500
$featureGraphics = New-Graphics $featureBitmap
$featureRect = [System.Drawing.Rectangle]::new(0, 0, 1024, 500)
$featureBackground = New-Object System.Drawing.Drawing2D.LinearGradientBrush($featureRect, $blueDark, $blueMid, 0)
$featureGraphics.FillRectangle($featureBackground, $featureRect)
$featureGraphics.FillEllipse((New-Object System.Drawing.SolidBrush($softCircle)), 804, -116, 360, 360)
$featureGraphics.FillEllipse((New-Object System.Drawing.SolidBrush($softCircle2)), -88, 320, 180, 180)

$featurePanel = New-RoundedPath -X 342 -Y 54 -Width 602 -Height 392 -Radius 30
$featureGraphics.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(34, 255, 255, 255))), $featurePanel)
$featureGraphics.DrawPath((New-Object System.Drawing.Pen($softPanelBorder, 1.5)), $featurePanel)

$iconPanelRect = [System.Drawing.Rectangle]::new(58, 86, 216, 216)
$iconPanelBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($iconPanelRect, $blueLight, $blueMid, 45)
$iconPanel = New-RoundedPath -X 58 -Y 86 -Width 216 -Height 216 -Radius 34
$featureGraphics.FillPath($iconPanelBrush, $iconPanel)
$featurePlacement = Get-BrandSymbolPlacement -FrameX 58 -FrameY 86 -FrameWidth 216 -FrameHeight 216 -Scale 0.27
Draw-BrandSymbol -Graphics $featureGraphics -OffsetX $featurePlacement.OffsetX -OffsetY $featurePlacement.OffsetY -Scale 0.27 -Color $white -Accent $cyan -StrokeMultiplier 1.08

$titleFont = New-Object System.Drawing.Font('Segoe UI', 34, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$subFont = New-Object System.Drawing.Font('Segoe UI', 18, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$sectionFont = New-Object System.Drawing.Font('Segoe UI', 18, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$itemFont = New-Object System.Drawing.Font('Segoe UI', 17, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$whiteBrush = New-Object System.Drawing.SolidBrush($white)
$mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(232, 255, 255, 255))
$accentBrush = New-Object System.Drawing.SolidBrush($cyan)
$pillBrush = New-Object System.Drawing.SolidBrush($darkPill)
$pillBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 255, 255, 255), 1)

$featureGraphics.DrawString('AUTO-GUARDIAN', $titleFont, $whiteBrush, 52, 344)
$featureGraphics.DrawString('Control movil para mantenimiento, alertas y documentos', $subFont, $mutedBrush, 54, 391)
$featureGraphics.DrawString('Funciones principales', $sectionFont, $whiteBrush, 382, 88)

$items = @(
  'Alertas de mantenimiento',
  'Documentos por vencer',
  'Historial por vehiculo',
  'Gastos y servicios'
)

for ($index = 0; $index -lt $items.Count; $index++) {
  $column = $index % 2
  $row = [math]::Floor($index / 2)
  $pillX = 376 + ($column * 280)
  $pillY = 158 + ($row * 92)
  $pillPath = New-RoundedPath -X $pillX -Y $pillY -Width 250 -Height 58 -Radius 18
  $featureGraphics.FillPath($pillBrush, $pillPath)
  $featureGraphics.DrawPath($pillBorderPen, $pillPath)
  $featureGraphics.FillEllipse($accentBrush, $pillX + 16, $pillY + 21, 16, 16)
  $featureGraphics.DrawString($items[$index], $itemFont, $whiteBrush, $pillX + 46, $pillY + 17)
  $pillPath.Dispose()
}

$tagFont = New-Object System.Drawing.Font('Segoe UI', 16, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$tagBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(236, 234, 244, 255))
$featureGraphics.DrawString('Seguimiento claro y confiable para tu vehiculo', $tagFont, $tagBrush, 384, 368)
$featureGraphics.Dispose()
$featureBitmap.Save((Join-Path $playstorePath 'feature-graphic-autoguardian.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$featureBitmap.Dispose()
$featureBackground.Dispose()
$featurePanel.Dispose()
$iconPanelBrush.Dispose()
$iconPanel.Dispose()
$titleFont.Dispose()
$subFont.Dispose()
$sectionFont.Dispose()
$itemFont.Dispose()
$tagFont.Dispose()
$whiteBrush.Dispose()
$mutedBrush.Dispose()
$accentBrush.Dispose()
$pillBrush.Dispose()
$pillBorderPen.Dispose()
$tagBrush.Dispose()

$splashBitmap = New-Object System.Drawing.Bitmap 1400, 1400
$splashGraphics = New-Graphics $splashBitmap
$splashGraphics.Clear([System.Drawing.Color]::Transparent)
$splashGlowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(72, 15, 95, 210))
$splashTextBrush = New-Object System.Drawing.SolidBrush($white)
$splashSubBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(238, 234, 244, 255))
$titleFontSplash = New-Object System.Drawing.Font('Segoe UI', 104, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$subFontSplash = New-Object System.Drawing.Font('Segoe UI', 40, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$centerPanel = New-RoundedPath -X 360 -Y 120 -Width 680 -Height 680 -Radius 132
$splashGraphics.FillPath($splashGlowBrush, $centerPanel)
$splashPlacement = Get-BrandSymbolPlacement -FrameX 360 -FrameY 120 -FrameWidth 680 -FrameHeight 680 -Scale 1.0
Draw-BrandSymbol -Graphics $splashGraphics -OffsetX $splashPlacement.OffsetX -OffsetY $splashPlacement.OffsetY -Scale 1.0 -Color $white -Accent $cyan -StrokeMultiplier 1.12
$splashFormat = New-Object System.Drawing.StringFormat
$splashFormat.Alignment = [System.Drawing.StringAlignment]::Center
$splashGraphics.DrawString('Auto-Guardian', $titleFontSplash, $splashTextBrush, [System.Drawing.RectangleF]::new(110, 860, 1180, 140), $splashFormat)
$splashGraphics.DrawString('Centro de control vehicular', $subFontSplash, $splashSubBrush, [System.Drawing.RectangleF]::new(110, 990, 1180, 74), $splashFormat)
$splashGraphics.Dispose()
$splashBitmap.Save((Join-Path $assetsPath 'splash.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$splashBitmap.Dispose()
$splashGlowBrush.Dispose()
$splashTextBrush.Dispose()
$splashSubBrush.Dispose()
$titleFontSplash.Dispose()
$subFontSplash.Dispose()
$splashFormat.Dispose()
$centerPanel.Dispose()

Write-Output 'Brand assets regenerated successfully.'