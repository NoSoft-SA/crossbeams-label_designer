require 'json'
require 'dry/configurable'
require 'crossbeams/label_designer/version'
require 'crossbeams/label_designer/config'
require 'crossbeams/label_designer/page'
require 'erubi'

module Crossbeams
  module LabelDesigner
    class Constants
      FONT_SIZES = {
        # PX val / Font val
        8 => 6,
        9 => 7,
        11 => 8,
        12 => 9,
        13 => 10,
        15 => 11,
        16 => 12,
        17 => 13,
        19 => 14,
        21 => 15,
        22 => 16,
        23 => 17,
        24 => 18,
        25 => 19,
        26 => 20,
        28 => 21,
        29 => 22,
        31 => 23,
        32 => 24,
        33 => 25,
        35 => 26,
        36 => 27,
        37 => 28,
        39 => 29,
        40 => 30,
        47 => 35,
        53 => 40,
        60 => 45,
        67 => 50,
        76 => 54,
        80 => 60,
        84 => 63,
        88 => 66
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
