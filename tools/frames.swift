// Read-only frame grabber, built on AVFoundation so no ffmpeg install is needed.
//
//   swiftc -O -o /tmp/frames tools/frames.swift
//   frames <in.mp4> <outdir> sheet <count> [startSec] [endSec]   contact sheet for picking
//   frames <in.mp4> <outdir> grab <t1,t2,...>                    full-res JPEGs at those seconds
//
// Masters on Ali's external drives are only ever read. Never write to them.
import AVFoundation
import AppKit
import Foundation

let a = CommandLine.arguments
guard a.count >= 4 else { fputs("bad args\n", stderr); exit(2) }
let url = URL(fileURLWithPath: a[1])
let outDir = URL(fileURLWithPath: a[2], isDirectory: true)
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

let asset = AVURLAsset(url: url)
let dur = CMTimeGetSeconds(asset.duration)
let track = asset.tracks(withMediaType: .video).first
let size = track?.naturalSize ?? .zero
FileHandle.standardError.write("duration=\(String(format: "%.2f", dur))s size=\(Int(size.width))x\(Int(size.height)) fps=\(track?.nominalFrameRate ?? 0)\n".data(using: .utf8)!)

let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.requestedTimeToleranceBefore = .zero
gen.requestedTimeToleranceAfter = .zero

func frame(at seconds: Double) -> CGImage? {
    let t = CMTime(seconds: seconds, preferredTimescale: 600)
    do { return try gen.copyCGImage(at: t, actualTime: nil) }
    catch { FileHandle.standardError.write("grab \(seconds)s failed: \(error)\n".data(using: .utf8)!); return nil }
}

func writeJPEG(_ img: CGImage, to url: URL, maxWidth: CGFloat, quality: CGFloat) {
    let scale = min(1, maxWidth / CGFloat(img.width))
    let size = NSSize(width: CGFloat(img.width) * scale, height: CGFloat(img.height) * scale)
    let canvas = NSImage(size: size)
    canvas.lockFocus()
    NSGraphicsContext.current?.imageInterpolation = .high
    NSImage(cgImage: img, size: .zero).draw(in: NSRect(origin: .zero, size: size))
    canvas.unlockFocus()
    guard let tiff = canvas.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
          let data = rep.representation(using: .jpeg, properties: [.compressionFactor: quality])
    else { return }
    try? data.write(to: url)
}

let mode = a[3]
if mode == "sheet" {
    let count = Int(a[4]) ?? 24
    let rangeStart = a.count > 5 ? Double(a[5])! : dur * 0.04
    let rangeEnd = a.count > 6 ? Double(a[6])! : dur * 0.96
    let cols = 6, thumbW = 360, thumbH = 202
    let rows = Int(ceil(Double(count) / Double(cols)))
    let sheet = NSImage(size: NSSize(width: cols * thumbW, height: rows * thumbH))
    sheet.lockFocus()
    NSColor.black.setFill()
    NSRect(x: 0, y: 0, width: cols * thumbW, height: rows * thumbH).fill()
    for i in 0..<count {
        let t = rangeStart + (rangeEnd - rangeStart) * Double(i) / Double(count - 1)
        guard let img = frame(at: t) else { continue }
        let col = i % cols, row = i / cols
        let r = NSRect(x: col * thumbW, y: (rows - 1 - row) * thumbH, width: thumbW, height: thumbH)
        NSImage(cgImage: img, size: .zero).draw(in: r)
        let label = String(format: "%.1fs", t) as NSString
        label.draw(at: NSPoint(x: r.minX + 8, y: r.minY + 6), withAttributes: [
            .font: NSFont.monospacedSystemFont(ofSize: 15, weight: .bold),
            .foregroundColor: NSColor.systemOrange,
        ])
    }
    sheet.unlockFocus()
    let tiff = sheet.tiffRepresentation!
    let rep = NSBitmapImageRep(data: tiff)!
    try? rep.representation(using: .jpeg, properties: [.compressionFactor: 0.7])!
        .write(to: outDir.appendingPathComponent("sheet.jpg"))
    print("sheet written")
} else {
    let times = a[4].split(separator: ",").compactMap { Double($0) }
    for (i, t) in times.enumerated() {
        guard let img = frame(at: t) else { continue }
        let name = String(format: "frame-%02d.jpg", i + 1)
        writeJPEG(img, to: outDir.appendingPathComponent(name), maxWidth: 2000, quality: 0.72)
        print("\(name) @ \(t)s")
    }
}
