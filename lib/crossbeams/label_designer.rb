require 'json'
require 'dry/configurable'
require 'crossbeams/label_designer/version'
require 'crossbeams/label_designer/config'
require 'crossbeams/label_designer/page'
require 'crossbeams/label_designer/variable_xml'
require 'erubi'

module Crossbeams
  module LabelDesigner
    class Error < StandardError; end

    class Constants
      # See https://websemantics.uk/tools/convert-pixel-point-em-rem-percent/
      # for a tool to calculate pixel/font point conversions.
      # Basically no of px == no of pt * 1.33 (See DATA at end of file)
      # Then we need to adjust for the printer resolution - hence the constants for
      # 8PXMM and 12PXMM.
      FONT_SIZES_8PXMM = {
        16 => 6,
        19 => 7,
        22 => 8,
        24 => 9,
        27 => 10,
        30 => 11,
        32 => 12,
        35 => 13,
        38 => 14,
        40 => 15,
        43 => 16,
        48 => 18,
        54 => 20,
        59 => 22,
        64 => 24,
        70 => 26,
        75 => 28,
        86 => 32,
        96 => 36,
        107 => 40,
        118 => 44,
        128 => 48,
        144 => 54,
        160 => 60,
        176 => 66,
        192 => 72,
        213 => 80,
        235 => 88,
        256 => 96
      }.freeze

      FONT_SIZES_12PXMM = {
        24 => 6,
        28 => 7,
        32 => 8,
        36 => 9,
        40 => 10,
        44 => 11,
        48 => 12,
        52 => 13,
        56 => 14,
        60 => 15,
        64 => 16,
        72 => 18,
        80 => 20,
        88 => 22,
        96 => 24,
        104 => 26,
        112 => 28,
        128 => 32,
        144 => 36,
        160 => 40,
        176 => 44,
        192 => 48,
        216 => 54,
        240 => 60,
        264 => 66,
        288 => 72,
        320 => 80,
        352 => 88,
        384 => 96
      }.freeze

      BARCODE_TYPES = {
        'CODE_39' => 'CODE 39',
        'CODE_128' => 'CODE 128',
        'EAN_8' => 'EAN 8',
        'EAN_13' => 'EAN 13',
        'EAN_128' => 'EAN 128',
        'UPC_A' => 'UPCa',
        'UPC_E' => 'UPCe',
        'QR_CODE' => 'QR code',
        'PDF_417' => 'PDF 417',
        'CODE_93' => 'CODE 93',
        'UPC_EAN_EXTENSION' => 'UPC/EAN Extension',
        'RSS_14' => 'RSS 14',
        'RSS_EXPANDED' => 'RSS Expanded',
        'DATA_MATRIX' => 'Data Matrix'
      }.freeze
    end
  end
end
__END__
# FOR 8pxmm, multiply by 2. FOR 12pxmm, multiply by 3?
pts = [6,7,8,9,10,11,12,13,14,15,16,18,20,22,24,26,28,32,36,40,44,48,54,60,66,72,80,88,96]
pxs = pts.map {|p| (p * 1.33).ceil }
Hash[pts.zip pxs]
=> {
 6 => 8,
 7 => 10,
 8 => 11,
 9 => 12,
 10 => 14,
 11 => 15,
 12 => 16,
 13 => 18,
 14 => 19,
 15 => 20,
 16 => 22,
 18 => 24,
 20 => 27,
 22 => 30,
 24 => 32,
 26 => 35,
 28 => 38,
 32 => 43,
 36 => 48,
 40 => 54,
 44 => 59,
 48 => 64,
 54 => 72,
 60 => 80,
 66 => 88,
 72 => 96,
 80 => 107,
 88 => 118,
 96 => 128
}
[15] pry(main)> pxs8 = pts.map {|p| (p * 1.33).ceil * 2 }
=> [16, 20, 22, 24, 28, 30, 32, 36, 38, 40, 44, 48, 54, 60, 64, 70, 76, 86, 96, 108, 118, 128, 144, 160, 176, 192, 214, 236, 256]
[16] pry(main)> pxs8 = pts.map {|p| (p * 1.33 * 2).ceil }
=> [16, 19, 22, 24, 27, 30, 32, 35, 38, 40, 43, 48, 54, 59, 64, 70, 75, 86, 96, 107, 118, 128, 144, 160, 176, 192, 213, 235, 256]

[17] pry(main)> pxs12 = pts.map {|p| (p * 1.33).ceil * 3 }
=> [24, 30, 33, 36, 42, 45, 48, 54, 57, 60, 66, 72, 81, 90, 96, 105, 114, 129, 144, 162, 177, 192, 216, 240, 264, 288, 321, 354, 384]
[18] pry(main)> pxs12 = pts.map {|p| (p * 1.33 * 3).ceil }
=> [24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 88, 96, 104, 112, 128, 144, 160, 176, 192, 216, 240, 264, 288, 320, 352, 384]

FONT_SIZES_8PXMM = {
 16 => 6,
 19 => 7,
 22 => 8,
 24 => 9,
 27 => 10,
 30 => 11,
 32 => 12,
 35 => 13,
 38 => 14,
 40 => 15,
 43 => 16,
 48 => 18,
 54 => 20,
 59 => 22,
 64 => 24,
 70 => 26,
 75 => 28,
 86 => 32,
 96 => 36,
 107 => 40,
 118 => 44,
 128 => 48,
 144 => 54,
 160 => 60,
 176 => 66,
 192 => 72,
 213 => 80,
 235 => 88,
 256 => 96
}
FONT_SIZES_12PXMM = {
 24 => 6,
 28 => 7,
 32 => 8,
 36 => 9,
 40 => 10,
 44 => 11,
 48 => 12,
 52 => 13,
 56 => 14,
 60 => 15,
 64 => 16,
 72 => 18,
 80 => 20,
 88 => 22,
 96 => 24,
 104 => 26,
 112 => 28,
 128 => 32,
 144 => 36,
 160 => 40,
 176 => 44,
 192 => 48,
 216 => 54,
 240 => 60,
 264 => 66,
 288 => 72,
 320 => 80,
 352 => 88,
 384 => 96
}
