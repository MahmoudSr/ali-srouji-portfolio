// Read-only transcoder, built on AVFoundation so no ffmpeg install is needed.
// Pulls a time range out of a master and writes a web-sized H.264 mp4 with the
// moov atom up front, so it starts playing on the first chunk.
//
//   swiftc -O -o /tmp/transcode tools/transcode.swift
//   transcode <in> <out> <startSec> <durSec> <height> <mbps> <audio 0|1> [keyframeSec]
//
// keyframeSec defaults to 2. Pass something small (0.4) for clips that get
// scrubbed by scroll, so seeks land on a nearby keyframe instead of jumping.
// Masters on Ali's external drives are only ever read. Never write to them.
import AVFoundation
import Foundation

let a = CommandLine.arguments
guard a.count == 8 || a.count == 9 else { fputs("bad args\n", stderr); exit(2) }
let src = URL(fileURLWithPath: a[1])
let out = URL(fileURLWithPath: a[2])
let start = Double(a[3])!, dur = Double(a[4])!
let targetH = Double(a[5])!, mbps = Double(a[6])!
let wantAudio = a[7] == "1"
let keyframeSec = a.count == 9 ? Double(a[8])! : 2.0

let asset = AVURLAsset(url: src)
guard let vTrack = asset.tracks(withMediaType: .video).first else { exit(3) }
let natural = vTrack.naturalSize.applying(vTrack.preferredTransform)
let srcW = abs(natural.width), srcH = abs(natural.height)
let scale = targetH / srcH
let outW = (srcW * scale / 2).rounded() * 2
let outH = (srcH * scale / 2).rounded() * 2

let range = CMTimeRange(start: CMTime(seconds: start, preferredTimescale: 600),
                        duration: CMTime(seconds: dur, preferredTimescale: 600))

let reader = try AVAssetReader(asset: asset)
reader.timeRange = range
let vOut = AVAssetReaderTrackOutput(track: vTrack, outputSettings: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange,
])
vOut.alwaysCopiesSampleData = false
reader.add(vOut)

var aOut: AVAssetReaderTrackOutput?
if wantAudio, let aTrack = asset.tracks(withMediaType: .audio).first {
    let o = AVAssetReaderTrackOutput(track: aTrack, outputSettings: [
        AVFormatIDKey: kAudioFormatLinearPCM,
    ])
    reader.add(o); aOut = o
}

try? FileManager.default.removeItem(at: out)
let writer = try AVAssetWriter(outputURL: out, fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true

let vIn = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: outW,
    AVVideoHeightKey: outH,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: Int(mbps * 1_000_000),
        AVVideoMaxKeyFrameIntervalDurationKey: keyframeSec,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
        AVVideoAllowFrameReorderingKey: true,
    ],
])
vIn.expectsMediaDataInRealTime = false
vIn.transform = vTrack.preferredTransform
writer.add(vIn)

var aIn: AVAssetWriterInput?
if aOut != nil {
    let i = AVAssetWriterInput(mediaType: .audio, outputSettings: [
        AVFormatIDKey: kAudioFormatMPEG4AAC,
        AVNumberOfChannelsKey: 2,
        AVSampleRateKey: 48000,
        AVEncoderBitRateKey: 128_000,
    ])
    i.expectsMediaDataInRealTime = false
    writer.add(i); aIn = i
}

writer.startWriting()
writer.startSession(atSourceTime: range.start)
reader.startReading()

let group = DispatchGroup()
func pump(_ input: AVAssetWriterInput, _ output: AVAssetReaderTrackOutput, _ label: String) {
    group.enter()
    input.requestMediaDataWhenReady(on: DispatchQueue(label: label)) {
        while input.isReadyForMoreMediaData {
            guard let buf = output.copyNextSampleBuffer() else {
                input.markAsFinished(); group.leave(); return
            }
            input.append(buf)
        }
    }
}
pump(vIn, vOut, "v")
if let aIn, let aOut { pump(aIn, aOut, "a") }
group.wait()

let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()

if writer.status != .completed {
    fputs("write failed: \(String(describing: writer.error))\n", stderr); exit(4)
}
let bytes = ((try? FileManager.default.attributesOfItem(atPath: out.path)[.size]) as? Int) ?? 0
print("\(out.lastPathComponent)  \(Int(outW))x\(Int(outH))  \(String(format: "%.1f", Double(bytes) / 1_048_576)) MB")
